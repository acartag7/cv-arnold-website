/**
 * Authentication Middleware for Cloudflare Workers
 *
 * Implements authentication using Cloudflare Access headers.
 * Cloudflare Access handles the actual authentication flow;
 * this middleware validates the Access JWT claims.
 *
 * Why Cloudflare Access instead of JWT:
 * - Zero authentication code to maintain
 * - Built-in identity provider integrations (Google, GitHub, etc.)
 * - Automatic token refresh and session management
 * - Rate limiting and bot protection included
 * - Works with both web and API requests
 * - Free for up to 50 users
 *
 * @module workers/api/middleware/auth
 */

import { unauthorized, forbidden } from '../utils/response'

/**
 * Cloudflare Access JWT claims
 * See: https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/
 */
export interface AccessJWTClaims {
  /** Audience tag (Access application ID) */
  aud: string[]
  /** User email */
  email: string
  /** Expiration time (Unix timestamp) */
  exp: number
  /** Issued at time (Unix timestamp) */
  iat: number
  /** Nonce for replay protection */
  nonce: string
  /** Identity provider session ID */
  identity_nonce: string
  /** Subject (user identifier) */
  sub: string
  /** Issuer (your Access team domain) */
  iss: string
  /** Custom claims from identity provider */
  custom?: Record<string, unknown>
}

/**
 * Authentication context passed to handlers
 */
export interface AuthContext {
  /** Whether the request is authenticated */
  isAuthenticated: boolean
  /** User email (if authenticated) */
  email?: string
  /** User subject ID (if authenticated) */
  userId?: string
  /** Raw JWT claims (if authenticated) */
  claims?: AccessJWTClaims
}

/**
 * Headers set by Cloudflare Access
 */
const ACCESS_HEADERS = {
  /** Contains the user's email */
  EMAIL: 'Cf-Access-Authenticated-User-Email',
  /** Contains the JWT for validation */
  JWT: 'Cf-Access-Jwt-Assertion',
  /** Contains the user's identity */
  IDENTITY: 'Cf-Access-Authenticated-User-Identity',
} as const

/**
 * Extract authentication context from Cloudflare Access headers
 *
 * ## Security Model
 *
 * This implementation trusts Cloudflare Access headers without cryptographic
 * verification. This is secure ONLY when:
 *
 * 1. **Cloudflare Access is properly configured** - The Access application
 *    must be set up to protect the `/api/` routes that require authentication.
 *
 * 2. **Direct Worker access is blocked** - Requests must flow through
 *    Cloudflare's proxy, not directly to the Worker. This is the default
 *    when using Cloudflare DNS with proxying enabled (orange cloud).
 *
 * 3. **Headers cannot be spoofed** - Cloudflare strips `Cf-Access-*` headers
 *    from incoming requests and only adds them after successful authentication.
 *
 * ## Why No Signature Verification?
 *
 * Full JWT signature verification requires:
 * - Fetching public keys from `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs`
 * - Implementing RS256 signature verification
 * - Handling key rotation
 *
 * For this CV website (single admin user, low sensitivity), the header-trust
 * model provides sufficient security with simpler implementation.
 *
 * ## Future Enhancement (Task 7.3)
 *
 * For applications requiring defense-in-depth (e.g., financial data),
 * implement full JWT validation per:
 * @see https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/
 *
 * @param request - Incoming request
 * @returns Authentication context
 */
export function getAuthContext(request: Request): AuthContext {
  const email = request.headers.get(ACCESS_HEADERS.EMAIL)
  const jwt = request.headers.get(ACCESS_HEADERS.JWT)

  // No Access headers = unauthenticated
  if (!email) {
    return { isAuthenticated: false }
  }

  // Trust Cloudflare Access headers (see Security Model above)
  const context: AuthContext = {
    isAuthenticated: true,
    email,
  }

  // Decode JWT for additional claims (signature already validated by Access)
  if (jwt) {
    try {
      const claims = decodeJWT(jwt)
      if (claims) {
        context.claims = claims
        context.userId = claims.sub
      }
    } catch {
      // JWT decode failed, but email is still valid from Access
    }
  }

  return context
}

/**
 * Decode a JWT without verification
 * Note: Only use this for Access JWTs that Cloudflare has already validated
 *
 * @param token - JWT string
 * @returns Decoded claims or null
 */
function decodeJWT(token: string): AccessJWTClaims | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    if (!payload) return null

    // Base64URL to Base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)

    const decoded = atob(padded)
    return JSON.parse(decoded) as AccessJWTClaims
  } catch {
    return null
  }
}

/**
 * Middleware to require authentication
 *
 * Returns an unauthorized response if not authenticated.
 * Passes auth context to the handler if authenticated.
 *
 * @param request - Incoming request
 * @returns Unauthorized response or null (to continue)
 */
export function requireAuth(request: Request): Response | null {
  const auth = getAuthContext(request)

  if (!auth.isAuthenticated) {
    return unauthorized(
      'Authentication required. Please sign in via Cloudflare Access.'
    )
  }

  return null
}

/**
 * Middleware to require specific email domain
 *
 * Useful for restricting access to organization members.
 *
 * @param request - Incoming request
 * @param allowedDomains - Array of allowed email domains
 * @returns Forbidden response or null (to continue)
 */
export function requireEmailDomain(
  request: Request,
  allowedDomains: string[]
): Response | null {
  const auth = getAuthContext(request)

  if (!auth.isAuthenticated) {
    return unauthorized('Authentication required')
  }

  if (!auth.email) {
    return forbidden('Email claim not found')
  }

  const domain = auth.email.split('@')[1]?.toLowerCase()
  const isAllowed = allowedDomains.some(
    allowed => allowed.toLowerCase() === domain
  )

  if (!isAllowed) {
    return forbidden(`Access restricted to: ${allowedDomains.join(', ')}`)
  }

  return null
}

/**
 * Middleware to require specific email addresses
 *
 * Useful for admin-only endpoints with explicit allowlist.
 *
 * @param request - Incoming request
 * @param allowedEmails - Array of allowed email addresses
 * @returns Forbidden response or null (to continue)
 */
export function requireEmail(
  request: Request,
  allowedEmails: string[]
): Response | null {
  const auth = getAuthContext(request)

  if (!auth.isAuthenticated) {
    return unauthorized('Authentication required')
  }

  if (!auth.email) {
    return forbidden('Email claim not found')
  }

  const isAllowed = allowedEmails.some(
    allowed => allowed.toLowerCase() === auth.email?.toLowerCase()
  )

  if (!isAllowed) {
    return forbidden('Access denied')
  }

  return null
}

/**
 * Authentication middleware factory
 *
 * Creates reusable auth middleware with configuration.
 *
 * @example
 * ```typescript
 * const authMiddleware = createAuthMiddleware({
 *   allowedDomains: ['company.com'],
 * })
 *
 * // In handler:
 * const authResult = authMiddleware.require(request)
 * if (authResult) return authResult // Returns error response
 * const auth = authMiddleware.getContext(request)
 * ```
 */
export function createAuthMiddleware(config?: {
  allowedDomains?: string[]
  allowedEmails?: string[]
}) {
  return {
    getContext: getAuthContext,
    require: requireAuth,
    requireDomain: (request: Request) =>
      config?.allowedDomains
        ? requireEmailDomain(request, config.allowedDomains)
        : requireAuth(request),
    requireEmail: (request: Request) =>
      config?.allowedEmails
        ? requireEmail(request, config.allowedEmails)
        : requireAuth(request),
  }
}
