/**
 * API Proxy Route
 *
 * Server-side proxy that forwards requests to the CV API with Cloudflare Access
 * service token authentication. This allows the admin panel (client-side) to
 * communicate with the API (protected by Cloudflare Access) without exposing
 * the service token to the browser.
 *
 * Flow:
 * 1. Admin panel calls /api/proxy/api/v1/cv
 * 2. This route adds CF-Access-Client-Id and CF-Access-Client-Secret headers
 * 3. Request is forwarded to api.arnoldcartagena.com/api/v1/cv
 * 4. Response is returned to admin panel
 *
 * @module app/api/proxy/[...path]/route
 */

import { NextRequest, NextResponse } from 'next/server'

// Environment variables (set in wrangler.toml or Cloudflare dashboard)
const API_URL = process.env.API_URL || 'https://api.arnoldcartagena.com'
const CF_ACCESS_CLIENT_ID = process.env.CF_ACCESS_CLIENT_ID
const CF_ACCESS_CLIENT_SECRET = process.env.CF_ACCESS_CLIENT_SECRET

/**
 * Proxy handler for all HTTP methods
 */
async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await params

  // Validate service token is configured
  if (!CF_ACCESS_CLIENT_ID || !CF_ACCESS_CLIENT_SECRET) {
    console.error('Service token not configured')
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CONFIG_ERROR',
          message: 'API proxy not configured',
        },
      },
      { status: 500 }
    )
  }

  // Build target URL
  const targetPath = '/' + path.join('/')
  const targetUrl = new URL(targetPath, API_URL)

  // Preserve query parameters
  const searchParams = request.nextUrl.searchParams
  searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value)
  })

  // Forward headers (excluding host and other problematic headers)
  const headers = new Headers()
  const skipHeaders = ['host', 'connection', 'keep-alive', 'transfer-encoding']

  request.headers.forEach((value, key) => {
    if (!skipHeaders.includes(key.toLowerCase())) {
      headers.set(key, value)
    }
  })

  // Add Cloudflare Access service token headers
  headers.set('CF-Access-Client-Id', CF_ACCESS_CLIENT_ID)
  headers.set('CF-Access-Client-Secret', CF_ACCESS_CLIENT_SECRET)

  try {
    // Forward the request
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body: request.body,
      // @ts-expect-error - duplex is required for streaming body
      duplex: 'half',
    })

    // Create response with same status and headers
    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      // Skip headers that shouldn't be forwarded
      if (
        !['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())
      ) {
        responseHeaders.set(key, value)
      }
    })

    // Return the proxied response
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: 'Failed to connect to API',
        },
      },
      { status: 502 }
    )
  }
}

// Export handlers for all HTTP methods
export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const PATCH = proxyRequest
export const DELETE = proxyRequest
