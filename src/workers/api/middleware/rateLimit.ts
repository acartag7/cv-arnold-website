/**
 * Rate Limiting Middleware for Cloudflare Workers
 *
 * Implements rate limiting using the Sliding Window Counter algorithm,
 * which provides a good balance between accuracy and performance.
 *
 * ## Algorithm: Sliding Window Counter
 *
 * The sliding window counter approximates a true sliding window by:
 * 1. Dividing time into fixed windows (e.g., 1-minute buckets)
 * 2. Storing request counts for current and previous windows
 * 3. Calculating weighted average based on how far into the current window we are
 *
 * **Example:**
 * - Window size: 60 seconds
 * - Previous window: 80 requests
 * - Current window: 30 requests
 * - Time into current window: 15 seconds (25% through)
 *
 * Weighted count = (80 × 0.75) + 30 = 90 requests
 *
 * **Why Sliding Window Counter?**
 * - ✅ More accurate than Fixed Window (no boundary spike issues)
 * - ✅ Lower memory than True Sliding Window (only 2 counters vs. N timestamps)
 * - ✅ Simple to implement with KV storage
 * - ✅ Works well with Cloudflare's eventually consistent KV
 *
 * ## Storage Design
 *
 * Keys are stored in KV with format: `ratelimit:{identifier}:{windowKey}`
 * - `identifier`: Client IP or custom key
 * - `windowKey`: Unix timestamp floored to window start
 *
 * KV expiration is set to 2× window size to ensure previous window data
 * is available for the sliding calculation.
 *
 * @module workers/api/middleware/rateLimit
 */

import type { KVNamespace } from '@/services/storage/KVConfig'

/**
 * Rate limiter configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum requests allowed per window
   * @default 100
   */
  limit: number

  /**
   * Time window in seconds
   * @default 60 (1 minute)
   */
  windowSeconds: number

  /**
   * Key prefix for KV storage
   * @default 'ratelimit'
   */
  keyPrefix: string

  /**
   * Whether to skip rate limiting for authenticated requests
   * Useful when auth implies trusted access
   * @default false
   */
  skipAuthenticated: boolean

  /**
   * Custom identifier function
   * Default uses CF-Connecting-IP header
   */
  getIdentifier?: (request: Request) => string | null
}

/**
 * Rate limit status for a request
 */
export interface RateLimitStatus {
  /** Whether the request is allowed */
  allowed: boolean

  /** Current request count (weighted) */
  current: number

  /** Maximum allowed requests */
  limit: number

  /** Seconds until the window resets */
  resetSeconds: number

  /** Unix timestamp when the window resets */
  resetAt: number
}

/**
 * Default rate limit configuration
 *
 * - 100 requests per minute for public endpoints
 * - Uses client IP from Cloudflare header
 */
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  limit: 100,
  windowSeconds: 60,
  keyPrefix: 'ratelimit',
  skipAuthenticated: false,
}

/**
 * Get client identifier from request
 *
 * Uses Cloudflare's CF-Connecting-IP header which provides the real
 * client IP even through proxies. Falls back to generic identifier
 * if header is missing (shouldn't happen in production).
 *
 * @param request - Incoming request
 * @returns Client identifier string
 */
export function getClientIdentifier(request: Request): string {
  // CF-Connecting-IP is set by Cloudflare and contains the real client IP
  const cfIp = request.headers.get('CF-Connecting-IP')
  if (cfIp) return cfIp

  // X-Forwarded-For can be spoofed, but provides fallback for local dev
  const xForwardedFor = request.headers.get('X-Forwarded-For')
  if (xForwardedFor) {
    // Take the first IP (original client)
    const firstIp = xForwardedFor.split(',')[0]
    if (firstIp) return firstIp.trim()
  }

  // Fallback for local development without proxy
  return 'unknown-client'
}

