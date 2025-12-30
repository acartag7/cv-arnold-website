/**
 * Router Tests
 *
 * Tests for the API router including route matching,
 * authentication, and CORS handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
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
})
