/**
 * CORS Middleware for Cloudflare Workers
 *
 * Handles Cross-Origin Resource Sharing (CORS) for the API.
 * Configurable origins with support for preflight requests.
 *
 * @module workers/api/middleware/cors
 */

/**
 * CORS configuration options
 */
export interface CORSConfig {
  /** Allowed origins (use '*' for any, or array of specific origins) */
  allowedOrigins: string | string[]
  /** Allowed HTTP methods */
  allowedMethods: string[]
  /** Allowed request headers */
  allowedHeaders: string[]
  /** Headers to expose to the browser */
  exposedHeaders?: string[]
  /** Allow credentials (cookies, auth headers) */
  allowCredentials?: boolean
  /** Preflight cache duration in seconds */
  maxAge?: number
}

/**
 * Default CORS configuration
 *
 * These defaults are optimized for a public API with caching:
 * - `allowedOrigins: '*'` - Open by default, restrict via ALLOWED_ORIGINS env var
 * - `maxAge: 86400` (24 hours) - Browsers cache preflight responses to reduce
 *   OPTIONS requests. 24 hours is the maximum supported by most browsers
 *   (Chrome caps at 2 hours, Firefox at 24 hours). This significantly
 *   improves performance for cross-origin API calls.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age
 */
export const DEFAULT_CORS_CONFIG: CORSConfig = {
  allowedOrigins: '*',
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Remaining'],
  allowCredentials: false,
  maxAge: 86400, // 24 hours - browser max for preflight caching
}

/**
 * Check if an origin is allowed based on CORS config
 *
 * @param origin - The request origin
 * @param allowedOrigins - Allowed origins config
 * @returns Whether the origin is allowed
 */
export function isOriginAllowed(
  origin: string | null,
  allowedOrigins: string | string[]
): boolean {
  if (!origin) return false

  // Allow all origins
  if (allowedOrigins === '*') return true

  // Check against array of allowed origins
  if (Array.isArray(allowedOrigins)) {
    return allowedOrigins.some(allowed => {
      // Exact match
      if (allowed === origin) return true

      // Wildcard subdomain match (e.g., '*.example.com')
      if (allowed.startsWith('*.')) {
        const domain = allowed.slice(2)
        const originUrl = new URL(origin)
        return (
          originUrl.hostname === domain ||
          originUrl.hostname.endsWith(`.${domain}`)
        )
      }

      return false
    })
  }

  return false
}

/**
 * Generate CORS headers for a request
 *
 * @param request - Incoming request
 * @param config - CORS configuration
 * @returns Headers object with CORS headers
 */
export function getCORSHeaders(
  request: Request,
  config: CORSConfig = DEFAULT_CORS_CONFIG
): Headers {
  const headers = new Headers()
  const origin = request.headers.get('Origin')

  // Determine the allowed origin for the response
  if (config.allowedOrigins === '*') {
    headers.set('Access-Control-Allow-Origin', '*')
  } else if (origin && isOriginAllowed(origin, config.allowedOrigins)) {
    headers.set('Access-Control-Allow-Origin', origin)
    // Vary header is important when origin is dynamic
    headers.set('Vary', 'Origin')
  }

  // Allow credentials if configured
  if (config.allowCredentials) {
    headers.set('Access-Control-Allow-Credentials', 'true')
  }

  // Expose headers to the browser
  if (config.exposedHeaders?.length) {
    headers.set(
      'Access-Control-Expose-Headers',
      config.exposedHeaders.join(', ')
    )
  }

  return headers
}

/**
 * Generate preflight response headers
 *
 * @param request - Incoming OPTIONS request
 * @param config - CORS configuration
 * @returns Headers object with preflight CORS headers
 */
export function getPreflightHeaders(
  request: Request,
  config: CORSConfig = DEFAULT_CORS_CONFIG
): Headers {
  const headers = getCORSHeaders(request, config)

  // Preflight-specific headers
  headers.set('Access-Control-Allow-Methods', config.allowedMethods.join(', '))
  headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '))

  if (config.maxAge !== undefined) {
    headers.set('Access-Control-Max-Age', config.maxAge.toString())
  }

  return headers
}

/**
 * Handle CORS preflight (OPTIONS) request
 *
 * @param request - Incoming OPTIONS request
 * @param config - CORS configuration
 * @returns Preflight response
 */
export function handlePreflight(
  request: Request,
  config: CORSConfig = DEFAULT_CORS_CONFIG
): Response {
  const headers = getPreflightHeaders(request, config)

  return new Response(null, {
    status: 204,
    headers,
  })
}

/**
 * CORS middleware factory
 *
 * Creates a middleware that handles CORS for all requests.
 * Automatically handles OPTIONS preflight requests.
 *
 * @param config - CORS configuration
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const corsMiddleware = createCORSMiddleware({
 *   allowedOrigins: ['https://example.com'],
 *   allowCredentials: true,
 * })
 *
 * // In router:
 * const corsHeaders = corsMiddleware.getHeaders(request)
 * if (request.method === 'OPTIONS') {
 *   return corsMiddleware.handlePreflight(request)
 * }
 * ```
 */
export function createCORSMiddleware(config: Partial<CORSConfig> = {}) {
  const mergedConfig: CORSConfig = { ...DEFAULT_CORS_CONFIG, ...config }

  return {
    config: mergedConfig,
    getHeaders: (request: Request) => getCORSHeaders(request, mergedConfig),
    handlePreflight: (request: Request) =>
      handlePreflight(request, mergedConfig),
    isOriginAllowed: (origin: string | null) =>
      isOriginAllowed(origin, mergedConfig.allowedOrigins),
  }
}