/**
 * Calculate window key (floor timestamp to window boundary)
 *
 * @param timestampSeconds - Unix timestamp in seconds
 * @param windowSeconds - Window size in seconds
 * @returns Window key (floored timestamp)
 */
export function getWindowKey(
  timestampSeconds: number,
  windowSeconds: number
): number {
  return Math.floor(timestampSeconds / windowSeconds) * windowSeconds
}

/**
 * Sliding Window Rate Limiter
 *
 * Uses Cloudflare KV for distributed rate limiting across edge locations.
 * The sliding window counter algorithm provides accurate rate limiting
 * without the boundary burst issues of fixed windows.
 */
export class RateLimiter {
  private readonly config: RateLimitConfig
  private readonly kv: KVNamespace

  constructor(kv: KVNamespace, config: Partial<RateLimitConfig> = {}) {
    this.kv = kv
    this.config = { ...DEFAULT_RATE_LIMIT_CONFIG, ...config }
  }

  /**
   * Check and update rate limit for a request
   *
   * @param request - Incoming request
   * @returns Rate limit status
   */
  async check(request: Request): Promise<RateLimitStatus> {
    const identifier = this.config.getIdentifier
      ? this.config.getIdentifier(request)
      : getClientIdentifier(request)

    // If we can't identify the client, be permissive
    if (!identifier) {
      return {
        allowed: true,
        current: 0,
        limit: this.config.limit,
        resetSeconds: this.config.windowSeconds,
        resetAt: Math.floor(Date.now() / 1000) + this.config.windowSeconds,
      }
    }

    const now = Date.now()
    const nowSeconds = Math.floor(now / 1000)

    // Calculate current and previous window keys
    const currentWindow = getWindowKey(nowSeconds, this.config.windowSeconds)
    const previousWindow = currentWindow - this.config.windowSeconds

    // Build storage keys
    const currentKey = `${this.config.keyPrefix}:${identifier}:${currentWindow}`
    const previousKey = `${this.config.keyPrefix}:${identifier}:${previousWindow}`

    // Fetch both window counts in parallel
    const [currentCountStr, previousCountStr] = await Promise.all([
      this.kv.get(currentKey),
      this.kv.get(previousKey),
    ])

    const currentCount = parseInt(currentCountStr ?? '0', 10)
    const previousCount = parseInt(previousCountStr ?? '0', 10)

    // Calculate how far through the current window we are (0.0 to 1.0)
    const windowProgress =
      (nowSeconds - currentWindow) / this.config.windowSeconds

    // Sliding window calculation:
    // Weight the previous window by how much of it is still "in scope"
    const previousWeight = 1 - windowProgress
    const weightedCount = previousCount * previousWeight + currentCount

    // Calculate reset time (end of current window)
    const resetAt = currentWindow + this.config.windowSeconds
    const resetSeconds = resetAt - nowSeconds

    // Check if over limit
    if (weightedCount >= this.config.limit) {
      return {
        allowed: false,
        current: Math.ceil(weightedCount),
        limit: this.config.limit,
        resetSeconds,
        resetAt,
      }
    }

    // Increment counter for current window
    // Use expirationTtl to auto-cleanup old keys (2× window for sliding calc)
    //
    // Note: This read-modify-write is not atomic. Cloudflare KV is eventually
    // consistent, so concurrent requests across edge locations may result in
    // slightly inaccurate counts. This is acceptable for rate limiting:
    // - Worst case: allows slightly more requests than limit (briefly)
    // - The sliding window algorithm already approximates (~1% variance)
    // - Trade-off is acceptable for simplicity and global distribution
    await this.kv.put(currentKey, String(currentCount + 1), {
      expirationTtl: this.config.windowSeconds * 2,
    })

    return {
      allowed: true,
      current: Math.ceil(weightedCount) + 1, // +1 for this request
      limit: this.config.limit,
      resetSeconds,
      resetAt,
    }
  }
}

/**
 * HTTP status code for rate limit exceeded
 */
