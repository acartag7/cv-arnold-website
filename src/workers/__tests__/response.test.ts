/**
 * Response Utilities Tests
 *
 * Tests for standardized API response functions.
 */

import { describe, it, expect } from 'vitest'
import {
  jsonResponse,
  errorResponse,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  methodNotAllowed,
  validationError,
  rateLimited,
  internalError,
  serviceUnavailable,
  createHeaders,
  HttpStatus,
  ErrorCodes,
} from '../api/utils/response'

describe('Response Utilities', () => {
  describe('createHeaders', () => {
    it('should create headers with default content type', () => {
      const headers = createHeaders()
      expect(headers.get('Content-Type')).toBe('application/json')
    })

    it('should add CORS headers when provided', () => {
      const corsHeaders = new Headers({
        'Access-Control-Allow-Origin': '*',
      })
      const headers = createHeaders(undefined, corsHeaders)
      expect(headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('should add additional headers', () => {
      const headers = createHeaders({ 'X-Custom': 'value' })
      expect(headers.get('X-Custom')).toBe('value')
    })

    it('should merge all header types', () => {
      const corsHeaders = { 'Access-Control-Allow-Origin': '*' }
      const additional = { 'X-Custom': 'value' }
      const headers = createHeaders(additional, corsHeaders)

      expect(headers.get('Content-Type')).toBe('application/json')
      expect(headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(headers.get('X-Custom')).toBe('value')
    })
  })

  describe('jsonResponse', () => {
    it('should create successful response with data', async () => {
      const data = { name: 'Test' }
      const response = jsonResponse(data)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data).toEqual(data)
      expect(body.meta.timestamp).toBeTruthy()
    })

    it('should accept custom status code', async () => {
      const response = jsonResponse({}, HttpStatus.CREATED)
      expect(response.status).toBe(201)
    })

    it('should include metadata', async () => {
      const response = jsonResponse({}, 200, { version: 'v1' })
      const body = await response.json()

      expect(body.meta.version).toBe('v1')
    })

    it('should include custom headers', async () => {
      const response = jsonResponse({}, 200, undefined, { 'X-Custom': 'test' })
      expect(response.headers.get('X-Custom')).toBe('test')
    })
  })

  describe('errorResponse', () => {
    it('should create error response', async () => {
      const response = errorResponse('TEST_ERROR', 'Test message', 400)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('TEST_ERROR')
      expect(body.error.message).toBe('Test message')
    })

    it('should include error details', async () => {
      const details = { field: 'email', issue: 'invalid' }
      const response = errorResponse(
        'VALIDATION_ERROR',
        'Invalid',
        422,
        details
      )
      const body = await response.json()

      expect(body.error.details).toEqual(details)
    })
  })

  describe('HTTP Error Responses', () => {
    it('badRequest should return 400', async () => {
      const response = badRequest('Invalid input')
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error.code).toBe(ErrorCodes.INVALID_REQUEST)
    })

    it('unauthorized should return 401', async () => {
      const response = unauthorized()
      const body = await response.json()

      expect(response.status).toBe(401)
      expect(body.error.code).toBe(ErrorCodes.UNAUTHORIZED)
    })

    it('forbidden should return 403', async () => {
      const response = forbidden()
      const body = await response.json()

      expect(response.status).toBe(403)
      expect(body.error.code).toBe(ErrorCodes.FORBIDDEN)
    })

    it('notFound should return 404', async () => {
      const response = notFound()
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.error.code).toBe(ErrorCodes.NOT_FOUND)
    })

    it('methodNotAllowed should return 405 with Allow header', async () => {
      const response = methodNotAllowed(['GET', 'POST'])
      const body = await response.json()

      expect(response.status).toBe(405)
      expect(body.error.code).toBe(ErrorCodes.METHOD_NOT_ALLOWED)
      expect(response.headers.get('Allow')).toBe('GET, POST')
    })

    it('validationError should return 422', async () => {
      const response = validationError('Validation failed', {
        errors: ['missing field'],
      })
      const body = await response.json()

      expect(response.status).toBe(422)
      expect(body.error.code).toBe(ErrorCodes.VALIDATION_ERROR)
      expect(body.error.details).toEqual({ errors: ['missing field'] })
    })

    it('rateLimited should return 429 with Retry-After header', async () => {
      const response = rateLimited(60)
      const body = await response.json()

      expect(response.status).toBe(429)
      expect(body.error.code).toBe(ErrorCodes.RATE_LIMITED)
      expect(response.headers.get('Retry-After')).toBe('60')
    })

    it('internalError should return 500', async () => {
      const response = internalError()
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.error.code).toBe(ErrorCodes.INTERNAL_ERROR)
    })

    it('serviceUnavailable should return 503', async () => {
      const response = serviceUnavailable()
      const body = await response.json()

      expect(response.status).toBe(503)
      expect(body.error.code).toBe(ErrorCodes.SERVICE_UNAVAILABLE)
    })
  })
})
