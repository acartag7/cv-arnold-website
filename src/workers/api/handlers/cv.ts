/**
 * CV Data Endpoint Handlers
 *
 * Handles CRUD operations for CV data via the Workers API.
 * Uses KVStorageAdapter for persistence and Zod for validation.
 *
 * @module workers/api/handlers/cv
 */

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
 * Environment bindings for CV handlers
 */
export interface CVHandlerEnv {
  CV_DATA: KVNamespace
}

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
    const adapter = createAdapter(env)
    const data = await adapter.getData()

    if (!data) {
      return notFound(
        'CV data not found. Please initialize with POST /api/v1/cv'
      )
    }

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
    console.error('Error retrieving CV data:', error)
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
  try {
    // Parse request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return badRequest('Invalid JSON in request body')
    }

    // Validate against schema
    const validation = validateCVData(body)
    if (!validation.success) {
      return validationError(
        'CV data validation failed',
        validation.error?.details
      )
    }

    // Store in KV - cast validated data to CVData type
    const adapter = createAdapter(env)
    const cvData = validation.data as CVData
    await adapter.updateData(cvData)

    return jsonResponse(
      cvData,
      HttpStatus.CREATED,
      { version: 'v1' },
      { 'Cache-Control': 'no-cache' }
    )
  } catch (error) {
    console.error('Error storing CV data:', error)
    return internalError('Failed to store CV data')
  }
}

/**
 * GET /api/v1/cv/export
 *
 * Export CV data in JSON format for download.
 * This is a public endpoint for portability.
 *
 * @param request - Incoming request
 * @param env - Environment bindings
 * @returns JSON file download response
 */
export async function handleExportCV(
  request: Request,
  env: CVHandlerEnv
): Promise<Response> {
  try {
    const adapter = createAdapter(env)
    const data = await adapter.getData()

    if (!data) {
      return notFound('CV data not found')
    }

    // Format as downloadable JSON
    const json = JSON.stringify(data, null, 2)
    const filename = `cv-export-${new Date().toISOString().split('T')[0]}.json`

    return new Response(json, {
      status: HttpStatus.OK,
      headers: {
        'Content-Type': 'application/json',
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
 * Import CV data from JSON.
 * Requires authentication via Cloudflare Access.
 * Validates data before import to prevent corruption.
 *
 * @param request - Incoming request with CV JSON in body
 * @param env - Environment bindings
 * @returns JSON response with imported data or validation error
 */
export async function handleImportCV(
  request: Request,
  env: CVHandlerEnv
): Promise<Response> {
  try {
    // Parse request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return badRequest('Invalid JSON in request body')
    }

    // Validate against schema
    const validation = validateCVData(body)
    if (!validation.success) {
      return validationError(
        'Import validation failed. Please check your CV data format.',
        validation.error?.details
      )
    }

    // Store in KV - cast validated data to CVData type
    const adapter = createAdapter(env)
    const cvData = validation.data as CVData
    await adapter.updateData(cvData)

    return jsonResponse(
      { message: 'CV data imported successfully', version: cvData.version },
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
