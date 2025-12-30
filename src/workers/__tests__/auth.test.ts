/**
 * Auth Middleware Tests
 *
 * Tests for Cloudflare Access authentication middleware.
 */

import { describe, it, expect } from 'vitest'
import {
  getAuthContext,
  requireAuth,
  requireEmailDomain,
  requireEmail,
  createAuthMiddleware,
} from '../api/middleware/auth'

// Create mock request with Access headers
function createRequest(headers?: Record<string, string>): Request {
  return new Request('https://api.example.com/api/v1/cv', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })
}

// Create a valid JWT for testing (base64 encoded)
function createMockJWT(claims: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  const payload = btoa(JSON.stringify(claims))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  const signature = 'mock-signature'

  return `${header}.${payload}.${signature}`
}

describe('Auth Middleware', () => {
  describe('getAuthContext', () => {
    it('should return unauthenticated for requests without Access headers', () => {
      const request = createRequest()
      const context = getAuthContext(request)

      expect(context.isAuthenticated).toBe(false)
      expect(context.email).toBeUndefined()
    })

    it('should return authenticated with email from Access header', () => {
      const request = createRequest({
        'Cf-Access-Authenticated-User-Email': 'user@example.com',
      })
      const context = getAuthContext(request)

      expect(context.isAuthenticated).toBe(true)
      expect(context.email).toBe('user@example.com')
    })

    it('should decode JWT claims when present', () => {
      const jwt = createMockJWT({
        sub: 'user-123',
        email: 'user@example.com',
        exp: Date.now() / 1000 + 3600,
      })

      const request = createRequest({
        'Cf-Access-Authenticated-User-Email': 'user@example.com',
        'Cf-Access-Jwt-Assertion': jwt,
      })
      const context = getAuthContext(request)

      expect(context.isAuthenticated).toBe(true)
      expect(context.userId).toBe('user-123')
      expect(context.claims).toBeDefined()
    })

    it('should handle invalid JWT gracefully', () => {
      const request = createRequest({
        'Cf-Access-Authenticated-User-Email': 'user@example.com',
        'Cf-Access-Jwt-Assertion': 'invalid-jwt',
      })
      const context = getAuthContext(request)

      // Should still be authenticated from email header
      expect(context.isAuthenticated).toBe(true)
      expect(context.email).toBe('user@example.com')
      expect(context.claims).toBeUndefined()
    })
  })

  describe('requireAuth', () => {
    it('should return null for authenticated requests', () => {
      const request = createRequest({
        'Cf-Access-Authenticated-User-Email': 'user@example.com',
      })
      const result = requireAuth(request)

      expect(result).toBeNull()
    })

    it('should return 401 response for unauthenticated requests', async () => {
      const request = createRequest()
      const result = requireAuth(request)

      expect(result).not.toBeNull()
      expect(result!.status).toBe(401)

      const body = await result!.json()
      expect(body.error.code).toBe('UNAUTHORIZED')
    })
  })

  describe('requireEmailDomain', () => {
    it('should return null for allowed domains', () => {
      const request = createRequest({
        'Cf-Access-Authenticated-User-Email': 'user@company.com',
      })
      const result = requireEmailDomain(request, ['company.com'])

      expect(result).toBeNull()
    })

    it('should return 403 for disallowed domains', async () => {
      const request = createRequest({
        'Cf-Access-Authenticated-User-Email': 'user@other.com',
      })
      const result = requireEmailDomain(request, ['company.com'])

      expect(result).not.toBeNull()
      expect(result!.status).toBe(403)
    })

    it('should return 401 for unauthenticated requests', async () => {
      const request = createRequest()
      const result = requireEmailDomain(request, ['company.com'])

      expect(result).not.toBeNull()
      expect(result!.status).toBe(401)
    })

    it('should handle case-insensitive domain matching', () => {
      const request = createRequest({
        'Cf-Access-Authenticated-User-Email': 'user@COMPANY.COM',
      })
      const result = requireEmailDomain(request, ['company.com'])

      expect(result).toBeNull()
    })
  })

  describe('requireEmail', () => {
    it('should return null for allowed emails', () => {
      const request = createRequest({
        'Cf-Access-Authenticated-User-Email': 'admin@example.com',
      })
      const result = requireEmail(request, ['admin@example.com'])

      expect(result).toBeNull()
    })

    it('should return 403 for disallowed emails', async () => {
      const request = createRequest({
        'Cf-Access-Authenticated-User-Email': 'user@example.com',
      })
      const result = requireEmail(request, ['admin@example.com'])

      expect(result).not.toBeNull()
      expect(result!.status).toBe(403)
    })

    it('should handle case-insensitive email matching', () => {
      const request = createRequest({
        'Cf-Access-Authenticated-User-Email': 'ADMIN@example.com',
      })
      const result = requireEmail(request, ['admin@example.com'])

      expect(result).toBeNull()
    })
  })

  describe('createAuthMiddleware', () => {
    it('should create middleware with default behavior', () => {
      const middleware = createAuthMiddleware()

      const request = createRequest({
        'Cf-Access-Authenticated-User-Email': 'user@example.com',
      })

      expect(middleware.getContext(request).isAuthenticated).toBe(true)
      expect(middleware.require(request)).toBeNull()
    })

    it('should create middleware with domain restriction', () => {
      const middleware = createAuthMiddleware({
        allowedDomains: ['company.com'],
      })

      const allowedRequest = createRequest({
        'Cf-Access-Authenticated-User-Email': 'user@company.com',
      })
      const blockedRequest = createRequest({
        'Cf-Access-Authenticated-User-Email': 'user@other.com',
      })

      expect(middleware.requireDomain(allowedRequest)).toBeNull()
      expect(middleware.requireDomain(blockedRequest)?.status).toBe(403)
    })

    it('should create middleware with email restriction', () => {
      const middleware = createAuthMiddleware({
        allowedEmails: ['admin@example.com'],
      })

      const allowedRequest = createRequest({
        'Cf-Access-Authenticated-User-Email': 'admin@example.com',
      })
      const blockedRequest = createRequest({
        'Cf-Access-Authenticated-User-Email': 'user@example.com',
      })

      expect(middleware.requireEmail(allowedRequest)).toBeNull()
      expect(middleware.requireEmail(blockedRequest)?.status).toBe(403)
    })
  })
})
