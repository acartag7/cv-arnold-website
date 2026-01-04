/**
 * API Proxy Route
 *
 * Server-side proxy that forwards requests to the CV API using Cloudflare
 * Service Bindings. This allows the admin panel (client-side) to communicate
 * with the API worker directly without going over the public internet.
 *
 * Security Features:
 * - Service Binding (no secrets, no network hop, no Access validation needed)
 * - Path validation (prevents SSRF/traversal attacks)
 * - Request timeout (25s to stay under Worker limits)
 * - Body size limit (10MB to prevent memory exhaustion)
 * - Structured logging with request correlation
 *
 * @module app/api/proxy/[...path]/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

// Security constants
const REQUEST_TIMEOUT_MS = 25000 // 25s (under Cloudflare's 30s limit)
const MAX_BODY_SIZE = 10 * 1024 * 1024 // 10MB

// Allowed request headers (allowlist approach for security)
const ALLOWED_REQUEST_HEADERS = [
  'content-type',
  'accept',
  'accept-language',
  'x-request-id',
]

/**
 * Generate a request ID for tracing
 */
function getRequestId(request: NextRequest): string {
  return (
    request.headers.get('cf-ray') ||
    request.headers.get('x-request-id') ||
    crypto.randomUUID()
  )
}

/**
 * Structured logging helper
 */
function logProxy(
  type: 'request' | 'response' | 'error',
  data: Record<string, unknown>
): void {
  console.log(
    JSON.stringify({
      type: `proxy_${type}`,
      timestamp: Date.now(),
      ...data,
    })
  )
}

/**
 * Validate and sanitize the request path
 * Prevents SSRF and path traversal attacks
 */
function validatePath(pathSegments: string[]): {
  valid: boolean
  sanitized?: string
  error?: string
} {
  // Filter out dangerous segments
  const sanitized = pathSegments.filter(
    segment => segment && !segment.includes('..') && segment !== '.'
  )

  // Path must start with 'api/'
  if (sanitized.length === 0 || sanitized[0] !== 'api') {
    return {
      valid: false,
      error: "Path must start with 'api/'",
    }
  }

  return {
    valid: true,
    sanitized: '/' + sanitized.join('/'),
  }
}

/**
 * Check request body size
 */
function checkBodySize(request: NextRequest): {
  valid: boolean
  error?: string
} {
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return {
      valid: false,
      error: `Request body exceeds ${MAX_BODY_SIZE / 1024 / 1024}MB limit`,
    }
  }
  return { valid: true }
}

/**
 * Service binding interface for the API worker
 */
interface APIServiceBinding {
  fetch(request: Request): Promise<Response>
}

/**
 * Environment bindings type
 */
interface CloudflareEnv {
  API?: APIServiceBinding
}

/**
 * Proxy handler for all HTTP methods
 */
async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await params
  const requestId = getRequestId(request)

  // Get Cloudflare context with service binding
  let env: CloudflareEnv
  try {
    const context = getCloudflareContext()
    env = context.env as CloudflareEnv
  } catch {
    logProxy('error', {
      requestId,
      error: 'Failed to get Cloudflare context',
    })
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CONTEXT_ERROR',
          message: 'Failed to access Cloudflare context',
        },
      },
      { status: 500 }
    )
  }

  // Validate service binding is configured
  if (!env.API) {
    logProxy('error', {
      requestId,
      error: 'API service binding not configured',
    })
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CONFIG_ERROR',
          message: 'API service binding not configured',
        },
      },
      { status: 500 }
    )
  }

  // Validate path (SSRF prevention)
  const pathValidation = validatePath(path)
  if (!pathValidation.valid) {
    logProxy('error', {
      requestId,
      error: 'Invalid path',
      path: path.join('/'),
    })
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_PATH',
          message: pathValidation.error,
        },
      },
      { status: 400 }
    )
  }

  // Check body size limit
  const bodySizeCheck = checkBodySize(request)
  if (!bodySizeCheck.valid) {
    logProxy('error', {
      requestId,
      error: 'Payload too large',
      contentLength: request.headers.get('content-length'),
    })
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: bodySizeCheck.error,
        },
      },
      { status: 413 }
    )
  }

  // Build target URL (internal URL for service binding)
  const targetUrl = new URL(pathValidation.sanitized!, 'http://internal')

  // Preserve query parameters
  const searchParams = request.nextUrl.searchParams
  searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value)
  })

  // Build headers (allowlist approach)
  const headers = new Headers()
  ALLOWED_REQUEST_HEADERS.forEach(name => {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  })

  // Add request ID for tracing
  headers.set('X-Request-ID', requestId)

  logProxy('request', {
    requestId,
    method: request.method,
    path: pathValidation.sanitized,
  })

  // Setup timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    // Forward the request via service binding (direct worker-to-worker call)
    const response = await env.API.fetch(
      new Request(targetUrl.toString(), {
        method: request.method,
        headers,
        body: request.body,
        signal: controller.signal,
        // @ts-expect-error - duplex is required for streaming body
        duplex: 'half',
      })
    )

    clearTimeout(timeoutId)

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

    // Add request ID to response for tracing
    responseHeaders.set('X-Request-ID', requestId)

    logProxy('response', {
      requestId,
      status: response.status,
      path: pathValidation.sanitized,
    })

    // Return the proxied response
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    clearTimeout(timeoutId)

    // Handle timeout
    if (error instanceof Error && error.name === 'AbortError') {
      logProxy('error', {
        requestId,
        error: 'Request timeout',
        path: pathValidation.sanitized,
      })
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'GATEWAY_TIMEOUT',
            message: 'API request timed out',
          },
        },
        { status: 504 }
      )
    }

    // Handle other errors
    logProxy('error', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      path: pathValidation.sanitized,
    })

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
