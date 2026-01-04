/**
 * CV Data Fetching Layer
 *
 * Provides a unified interface for fetching CV data from:
 * - Cloudflare KV binding (runtime SSR via OpenNext)
 * - Cloudflare KV via wrangler CLI (build-time fallback)
 * - Local JSON file (development fallback)
 *
 * This module abstracts the data source, making the frontend
 * agnostic to where the data comes from.
 *
 * @module lib/get-cv-data
 */

import type { CVData } from '@/types/cv'
import { isCVData } from '@/types/cv'
import { isGzipData } from '@/services/storage/KVConfig'
import { createLogger } from './logger'

const logger = createLogger('get-cv-data')

/**
 * KV binding interface for CV_DATA
 * Matches the subset of KVNamespace we use
 * Supports both JSON and ArrayBuffer reads for compression handling
 */
interface CVDataKVBinding {
  get(key: string, options: 'json'): Promise<unknown>
  get(key: string, options: 'arrayBuffer'): Promise<ArrayBuffer | null>
}

/**
 * StoredData wrapper format used by KVStorageAdapter
 * When data is written via the API, it's wrapped in this format
 */
interface StoredData<T = unknown> {
  data: T
  compressed: boolean
  timestamp: string
}

/**
 * Type guard to check if data is wrapped in StoredData format
 */
function isStoredData<T>(data: unknown): data is StoredData<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    'compressed' in data &&
    'timestamp' in data
  )
}

/**
 * Decompress gzip data using the Web Streams API
 *
 * Uses DecompressionStream which is available in Cloudflare Workers runtime.
 * This allows the public site SSR to read compressed data from KV.
 */
async function decompressData(buffer: ArrayBuffer): Promise<string> {
  const stream = new Blob([buffer])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'))

  const chunks: Uint8Array[] = []
  const reader = stream.getReader()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    // Combine chunks and decode to string
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0

    for (const chunk of chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }

    return new TextDecoder().decode(result)
  } finally {
    // Always release the reader to prevent memory leaks
    reader.releaseLock()
  }
}

/**
 * Configuration for data fetching
 */
interface CVDataConfig {
  /** KV namespace ID for CV_DATA (used for wrangler CLI fallback) */
  kvNamespaceId: string
  /** Key used to store CV data in KV */
  kvKey: string
  /** Path to fallback JSON file */
  fallbackPath: string
}

const DEFAULT_CONFIG: CVDataConfig = {
  kvNamespaceId:
    process.env.KV_CV_DATA_ID || 'c9df8a4271984ad8bb0a02c30ff3568d',
  // Unified key format: matches KVStorageAdapter (cv:data:v1)
  // Previously was 'cv_data' (legacy format)
  kvKey: 'cv:data:v1',
  fallbackPath: './src/data/cv-data.json',
}

/** Timeout for wrangler CLI operations (module-level to avoid re-parsing) */
const KV_TIMEOUT_MS = parseInt(process.env.KV_FETCH_TIMEOUT_MS || '10000', 10)

/**
 * Type guard to validate KV binding shape at runtime
 * Catches configuration errors with clear error messages
 */
function isCVDataKVBinding(value: unknown): value is CVDataKVBinding {
  return (
    value != null &&
    typeof value === 'object' &&
    'get' in value &&
    typeof (value as CVDataKVBinding).get === 'function'
  )
}

/**
 * Fetch CV data from Cloudflare KV using worker binding (runtime)
 *
 * This uses OpenNext's getCloudflareContext to access the KV binding
 * directly at request time, enabling real-time data updates.
 *
 * Uses BINARY-FIRST approach to handle both compressed and uncompressed data:
 * 1. Read as ArrayBuffer (works for both formats)
 * 2. Check gzip magic number (0x1f 0x8b) to detect compression
 * 3. Decompress if gzip, otherwise decode as UTF-8 text
 * 4. Parse JSON and unwrap StoredData format if present
 *
 * @param kvKey - The key to fetch from KV
 * @returns CV data or null if fetch fails
 */