export const HTTP_TOO_MANY_REQUESTS = 429

/**
 * Create rate limit response headers
 *
 * Follows draft IETF rate limiting headers specification.
 * @see https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/
 *
 * @param status - Rate limit status
 * @returns Headers object with rate limit info
 */
export function createRateLimitHeaders(status: RateLimitStatus): Headers {
  const headers = new Headers()

  // Standard rate limit headers
  headers.set('X-RateLimit-Limit', String(status.limit))
  headers.set(
    'X-RateLimit-Remaining',
    String(Math.max(0, status.limit - status.current))
  )
  headers.set('X-RateLimit-Reset', String(status.resetAt))

  // Retry-After header (for 429 responses)
  if (!status.allowed) {
    headers.set('Retry-After', String(status.resetSeconds))
  }

  return headers
}

/**
 * Create 429 Too Many Requests response
 *
 * @param status - Rate limit status
 * @returns HTTP response with rate limit info
 */
export function tooManyRequests(status: RateLimitStatus): Response {
  const headers = createRateLimitHeaders(status)
  headers.set('Content-Type', 'application/json')

  const body = JSON.stringify({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Rate limit exceeded. Try again in ${status.resetSeconds} seconds.`,
      details: {
        limit: status.limit,
        current: status.current,
        resetAt: new Date(status.resetAt * 1000).toISOString(),
        retryAfter: status.resetSeconds,
      },
    },
  })

  return new Response(body, {
    status: HTTP_TOO_MANY_REQUESTS,
    headers,
  })
}

/**
 * Rate limit middleware options
 */
export interface RateLimitMiddlewareOptions {
  /**
   * KV namespace for storing rate limit data
   * If not provided, rate limiting is skipped (useful for dev)
   */
  kv?: KVNamespace

  /**
   * Rate limit configuration
   */
  config?: Partial<RateLimitConfig>
}

/**
 * Create rate limiting middleware
 *
 * Returns a middleware function that checks rate limits before
 * allowing requests to proceed. Adds rate limit headers to responses.
 *
 * @param options - Middleware options
 * @returns Middleware object with check and addHeaders methods
 *
 * @example
 * ```typescript
 * const rateLimiter = createRateLimitMiddleware({
 *   kv: env.RATE_LIMIT_KV,
 *   config: { limit: 100, windowSeconds: 60 }
 * })
 *
 * // In request handler:
 * const rateLimitResponse = await rateLimiter.check(request)
 * if (rateLimitResponse) {
 *   return rateLimitResponse // 429 response
 * }
 *
 * // Process request...
 * const response = await handler(request)
 *
 * // Add rate limit headers to response
 * return rateLimiter.addHeaders(response, status)
 * ```
 */
export function createRateLimitMiddleware(options: RateLimitMiddlewareOptions) {
  const limiter = options.kv
    ? new RateLimiter(options.kv, options.config)
    : null

  return {
    /**
     * Check if request should be rate limited
     *
     * @param request - Incoming request
     * @returns 429 response if rate limited, null if allowed
     */
    async check(
      request: Request
    ): Promise<{ response: Response | null; status: RateLimitStatus | null }> {
      // Skip if no KV configured (development mode)
      if (!limiter) {
        return { response: null, status: null }
      }

      const status = await limiter.check(request)

      if (!status.allowed) {
        return { response: tooManyRequests(status), status }
      }

      return { response: null, status }
    },

    /**
     * Add rate limit headers to a response
     *
     * @param response - Original response
     * @param status - Rate limit status (from check)
     * @returns Response with rate limit headers added
     */
    addHeaders(response: Response, status: RateLimitStatus | null): Response {
      if (!status) return response

      const rateLimitHeaders = createRateLimitHeaders(status)
      const newHeaders = new Headers(response.headers)

      rateLimitHeaders.forEach((value, key) => {
        newHeaders.set(key, value)
      })

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      })
    },
  }
}
