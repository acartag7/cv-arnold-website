/**
 * CV Data Fetching Layer
 *
 * Provides a unified interface for fetching CV data from:
 * - Cloudflare KV (production/build)
 * - Local JSON file (development fallback)
 *
 * This module abstracts the data source, making the frontend
 * agnostic to where the data comes from.
 *
 * @module lib/get-cv-data
 */

import type { CVData } from '@/types/cv'
import { isCVData } from '@/types/cv'
import { execFileSync } from 'child_process'
import { createLogger } from './logger'

const logger = createLogger('get-cv-data')

/**
 * Configuration for data fetching
 */
interface CVDataConfig {
  /** KV namespace ID for CV_DATA */
  kvNamespaceId: string
  /** Key used to store CV data in KV */
  kvKey: string
  /** Path to fallback JSON file */
  fallbackPath: string
}

const DEFAULT_CONFIG: CVDataConfig = {
  kvNamespaceId:
    process.env.KV_CV_DATA_ID || 'c9df8a4271984ad8bb0a02c30ff3568d',
  kvKey: 'cv_data',
  fallbackPath: './src/data/cv-data.json',
}

/**
 * Fetch CV data from Cloudflare KV using wrangler CLI
 *
 * This is used at build time to fetch the latest data from KV.
 * The wrangler CLI handles authentication via the saved credentials.
 *
 * @param config - Configuration options
 * @returns CV data or null if fetch fails
 */
async function fetchFromKV(
  config: CVDataConfig = DEFAULT_CONFIG
): Promise<CVData | null> {
  try {
    // Use wrangler CLI to fetch from KV
    // This works during build if wrangler is authenticated
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
        timeout: 30000, // 30 second timeout
        stdio: ['pipe', 'pipe', 'pipe'], // Capture stderr too
      }
    )

    // Skip wrangler warnings and parse JSON
    const lines = result.split('\n')
    const jsonStart = lines.findIndex(line => line.trim().startsWith('{'))
    if (jsonStart === -1) {
      logger.warn('No JSON found in KV response')
      return null
    }

    const jsonContent = lines.slice(jsonStart).join('\n')
    const data = JSON.parse(jsonContent)

    if (!isCVData(data)) {
      logger.warn('KV data failed validation')
      return null
    }

    return data
  } catch (error) {
    logger.warn('Failed to fetch from KV', {
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
 * Priority:
 * 1. Cloudflare KV (if CI=true or NODE_ENV=production and wrangler is available)
 * 2. Local JSON file (development fallback)
 *
 * @param options - Optional configuration
 * @returns CV data
 * @throws Error if no data source is available
 */
export async function getCVData(
  options: Partial<CVDataConfig> = {}
): Promise<CVData> {
  const config = { ...DEFAULT_CONFIG, ...options }

  const isProduction = process.env.NODE_ENV === 'production'
  const isCI = process.env.CI === 'true'
  const forceKV = process.env.USE_KV === 'true'

  // In production/CI builds, try KV first
  if (isProduction || isCI || forceKV) {
    logger.info('Attempting to fetch from KV')
    const kvData = await fetchFromKV(config)
    if (kvData) {
      logger.info('Successfully fetched from KV')
      return kvData
    }
    logger.info('KV fetch failed, falling back to local file')
  }

  // Fall back to local file
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
  fetchFromKV,
  fetchFromFile,
  DEFAULT_CONFIG,
}
