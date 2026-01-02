import { headers } from 'next/headers'
import { AdminLayoutClient } from './AdminLayoutClient'

/**
 * Admin Layout (Server Component)
 *
 * Wraps all admin pages with the admin shell (sidebar, header).
 * Reads Cloudflare Access headers to get authenticated user info.
 *
 * Authentication is handled by Cloudflare Access at the edge.
 * This layout just reads the authenticated user email from headers.
 *
 * Security Note: In production, Cloudflare Access validates JWTs at the edge
 * before requests reach this server. For additional security, consider
 * validating the `Cf-Access-Jwt-Assertion` header against your team's
 * public key from Cloudflare to prevent header spoofing.
 * See: https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()

  // Cloudflare Access sets this header after successful authentication
  const userEmail = headersList.get('Cf-Access-Authenticated-User-Email')

  // In development without Cloudflare Tunnel, userEmail will be null
  // The AdminLayoutClient handles this gracefully
  return <AdminLayoutClient userEmail={userEmail}>{children}</AdminLayoutClient>
}

/**
 * Admin routes must be dynamic (not statically generated)
 * to read request headers for authentication.
 * Note: OpenNext handles Cloudflare Workers deployment automatically.
 */
export const dynamic = 'force-dynamic'
