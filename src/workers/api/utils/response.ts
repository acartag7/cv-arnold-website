/**
 * Standardized API Response Utilities
 *
 * Provides consistent JSON response formatting for the Workers API.
 * All responses follow a standard envelope format for predictable
 * client-side handling.
 *
 * @module workers/api/utils/response
 */

/**
 * Standard API response envelope
 */
export interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: APIError
  meta?: APIMetadata
}

/**
 * API error structure
 */
export interface APIError {
  code: string
  message: string
  details?: unknown
}

/**
 * Response metadata
 */
export interface APIMetadata {
  timestamp: string
  requestId?: string
  version?: string
}

/**
 * HTTP status codes used in API responses
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus]

/**
 * Standard error codes for consistent error handling
 */
export const ErrorCodes = {
  // Client errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  RATE_LIMITED: 'RATE_LIMITED',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

/**
 * Default CORS headers for API responses
 */
const DEFAULT_HEADERS: HeadersInit = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
}

/**
 * Create standard response headers with CORS support
 */
export function createHeaders(
  additional?: HeadersInit,
  corsHeaders?: HeadersInit
): Headers {
  const headers = new Headers(DEFAULT_HEADERS)

  // Add CORS headers if provided
  if (corsHeaders) {
    const corsEntries =
      corsHeaders instanceof Headers
        ? Array.from(corsHeaders.entries())
        : Object.entries(corsHeaders)

    for (const [key, value] of corsEntries) {
      if (typeof value === 'string') {
        headers.set(key, value)
      }
    }
  }

  // Add additional headers
  if (additional) {
    const additionalEntries =
      additional instanceof Headers
        ? Array.from(additional.entries())
        : Object.entries(additional)

    for (const [key, value] of additionalEntries) {
      if (typeof value === 'string') {
        headers.set(key, value)
      }
    }
  }

  return headers
}

/**
 * Create a successful JSON response
 *
 * @param data - Response payload
 * @param status - HTTP status code (default: 200)
 * @param meta - Optional metadata
 * @param headers - Additional headers
 */
export function jsonResponse<T>(
  data: T,
  status: HttpStatusCode = HttpStatus.OK,
  meta?: Partial<APIMetadata>,
  headers?: HeadersInit
): Response {
  const body: APIResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: createHeaders(headers),
  })
}

/**
 * Create an error JSON response
 *
 * @param code - Error code
 * @param message - Human-readable error message
 * @param status - HTTP status code
 * @param details - Additional error details
 * @param headers - Additional headers
 */
export function errorResponse(
  code: ErrorCode | string,
  message: string,
  status: HttpStatusCode,
  details?: unknown,
  headers?: HeadersInit
): Response {
  const body: APIResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: createHeaders(headers),
  })
}

/**
 * Create a 400 Bad Request response
 */
export function badRequest(
  message: string,
  details?: unknown,
  headers?: HeadersInit
): Response {
  return errorResponse(
    ErrorCodes.INVALID_REQUEST,
    message,
    HttpStatus.BAD_REQUEST,
    details,
    headers
  )
}

/**
 * Create a 401 Unauthorized response
 */
export function unauthorized(
  message = 'Unauthorized',
  headers?: HeadersInit
): Response {
  return errorResponse(
    ErrorCodes.UNAUTHORIZED,
    message,
    HttpStatus.UNAUTHORIZED,
    undefined,
    headers
  )
}

/**
 * Create a 403 Forbidden response
 */
export function forbidden(
  message = 'Forbidden',
  headers?: HeadersInit
): Response {
  return errorResponse(
    ErrorCodes.FORBIDDEN,
    message,
    HttpStatus.FORBIDDEN,
    undefined,
    headers
  )
}

/**
 * Create a 404 Not Found response
 */
export function notFound(
  message = 'Resource not found',
  headers?: HeadersInit
): Response {
  return errorResponse(
    ErrorCodes.NOT_FOUND,
    message,
    HttpStatus.NOT_FOUND,
    undefined,
    headers
  )
}

/**
 * Create a 405 Method Not Allowed response
 */
export function methodNotAllowed(
  allowedMethods: string[],
  headers?: HeadersInit
): Response {
  const additionalHeaders = new Headers(headers)
  additionalHeaders.set('Allow', allowedMethods.join(', '))

  return errorResponse(
    ErrorCodes.METHOD_NOT_ALLOWED,
    `Method not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
    HttpStatus.METHOD_NOT_ALLOWED,
    undefined,
    additionalHeaders
  )
}

/**
 * Create a 422 Unprocessable Entity response (validation error)
 */
export function validationError(
  message: string,
  details?: unknown,
  headers?: HeadersInit
): Response {
  return errorResponse(
    ErrorCodes.VALIDATION_ERROR,
    message,
    HttpStatus.UNPROCESSABLE_ENTITY,
    details,
    headers
  )
}

/**
 * Create a 429 Too Many Requests response
 */
export function rateLimited(
  retryAfter: number,
  headers?: HeadersInit
): Response {
  const additionalHeaders = new Headers(headers)
  additionalHeaders.set('Retry-After', retryAfter.toString())

  return errorResponse(
    ErrorCodes.RATE_LIMITED,
    'Rate limit exceeded',
    HttpStatus.TOO_MANY_REQUESTS,
    { retryAfter },
    additionalHeaders
  )
}

/**
 * Create a 500 Internal Server Error response
 */
export function internalError(
  message = 'Internal server error',
  headers?: HeadersInit
): Response {
  return errorResponse(
    ErrorCodes.INTERNAL_ERROR,
    message,
    HttpStatus.INTERNAL_SERVER_ERROR,
    undefined,
    headers
  )
}

/**
 * Create a 503 Service Unavailable response
 */
export function serviceUnavailable(
  message = 'Service temporarily unavailable',
  headers?: HeadersInit
): Response {
  return errorResponse(
    ErrorCodes.SERVICE_UNAVAILABLE,
    message,
    HttpStatus.SERVICE_UNAVAILABLE,
    undefined,
    headers
  )
}
