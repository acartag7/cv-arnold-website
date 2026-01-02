import { AdminDashboard } from './AdminDashboard'

/**
 * Admin Dashboard Page (Server Component)
 *
 * Entry point for the admin dashboard.
 * The actual dashboard UI is in AdminDashboard client component.
 */
export default function AdminPage() {
  return <AdminDashboard />
}

/**
 * Admin routes must be dynamic (not statically generated)
 * to read request headers for authentication.
 * Note: OpenNext handles Cloudflare Workers deployment automatically.
 */
export const dynamic = 'force-dynamic'