async function fetchFromKVBinding(
  kvKey: string = DEFAULT_CONFIG.kvKey
): Promise<CVData | null> {
  try {
    // Dynamic import to avoid issues during build time
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')

    // Use async mode for server components
    const { env } = await getCloudflareContext({ async: true })

    // Validate KV binding shape at runtime (catches configuration errors)
    const potentialBinding = (env as Record<string, unknown>).CV_DATA
    if (!isCVDataKVBinding(potentialBinding)) {
      logger.warn('CV_DATA KV binding not available or invalid', {
        hasBinding: potentialBinding != null,
        bindingType: typeof potentialBinding,
      })
      return null
    }

    // BINARY-FIRST: Read as ArrayBuffer to handle both compressed and uncompressed
    const buffer = await potentialBinding.get(kvKey, 'arrayBuffer')

    if (!buffer || buffer.byteLength === 0) {
      logger.warn('No data found in KV for key', { kvKey })
      return null
    }

    // Detect format by checking gzip magic number (0x1f 0x8b)
    let jsonString: string
    if (isGzipData(buffer)) {
      logger.debug('Decompressing gzip data from KV binding', { kvKey })
      jsonString = await decompressData(buffer)
      logger.debug('KV data decompressed', {
        kvKey,
        compressedSize: buffer.byteLength,
        decompressedSize: jsonString.length,
      })
    } else {
      // Uncompressed: decode as UTF-8 text
      jsonString = new TextDecoder().decode(buffer)
    }

    // Parse JSON
    const rawData = JSON.parse(jsonString)

    // Handle both formats:
    // 1. Raw CVData (from wrangler CLI seeding)
    // 2. Wrapped StoredData format (from KVStorageAdapter API writes)
    let data: unknown
    if (isStoredData(rawData)) {
      // Data is wrapped in StoredData format from KVStorageAdapter
      data = rawData.data
      logger.debug('KV data unwrapped from StoredData format', {
        kvKey,
        timestamp: rawData.timestamp,
      })
    } else {
      // Raw CVData format (legacy or from wrangler CLI)
      data = rawData
      logger.debug('KV data in raw format', { kvKey })
    }

    if (!isCVData(data)) {
      logger.warn('KV binding data failed validation')
      return null
    }

    return data
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const isCI = process.env.CI === 'true'

    // Detect if we're in a build context (no Request global = not runtime)
    const isBuildTime = typeof globalThis.Request === 'undefined'

    if (isCI || isBuildTime) {
      // Expected during build - use debug level
      logger.debug('KV binding not available during build', {
        error: errorMessage,
      })
    } else {
      // Unexpected at runtime - potential misconfiguration
      logger.warn('KV binding fetch failed at runtime', {
        error: errorMessage,
        hint: 'Check wrangler.pages.toml CV_DATA binding configuration',
      })
    }
    return null
  }
}

/**
 * Fetch CV data from Cloudflare KV using wrangler CLI (build-time)
 *
 * This is used as a fallback during build or when bindings are unavailable.
 * The wrangler CLI handles authentication via saved credentials.
 *
 * @param config - Configuration options
 * @returns CV data or null if fetch fails
 */
