import { CVData } from '@/types'
import { CVPageClient } from '@/components/CVPageClient'
import { getCVData } from '@/lib/get-cv-data'

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
    console.error('[HomePage] Failed to load CV data:', error)
    return null
  }
}

/**
 * CV Website - Main Page (Server Component)
 *
 * This server component fetches CV data at build time (SSG)
 * and passes it to the client component for rendering.
 *
 * Data sources (in priority order):
 * 1. Cloudflare KV (production/CI builds)
 * 2. Local cv-data.json (development fallback)
 */
export default async function HomePage() {
  const cvData = await safeFetchCVData()

  if (!cvData) {
    return <DataLoadError />
  }

  return <CVPageClient data={cvData} />
}

/**
 * Static generation configuration
 * Ensures the page is statically generated at build time
 */
export const dynamic = 'force-static'
export const revalidate = false
