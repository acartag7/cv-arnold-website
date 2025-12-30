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
 * Cloudflare Workers fetch handler
 */
const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // API routes - handle with router
    if (url.pathname.startsWith('/api/')) {
      const router = createRouter({
        cors: {
          allowedOrigins: parseAllowedOrigins(env.ALLOWED_ORIGINS),
        },
      })
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
