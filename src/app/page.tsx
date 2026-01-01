import { CVPageClient } from '@/components/CVPageClient'
import { getCVData } from '@/lib/get-cv-data'

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
  const cvData = await getCVData()

  return <CVPageClient data={cvData} />
}

/**
 * Static generation configuration
 * Ensures the page is statically generated at build time
 */
export const dynamic = 'force-static'
export const revalidate = false
