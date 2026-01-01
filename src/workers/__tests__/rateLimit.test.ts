/**
 * Rate Limiting Middleware Tests
 *
 * Tests for the sliding window counter rate limiting implementation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  RateLimiter,
  getClientIdentifier,
  getWindowKey,
  createRateLimitHeaders,
  tooManyRequests,
  createRateLimitMiddleware,
  DEFAULT_RATE_LIMIT_CONFIG,
  HTTP_TOO_MANY_REQUESTS,
} from '../api/middleware/rateLimit'

/**
 * Mock KV namespace for testing
 */
function createMockKV() {
  const store = new Map<string, { value: string; expiration?: number }>()

  return {
    _store: store,
    _getAll: () => Object.fromEntries(store),

    get: vi.fn(async (key: string) => {
      const item = store.get(key)
      if (!item) return null
      // Check expiration
      if (item.expiration && Date.now() / 1000 > item.expiration) {
        store.delete(key)
        return null
      }
      return item.value
    }),

    put: vi.fn(
      async (
        key: string,
        value: string,
        options?: { expirationTtl?: number }
      ) => {
        if (options?.expirationTtl) {
          const expiration =
            Math.floor(Date.now() / 1000) + options.expirationTtl
          store.set(key, { value, expiration })
        } else {
          store.set(key, { value })
        }
      }
    ),

    delete: vi.fn(async (key: string) => {
      store.delete(key)
    }),
  }
}

/**
 * Create a mock request with optional headers
 */
function createRequest(
  url = 'https://api.example.com/api/v1/cv',
  headers: Record<string, string> = {}
): Request {
  return new Request(url, {
    headers: new Headers(headers),
  })
}

