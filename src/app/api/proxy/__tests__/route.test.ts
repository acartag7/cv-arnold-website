/**
 * Tests for API Proxy Route (Service Binding Version)
 *
 * Tests cover:
 * - Service binding configuration
 * - Path validation (SSRF prevention)
 * - Body size limits
 * - Request forwarding via service binding
 * - Error handling
 * - Timeout handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the API service binding
const mockAPIFetch = vi.fn()

// Mock getCloudflareContext - must be at top level
vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: () => ({
    env: {
      API: {
        fetch: mockAPIFetch,
      },
    },
    cf: {},
    ctx: { waitUntil: vi.fn() },
  }),
}))

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-1234',
})

// Helper to create mock NextRequest
function createMockRequest(
  path: string,
  options: {
    method?: string
    body?: string
    headers?: Record<string, string>
  } = {}
): NextRequest {
  const url = `http://localhost:3000/api/proxy/${path}`
  const init = {
    method: options.method || 'GET',
    headers: options.headers || {},
    ...(options.body !== undefined ? { body: options.body } : {}),
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new NextRequest(url, init as any)
}

describe('API Proxy Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Path Validation (SSRF Prevention)', () => {
    it('should reject paths not starting with api/', async () => {
      const { GET } = await import('../[...path]/route')

      const request = createMockRequest('admin/secrets')
      const response = await GET(request, {
        params: Promise.resolve({ path: ['admin', 'secrets'] }),
      })

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error.code).toBe('INVALID_PATH')
    })

    it('should filter out dangerous path segments', async () => {
      const { GET } = await import('../[...path]/route')

      // Path with .. gets filtered: ['api', '..', 'etc'] becomes ['api', 'etc']
      // This is valid because it starts with 'api'
      mockAPIFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
        })
      )

      const request = createMockRequest('api/../etc')
      const response = await GET(request, {
        params: Promise.resolve({ path: ['api', '..', 'etc'] }),
      })

      // After filtering, path becomes /api/etc which is valid
      expect(response.status).toBe(200)
      expect(mockAPIFetch).toHaveBeenCalled()

      // Verify the dangerous segment was filtered
      const call = mockAPIFetch.mock.calls[0]
      expect(call).toBeDefined()
      const callArg = call![0] as Request
      expect(callArg.url).toBe('http://internal/api/etc')
    })

    it('should reject paths that become invalid after filtering', async () => {
      const { GET } = await import('../[...path]/route')

      // Path ['..', 'etc'] after filtering becomes ['etc'] - no 'api' prefix
      const request = createMockRequest('../etc')
      const response = await GET(request, {
        params: Promise.resolve({ path: ['..', 'etc'] }),
      })

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error.code).toBe('INVALID_PATH')
    })

    it('should reject empty paths', async () => {
      const { GET } = await import('../[...path]/route')

      const request = createMockRequest('')
      const response = await GET(request, {
        params: Promise.resolve({ path: [] }),
      })

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error.code).toBe('INVALID_PATH')
    })

    it('should accept valid api paths', async () => {
      const { GET } = await import('../[...path]/route')

      mockAPIFetch.mockResolvedValueOnce(
        new Response(null, {
          status: 200,
          statusText: 'OK',
          headers: new Headers({ 'content-type': 'application/json' }),
        })
      )

      const request = createMockRequest('api/v1/cv')
      const response = await GET(request, {
        params: Promise.resolve({ path: ['api', 'v1', 'cv'] }),
      })

      expect(response.status).toBe(200)
      expect(mockAPIFetch).toHaveBeenCalled()

      const call = mockAPIFetch.mock.calls[0]
      expect(call).toBeDefined()
      const callArg = call![0] as Request
      expect(callArg.url).toBe('http://internal/api/v1/cv')
    })
  })

  describe('Body Size Limits', () => {
    it('should reject requests exceeding 10MB', async () => {
      const { POST } = await import('../[...path]/route')

      // Create a request with a small body but mock the headers.get method
      // to return a large content-length (simulating a declared large payload)
      const request = createMockRequest('api/v1/cv', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: '{}',
      })

      // Override headers.get to return large content-length
      const originalGet = request.headers.get.bind(request.headers)
      vi.spyOn(request.headers, 'get').mockImplementation((name: string) => {
        if (name.toLowerCase() === 'content-length') {
          return String(11 * 1024 * 1024) // 11MB
        }
        return originalGet(name)
      })

      const response = await POST(request, {
        params: Promise.resolve({ path: ['api', 'v1', 'cv'] }),
      })

      expect(response.status).toBe(413)
      const body = await response.json()
      expect(body.error.code).toBe('PAYLOAD_TOO_LARGE')
    })

    it('should accept requests under 10MB', async () => {
      const { POST } = await import('../[...path]/route')

      mockAPIFetch.mockResolvedValueOnce(
        new Response(null, {
          status: 200,
          statusText: 'OK',
          headers: new Headers({ 'content-type': 'application/json' }),
        })
      )

      const request = createMockRequest('api/v1/cv', {
        method: 'POST',
        headers: {
          'content-length': String(1024), // 1KB
          'content-type': 'application/json',
        },
        body: '{"test": true}',
      })

      const response = await POST(request, {
        params: Promise.resolve({ path: ['api', 'v1', 'cv'] }),
      })

      expect(response.status).toBe(200)
    })
  })

  describe('Request Forwarding', () => {
    it('should forward GET requests via service binding', async () => {
      const { GET } = await import('../[...path]/route')

      mockAPIFetch.mockResolvedValueOnce(
        new Response(null, {
          status: 200,
          statusText: 'OK',
          headers: new Headers({ 'content-type': 'application/json' }),
        })
      )

      const request = createMockRequest('api/v1/cv')
      await GET(request, {
        params: Promise.resolve({ path: ['api', 'v1', 'cv'] }),
      })

      expect(mockAPIFetch).toHaveBeenCalled()
      const call = mockAPIFetch.mock.calls[0]
      expect(call).toBeDefined()
      const callArg = call![0] as Request
      expect(callArg.method).toBe('GET')
      expect(callArg.url).toBe('http://internal/api/v1/cv')
    })

    it('should forward POST requests with body', async () => {
      const { POST } = await import('../[...path]/route')

      mockAPIFetch.mockResolvedValueOnce(
        new Response(null, {
          status: 201,
          statusText: 'Created',
          headers: new Headers({ 'content-type': 'application/json' }),
        })
      )

      const request = createMockRequest('api/v1/cv', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{"test": true}',
      })

      const response = await POST(request, {
        params: Promise.resolve({ path: ['api', 'v1', 'cv'] }),
      })

      expect(response.status).toBe(201)
      const call = mockAPIFetch.mock.calls[0]
      expect(call).toBeDefined()
      const callArg = call![0] as Request
      expect(callArg.method).toBe('POST')
    })

    it('should preserve query parameters', async () => {
      const { GET } = await import('../[...path]/route')

      mockAPIFetch.mockResolvedValueOnce(
        new Response(null, {
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
        })
      )

      const request = new NextRequest(
        'http://localhost:3000/api/proxy/api/v1/cv/export?format=yaml'
      )

      await GET(request, {
        params: Promise.resolve({ path: ['api', 'v1', 'cv', 'export'] }),
      })

      const call = mockAPIFetch.mock.calls[0]
      expect(call).toBeDefined()
      const callArg = call![0] as Request
      expect(callArg.url).toBe('http://internal/api/v1/cv/export?format=yaml')
    })

    it('should add X-Request-ID header for tracing', async () => {
      const { GET } = await import('../[...path]/route')

      mockAPIFetch.mockResolvedValueOnce(
        new Response(null, {
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
        })
      )

      const request = createMockRequest('api/v1/cv')
      const response = await GET(request, {
        params: Promise.resolve({ path: ['api', 'v1', 'cv'] }),
      })

      expect(response.headers.get('X-Request-ID')).toBe('test-uuid-1234')
    })
  })

  describe('Error Handling', () => {
    it('should return 502 on service binding errors', async () => {
      const { GET } = await import('../[...path]/route')

      mockAPIFetch.mockRejectedValueOnce(new Error('Service binding error'))

      const request = createMockRequest('api/v1/cv')
      const response = await GET(request, {
        params: Promise.resolve({ path: ['api', 'v1', 'cv'] }),
      })

      expect(response.status).toBe(502)
      const body = await response.json()
      expect(body.error.code).toBe('PROXY_ERROR')
    })

    it('should return 504 on timeout', async () => {
      const { GET } = await import('../[...path]/route')

      const abortError = new Error('Aborted')
      abortError.name = 'AbortError'
      mockAPIFetch.mockRejectedValueOnce(abortError)

      const request = createMockRequest('api/v1/cv')
      const response = await GET(request, {
        params: Promise.resolve({ path: ['api', 'v1', 'cv'] }),
      })

      expect(response.status).toBe(504)
      const body = await response.json()
      expect(body.error.code).toBe('GATEWAY_TIMEOUT')
    })

    it('should forward API error responses', async () => {
      const { GET } = await import('../[...path]/route')

      mockAPIFetch.mockResolvedValueOnce(
        new Response(null, {
          status: 404,
          statusText: 'Not Found',
          headers: new Headers({ 'content-type': 'application/json' }),
        })
      )

      const request = createMockRequest('api/v1/cv/nonexistent')
      const response = await GET(request, {
        params: Promise.resolve({ path: ['api', 'v1', 'cv', 'nonexistent'] }),
      })

      expect(response.status).toBe(404)
    })
  })

  describe('HTTP Methods', () => {
    it('should support PUT method', async () => {
      const { PUT } = await import('../[...path]/route')

      mockAPIFetch.mockResolvedValueOnce(
        new Response(null, {
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
        })
      )

      const request = createMockRequest('api/v1/cv', { method: 'PUT' })
      const response = await PUT(request, {
        params: Promise.resolve({ path: ['api', 'v1', 'cv'] }),
      })

      expect(response.status).toBe(200)
      const call = mockAPIFetch.mock.calls[0]
      expect(call).toBeDefined()
      const callArg = call![0] as Request
      expect(callArg.method).toBe('PUT')
    })

    it('should support PATCH method', async () => {
      const { PATCH } = await import('../[...path]/route')

      mockAPIFetch.mockResolvedValueOnce(
        new Response(null, {
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
        })
      )

      const request = createMockRequest('api/v1/cv', { method: 'PATCH' })
      const response = await PATCH(request, {
        params: Promise.resolve({ path: ['api', 'v1', 'cv'] }),
      })

      expect(response.status).toBe(200)
      const call = mockAPIFetch.mock.calls[0]
      expect(call).toBeDefined()
      const callArg = call![0] as Request
      expect(callArg.method).toBe('PATCH')
    })

    it('should support DELETE method', async () => {
      const { DELETE } = await import('../[...path]/route')

      mockAPIFetch.mockResolvedValueOnce(
        new Response(null, {
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
        })
      )

      const request = createMockRequest('api/v1/cv/item', { method: 'DELETE' })
      const response = await DELETE(request, {
        params: Promise.resolve({ path: ['api', 'v1', 'cv', 'item'] }),
      })

      expect(response.status).toBe(200)
      const call = mockAPIFetch.mock.calls[0]
      expect(call).toBeDefined()
      const callArg = call![0] as Request
      expect(callArg.method).toBe('DELETE')
    })
  })
})
