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
import { execSync } from 'child_process'

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
    const result = execSync(
      `npx wrangler kv key get "${config.kvKey}" --namespace-id="${config.kvNamespaceId}" --remote 2>/dev/null`,
      {
        encoding: 'utf-8',
        timeout: 30000, // 30 second timeout
      }
    )

    // Skip wrangler warnings and parse JSON
    const lines = result.split('\n')
    const jsonStart = lines.findIndex(line => line.trim().startsWith('{'))
    if (jsonStart === -1) {
      console.warn('[get-cv-data] No JSON found in KV response')
      return null
    }

    const jsonContent = lines.slice(jsonStart).join('\n')
    const data = JSON.parse(jsonContent)

    if (!isCVData(data)) {
      console.warn('[get-cv-data] KV data failed validation')
      return null
    }

    return data
  } catch (error) {
    console.warn('[get-cv-data] Failed to fetch from KV:', error)
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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const data = require('@/data/cv-data.json')

    if (!isCVData(data)) {
      console.warn('[get-cv-data] Local file data failed validation')
      return null
    }

    return data
  } catch (error) {
    console.warn('[get-cv-data] Failed to read local file:', error)
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
    console.log('[get-cv-data] Attempting to fetch from KV...')
    const kvData = await fetchFromKV(config)
    if (kvData) {
      console.log('[get-cv-data] Successfully fetched from KV')
      return kvData
    }
    console.log('[get-cv-data] KV fetch failed, falling back to local file')
  }

  // Fall back to local file
  const fileData = await fetchFromFile()
  if (fileData) {
    console.log('[get-cv-data] Using local file data')
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
