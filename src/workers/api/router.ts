/**
 * API Router for Cloudflare Workers
 *
 * URL-based routing with versioning support for the CV API.
 * Handles request routing, middleware execution, and error handling.
 *
 * ## Routing Architecture
 *
 * ### URL-based Versioning (`/api/v1/`)
 * Chosen over header-based versioning for:
 * - **Simplicity**: URLs are self-documenting and cacheable
 * - **Debuggability**: Easy to test with curl/browser
 * - **CDN Compatibility**: Works with Cloudflare's edge caching
 * - **Client Clarity**: No hidden version headers to manage
 *
 * ### Route Structure
 * ```
 * /api/v1/cv          GET     Public - Get full CV data
 * /api/v1/cv          POST    Auth   - Create/replace CV data
 * /api/v1/cv/export   GET     Public - Download CV as JSON file
 * /api/v1/cv/import   POST    Auth   - Import CV from JSON
 * /api/v1/cv/sections/:name   GET - Get specific section
 * ```
 *
 * @module workers/api/router
 */

import type { KVNamespace } from '@/services/storage/KVConfig'
import { notFound, methodNotAllowed, internalError } from './utils/response'
import { createCORSMiddleware, type CORSConfig } from './middleware/cors'
import { requireAuth } from './middleware/auth'
import {
  createRateLimitMiddleware,
  type RateLimitConfig,
} from './middleware/rateLimit'
import { createCacheMiddleware, type CacheConfig } from './middleware/cache'
import {
  handleGetCV,
  handlePostCV,
  handleExportCV,
  handleImportCV,
  handleGetSection,
} from './handlers/cv'
import {
  handleListHistory,
  handleGetSnapshot,
  handleCreateSnapshot,
  handleDeleteSnapshot,
} from './handlers/history'
import { handlePostContact } from './handlers/contact'

/**
 * Environment bindings for the Worker
 */
export interface Env {
  CV_DATA: KVNamespace
  /** Optional: KV namespace for rate limiting */
  RATE_LIMIT_KV?: KVNamespace
  /** Optional: Allowed CORS origins (comma-separated) */
  ALLOWED_ORIGINS?: string
  /** Optional: KV namespace for contact form submissions */
  CONTACT_SUBMISSIONS?: KVNamespace
  /** Cloudflare Turnstile secret key (for spam protection) */
  TURNSTILE_SECRET_KEY?: string
  /** Resend API key (for email delivery) */
  RESEND_API_KEY?: string
  /** Email address to receive contact submissions */
  CONTACT_EMAIL?: string
}

/**
 * Route definition
 */
interface Route {
  /** HTTP method */
  method: string
  /** URL pattern (supports :param for dynamic segments) */
  pattern: RegExp
  /** Request handler */
  handler: RouteHandler
  /** Whether authentication is required */
  requiresAuth: boolean
  /** Parameter names in order of capture groups */
  params?: string[]
}

/**
 * Route handler function signature
 */
type RouteHandler = (
  request: Request,
  env: Env,
  params: Record<string, string>
) => Promise<Response>

/**
 * Router configuration options
 */
export interface RouterConfig {
  /** API version prefix (default: 'v1') */
  version?: string
  /** CORS configuration */
  cors?: Partial<CORSConfig>
  /** Rate limiting configuration */
  rateLimit?: Partial<RateLimitConfig>
  /** Whether to enable rate limiting (default: true if RATE_LIMIT_KV is available) */
  enableRateLimit?: boolean
  /** Response cache configuration */
  cache?: Partial<CacheConfig>
  /** Whether to enable response caching (default: true) */
  enableCache?: boolean
}

/**
 * API route definitions
 */
const routes: Route[] = [
  // CV Data endpoints
  {
    method: 'GET',
    pattern: /^\/api\/v1\/cv\/?$/,
    handler: async (req, env) => handleGetCV(req, env),
    requiresAuth: false,
  },
  {
    method: 'POST',
    pattern: /^\/api\/v1\/cv\/?$/,
    handler: async (req, env) => handlePostCV(req, env),
    requiresAuth: true,
  },
  // Export/Import endpoints
  {
    method: 'GET',
    pattern: /^\/api\/v1\/cv\/export\/?$/,
    handler: async (req, env) => handleExportCV(req, env),
    requiresAuth: false,
  },
  {
    method: 'POST',
    pattern: /^\/api\/v1\/cv\/import\/?$/,
    handler: async (req, env) => handleImportCV(req, env),
    requiresAuth: true,
  },
  // Section endpoints
  {
    method: 'GET',
    pattern: /^\/api\/v1\/cv\/sections\/([a-zA-Z]+)\/?$/,
    handler: async (req, env, params) =>
      handleGetSection(req, env, params.section ?? ''),
    requiresAuth: false,
    params: ['section'],
  },
  // History endpoints
  {
    method: 'GET',
    pattern: /^\/api\/v1\/cv\/history\/?$/,
    handler: async (req, env) => handleListHistory(req, env),
    requiresAuth: true,
  },
  {
    method: 'GET',
    pattern: /^\/api\/v1\/cv\/history\/([a-zA-Z0-9-]+)\/?$/,
    handler: async (req, env, params) =>
      handleGetSnapshot(req, env, params.id ?? ''),
    requiresAuth: true,
    params: ['id'],
  },
  {
    method: 'POST',
    pattern: /^\/api\/v1\/cv\/history\/?$/,
    handler: async (req, env) => handleCreateSnapshot(req, env),
    requiresAuth: true,
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/v1\/cv\/history\/([a-zA-Z0-9-]+)\/?$/,
    handler: async (req, env, params) =>
      handleDeleteSnapshot(req, env, params.id ?? ''),
    requiresAuth: true,
    params: ['id'],
  },
  // Contact form endpoint (public, with its own rate limiting)
  {
    method: 'POST',
    pattern: /^\/api\/v1\/contact\/?$/,
    handler: async (req, env) => handlePostContact(req, env),
    requiresAuth: false,
  },
]