async function fetchFromWranglerCLI(
  config: CVDataConfig = DEFAULT_CONFIG
): Promise<CVData | null> {
  try {
    // Dynamic import to avoid bundling issues
    const { execFileSync } = await import('child_process')

    // Use wrangler CLI to fetch from KV
    // Using execFileSync with argument array to prevent command injection
    const result = execFileSync(
      'npx',
      [
        'wrangler',
        'kv',
        'key',
        'get',
        config.kvKey,
        `--namespace-id=${config.kvNamespaceId}`,
        '--remote',
      ],
      {
        encoding: 'utf-8',
        timeout: KV_TIMEOUT_MS,
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    )

    // Skip wrangler warnings and parse JSON
    const lines = result.split('\n')
    const jsonStart = lines.findIndex(line => line.trim().startsWith('{'))
    if (jsonStart === -1) {
      logger.warn('No JSON found in wrangler CLI response')
      return null
    }

    const jsonContent = lines.slice(jsonStart).join('\n')
    const rawData = JSON.parse(jsonContent)

    // Handle both formats (same as fetchFromKVBinding)
    let data: unknown
    if (isStoredData(rawData)) {
      if (rawData.compressed) {
        logger.warn('Wrangler CLI data is compressed - cannot decode')
        return null
      }
      data = rawData.data
    } else {
      data = rawData
    }

    if (!isCVData(data)) {
      logger.warn('Wrangler CLI data failed validation')
      return null
    }

    return data
  } catch (error) {
    logger.warn('Failed to fetch via wrangler CLI', {
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

/**
 * Fetch CV data from local JSON file
 *
 * Used as a fallback during development or when KV is unavailable.
 *
 * @returns CV data or null if file doesn't exist/is invalid
 */
async function fetchFromFile(): Promise<CVData | null> {
  try {
    // Dynamic import of the JSON file
    const jsonModule = await import('@/data/cv-data.json')
    const data = jsonModule.default || jsonModule

    if (!isCVData(data)) {
      logger.warn('Local file data failed validation')
      return null
    }

    return data
  } catch (error) {
    logger.warn('Failed to read local file', {
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

/**
 * Get CV data from the best available source
 *
 * Data Source Strategy:
 *
 * **Runtime (Cloudflare Workers):**
 * 1. KV binding via getCloudflareContext (fastest, real-time)
 * 2. Local JSON file (fallback - embedded in build)
 *
 * Note: Wrangler CLI is NOT used at runtime because it's a Node.js CLI tool
 * that cannot execute in the Cloudflare Workers JavaScript runtime.
 *
 * **Build-time (CI/local build):**
 * 1. Wrangler CLI to KV (requires wrangler auth)
 * 2. Local JSON file (fallback)
 *
 * @param options - Optional configuration
 * @returns CV data
 * @throws Error if no data source is available
 */
export async function getCVData(
  options: Partial<CVDataConfig> = {}
): Promise<CVData> {
  const config = { ...DEFAULT_CONFIG, ...options }

  const isCI = process.env.CI === 'true'

  // At runtime on Cloudflare Workers, try KV binding first (fastest path)
  // Note: If KV binding fails at runtime, we fall back to local file (not CLI)
  // because wrangler CLI cannot run in Workers runtime.
  if (!isCI) {
    logger.debug('Attempting to fetch from KV binding')
    const bindingData = await fetchFromKVBinding(config.kvKey)
    if (bindingData) {
      logger.info('Successfully fetched from KV binding')
      return bindingData
    }
    // KV binding failed - this is unexpected at runtime
    // Fall through to local file fallback
    logger.debug('KV binding not available, will use local file fallback')
  }

  // During CI/build, use wrangler CLI (Node.js environment)
  if (isCI) {
    logger.info('CI detected, attempting wrangler CLI fetch')
    const cliData = await fetchFromWranglerCLI(config)
    if (cliData) {
      logger.info('Successfully fetched via wrangler CLI')
      return cliData
    }
    logger.info('Wrangler CLI fetch failed, falling back to local file')
  }

  // Fall back to local file (always available - embedded in build)
  const fileData = await fetchFromFile()
  if (fileData) {
    logger.info('Using local file data')
    return fileData
  }

  throw new Error(
    '[get-cv-data] Failed to fetch CV data from any source. ' +
      'Ensure either KV is seeded or cv-data.json exists.'
  )
}

/**
 * Export default for convenient importing
 */
export default getCVData

// Export internal functions for testing
export const __testing = {
  fetchFromKVBinding,
  fetchFromWranglerCLI,
  fetchFromFile,
  isStoredData,
  isGzipData,
  decompressData,
  DEFAULT_CONFIG,
}
