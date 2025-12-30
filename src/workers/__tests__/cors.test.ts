/**
 * CORS Middleware Tests
 *
 * Tests for Cross-Origin Resource Sharing middleware.
 */

import { describe, it, expect, vi } from 'vitest'
import {
  isOriginAllowed,
  getCORSHeaders,
  getPreflightHeaders,
  handlePreflight,
  createCORSMiddleware,
  DEFAULT_CORS_CONFIG,
} from '../api/middleware/cors'

/**
 * Create a mock request with Origin header
 *
 * Note: Some test environments treat 'Origin' as a forbidden header.
 * We use a workaround by creating a mock request object.
 */
function createMockRequest(origin?: string): Request {
  // Create the request first
  const request = new Request('https://api.example.com/api/v1/cv', {
    method: 'GET',
  })

  // If origin is provided, create a new request with mocked headers
  if (origin) {
    // Use Object.defineProperty to mock the headers.get method
    const originalGet = request.headers.get.bind(request.headers)
    vi.spyOn(request.headers, 'get').mockImplementation((name: string) => {
      if (name.toLowerCase() === 'origin') {
        return origin
      }
      return originalGet(name)
    })
  }

  return request
}

describe('CORS Middleware', () => {
  describe('isOriginAllowed', () => {
    it('should allow any origin with "*"', () => {
      expect(isOriginAllowed('https://example.com', '*')).toBe(true)
      expect(isOriginAllowed('https://other.com', '*')).toBe(true)
    })

    it('should return false for null origin', () => {
      expect(isOriginAllowed(null, '*')).toBe(false)
    })

    it('should match exact origins', () => {
      const allowed = ['https://example.com', 'https://other.com']
      expect(isOriginAllowed('https://example.com', allowed)).toBe(true)
      expect(isOriginAllowed('https://other.com', allowed)).toBe(true)
      expect(isOriginAllowed('https://unknown.com', allowed)).toBe(false)
    })

    it('should match wildcard subdomains', () => {
      const allowed = ['*.example.com']
      expect(isOriginAllowed('https://sub.example.com', allowed)).toBe(true)
      expect(isOriginAllowed('https://deep.sub.example.com', allowed)).toBe(
        true
      )
      expect(isOriginAllowed('https://example.com', allowed)).toBe(true)
      expect(isOriginAllowed('https://other.com', allowed)).toBe(false)
    })
  })

  describe('getCORSHeaders', () => {
    it('should return * for default config', () => {
      const request = createMockRequest('https://example.com')
      const headers = getCORSHeaders(request)

      expect(headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('should return specific origin when matched', () => {
      const request = createMockRequest('https://example.com')

      const config = {
        ...DEFAULT_CORS_CONFIG,
        allowedOrigins: ['https://example.com'],
      }

      const headers = getCORSHeaders(request, config)

      expect(headers.get('Access-Control-Allow-Origin')).toBe(
        'https://example.com'
      )
      expect(headers.get('Vary')).toBe('Origin')
    })

    it('should not set origin for non-matching requests', () => {
      const request = createMockRequest('https://unknown.com')
      const headers = getCORSHeaders(request, {
        ...DEFAULT_CORS_CONFIG,
        allowedOrigins: ['https://example.com'],
      })

      expect(headers.get('Access-Control-Allow-Origin')).toBeNull()
    })

    it('should set credentials header when configured', () => {
      const request = createMockRequest('https://example.com')
      const headers = getCORSHeaders(request, {
        ...DEFAULT_CORS_CONFIG,
        allowCredentials: true,
      })

      expect(headers.get('Access-Control-Allow-Credentials')).toBe('true')
    })

    it('should set exposed headers when configured', () => {
      const request = createMockRequest('https://example.com')
      const headers = getCORSHeaders(request, {
        ...DEFAULT_CORS_CONFIG,
        exposedHeaders: ['X-Custom-Header', 'X-Another'],
      })

      expect(headers.get('Access-Control-Expose-Headers')).toBe(
        'X-Custom-Header, X-Another'
      )
    })
  })

  describe('getPreflightHeaders', () => {
    it('should include preflight-specific headers', () => {
      const request = createMockRequest('https://example.com')
      const headers = getPreflightHeaders(request)

      expect(headers.get('Access-Control-Allow-Methods')).toBeTruthy()
      expect(headers.get('Access-Control-Allow-Headers')).toBeTruthy()
      expect(headers.get('Access-Control-Max-Age')).toBeTruthy()
    })

    it('should include configured methods', () => {
      const request = createMockRequest('https://example.com')
      const headers = getPreflightHeaders(request, {
        ...DEFAULT_CORS_CONFIG,
        allowedMethods: ['GET', 'POST'],
      })

      expect(headers.get('Access-Control-Allow-Methods')).toBe('GET, POST')
    })

    it('should include configured headers', () => {
      const request = createMockRequest('https://example.com')
      const headers = getPreflightHeaders(request, {
        ...DEFAULT_CORS_CONFIG,
        allowedHeaders: ['Content-Type', 'Authorization'],
      })

      expect(headers.get('Access-Control-Allow-Headers')).toBe(
        'Content-Type, Authorization'
      )
    })
  })

  describe('handlePreflight', () => {
    it('should return 204 No Content', async () => {
      const request = createMockRequest('https://example.com')
      const response = handlePreflight(request)

      expect(response.status).toBe(204)
      expect(await response.text()).toBe('')
    })

    it('should include all preflight headers', () => {
      const request = createMockRequest('https://example.com')
      const response = handlePreflight(request)

      expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy()
      expect(response.headers.get('Access-Control-Allow-Methods')).toBeTruthy()
      expect(response.headers.get('Access-Control-Allow-Headers')).toBeTruthy()
    })
  })

  describe('createCORSMiddleware', () => {
    it('should create middleware with default config', () => {
      const middleware = createCORSMiddleware()

      expect(middleware.config).toEqual(DEFAULT_CORS_CONFIG)
    })

    it('should merge custom config with defaults', () => {
      const middleware = createCORSMiddleware({
        allowedOrigins: ['https://example.com'],
        allowCredentials: true,
      })

      expect(middleware.config.allowedOrigins).toEqual(['https://example.com'])
      expect(middleware.config.allowCredentials).toBe(true)
      expect(middleware.config.allowedMethods).toEqual(
        DEFAULT_CORS_CONFIG.allowedMethods
      )
    })

    it('should provide working getHeaders method', () => {
      const middleware = createCORSMiddleware()
      const request = createMockRequest('https://example.com')
      const headers = middleware.getHeaders(request)

      expect(headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('should provide working handlePreflight method', () => {
      const middleware = createCORSMiddleware()
      const request = createMockRequest('https://example.com')
      const response = middleware.handlePreflight(request)

      expect(response.status).toBe(204)
    })

    it('should provide working isOriginAllowed method', () => {
      const middleware = createCORSMiddleware({
        allowedOrigins: ['https://example.com'],
      })

      expect(middleware.isOriginAllowed('https://example.com')).toBe(true)
      expect(middleware.isOriginAllowed('https://other.com')).toBe(false)
    })
  })
})
