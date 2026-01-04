/**
 * CV Data Endpoint Handlers
 *
 * Handles CRUD operations for CV data via the Workers API.
 * Uses KVStorageAdapter for persistence and Zod for validation.
 * Supports both JSON and YAML formats for export/import.
 *
 * @module workers/api/handlers/cv
 */

import yaml from 'js-yaml'
import type { KVNamespace } from '@/services/storage/KVConfig'
import type { CVData } from '@/types/cv'
import { KVStorageAdapter } from '@/services/storage/KVStorageAdapter'
import { validateCVData } from '@/schemas/cv.schema'
import {
  jsonResponse,
  notFound,
  badRequest,
  validationError,
  internalError,
  HttpStatus,
} from '../utils/response'

/**
 * Supported export/import formats
 */
export type ExportFormat = 'json' | 'yaml'

/**
 * Content type mapping for export formats
 */
const FORMAT_CONTENT_TYPES: Record<ExportFormat, string> = {
  json: 'application/json',
  yaml: 'application/x-yaml',
}

/**
 * Parse format from query parameter with validation
 */
function parseExportFormat(formatParam: string | null): ExportFormat | null {
  if (!formatParam) return 'json' // Default to JSON
  const normalized = formatParam.toLowerCase()
  if (normalized === 'json' || normalized === 'yaml') {
    return normalized
  }
  return null // Invalid format
}

/**
 * Detect format from Content-Type header
 */
function detectImportFormat(contentType: string | null): ExportFormat | null {
  if (!contentType) return null

  const normalized = contentType.toLowerCase()
  if (
    normalized.includes('application/json') ||
    normalized.includes('text/json')
  ) {
    return 'json'
  }
  if (
    normalized.includes('application/x-yaml') ||
    normalized.includes('text/yaml') ||
    normalized.includes('application/yaml')
  ) {
    return 'yaml'
  }
  return null
}

/**
 * Environment bindings for CV handlers
 */
export interface CVHandlerEnv {
  CV_DATA: KVNamespace
}

/**
 * KV key used for CV data storage
 * This constant should match what KVStorageAdapter generates
 */
const CV_DATA_KEY = 'cv:data:v1'

/**
 * Create a KV storage adapter from environment bindings
 */
function createAdapter(env: CVHandlerEnv): KVStorageAdapter {
  return new KVStorageAdapter({
    namespace: env.CV_DATA,
    keyPrefix: 'cv',
    version: 'v1',
    enableCompression: true,
    compressionThreshold: 10240, // 10KB
  })
}

/**
 * GET /api/v1/cv
 *
 * Retrieve the complete CV data.
 * This is a public endpoint, no authentication required.
 *
 * @param request - Incoming request
 * @param env - Environment bindings
 * @returns JSON response with CV data or 404
 */
export async function handleGetCV(
  request: Request,
  env: CVHandlerEnv
): Promise<Response> {
  try {
    console.log(`[CV] GET: Fetching data from KV key "${CV_DATA_KEY}"`)
    const adapter = createAdapter(env)
    const data = await adapter.getData()

    if (!data) {
      console.warn(`[CV] GET: No data found at key "${CV_DATA_KEY}"`)
      return notFound(
        `CV data not found. KV key "${CV_DATA_KEY}" is empty. ` +
          'Seed with: npx wrangler kv key put "cv:data:v1" --path=src/data/cv-data.json --remote'
      )
    }

    console.log(
      `[CV] GET: Successfully retrieved CV data from "${CV_DATA_KEY}"`
    )

    // Get metadata for cache headers
    const metadata = await adapter.getMetadata()

    // Add cache headers for CDN caching
    const headers: HeadersInit = {}
    if (metadata?.lastUpdated) {
      headers['Last-Modified'] = new Date(metadata.lastUpdated).toUTCString()
    }
    // Cache for 5 minutes at edge, revalidate in background
    headers['Cache-Control'] = 'public, max-age=300, stale-while-revalidate=60'

    return jsonResponse(data, HttpStatus.OK, { version: 'v1' }, headers)
  } catch (error) {
    console.error(`[CV] GET: Error retrieving from "${CV_DATA_KEY}":`, error)
    return internalError('Failed to retrieve CV data')
  }
}

