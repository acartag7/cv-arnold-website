/**
 * Router Tests
 *
 * Tests for the API router including route matching,
 * authentication, and CORS handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  matchRoute,
  getAllowedMethods,
  createRouter,
  type Env,
} from '../api/router'

// Mock the KV namespace
function createMockKV() {
  const store = new Map<string, string>()
  return {
    get: vi.fn(async (key: string, type?: string) => {
      const value = store.get(key)
      if (!value) return null
      if (type === 'json') return JSON.parse(value)
      return value
    }),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, typeof value === 'string' ? value : JSON.stringify(value))
    }),
    delete: vi.fn(async (key: string) => {
      store.delete(key)
    }),
    list: vi.fn(async () => ({ keys: [], list_complete: true })),
    _store: store,
  }
}

// Create mock environment
function createMockEnv(): Env {
  return {
    CV_DATA: createMockKV() as unknown as Env['CV_DATA'],
  }
}

// Create mock request
function createRequest(
  method: string,
  path: string,
  options: RequestInit = {}
): Request {
  return new Request(`https://example.com${path}`, {
    method,
    ...options,
  })
}

describe('Router', () => {
  describe('matchRoute', () => {
    it('should match GET /api/v1/cv', () => {
      const result = matchRoute('GET', '/api/v1/cv')
      expect(result).not.toBeNull()
      expect(result?.route.method).toBe('GET')
      expect(result?.route.requiresAuth).toBe(false)
    })

    it('should match GET /api/v1/cv/', () => {
      const result = matchRoute('GET', '/api/v1/cv/')
      expect(result).not.toBeNull()
    })

    it('should match POST /api/v1/cv', () => {
      const result = matchRoute('POST', '/api/v1/cv')
      expect(result).not.toBeNull()
      expect(result?.route.method).toBe('POST')
      expect(result?.route.requiresAuth).toBe(true)
    })

    it('should match GET /api/v1/cv/export', () => {
      const result = matchRoute('GET', '/api/v1/cv/export')
      expect(result).not.toBeNull()
      expect(result?.route.requiresAuth).toBe(false)
    })

    it('should match POST /api/v1/cv/import', () => {
      const result = matchRoute('POST', '/api/v1/cv/import')
      expect(result).not.toBeNull()
      expect(result?.route.requiresAuth).toBe(true)
    })

    it('should match GET /api/v1/cv/sections/:section', () => {
      const result = matchRoute('GET', '/api/v1/cv/sections/experience')
      expect(result).not.toBeNull()
      expect(result?.params).toEqual({ section: 'experience' })
    })

    it('should not match invalid paths', () => {
      expect(matchRoute('GET', '/api/v2/cv')).toBeNull()
      expect(matchRoute('GET', '/api/v1/users')).toBeNull()
      expect(matchRoute('GET', '/not-api')).toBeNull()
    })

    it('should not match wrong methods', () => {
      expect(matchRoute('PUT', '/api/v1/cv')).toBeNull()
      expect(matchRoute('DELETE', '/api/v1/cv')).toBeNull()
    })
  })

  describe('getAllowedMethods', () => {
    it('should return allowed methods for /api/v1/cv', () => {
      const methods = getAllowedMethods('/api/v1/cv')
      expect(methods).toContain('GET')
      expect(methods).toContain('POST')
      expect(methods).toContain('OPTIONS')
    })

    it('should return only GET and OPTIONS for /api/v1/cv/export', () => {
      const methods = getAllowedMethods('/api/v1/cv/export')
      expect(methods).toContain('GET')
      expect(methods).toContain('OPTIONS')
      expect(methods).not.toContain('POST')
    })

    it('should return empty array for unknown paths', () => {
      const methods = getAllowedMethods('/unknown')
      expect(methods).toEqual([])
    })
  })

  describe('createRouter', () => {
    let env: Env

    beforeEach(() => {
      env = createMockEnv()
    })

    it('should handle OPTIONS preflight requests', async () => {
      const router = createRouter()
      const request = createRequest('OPTIONS', '/api/v1/cv')

      const response = await router(request, env)

      expect(response.status).toBe(204)
      expect(response.headers.get('Access-Control-Allow-Methods')).toBeTruthy()
    })

    it('should return 404 for unknown API paths', async () => {
      const router = createRouter()
      const request = createRequest('GET', '/api/v1/unknown')

      const response = await router(request, env)
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('NOT_FOUND')
    })

    it('should return 405 for wrong methods on known paths', async () => {
      const router = createRouter()
      const request = createRequest('PUT', '/api/v1/cv')

      const response = await router(request, env)
      const body = await response.json()

      expect(response.status).toBe(405)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('METHOD_NOT_ALLOWED')
      expect(response.headers.get('Allow')).toContain('GET')
      expect(response.headers.get('Allow')).toContain('POST')
    })

    it('should add CORS headers to responses', async () => {
      const router = createRouter()
      const request = createRequest('GET', '/api/v1/cv', {
        headers: { Origin: 'https://example.com' },
      })

      const response = await router(request, env)

      expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy()
    })

    it('should require auth for protected routes', async () => {
      const router = createRouter()
      const request = createRequest('POST', '/api/v1/cv', {
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await router(request, env)
      const body = await response.json()

      expect(response.status).toBe(401)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('UNAUTHORIZED')
    })

    it('should handle GET /api/v1/cv without data', async () => {
      const router = createRouter()
      const request = createRequest('GET', '/api/v1/cv')

      const response = await router(request, env)
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.error.message).toContain('not found')
    })
  })

  describe('Cache Integration', () => {
    let env: Env
    let mockCache: {
      _store: Map<string, Response>
      match: ReturnType<typeof vi.fn>
      put: ReturnType<typeof vi.fn>
      delete: ReturnType<typeof vi.fn>
    }

    beforeEach(() => {
      env = createMockEnv()
      // Create mock cache
      mockCache = {
        _store: new Map<string, Response>(),
        match: vi.fn(async (key: string | Request) => {
          const keyStr = typeof key === 'string' ? key : key.url
          return mockCache._store.get(keyStr) ?? null
        }),
        put: vi.fn(async (key: string | Request, response: Response) => {
          const keyStr = typeof key === 'string' ? key : key.url
          mockCache._store.set(keyStr, response.clone())
        }),
        delete: vi.fn(async (key: string | Request) => {
          const keyStr = typeof key === 'string' ? key : key.url
          return mockCache._store.delete(keyStr)
        }),
      }
      // Stub global caches
      vi.stubGlobal('caches', { default: mockCache })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('should return X-Cache: MISS on first request', async () => {
      // Pre-populate KV with CV data in the correct format
      const cvData = {
        personalInfo: { name: 'Test User', title: 'Developer' },
        experience: [],
        skills: [],
        education: [],
        certifications: [],
        achievements: [],
        languages: [],
        metadata: { version: '1.0.0', lastUpdated: new Date().toISOString() },
      }
      // KVStorageAdapter uses versioned keys and wrapped format
      const storedData = {
        data: cvData,
        compressed: false,
        timestamp: new Date().toISOString(),
      }
      ;(env.CV_DATA as ReturnType<typeof createMockKV>)._store.set(
        'cv:data:v1',
        JSON.stringify(storedData)
      )

      const router = createRouter({ enableCache: true })
      const request = createRequest('GET', '/api/v1/cv')

      const response = await router(request, env)

      expect(response.status).toBe(200)
      expect(response.headers.get('X-Cache')).toBe('MISS')
    })

    it('should return X-Cache: HIT on second request', async () => {
      // Pre-populate KV with CV data in the correct format
      const cvData = {
        personalInfo: { name: 'Test User', title: 'Developer' },
        experience: [],
        skills: [],
        education: [],
        certifications: [],
        achievements: [],
        languages: [],
        metadata: { version: '1.0.0', lastUpdated: new Date().toISOString() },
      }
      // KVStorageAdapter uses versioned keys and wrapped format
      const storedData = {
        data: cvData,
        compressed: false,
        timestamp: new Date().toISOString(),
      }
      ;(env.CV_DATA as ReturnType<typeof createMockKV>)._store.set(
        'cv:data:v1',
        JSON.stringify(storedData)
      )

      const router = createRouter({ enableCache: true })

      // First request - cache miss
      const request1 = createRequest('GET', '/api/v1/cv')
      const response1 = await router(request1, env)
      expect(response1.status).toBe(200)
      expect(response1.headers.get('X-Cache')).toBe('MISS')

      // Second request - should hit cache
      const request2 = createRequest('GET', '/api/v1/cv')
      const response2 = await router(request2, env)
      expect(response2.status).toBe(200)
      expect(response2.headers.get('X-Cache')).toBe('HIT')
    })

    it('should invalidate cache before POST operations', async () => {
      // Pre-populate cache with a response
      const cachedResponse = new Response(JSON.stringify({ cached: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
      mockCache._store.set('https://cv-api.cache/api/v1/cv', cachedResponse)

      const router = createRouter({ enableCache: true })

      // POST request should invalidate cache
      const request = createRequest('POST', '/api/v1/cv', {
        body: JSON.stringify({
          personalInfo: { name: 'New Name', title: 'New Title' },
        }),
        headers: {
          'Content-Type': 'application/json',
          'CF-Access-Authenticated-User-Email': 'test@example.com',
        },
      })

      await router(request, env)

      // Verify cache.delete was called (invalidation happened)
      expect(mockCache.delete).toHaveBeenCalled()
    })

    it('should add CORS headers to cached responses', async () => {
      // Pre-populate KV with CV data in the correct format
      const cvData = {
        personalInfo: { name: 'Test User', title: 'Developer' },
        experience: [],
        skills: [],
        education: [],
        certifications: [],
        achievements: [],
        languages: [],
        metadata: { version: '1.0.0', lastUpdated: new Date().toISOString() },
      }
      // KVStorageAdapter uses versioned keys and wrapped format
      const storedData = {
        data: cvData,
        compressed: false,
        timestamp: new Date().toISOString(),
      }
      ;(env.CV_DATA as ReturnType<typeof createMockKV>)._store.set(
        'cv:data:v1',
        JSON.stringify(storedData)
      )

      const router = createRouter({ enableCache: true })

      // First request to populate cache
      const request1 = createRequest('GET', '/api/v1/cv', {
        headers: { Origin: 'https://example.com' },
      })
      await router(request1, env)

      // Second request from cache should still have CORS headers
      const request2 = createRequest('GET', '/api/v1/cv', {
        headers: { Origin: 'https://example.com' },
      })
      const response2 = await router(request2, env)

      expect(response2.headers.get('X-Cache')).toBe('HIT')
      expect(response2.headers.get('Access-Control-Allow-Origin')).toBeTruthy()
    })

    it('should skip caching when disabled', async () => {
      const router = createRouter({ enableCache: false })
      const request = createRequest('GET', '/api/v1/cv')

      await router(request, env)

      // Cache should not be used
      expect(mockCache.match).not.toHaveBeenCalled()
      expect(mockCache.put).not.toHaveBeenCalled()
    })
  })
})
