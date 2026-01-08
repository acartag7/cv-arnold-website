import { CVData } from '@/types'
import { CVPageClient } from '@/components/CVPageClient'
import { getCVData } from '@/lib/get-cv-data'
import { createLogger } from '@/lib/logger'

const logger = createLogger('HomePage')

/**
 * Error fallback component for data loading failures
 */
function DataLoadError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Unable to Load CV Data
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Please ensure CV data is properly configured.
        </p>
      </div>
    </div>
  )
}

/**
 * Safely fetch CV data with error handling
 * Returns null on failure to allow graceful degradation
 */
async function safeFetchCVData(): Promise<CVData | null> {
  try {
    return await getCVData()
  } catch (error) {
    logger.error('Failed to load CV data', error)
    return null
  }
}

/**
 * CV Website - Main Page (Server Component)
 *
 * This server component fetches CV data at request time (SSR)
 * from Cloudflare KV and passes it to the client component.
 *
 * Data sources (in priority order):
 * 1. Cloudflare KV binding (runtime, via getCloudflareContext)
 * 2. Local cv-data.json (development fallback)
 *
 * Changes made in the admin CMS are reflected within the cache duration.
 */
export default async function HomePage() {
  const cvData = await safeFetchCVData()

  if (!cvData) {
    return <DataLoadError />
  }

  // Contact form configuration from environment variables
  // Only pass props if they're defined (CVPageClient handles undefined gracefully)
  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined
  const calLink = process.env.NEXT_PUBLIC_CAL_LINK || undefined

  return (
    <CVPageClient
      data={cvData}
      {...(turnstileSiteKey && { turnstileSiteKey })}
      {...(calLink && { calLink })}
    />
  )
}

/**
 * SSR with edge caching configuration
 *
 * - revalidate: Cache duration in seconds (60s = 1 minute)
 * - After cache expires, next request triggers fresh KV fetch
 * - Edge caching keeps performance fast while allowing updates
 */
export const revalidate = 60
