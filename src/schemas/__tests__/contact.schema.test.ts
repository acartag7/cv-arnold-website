/**
 * Contact Form Schema Tests
 *
 * Tests for contact form validation including:
 * - Valid submission acceptance
 * - Field validation (name, email, subject, message)
 * - Honeypot detection
 * - Turnstile token requirement
 *
 * @module schemas/__tests__/contact.schema
 */

import { describe, it, expect } from 'vitest'
import {
  ContactFormSchema,
  ContactSubmissionSchema,
  validateContactForm,
  isHoneypotTriggered,
} from '../contact.schema'

describe('ContactFormSchema', () => {
  const validData = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Inquiry about services',
    message: 'I would like to discuss a potential project with you.',
    honeypot: '',
    turnstileToken: 'valid-token-123',
  }

  describe('valid submissions', () => {
    it('should accept valid contact form data', () => {
      const result = ContactFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('John Doe')
        expect(result.data.email).toBe('john@example.com')
      }
    })

    it('should trim whitespace from string fields', () => {
      const result = ContactFormSchema.safeParse({
        ...validData,
        name: '  John Doe  ',
        subject: '  Test Subject  ',
        message: '  This is a test message  ',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('John Doe')
        expect(result.data.subject).toBe('Test Subject')
        expect(result.data.message).toBe('This is a test message')
      }
    })

    it('should accept minimum valid field lengths', () => {
      const result = ContactFormSchema.safeParse({
        name: 'Jo', // 2 chars
        email: 'a@b.co',
        subject: 'Hello', // 5 chars
        message: 'Hi there!!', // 10 chars
        honeypot: '', // Required field (form provides via defaultValues)
        turnstileToken: 'x',
      })
      expect(result.success).toBe(true)
    })

    it('should require honeypot field (form always provides it)', () => {
      // The form always provides honeypot via defaultValues: { honeypot: '' }
      // Schema requires it to satisfy exactOptionalPropertyTypes
      const dataWithoutHoneypot = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test subject here',
        message: 'Test message content',
        turnstileToken: 'token',
      }
      const result = ContactFormSchema.safeParse(dataWithoutHoneypot)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('honeypot')
      }
    })
  })

  describe('name validation', () => {
    it('should reject empty name', () => {
      const result = ContactFormSchema.safeParse({ ...validData, name: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('required')
      }
    })

    it('should reject name shorter than 2 characters', () => {
      const result = ContactFormSchema.safeParse({ ...validData, name: 'J' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('at least 2')
      }
    })

    it('should reject name longer than 100 characters', () => {
      const result = ContactFormSchema.safeParse({
        ...validData,
        name: 'A'.repeat(101),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('100')
      }
    })

    it('should accept exactly 100 character name', () => {
      const result = ContactFormSchema.safeParse({
        ...validData,
        name: 'A'.repeat(100),
      })
      expect(result.success).toBe(true)
    })
  })

  describe('email validation', () => {
    it('should reject empty email', () => {
      const result = ContactFormSchema.safeParse({ ...validData, email: '' })
      expect(result.success).toBe(false)
    })

    it('should reject invalid email format', () => {
      const invalidEmails = [
        'not-an-email',
        'missing@domain',
        '@nodomain.com',
        'spaces in@email.com',
        'no@tld',
      ]

      for (const email of invalidEmails) {
        const result = ContactFormSchema.safeParse({ ...validData, email })
        expect(result.success).toBe(false)
      }
    })

    it('should accept valid email formats', () => {
      const validEmails = [
        'simple@example.com',
        'user.name@example.com',
        'user+tag@example.org',
        'user@subdomain.example.com',
      ]

      for (const email of validEmails) {
        const result = ContactFormSchema.safeParse({ ...validData, email })
        expect(result.success).toBe(true)
      }
    })

    it('should reject email longer than 255 characters', () => {
      const result = ContactFormSchema.safeParse({
        ...validData,
        email: 'a'.repeat(250) + '@b.com',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('subject validation', () => {
    it('should reject empty subject', () => {
      const result = ContactFormSchema.safeParse({ ...validData, subject: '' })
      expect(result.success).toBe(false)
    })

    it('should reject subject shorter than 5 characters', () => {
      const result = ContactFormSchema.safeParse({
        ...validData,
        subject: 'Hey!',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('at least 5')
      }
    })

    it('should reject subject longer than 200 characters', () => {
      const result = ContactFormSchema.safeParse({
        ...validData,
        subject: 'A'.repeat(201),
      })
      expect(result.success).toBe(false)
    })
  })

  describe('message validation', () => {
    it('should reject empty message', () => {
      const result = ContactFormSchema.safeParse({ ...validData, message: '' })
      expect(result.success).toBe(false)
    })

    it('should reject message shorter than 10 characters', () => {
      const result = ContactFormSchema.safeParse({
        ...validData,
        message: 'Too short',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('at least 10')
      }
    })

    it('should reject message longer than 2000 characters', () => {
      const result = ContactFormSchema.safeParse({
        ...validData,
        message: 'A'.repeat(2001),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('2000')
      }
    })

    it('should accept exactly 2000 character message', () => {
      const result = ContactFormSchema.safeParse({
        ...validData,
        message: 'A'.repeat(2000),
      })
      expect(result.success).toBe(true)
    })
  })

  describe('honeypot validation (bot detection)', () => {
    it('should accept empty honeypot (legitimate user)', () => {
      const result = ContactFormSchema.safeParse({ ...validData, honeypot: '' })
      expect(result.success).toBe(true)
    })

    // Honeypot validation is intentionally permissive at schema level
    // The handler silently accepts bot submissions without alerting them
    it('should accept filled honeypot at schema level (handler checks silently)', () => {
      const result = ContactFormSchema.safeParse({
        ...validData,
        honeypot: 'spam-content',
      })
      // Schema accepts it - handler will silently reject
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.honeypot).toBe('spam-content')
      }
    })

    it('should pass any honeypot value to handler for silent rejection', () => {
      const botValues = ['x', ' ', 'http://spam.com', '123']
      for (const honeypot of botValues) {
        const result = ContactFormSchema.safeParse({ ...validData, honeypot })
        // Schema accepts all values - handler decides what to do
        expect(result.success).toBe(true)
      }
    })
  })

  describe('turnstileToken validation', () => {
    it('should reject empty turnstile token', () => {
      const result = ContactFormSchema.safeParse({
        ...validData,
        turnstileToken: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          'security verification'
        )
      }
    })

    it('should reject missing turnstile token', () => {
      const { turnstileToken: _unused, ...dataWithoutToken } = validData
      void _unused // Satisfy ESLint no-unused-vars
      const result = ContactFormSchema.safeParse(dataWithoutToken)
      expect(result.success).toBe(false)
    })

    it('should accept any non-empty turnstile token', () => {
      const result = ContactFormSchema.safeParse({
        ...validData,
        turnstileToken: 'any-token-value',
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('ContactSubmissionSchema', () => {
  it('should accept valid submission data', () => {
    const validSubmission = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'Test message content',
      submittedAt: '2026-01-08T12:00:00.000Z',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      emailSent: true,
    }
    const result = ContactSubmissionSchema.safeParse(validSubmission)
    expect(result.success).toBe(true)
  })

  it('should accept submission without optional fields', () => {
    const minimalSubmission = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'Test message content',
      submittedAt: '2026-01-08T12:00:00.000Z',
      emailSent: false,
    }
    const result = ContactSubmissionSchema.safeParse(minimalSubmission)
    expect(result.success).toBe(true)
  })

  it('should reject invalid UUID', () => {
    const result = ContactSubmissionSchema.safeParse({
      id: 'not-a-uuid',
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'Test message content',
      submittedAt: '2026-01-08T12:00:00.000Z',
      emailSent: true,
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid datetime format', () => {
    const result = ContactSubmissionSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'Test message content',
      submittedAt: 'not-a-datetime',
      emailSent: true,
    })
    expect(result.success).toBe(false)
  })
})

describe('validateContactForm helper', () => {
  it('should return success result for valid data', () => {
    const result = validateContactForm({
      name: 'Test User',
      email: 'test@test.com',
      subject: 'Test Subject',
      message: 'This is a test message',
      honeypot: '', // Required field
      turnstileToken: 'token',
    })
    expect(result.success).toBe(true)
  })

  it('should return error result for invalid data', () => {
    const result = validateContactForm({
      name: '', // Invalid
      email: 'invalid',
      subject: 'Hi', // Too short
      message: 'Short', // Too short
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0)
    }
  })
})

describe('isHoneypotTriggered helper', () => {
  it('should return false for empty string honeypot', () => {
    // Empty string = human user (field hidden, not filled)
    expect(isHoneypotTriggered('')).toBe(false)
  })

  it('should return true for filled honeypot', () => {
    // Any content = likely bot (filled the hidden field)
    expect(isHoneypotTriggered('spam')).toBe(true)
    expect(isHoneypotTriggered(' ')).toBe(true)
    expect(isHoneypotTriggered('x')).toBe(true)
  })
})
