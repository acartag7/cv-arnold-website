#!/usr/bin/env node
/**
 * Sync local cv-data.json from Cloudflare KV
 *
 * This script fetches the current KV data and updates the local fallback file
 * to prevent stale data during builds and tests.
 *
 * Usage: node scripts/sync-local-from-kv.mjs
 */

import { execSync } from 'child_process'
import { createWriteStream } from 'fs'
import { writeFile, readFile } from 'fs/promises'
import { createGunzip } from 'zlib'
import { pipeline } from 'stream/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const KV_NAMESPACE_ID = 'c9df8a4271984ad8bb0a02c30ff3568d'
const KV_KEY = 'cv:data:v1'
const LOCAL_FILE = join(__dirname, '../src/data/cv-data.json')

async function main() {
  console.log('🔄 Fetching CV data from Cloudflare KV...')

  try {
    // Fetch raw binary data from KV
    const result = execSync(
      `npx wrangler kv key get "${KV_KEY}" --namespace-id=${KV_NAMESPACE_ID} --remote`,
      { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer, returns Buffer
    )

    // Check if it's gzip compressed (magic number 0x1f 0x8b)
    let jsonString
    if (result[0] === 0x1f && result[1] === 0x8b) {
      console.log('📦 Decompressing gzip data...')
      const { gunzipSync } = await import('zlib')
      jsonString = gunzipSync(result).toString('utf-8')
    } else {
      jsonString = result.toString('utf-8')
    }

    // Parse and extract data
    const parsed = JSON.parse(jsonString)

    // Handle StoredData wrapper if present
    const cvData =
      parsed.data && parsed.compressed !== undefined ? parsed.data : parsed

    console.log(
      `📋 Data retrieved: version=${cvData.version}, lastUpdated=${cvData.lastUpdated}`
    )
    console.log(`📊 Experience count: ${cvData.experience?.length || 0}`)
    console.log(
      `🎨 Theme config: ${cvData.themeConfig ? 'present' : 'missing'}`
    )

    // Write to local file with pretty formatting
    await writeFile(LOCAL_FILE, JSON.stringify(cvData, null, 2) + '\n')
    console.log(`✅ Local file updated: ${LOCAL_FILE}`)
  } catch (error) {
    console.error('❌ Failed to sync:', error.message)
    process.exit(1)
  }
}

main()