/**
 * Match a request to a route
 *
 * @param method - HTTP method
 * @param pathname - URL pathname
 * @returns Matched route and params, or null
 */
export function matchRoute(
  method: string,
  pathname: string
): { route: Route; params: Record<string, string> } | null {
  for (const route of routes) {
    const match = pathname.match(route.pattern)
    if (match && route.method === method) {
      // Extract named parameters
      const params: Record<string, string> = {}
      if (route.params) {
        route.params.forEach((name, index) => {
          const value = match[index + 1]
          if (value !== undefined) {
            params[name] = value
          }
        })
      }
      return { route, params }
    }
  }
  return null
}

/**
 * Check if any route matches the path (for method not allowed detection)
 *
 * @param pathname - URL pathname
 * @returns Array of allowed methods for this path
 */
export function getAllowedMethods(pathname: string): string[] {
  const methods: string[] = []
  for (const route of routes) {
    if (route.pattern.test(pathname)) {
      methods.push(route.method)
    }
  }
  // Always include OPTIONS for CORS
  if (methods.length > 0 && !methods.includes('OPTIONS')) {
    methods.push('OPTIONS')
  }
  return methods
}

/**
 * Create the API router
 *
 * @param config - Router configuration
 * @returns Request handler function
 */
export function createRouter(config: RouterConfig = {}) {
  const corsMiddleware = createCORSMiddleware(config.cors)

  // Create cache middleware (enabled by default)
  const cacheMiddleware =
    config.enableCache !== false
      ? createCacheMiddleware({
          ...(config.cache && { config: config.cache }),
        })
      : null

  return async function handleRequest(
    request: Request,
    env: Env
  ): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname
    const method = request.method

    // Generate request ID for distributed tracing and log correlation
    // Use existing X-Request-ID header if provided, otherwise generate new UUID
    const requestId = request.headers.get('X-Request-ID') ?? crypto.randomUUID()

    // Create rate limiter if KV is available and not explicitly disabled
    const rateLimiter =
      config.enableRateLimit !== false && env.RATE_LIMIT_KV
        ? createRateLimitMiddleware({
            kv: env.RATE_LIMIT_KV,
            ...(config.rateLimit && { config: config.rateLimit }),
          })
        : null

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      const response = corsMiddleware.handlePreflight(request)
      const headers = new Headers(response.headers)
      headers.set('X-Request-ID', requestId)
      return new Response(response.body, {
        status: response.status,
        headers,
      })
    }

    // Add CORS headers and request ID to all responses
    const addCORSHeaders = (response: Response): Response => {
      const corsHeaders = corsMiddleware.getHeaders(request)
      const newHeaders = new Headers(response.headers)
      corsHeaders.forEach((value, key) => {
        newHeaders.set(key, value)
      })
      // Propagate request ID for tracing
      newHeaders.set('X-Request-ID', requestId)
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      })
    }

    try {
      // Match route
      const matched = matchRoute(method, pathname)

      if (!matched) {
        // Check if path exists with different method
        const allowedMethods = getAllowedMethods(pathname)
        if (allowedMethods.length > 0) {
          return addCORSHeaders(methodNotAllowed(allowedMethods))
        }

        // Check if this is an API path at all
        if (pathname.startsWith('/api/')) {
          return addCORSHeaders(notFound(`API endpoint not found: ${pathname}`))
        }

        // Not an API path - let it fall through to static assets
        return addCORSHeaders(notFound('Not found'))
      }

      const { route, params } = matched

      // Check rate limit for public endpoints (authenticated requests bypass rate limiting)
      // This assumes authenticated users are trusted and shouldn't be rate limited
      let rateLimitStatus = null
      if (rateLimiter && !route.requiresAuth) {
        const { response: rateLimitResponse, status } =
          await rateLimiter.check(request)
        rateLimitStatus = status
        if (rateLimitResponse) {
          return addCORSHeaders(rateLimitResponse)
        }
      }

      // Check authentication if required
      if (route.requiresAuth) {
        const authError = requireAuth(request)
        if (authError) {
          return addCORSHeaders(authError)
        }
      }

      // Check cache for GET requests on public endpoints
      if (cacheMiddleware && method === 'GET' && !route.requiresAuth) {
        const cachedResponse = await cacheMiddleware.get(request)
        if (cachedResponse) {
          // Add rate limit headers to cached response
          let response = cachedResponse
          if (rateLimiter && rateLimitStatus) {
            response = rateLimiter.addHeaders(response, rateLimitStatus)
          }
          return addCORSHeaders(response)
        }
      }

      // Invalidate cache BEFORE write operations to prevent race conditions
      // This ensures concurrent GET requests don't serve stale data during POST
      if (cacheMiddleware && method === 'POST') {
        await cacheMiddleware.invalidate(request)
      }

      // Execute handler
      let response = await route.handler(request, env, params)

      // Cache successful GET responses
      if (cacheMiddleware && method === 'GET' && !route.requiresAuth) {
        response = await cacheMiddleware.put(request, response)
      }

      // Add rate limit headers to successful responses
      if (rateLimiter && rateLimitStatus) {
        response = rateLimiter.addHeaders(response, rateLimitStatus)
      }

      return addCORSHeaders(response)
    } catch (error) {
      console.error(`[${requestId}] Router error:`, error)
      return addCORSHeaders(internalError('An unexpected error occurred'))
    }
  }
}

/**
 * Default router instance
 */
export const router = createRouter()
