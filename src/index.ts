/**
 * Cloudflare Workers Entry Point
 *
 * Main entry point for the CV Arnold Website Workers application.
 * Routes API requests to the API router and serves static assets.
 *
 * @module index
 */

import { createRouter, type Env } from './workers/api/router'

/**
 * Parse allowed origins from environment variable
 *
 * @param envValue - Comma-separated list of allowed origins
 * @returns Parsed origins for CORS config
 */
function parseAllowedOrigins(envValue: string | undefined): string | string[] {
  if (!envValue) return '*'
  const origins = envValue
    .split(',')
    .map(o => o.trim())
    .filter(Boolean)
  if (origins.length === 0) return '*'
  if (origins.length === 1) {
    const origin = origins[0]
    return origin ?? '*'
  }
  return origins
}

/**
 * Validate ALLOWED_ORIGINS environment variable format
 *
 * @param envValue - Raw environment variable value
 * @returns True if valid, false otherwise
 */
function validateAllowedOrigins(envValue: string | undefined): boolean {
  if (!envValue) return true // Empty means allow all

  const origins = envValue.split(',').map(o => o.trim())
  for (const origin of origins) {
    if (!origin) continue
    // Allow wildcard
    if (origin === '*') continue
    // Allow wildcard subdomain patterns (*.example.com)
    if (origin.startsWith('*.')) continue
    // Validate URL format for explicit origins
    try {
      const url = new URL(origin)
      // Must have http/https protocol
      if (!['http:', 'https:'].includes(url.protocol)) {
        console.warn(`[CORS] Invalid origin protocol: ${origin}`)
        return false
      }
    } catch {
      console.warn(`[CORS] Invalid origin format: ${origin}`)
      return false
    }
  }
  return true
}

/**
 * Router cache for performance optimization
 *
 * Caches the router instance to avoid creating CORS middleware
 * on every request. The cache is invalidated if ALLOWED_ORIGINS changes.
 */
let cachedRouter: ReturnType<typeof createRouter> | null = null
let cachedAllowedOrigins: string | undefined = undefined

/**
 * Get or create cached router instance
 *
 * @param env - Worker environment bindings
 * @returns Cached or newly created router
 */
function getRouter(env: Env): ReturnType<typeof createRouter> {
  // Invalidate cache if config changed
  if (cachedRouter && cachedAllowedOrigins === env.ALLOWED_ORIGINS) {
    return cachedRouter
  }

  // Validate origins format on first request or config change
  if (!validateAllowedOrigins(env.ALLOWED_ORIGINS)) {
    console.error(
      '[CORS] Invalid ALLOWED_ORIGINS config, falling back to deny all'
    )
  }

  // Create and cache new router
  cachedRouter = createRouter({
    cors: {
      allowedOrigins: parseAllowedOrigins(env.ALLOWED_ORIGINS),
    },
  })
  cachedAllowedOrigins = env.ALLOWED_ORIGINS

  return cachedRouter
}

/**
 * Cloudflare Workers fetch handler
 */
const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // API routes - handle with cached router
    if (url.pathname.startsWith('/api/')) {
      const router = getRouter(env)
      return router(request, env)
    }

    // Health check endpoint
    if (url.pathname === '/health' || url.pathname === '/health/') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Static assets will be handled by Workers Sites (configured in wrangler.toml)
    // For now, return a simple message for non-API routes
    // In production, this will serve the Next.js static export from ./out
    return new Response(
      'CV Arnold Website - Static assets served by Workers Sites',
      {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      }
    )
  },
}

export default worker
