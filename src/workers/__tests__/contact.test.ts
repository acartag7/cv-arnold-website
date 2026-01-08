/**
 * Contact Form Handler Tests
 *
 * Tests for POST /api/v1/contact endpoint including:
 * - Validation
 * - Honeypot detection
 * - Turnstile verification
 * - Rate limiting
 * - Email sending
 *
 * @module workers/__tests__/contact
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { handlePostContact } from '../api/handlers/contact'

// Mock fetch for Turnstile and Resend API calls
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('handlePostContact', () => {
  const mockEnv = {
    TURNSTILE_SECRET_KEY: 'test-secret-key',
    RESEND_API_KEY: 'test-resend-key',
    CONTACT_EMAIL: 'test@example.com',
    CONTACT_FROM_DOMAIN: 'example.com',
    RATE_LIMIT_KV: {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    },
    CONTACT_SUBMISSIONS: {
      put: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    },
  }

  const validFormData = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Test Subject',
    message: 'This is a test message for the contact form.',
    honeypot: '',
    turnstileToken: 'valid-turnstile-token',
  }

  const createRequest = (body: unknown) =>
    new Request('http://localhost/api/v1/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '192.168.1.1',
        'User-Agent': 'Test Agent',
      },
      body: JSON.stringify(body),
    })

  beforeEach(() => {
    vi.clearAllMocks()

    // Default: rate limit allows requests
    mockEnv.RATE_LIMIT_KV.get.mockResolvedValue(null)
    mockEnv.RATE_LIMIT_KV.put.mockResolvedValue(undefined)

    // Default: Turnstile verification succeeds
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('turnstile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
      }
      if (url.includes('resend')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'email-123' }),
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('request validation', () => {
    it('should reject invalid JSON', async () => {
      const request = new Request('http://localhost/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      })

      const response = await handlePostContact(request, mockEnv)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('INVALID_REQUEST')
    })

    it('should reject missing required fields', async () => {
      const request = createRequest({ name: 'John' })

      const response = await handlePostContact(request, mockEnv)
      const body = await response.json()

      expect(response.status).toBe(422)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should reject invalid email format', async () => {
      const request = createRequest({
        ...validFormData,
        email: 'not-an-email',
      })

      const response = await handlePostContact(request, mockEnv)
      const body = await response.json()

      expect(response.status).toBe(422)
      expect(body.error.details).toBeDefined()
    })

    it('should reject message that is too short', async () => {
      const request = createRequest({
        ...validFormData,
        message: 'Short',
      })

      const response = await handlePostContact(request, mockEnv)

      expect(response.status).toBe(422)
    })
  })

  describe('honeypot detection', () => {
    it('should silently accept honeypot submissions (bot detection)', async () => {
      const request = createRequest({
        ...validFormData,
        honeypot: 'spam-content-here',
      })

      const response = await handlePostContact(request, mockEnv)
      const body = await response.json()

      // Returns success to not alert bots
      expect(response.status).toBe(200)
      expect(body.success).toBe(true)

      // But no email should be sent
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('resend'),
        expect.anything()
      )
    })

    it('should process legitimate submissions (empty honeypot)', async () => {
      const request = createRequest(validFormData)

      await handlePostContact(request, mockEnv)

      // Should proceed to Turnstile verification
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('turnstile'),
        expect.anything()
      )
    })
  })

  describe('Turnstile verification', () => {
    it('should reject when Turnstile verification fails', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('turnstile')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                success: false,
                'error-codes': ['invalid-input-response'],
              }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      const request = createRequest(validFormData)
      const response = await handlePostContact(request, mockEnv)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error.message).toContain('Security verification failed')
    })

    it('should handle Turnstile service errors gracefully', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('turnstile')) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      const request = createRequest(validFormData)
      const response = await handlePostContact(request, mockEnv)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error.message).toContain('verification')
    })
  })

  describe('rate limiting', () => {
    it('should allow requests under rate limit', async () => {
      mockEnv.RATE_LIMIT_KV.get.mockResolvedValue('2') // 2 requests so far

      const request = createRequest(validFormData)
      const response = await handlePostContact(request, mockEnv)

      expect(response.status).toBe(200)
    })

    it('should reject requests over rate limit', async () => {
      mockEnv.RATE_LIMIT_KV.get.mockResolvedValue('5') // At limit

      const request = createRequest(validFormData)
      const response = await handlePostContact(request, mockEnv)
      const body = await response.json()

      expect(response.status).toBe(429)
      expect(body.error.code).toBe('RATE_LIMITED')
    })

    it('should increment rate limit counter on successful validation', async () => {
      mockEnv.RATE_LIMIT_KV.get.mockResolvedValue('1')

      const request = createRequest(validFormData)
      await handlePostContact(request, mockEnv)

      expect(mockEnv.RATE_LIMIT_KV.put).toHaveBeenCalled()
    })
  })

  describe('email sending', () => {
    it('should send email on successful submission', async () => {
      const request = createRequest(validFormData)
      const response = await handlePostContact(request, mockEnv)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)

      // Verify Resend API was called
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-resend-key',
          }),
        })
      )
    })

    it('should include correct email content', async () => {
      const request = createRequest(validFormData)
      await handlePostContact(request, mockEnv)

      const resendCall = mockFetch.mock.calls.find(call =>
        call[0].includes('resend')
      )
      expect(resendCall).toBeDefined()
      const emailBody = JSON.parse(resendCall![1].body)

      expect(emailBody.to).toContain('test@example.com')
      expect(emailBody.reply_to).toBe('john@example.com')
      expect(emailBody.subject).toContain('Test Subject')
      // Verify configurable sender domain is used
      expect(emailBody.from).toContain('contact@example.com')
    })

    it('should return error when email sending fails', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('turnstile')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          })
        }
        if (url.includes('resend')) {
          return Promise.resolve({
            ok: false,
            json: () =>
              Promise.resolve({
                error: { message: 'API error', statusCode: 500 },
              }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      const request = createRequest(validFormData)
      const response = await handlePostContact(request, mockEnv)
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.error.message).toContain('Failed to send')
    })
  })

  describe('submission storage', () => {
    it('should store submission in KV when available', async () => {
      const request = createRequest(validFormData)
      await handlePostContact(request, mockEnv)

      expect(mockEnv.CONTACT_SUBMISSIONS.put).toHaveBeenCalledWith(
        expect.stringMatching(/^contact:/),
        expect.any(String),
        expect.objectContaining({ expirationTtl: expect.any(Number) })
      )
    })

    it('should work without KV storage', async () => {
      // Omit CONTACT_SUBMISSIONS entirely (not set to undefined) due to exactOptionalPropertyTypes
      const { CONTACT_SUBMISSIONS: _omitted, ...envWithoutStorage } = mockEnv
      void _omitted // Satisfy ESLint no-unused-vars

      const request = createRequest(validFormData)
      const response = await handlePostContact(request, envWithoutStorage)

      expect(response.status).toBe(200)
    })
  })

  describe('configuration errors', () => {
    it('should return error when TURNSTILE_SECRET_KEY is missing', async () => {
      // Omit property entirely due to exactOptionalPropertyTypes
      const { TURNSTILE_SECRET_KEY: _omit1, ...envWithoutTurnstile } = mockEnv
      void _omit1

      const request = createRequest(validFormData)
      const response = await handlePostContact(request, envWithoutTurnstile)
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.error.message).toContain('configuration')
    })

    it('should return error when RESEND_API_KEY is missing', async () => {
      // Omit property entirely due to exactOptionalPropertyTypes
      const { RESEND_API_KEY: _omit2, ...envWithoutResend } = mockEnv
      void _omit2

      const request = createRequest(validFormData)
      const response = await handlePostContact(request, envWithoutResend)
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.error.message).toContain('configuration')
    })

    it('should return error when CONTACT_EMAIL is missing', async () => {
      // Omit property entirely due to exactOptionalPropertyTypes
      const { CONTACT_EMAIL: _omit3, ...envWithoutEmail } = mockEnv
      void _omit3

      const request = createRequest(validFormData)
      const response = await handlePostContact(request, envWithoutEmail)
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.error.message).toContain('configuration')
    })

    it('should return error when CONTACT_FROM_DOMAIN is missing', async () => {
      // Omit property entirely due to exactOptionalPropertyTypes
      const { CONTACT_FROM_DOMAIN: _omit4, ...envWithoutDomain } = mockEnv
      void _omit4

      const request = createRequest(validFormData)
      const response = await handlePostContact(request, envWithoutDomain)
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.error.message).toContain('configuration')
    })

    it('should return error when CONTACT_EMAIL has invalid format', async () => {
      const envWithInvalidEmail = {
        ...mockEnv,
        CONTACT_EMAIL: 'not-a-valid-email',
      }

      const request = createRequest(validFormData)
      const response = await handlePostContact(request, envWithInvalidEmail)
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.error.message).toContain('configuration')
    })
  })

  describe('successful submission flow', () => {
    it('should return success message on valid submission', async () => {
      const request = createRequest(validFormData)
      const response = await handlePostContact(request, mockEnv)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.message).toContain('successfully')
    })

    it('should complete full flow: validate → verify → email → store', async () => {
      const request = createRequest(validFormData)
      await handlePostContact(request, mockEnv)

      // 1. Rate limit checked
      expect(mockEnv.RATE_LIMIT_KV.get).toHaveBeenCalled()

      // 2. Turnstile verified
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('turnstile'),
        expect.anything()
      )

      // 3. Email sent
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('resend'),
        expect.anything()
      )

      // 4. Submission stored
      expect(mockEnv.CONTACT_SUBMISSIONS.put).toHaveBeenCalled()
    })
  })
})
