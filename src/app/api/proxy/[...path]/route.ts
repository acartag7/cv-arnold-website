/**
 * API Proxy Route
 *
 * Server-side proxy that forwards requests to the CV API using Cloudflare
 * Service Bindings. This allows the admin panel (client-side) to communicate
 * with the API worker directly without going over the public internet.
 *
 * Security Features:
 * - Service Binding (direct worker-to-worker, no network hop)
 * - Path validation (prevents SSRF/traversal attacks)
 * - Request timeout (25s to stay under Worker limits)
 * - Body size limit (10MB to prevent memory exhaustion)
 * - Structured logging with request correlation
 * - Cloudflare Access headers forwarded (preserves authentication context)
 *
 * Authentication Flow:
 * 1. User authenticates via Cloudflare Access (on /admin/* or /api/proxy/*)
 * 2. Cloudflare Access sets Cf-Access-* headers on the request
 * 3. This proxy forwards those headers to the API worker via Service Binding
 * 4. API worker validates the headers and authorizes the request
 *
 * @module app/api/proxy/[...path]/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

// Security constants
const REQUEST_TIMEOUT_MS = 25000 // 25s (under Cloudflare's 30s limit)
const MAX_BODY_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_RESPONSE_SIZE = 50 * 1024 * 1024 // 50MB (generous for CV data + images)

// Allowed request headers (allowlist approach for security)
const ALLOWED_REQUEST_HEADERS = [
  'content-type',
  'accept',
  'accept-language',
  'x-request-id',
  // Cloudflare Access headers - required for authenticated API calls
  // These are set by Cloudflare Access after successful authentication
  // and must be forwarded to the API worker via Service Binding
  'cf-access-authenticated-user-email',
  'cf-access-jwt-assertion',
]

// Allowed content types for request bodies (defense in depth)
const ALLOWED_CONTENT_TYPES = [
  'application/json',
  'application/x-yaml',
  'text/yaml',
  'text/plain',
  'multipart/form-data', // For file uploads
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
 * Validate content type for requests with body
 * Only allows known safe content types (defense in depth)
 */
function validateContentType(request: NextRequest): {
  valid: boolean
  error?: string
} {
  // Only validate for methods that typically have a body
  if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
    return { valid: true }
  }

  const contentType = request.headers.get('content-type')

  // No content-type header is ok (might be empty body)
  if (!contentType) {
    return { valid: true }
  }

  // Check if content type starts with any allowed type
  // (handles charset and boundary parameters like "application/json; charset=utf-8")
  const isAllowed = ALLOWED_CONTENT_TYPES.some(allowed =>
    contentType.toLowerCase().startsWith(allowed)
  )

  if (!isAllowed) {
    return {
      valid: false,
      error: `Content-Type '${contentType}' not allowed`,
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
  } catch (error) {
    logProxy('error', {
      requestId,
      error: 'Failed to get Cloudflare context',
      details: error instanceof Error ? error.message : String(error),
      hint: 'This usually means the code is running outside Cloudflare Workers runtime',
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

  // Validate content type (defense in depth)
  const contentTypeCheck = validateContentType(request)
  if (!contentTypeCheck.valid) {
    logProxy('error', {
      requestId,
      error: 'Invalid content type',
      contentType: request.headers.get('content-type'),
    })
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNSUPPORTED_MEDIA_TYPE',
          message: contentTypeCheck.error,
        },
      },
      { status: 415 }
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

  // Track timing for observability
  const startTime = Date.now()

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

    // Calculate request duration
    const durationMs = Date.now() - startTime

    // Check response size (defense in depth)
    const responseContentLength = response.headers.get('content-length')
    if (
      responseContentLength &&
      parseInt(responseContentLength, 10) > MAX_RESPONSE_SIZE
    ) {
      logProxy('error', {
        requestId,
        error: 'Response too large',
        contentLength: responseContentLength,
        durationMs,
      })
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RESPONSE_TOO_LARGE',
            message: 'API response exceeds size limit',
          },
        },
        { status: 502 }
      )
    }

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
      durationMs,
      contentLength: responseContentLength || 'unknown',
    })

    // Return the proxied response
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    clearTimeout(timeoutId)
    const durationMs = Date.now() - startTime

    // Handle timeout
    if (error instanceof Error && error.name === 'AbortError') {
      logProxy('error', {
        requestId,
        error: 'Request timeout',
        path: pathValidation.sanitized,
        durationMs,
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
      durationMs,
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
