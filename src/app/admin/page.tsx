import { getCVData } from '@/lib/get-cv-data'
import { AdminPageClient } from './AdminPageClient'

/**
 * Admin Page (Server Component)
 *
 * Fetches initial CV data at build time and passes to client component.
 * This is a placeholder admin page - Phase 1 will build the full CMS.
 */
export default async function AdminPage() {
  const cvData = await getCVData()

  return <AdminPageClient initialData={cvData} />
}

export const dynamic = 'force-static'
export const revalidate = false
