/**
 * Response Caching Middleware Tests
 *
 * Tests for Cache API integration and automatic invalidation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  ResponseCache,
  getCacheKey,
  isCacheable,
  createCacheControl,
  createCacheMiddleware,
  DEFAULT_CACHE_CONFIG,
  CACHE_KEYS,
} from '../api/middleware/cache'

/**
 * Create a mock Cache object
 */
function createMockCache() {
  const store = new Map<string, Response>()

  return {
    _store: store,

    match: vi.fn(async (key: string | Request) => {
      const keyStr = typeof key === 'string' ? key : key.url
      return store.get(keyStr) ?? null
    }),

    put: vi.fn(async (key: string | Request, response: Response) => {
      const keyStr = typeof key === 'string' ? key : key.url
      store.set(keyStr, response.clone())
    }),

    delete: vi.fn(async (key: string | Request) => {
      const keyStr = typeof key === 'string' ? key : key.url
      return store.delete(keyStr)
    }),
  }
}

/**
 * Create a mock request
 */
function createRequest(
  url: string,
  method = 'GET',
  headers: Record<string, string> = {}
): Request {
  return new Request(url, {
    method,
    headers: new Headers(headers),
  })
}

/**
 * Create a mock response
 */
function createResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('Cache Middleware', () => {
  describe('getCacheKey', () => {
    it('should generate cache key from URL pathname', () => {
      const request = createRequest('https://api.example.com/api/v1/cv')
      const key = getCacheKey(request, DEFAULT_CACHE_CONFIG)

      expect(key).toBe('https://cv-api.cache/api/v1/cv')
    })

    it('should include query parameters in cache key', () => {
      const request = createRequest(
        'https://api.example.com/api/v1/cv/export?format=yaml'
      )
      const key = getCacheKey(request, DEFAULT_CACHE_CONFIG)

      expect(key).toBe('https://cv-api.cache/api/v1/cv/export?format=yaml')
    })

    it('should use custom key prefix', () => {
      const request = createRequest('https://api.example.com/api/v1/cv')
      const key = getCacheKey(request, {
        ...DEFAULT_CACHE_CONFIG,
        keyPrefix: 'my-app',
      })

      expect(key).toBe('https://my-app.cache/api/v1/cv')
    })
  })

  describe('isCacheable', () => {
    it('should return true for GET /api/v1/cv', () => {
      const request = createRequest('https://api.example.com/api/v1/cv')
      expect(isCacheable(request)).toBe(true)
    })

    it('should return true for GET /api/v1/cv/', () => {
      const request = createRequest('https://api.example.com/api/v1/cv/')
      expect(isCacheable(request)).toBe(true)
    })

    it('should return true for GET /api/v1/cv/export', () => {
      const request = createRequest('https://api.example.com/api/v1/cv/export')
      expect(isCacheable(request)).toBe(true)
    })

    it('should return true for GET /api/v1/cv/sections/experience', () => {
      const request = createRequest(
        'https://api.example.com/api/v1/cv/sections/experience'
      )
      expect(isCacheable(request)).toBe(true)
    })

    it('should return false for POST requests', () => {
      const request = createRequest('https://api.example.com/api/v1/cv', 'POST')
      expect(isCacheable(request)).toBe(false)
    })

    it('should return false for non-API paths', () => {
      const request = createRequest('https://api.example.com/static/file.js')
      expect(isCacheable(request)).toBe(false)
    })

    it('should return false for import endpoint', () => {
      const request = createRequest(
        'https://api.example.com/api/v1/cv/import',
        'GET'
      )
      expect(isCacheable(request)).toBe(false)
    })
  })

  describe('createCacheControl', () => {
    it('should create cache control header with default values', () => {
      const header = createCacheControl(DEFAULT_CACHE_CONFIG)

      expect(header).toBe('public, max-age=300, stale-while-revalidate=60')
    })

    it('should use custom TTL values', () => {
      const header = createCacheControl({
        ...DEFAULT_CACHE_CONFIG,
        ttlSeconds: 600,
        staleWhileRevalidateSeconds: 120,
      })

      expect(header).toBe('public, max-age=600, stale-while-revalidate=120')
    })
  })

  describe('ResponseCache', () => {
    let mockCache: ReturnType<typeof createMockCache>

    beforeEach(() => {
      mockCache = createMockCache()
    })

    describe('get', () => {
      it('should return null for non-cacheable requests', async () => {
        const cache = new ResponseCache(mockCache as never)
        const request = createRequest(
          'https://api.example.com/api/v1/cv',
          'POST'
        )

        const result = await cache.get(request)

        expect(result).toBeNull()
        expect(mockCache.match).not.toHaveBeenCalled()
      })

      it('should return null when cache is disabled', async () => {
        const cache = new ResponseCache(mockCache as never, { enabled: false })
        const request = createRequest('https://api.example.com/api/v1/cv')

        const result = await cache.get(request)

        expect(result).toBeNull()
      })

      it('should return cached response with X-Cache: HIT', async () => {
        const cache = new ResponseCache(mockCache as never)
        const request = createRequest('https://api.example.com/api/v1/cv')

        // Pre-populate cache
        const cachedResponse = createResponse('{"cached": true}')
        mockCache._store.set(
          'https://cv-api.cache/api/v1/cv',
          cachedResponse.clone()
        )

        const result = await cache.get(request)

        expect(result).not.toBeNull()
        expect(result?.headers.get('X-Cache')).toBe('HIT')
      })

      it('should return null for cache miss', async () => {
        const cache = new ResponseCache(mockCache as never)
        const request = createRequest('https://api.example.com/api/v1/cv')

        const result = await cache.get(request)

        expect(result).toBeNull()
      })
    })

    describe('put', () => {
      it('should cache successful responses', async () => {
        const cache = new ResponseCache(mockCache as never)
        const request = createRequest('https://api.example.com/api/v1/cv')
        const response = createResponse('{"data": "test"}')

        const result = await cache.put(request, response)

        expect(mockCache.put).toHaveBeenCalled()
        expect(result.headers.get('X-Cache')).toBe('MISS')
        expect(result.headers.get('Cache-Control')).toContain('max-age=300')
      })

      it('should not cache non-2xx responses', async () => {
        const cache = new ResponseCache(mockCache as never)
        const request = createRequest('https://api.example.com/api/v1/cv')
        const response = createResponse('{"error": "not found"}', 404)

        await cache.put(request, response)

        expect(mockCache.put).not.toHaveBeenCalled()
      })

      it('should not cache non-cacheable requests', async () => {
        const cache = new ResponseCache(mockCache as never)
        const request = createRequest(
          'https://api.example.com/api/v1/cv',
          'POST'
        )
        const response = createResponse('{"success": true}')

        await cache.put(request, response)

        expect(mockCache.put).not.toHaveBeenCalled()
      })

      it('should not cache when disabled', async () => {
        const cache = new ResponseCache(mockCache as never, { enabled: false })
        const request = createRequest('https://api.example.com/api/v1/cv')
        const response = createResponse('{"data": "test"}')

        await cache.put(request, response)

        expect(mockCache.put).not.toHaveBeenCalled()
      })
    })

    describe('invalidate', () => {
      it('should delete all CV-related cache keys', async () => {
        const cache = new ResponseCache(mockCache as never)
        const request = createRequest('https://api.example.com/api/v1/cv')

        await cache.invalidate(request)

        // Should attempt to delete multiple keys
        expect(mockCache.delete).toHaveBeenCalled()
        const deleteCalls = mockCache.delete.mock.calls.length

        // Should delete: CV data, export (json/yaml), sections
        expect(deleteCalls).toBeGreaterThanOrEqual(10)
      })

      it('should not invalidate when disabled', async () => {
        const cache = new ResponseCache(mockCache as never, { enabled: false })
        const request = createRequest('https://api.example.com/api/v1/cv')

        await cache.invalidate(request)

        expect(mockCache.delete).not.toHaveBeenCalled()
      })
    })
  })

  describe('createCacheMiddleware', () => {
    it('should provide get, put, invalidate, and isCacheable methods', () => {
      // Mock global caches object
      const mockCache = createMockCache()
      vi.stubGlobal('caches', { default: mockCache })

      const middleware = createCacheMiddleware()

      expect(typeof middleware.get).toBe('function')
      expect(typeof middleware.put).toBe('function')
      expect(typeof middleware.invalidate).toBe('function')
      expect(typeof middleware.isCacheable).toBe('function')

      vi.unstubAllGlobals()
    })

    it('should respect custom config', () => {
      const mockCache = createMockCache()
      vi.stubGlobal('caches', { default: mockCache })

      const middleware = createCacheMiddleware({
        config: { ttlSeconds: 600 },
      })

      expect(middleware.isCacheable).toBeDefined()

      vi.unstubAllGlobals()
    })

    it('should return no-op middleware when caches is not available', async () => {
      // Don't stub caches - simulates test/non-Workers environment
      vi.unstubAllGlobals()

      const middleware = createCacheMiddleware()
      const request = createRequest('https://api.example.com/api/v1/cv')
      const response = createResponse('{"data": "test"}')

      // get should return null
      const cached = await middleware.get(request)
      expect(cached).toBeNull()

      // put should return the original response unchanged
      const result = await middleware.put(request, response)
      expect(result).toBe(response)

      // invalidate should not throw
      await expect(middleware.invalidate(request)).resolves.not.toThrow()

      // isCacheable should still work
      expect(middleware.isCacheable(request)).toBe(true)
    })
  })

  describe('CACHE_KEYS', () => {
    it('should have correct cache key patterns', () => {
      expect(CACHE_KEYS.CV_DATA).toBe('/api/v1/cv')
      expect(CACHE_KEYS.CV_EXPORT).toBe('/api/v1/cv/export')
      expect(CACHE_KEYS.CV_SECTIONS).toBe('/api/v1/cv/sections/')
    })
  })

  describe('DEFAULT_CACHE_CONFIG', () => {
    it('should have sensible defaults', () => {
      expect(DEFAULT_CACHE_CONFIG.ttlSeconds).toBe(300)
      expect(DEFAULT_CACHE_CONFIG.staleWhileRevalidateSeconds).toBe(60)
      expect(DEFAULT_CACHE_CONFIG.keyPrefix).toBe('cv-api')
      expect(DEFAULT_CACHE_CONFIG.enabled).toBe(true)
    })
  })
})