describe('Rate Limiting', () => {
  describe('getClientIdentifier', () => {
    it('should use CF-Connecting-IP when available', () => {
      const request = createRequest('https://api.example.com/', {
        'CF-Connecting-IP': '192.168.1.100',
      })
      expect(getClientIdentifier(request)).toBe('192.168.1.100')
    })

    it('should fall back to X-Forwarded-For first IP', () => {
      const request = createRequest('https://api.example.com/', {
        'X-Forwarded-For': '10.0.0.1, 10.0.0.2, 10.0.0.3',
      })
      expect(getClientIdentifier(request)).toBe('10.0.0.1')
    })

    it('should trim whitespace from X-Forwarded-For', () => {
      const request = createRequest('https://api.example.com/', {
        'X-Forwarded-For': '  10.0.0.1  , 10.0.0.2',
      })
      expect(getClientIdentifier(request)).toBe('10.0.0.1')
    })

    it('should prefer CF-Connecting-IP over X-Forwarded-For', () => {
      const request = createRequest('https://api.example.com/', {
        'CF-Connecting-IP': '192.168.1.100',
        'X-Forwarded-For': '10.0.0.1, 10.0.0.2',
      })
      expect(getClientIdentifier(request)).toBe('192.168.1.100')
    })

    it('should return unknown-client when no IP headers present', () => {
      const request = createRequest('https://api.example.com/')
      expect(getClientIdentifier(request)).toBe('unknown-client')
    })
  })

  describe('getWindowKey', () => {
    it('should floor timestamp to window boundary', () => {
      // 60 second window
      expect(getWindowKey(1000, 60)).toBe(960) // floor(1000/60)*60 = 960
      expect(getWindowKey(1059, 60)).toBe(1020) // floor(1059/60)*60 = 1020
      expect(getWindowKey(1060, 60)).toBe(1020) // floor(1060/60)*60 = 1020
      expect(getWindowKey(1061, 60)).toBe(1020) // floor(1061/60)*60 = 1020
    })

    it('should work with different window sizes', () => {
      // 30 second window
      expect(getWindowKey(100, 30)).toBe(90)
      // 120 second window
      expect(getWindowKey(200, 120)).toBe(120)
    })
  })

  describe('RateLimiter', () => {
    let mockKV: ReturnType<typeof createMockKV>

    beforeEach(() => {
      mockKV = createMockKV()
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:30.000Z'))
    })

    it('should allow requests under the limit', async () => {
      const limiter = new RateLimiter(mockKV as never, {
        limit: 10,
        windowSeconds: 60,
      })

      const request = createRequest('https://api.example.com/', {
        'CF-Connecting-IP': '192.168.1.1',
      })

      const status = await limiter.check(request)

      expect(status.allowed).toBe(true)
      expect(status.current).toBe(1)
      expect(status.limit).toBe(10)
    })

    it('should increment counter on each request', async () => {
      const limiter = new RateLimiter(mockKV as never, {
        limit: 10,
        windowSeconds: 60,
      })

      const request = createRequest('https://api.example.com/', {
        'CF-Connecting-IP': '192.168.1.1',
      })

      // Make 3 requests
      await limiter.check(request)
      await limiter.check(request)
      const status = await limiter.check(request)

      expect(status.allowed).toBe(true)
      expect(status.current).toBe(3)
    })

    it('should reject requests over the limit', async () => {
      const limiter = new RateLimiter(mockKV as never, {
        limit: 3,
        windowSeconds: 60,
      })

      const request = createRequest('https://api.example.com/', {
        'CF-Connecting-IP': '192.168.1.1',
      })

      // Make requests up to the limit
      await limiter.check(request)
      await limiter.check(request)
      await limiter.check(request)

      // This should be rejected
      const status = await limiter.check(request)

      expect(status.allowed).toBe(false)
      expect(status.current).toBeGreaterThanOrEqual(3)
    })

    it('should track different clients separately', async () => {
      const limiter = new RateLimiter(mockKV as never, {
        limit: 2,
        windowSeconds: 60,
      })

      const client1 = createRequest('https://api.example.com/', {
        'CF-Connecting-IP': '192.168.1.1',
      })
      const client2 = createRequest('https://api.example.com/', {
        'CF-Connecting-IP': '192.168.1.2',
      })

      // Client 1 makes 2 requests (at limit)
      await limiter.check(client1)
      await limiter.check(client1)

      // Client 2 should still be allowed
      const status = await limiter.check(client2)
      expect(status.allowed).toBe(true)
      expect(status.current).toBe(1)

      // Client 1 should be rejected
      const client1Status = await limiter.check(client1)
      expect(client1Status.allowed).toBe(false)
    })

    it('should include sliding window calculation from previous window', async () => {
      const limiter = new RateLimiter(mockKV as never, {
        limit: 10,
        windowSeconds: 60,
      })

      const request = createRequest('https://api.example.com/', {
        'CF-Connecting-IP': '192.168.1.1',
      })

      // Simulate 8 requests in the previous window
      const nowSeconds = Math.floor(Date.now() / 1000)
      const currentWindow = Math.floor(nowSeconds / 60) * 60
      const previousWindow = currentWindow - 60

      await mockKV.put(`ratelimit:192.168.1.1:${previousWindow}`, '8')

      // We're 30 seconds into the current window (50% through)
      // Previous window contributes: 8 * 0.5 = 4 weighted requests
      const status = await limiter.check(request)

      // Should be allowed: 4 (weighted previous) + 1 (current) = 5
      expect(status.allowed).toBe(true)
      // Current should reflect the weighted count + this request
      expect(status.current).toBe(5) // 4 weighted + 1 new
    })

    it('should be permissive when identifier is null', async () => {
      const limiter = new RateLimiter(mockKV as never, {
        limit: 1,
        windowSeconds: 60,
        getIdentifier: () => null,
      })

      const request = createRequest('https://api.example.com/')

      // Should allow even though limit is 1
      await limiter.check(request)
      await limiter.check(request)
      const status = await limiter.check(request)

      expect(status.allowed).toBe(true)
    })

    it('should set correct expiration TTL on KV entries', async () => {
      const limiter = new RateLimiter(mockKV as never, {
        limit: 10,
        windowSeconds: 60,
      })

      const request = createRequest('https://api.example.com/', {
        'CF-Connecting-IP': '192.168.1.1',
      })

      await limiter.check(request)

      // Verify put was called with correct expirationTtl
      expect(mockKV.put).toHaveBeenCalledWith(
        expect.stringContaining('ratelimit:192.168.1.1:'),
        '1',
        { expirationTtl: 120 } // 2 * windowSeconds
      )
    })
  })

  describe('createRateLimitHeaders', () => {
    it('should create standard rate limit headers', () => {
      const status = {
        allowed: true,
        current: 5,
        limit: 100,
        resetSeconds: 30,
        resetAt: 1705323630,
      }

      const headers = createRateLimitHeaders(status)

      expect(headers.get('X-RateLimit-Limit')).toBe('100')
      expect(headers.get('X-RateLimit-Remaining')).toBe('95')
      expect(headers.get('X-RateLimit-Reset')).toBe('1705323630')
      expect(headers.get('Retry-After')).toBeNull()
    })

    it('should include Retry-After when rate limited', () => {
      const status = {
        allowed: false,
        current: 100,
        limit: 100,
        resetSeconds: 45,
        resetAt: 1705323645,
      }

      const headers = createRateLimitHeaders(status)

      expect(headers.get('Retry-After')).toBe('45')
    })

    it('should not return negative remaining', () => {
      const status = {
        allowed: false,
        current: 150, // Over limit
        limit: 100,
        resetSeconds: 30,
        resetAt: 1705323630,
      }

      const headers = createRateLimitHeaders(status)

      expect(headers.get('X-RateLimit-Remaining')).toBe('0')
    })
  })

  describe('tooManyRequests', () => {
    it('should return 429 status', () => {
      const status = {
        allowed: false,
        current: 100,
        limit: 100,
        resetSeconds: 30,
        resetAt: 1705323630,
      }

      const response = tooManyRequests(status)

      expect(response.status).toBe(HTTP_TOO_MANY_REQUESTS)
      expect(response.status).toBe(429)
    })

    it('should include rate limit error in body', async () => {
      const status = {
        allowed: false,
        current: 100,
        limit: 100,
        resetSeconds: 30,
        resetAt: 1705323630,
      }

      const response = tooManyRequests(status)
      const body = await response.json()

      expect(body.success).toBe(false)
      expect(body.error.code).toBe('RATE_LIMIT_EXCEEDED')
      expect(body.error.message).toContain('30 seconds')
      expect(body.error.details.limit).toBe(100)
      expect(body.error.details.retryAfter).toBe(30)
    })

    it('should include rate limit headers', () => {
      const status = {
        allowed: false,
        current: 100,
        limit: 100,
        resetSeconds: 30,
        resetAt: 1705323630,
      }

      const response = tooManyRequests(status)

      expect(response.headers.get('X-RateLimit-Limit')).toBe('100')
      expect(response.headers.get('Retry-After')).toBe('30')
    })
  })

  describe('createRateLimitMiddleware', () => {
    let mockKV: ReturnType<typeof createMockKV>

    beforeEach(() => {
      mockKV = createMockKV()
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:30.000Z'))
    })

    it('should skip rate limiting when no KV provided', async () => {
      const middleware = createRateLimitMiddleware({})

      const request = createRequest('https://api.example.com/', {
        'CF-Connecting-IP': '192.168.1.1',
      })

      const { response, status } = await middleware.check(request)

      expect(response).toBeNull()
      expect(status).toBeNull()
    })

    it('should allow requests under limit', async () => {
      const middleware = createRateLimitMiddleware({
        kv: mockKV as never,
        config: { limit: 10, windowSeconds: 60 },
      })

      const request = createRequest('https://api.example.com/', {
        'CF-Connecting-IP': '192.168.1.1',
      })

      const { response, status } = await middleware.check(request)

      expect(response).toBeNull()
      expect(status?.allowed).toBe(true)
    })

    it('should return 429 response when limit exceeded', async () => {
      const middleware = createRateLimitMiddleware({
        kv: mockKV as never,
        config: { limit: 2, windowSeconds: 60 },
      })

      const request = createRequest('https://api.example.com/', {
        'CF-Connecting-IP': '192.168.1.1',
      })

      // Exhaust limit
      await middleware.check(request)
      await middleware.check(request)

      const { response } = await middleware.check(request)

      expect(response).not.toBeNull()
      expect(response?.status).toBe(429)
    })

    it('should add rate limit headers to response', async () => {
      const middleware = createRateLimitMiddleware({
        kv: mockKV as never,
        config: { limit: 100, windowSeconds: 60 },
      })

      const request = createRequest('https://api.example.com/', {
        'CF-Connecting-IP': '192.168.1.1',
      })

      const { status } = await middleware.check(request)
      const originalResponse = new Response('OK', { status: 200 })
      const enhanced = middleware.addHeaders(originalResponse, status)

      expect(enhanced.headers.get('X-RateLimit-Limit')).toBe('100')
      expect(enhanced.headers.get('X-RateLimit-Remaining')).toBe('99')
      expect(enhanced.headers.get('X-RateLimit-Reset')).toBeDefined()
    })

    it('should preserve original response when no status', () => {
      const middleware = createRateLimitMiddleware({})

      const originalResponse = new Response('OK', {
        status: 200,
        headers: { 'X-Custom': 'header' },
      })
      const enhanced = middleware.addHeaders(originalResponse, null)

      expect(enhanced.headers.get('X-Custom')).toBe('header')
      expect(enhanced.headers.get('X-RateLimit-Limit')).toBeNull()
    })
  })

  describe('DEFAULT_RATE_LIMIT_CONFIG', () => {
    it('should have sensible defaults', () => {
      expect(DEFAULT_RATE_LIMIT_CONFIG.limit).toBe(100)
      expect(DEFAULT_RATE_LIMIT_CONFIG.windowSeconds).toBe(60)
      expect(DEFAULT_RATE_LIMIT_CONFIG.keyPrefix).toBe('ratelimit')
      expect(DEFAULT_RATE_LIMIT_CONFIG.skipAuthenticated).toBe(false)
    })
  })
})