/**
 * POST /api/v1/cv
 *
 * Create or replace complete CV data.
 * Requires authentication via Cloudflare Access.
 *
 * @param request - Incoming request with CV data in body
 * @param env - Environment bindings
 * @returns JSON response with created data or validation error
 */
export async function handlePostCV(
  request: Request,
  env: CVHandlerEnv
): Promise<Response> {
  const userEmail = request.headers.get('Cf-Access-Authenticated-User-Email')
  console.log(
    `[CV] POST: Received update request from "${userEmail || 'unknown'}"`
  )

  try {
    // Parse request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      console.warn('[CV] POST: Invalid JSON in request body')
      return badRequest('Invalid JSON in request body')
    }

    // Validate against schema
    const validation = validateCVData(body)
    if (!validation.success) {
      console.warn('[CV] POST: Validation failed', validation.error?.details)
      return validationError(
        'CV data validation failed',
        validation.error?.details
      )
    }

    // Store in KV - cast validated data to CVData type
    console.log(`[CV] POST: Storing data to KV key "${CV_DATA_KEY}"`)
    const adapter = createAdapter(env)
    const cvData = validation.data as CVData
    await adapter.updateData(cvData)

    console.log(
      `[CV] POST: Successfully stored CV data by "${userEmail || 'unknown'}"`
    )

    return jsonResponse(
      cvData,
      HttpStatus.CREATED,
      { version: 'v1' },
      { 'Cache-Control': 'no-cache' }
    )
  } catch (error) {
    console.error(`[CV] POST: Error storing to "${CV_DATA_KEY}":`, error)
    return internalError('Failed to store CV data')
  }
}

/**
 * GET /api/v1/cv/export
 *
 * Export CV data in JSON or YAML format for download.
 * This is a public endpoint for portability.
 *
 * Query parameters:
 * - format: 'json' (default) or 'yaml'
 *
 * @param request - Incoming request
 * @param env - Environment bindings
 * @returns File download response in requested format
 *
 * @example
 * GET /api/v1/cv/export           → JSON download
 * GET /api/v1/cv/export?format=yaml → YAML download
 */
export async function handleExportCV(
  request: Request,
  env: CVHandlerEnv
): Promise<Response> {
  try {
    // Parse format from query parameter
    const url = new URL(request.url)
    const formatParam = url.searchParams.get('format')
    const format = parseExportFormat(formatParam)

    if (!format) {
      return badRequest(
        `Invalid format: ${formatParam}. Supported formats: json, yaml`
      )
    }

    const adapter = createAdapter(env)
    const data = await adapter.getData()

    if (!data) {
      return notFound('CV data not found')
    }

    // Serialize data in requested format
    const dateStr = new Date().toISOString().split('T')[0]
    let content: string
    let filename: string

    if (format === 'yaml') {
      content = yaml.dump(data, {
        indent: 2, // Matches JSON formatting for consistency
        lineWidth: 120, // Prevents excessive line wrapping in long strings
        // Security: noRefs prevents YAML anchors/aliases which could be
        // exploited for "billion laughs" attacks on re-import
        noRefs: true,
        sortKeys: false, // Preserve schema key order for readability
      })
      filename = `cv-export-${dateStr}.yaml`
    } else {
      content = JSON.stringify(data, null, 2)
      filename = `cv-export-${dateStr}.json`
    }

    return new Response(content, {
      status: HttpStatus.OK,
      headers: {
        'Content-Type': FORMAT_CONTENT_TYPES[format],
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error exporting CV data:', error)
    return internalError('Failed to export CV data')
  }
}

/**
 * POST /api/v1/cv/import
 *
 * Import CV data from JSON or YAML.
 * Requires authentication via Cloudflare Access.
 * Validates data before import to prevent corruption.
 *
 * Content-Type header determines format:
 * - application/json → JSON parsing
 * - application/x-yaml, text/yaml → YAML parsing
 *
 * Query parameters:
 * - preview: 'true' → Validate only, don't save (dry run)
 *
 * @param request - Incoming request with CV data in body
 * @param env - Environment bindings
 * @returns JSON response with import result or validation error
 *
 * @example
 * POST /api/v1/cv/import
 * Content-Type: application/json
 * Body: { "version": "1.0", ... }
 *
 * @example
 * POST /api/v1/cv/import?preview=true
 * Content-Type: application/x-yaml
 * Body: version: "1.0"\n...
 */
export async function handleImportCV(
  request: Request,
  env: CVHandlerEnv
): Promise<Response> {
  try {
    // Check for preview mode (dry run)
    const url = new URL(request.url)
    const isPreview = url.searchParams.get('preview') === 'true'

    // Detect format from Content-Type header
    const contentType = request.headers.get('Content-Type')
    const format = detectImportFormat(contentType)

    if (!format) {
      return badRequest(
        `Unsupported Content-Type: ${contentType ?? 'none'}. ` +
          'Supported types: application/json, application/x-yaml, text/yaml'
      )
    }

    // Parse request body based on format
    let body: unknown
    try {
      const rawBody = await request.text()

      // Protect against YAML bombs and oversized payloads
      // 1MB is generous for CV data (typical CV JSON is 10-50KB)
      const MAX_IMPORT_SIZE = 1024 * 1024 // 1MB
      if (rawBody.length > MAX_IMPORT_SIZE) {
        return badRequest(
          `Import payload too large (${Math.round(rawBody.length / 1024)}KB). Maximum size: 1024KB`
        )
      }

      if (format === 'yaml') {
        // json: true prevents !!tag directives for additional security
        body = yaml.load(rawBody, { schema: yaml.JSON_SCHEMA, json: true })
      } else {
        body = JSON.parse(rawBody)
      }
    } catch (parseError) {
      const formatName = format.toUpperCase()
      return badRequest(
        `Invalid ${formatName} in request body: ${parseError instanceof Error ? parseError.message : 'parse error'}`
      )
    }

    // Validate against schema
    const validation = validateCVData(body)
    if (!validation.success) {
      return validationError(
        'Import validation failed. Please check your CV data format.',
        validation.error?.details
      )
    }

    const cvData = validation.data as CVData

    // Preview mode: return validation success without saving
    if (isPreview) {
      return jsonResponse(
        {
          message: 'Validation successful (preview mode - data not saved)',
          preview: true,
          format,
          version: cvData.version,
          sections: {
            personalInfo: !!cvData.personalInfo,
            experience: cvData.experience?.length ?? 0,
            skills: cvData.skills?.length ?? 0,
            education: cvData.education?.length ?? 0,
            certifications: cvData.certifications?.length ?? 0,
            languages: cvData.languages?.length ?? 0,
          },
        },
        HttpStatus.OK,
        { version: 'v1' }
      )
    }

    // Store in KV
    const adapter = createAdapter(env)
    await adapter.updateData(cvData)

    return jsonResponse(
      {
        message: 'CV data imported successfully',
        format,
        version: cvData.version,
      },
      HttpStatus.OK,
      { version: 'v1' }
    )
  } catch (error) {
    console.error('Error importing CV data:', error)
    return internalError('Failed to import CV data')
  }
}

/**
 * GET /api/v1/cv/sections/:section
 *
 * Retrieve a specific section of CV data.
 * This is a public endpoint for partial data access.
 *
 * @param request - Incoming request
 * @param env - Environment bindings
 * @param section - Section name (e.g., 'experience', 'skills')
 * @returns JSON response with section data or 404
 */
export async function handleGetSection(
  request: Request,
  env: CVHandlerEnv,
  section: string
): Promise<Response> {
  try {
    // Validate section name
    const validSections = [
      'personalInfo',
      'experience',
      'skills',
      'education',
      'certifications',
      'achievements',
      'languages',
      'metadata',
    ]

    if (!validSections.includes(section)) {
      return badRequest(
        `Invalid section: ${section}. Valid sections: ${validSections.join(', ')}`
      )
    }

    const adapter = createAdapter(env)
    const data = await adapter.getSection(
      section as keyof Awaited<ReturnType<typeof adapter.getData>>
    )

    if (data === null || data === undefined) {
      return notFound(`Section '${section}' not found`)
    }

    return jsonResponse(data, HttpStatus.OK, { version: 'v1' })
  } catch (error) {
    console.error(`Error retrieving section ${section}:`, error)
    return internalError(`Failed to retrieve section '${section}'`)
  }
}
