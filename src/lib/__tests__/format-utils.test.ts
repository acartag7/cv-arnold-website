import { describe, it, expect } from 'vitest'
import {
  formatPhoneNumber,
  isValidUrl,
  isValidEmail,
  sanitizeUrl,
  sanitizeEmail,
  generateId,
} from '../format-utils'

describe('format-utils', () => {
  describe('formatPhoneNumber', () => {
    describe('Swiss numbers (+41)', () => {
      it('should format valid Swiss mobile number', () => {
        expect(formatPhoneNumber('+41795301426')).toBe('+41 79 530 14 26')
      })

      it('should format Swiss number with spaces already present', () => {
        expect(formatPhoneNumber('+41 79 530 14 26')).toBe('+41 79 530 14 26')
      })

      it('should format Swiss number with dashes', () => {
        expect(formatPhoneNumber('+41-79-530-14-26')).toBe('+41 79 530 14 26')
      })

      it('should format Swiss landline number', () => {
        expect(formatPhoneNumber('+41313001234')).toBe('+41 31 300 12 34')
      })
    })

    describe('Spanish numbers (+34)', () => {
      it('should format valid Spanish mobile number', () => {
        expect(formatPhoneNumber('+34612345678')).toBe('+34 612 345 678')
      })

      it('should format Spanish number with spaces', () => {
        expect(formatPhoneNumber('+34 612 345 678')).toBe('+34 612 345 678')
      })

      it('should format Spanish landline number', () => {
        expect(formatPhoneNumber('+34912345678')).toBe('+34 912 345 678')
      })
    })

    describe('Czech numbers (+420)', () => {
      it('should format valid Czech mobile number', () => {
        expect(formatPhoneNumber('+420123456789')).toBe('+420 123 456 789')
      })

      it('should format Czech number with spaces', () => {
        expect(formatPhoneNumber('+420 123 456 789')).toBe('+420 123 456 789')
      })

      it('should format Czech number with dashes', () => {
        expect(formatPhoneNumber('+420-123-456-789')).toBe('+420 123 456 789')
      })
    })

    describe('unsupported formats (returns original)', () => {
      it('should return original UK number unmodified', () => {
        const ukNumber = '+447911123456'
        expect(formatPhoneNumber(ukNumber)).toBe(ukNumber)
      })

      it('should return original German number unmodified', () => {
        const germanNumber = '+4915123456789'
        expect(formatPhoneNumber(germanNumber)).toBe(germanNumber)
      })

      it('should return original US number unmodified', () => {
        const usNumber = '+12025551234'
        expect(formatPhoneNumber(usNumber)).toBe(usNumber)
      })

      it('should return original Australian number unmodified', () => {
        const ausNumber = '+61412345678'
        expect(formatPhoneNumber(ausNumber)).toBe(ausNumber)
      })

      it('should return original for incomplete Swiss number', () => {
        const incomplete = '+4179530'
        expect(formatPhoneNumber(incomplete)).toBe(incomplete)
      })

      it('should return original for incomplete Spanish number', () => {
        const incomplete = '+346123'
        expect(formatPhoneNumber(incomplete)).toBe(incomplete)
      })
    })

    describe('edge cases', () => {
      it('should return empty string for empty input', () => {
        expect(formatPhoneNumber('')).toBe('')
      })

      it('should format number without plus if digits match known pattern', () => {
        // Function recognizes Swiss pattern and formats it
        expect(formatPhoneNumber('41795301426')).toBe('+41 79 530 14 26')
      })

      it('should return original for local format', () => {
        expect(formatPhoneNumber('079 530 14 26')).toBe('079 530 14 26')
      })

      it('should return original for very short numbers', () => {
        expect(formatPhoneNumber('+41')).toBe('+41')
        expect(formatPhoneNumber('123')).toBe('123')
      })

      it('should handle number with parentheses', () => {
        // Swiss number with area code in parentheses - strips non-digits
        expect(formatPhoneNumber('+41(79)5301426')).toBe('+41 79 530 14 26')
      })
    })

    describe('security - XSS and injection attempts', () => {
      it('should handle script tags safely', () => {
        const malicious = '<script>alert("xss")</script>'
        expect(formatPhoneNumber(malicious)).toBe(malicious)
      })

      it('should sanitize SQL injection attempts by stripping non-digits', () => {
        const injection = '+41795301426; DROP TABLE users;--'
        // Strips non-digits, recognizes Swiss pattern, formats safely
        expect(formatPhoneNumber(injection)).toBe('+41 79 530 14 26')
      })

      it('should handle javascript protocol', () => {
        const jsProtocol = 'javascript:alert(1)'
        expect(formatPhoneNumber(jsProtocol)).toBe(jsProtocol)
      })

      it('should handle null characters', () => {
        const nullChar = '+41795301426\x00'
        // Stripping non-digits makes it valid Swiss format
        expect(formatPhoneNumber(nullChar)).toBe('+41 79 530 14 26')
      })

      it('should handle unicode escape sequences', () => {
        const unicode = '+41795301426\u0000\u0001'
        expect(formatPhoneNumber(unicode)).toBe('+41 79 530 14 26')
      })
    })

    describe('formatting consistency', () => {
      it('should produce consistent output regardless of input formatting', () => {
        const variants = [
          '+41795301426',
          '+41 795301426',
          '+41 79 530 14 26',
          '+41-79-530-14-26',
          '+41.79.530.14.26',
          '+41 (79) 530 14 26',
        ]

        const expected = '+41 79 530 14 26'
        variants.forEach(variant => {
          expect(formatPhoneNumber(variant)).toBe(expected)
        })
      })
    })
  })

  describe('isValidUrl', () => {
    describe('valid URLs', () => {
      it('should accept https URLs', () => {
        expect(isValidUrl('https://example.com')).toBe(true)
        expect(isValidUrl('https://linkedin.com/in/user')).toBe(true)
        expect(isValidUrl('https://github.com/user/repo')).toBe(true)
      })

      it('should accept http URLs', () => {
        expect(isValidUrl('http://example.com')).toBe(true)
        expect(isValidUrl('http://localhost:3000')).toBe(true)
      })

      it('should accept URLs with query strings and fragments', () => {
        expect(isValidUrl('https://example.com?foo=bar')).toBe(true)
        expect(isValidUrl('https://example.com#section')).toBe(true)
        expect(isValidUrl('https://example.com/path?foo=bar#section')).toBe(
          true
        )
      })
    })

    describe('invalid URLs', () => {
      it('should reject javascript protocol', () => {
        expect(isValidUrl('javascript:alert("xss")')).toBe(false)
        expect(isValidUrl('javascript:void(0)')).toBe(false)
      })

      it('should reject data protocol', () => {
        expect(isValidUrl('data:text/html,<script>alert(1)</script>')).toBe(
          false
        )
        expect(isValidUrl('data:application/json,{}')).toBe(false)
      })

      it('should reject file protocol', () => {
        expect(isValidUrl('file:///etc/passwd')).toBe(false)
      })

      it('should reject ftp protocol', () => {
        expect(isValidUrl('ftp://ftp.example.com')).toBe(false)
      })

      it('should reject malformed URLs', () => {
        expect(isValidUrl('not-a-url')).toBe(false)
        expect(isValidUrl('://missing-protocol.com')).toBe(false)
        expect(isValidUrl('')).toBe(false)
      })

      it('should reject null and undefined', () => {
        expect(isValidUrl(null)).toBe(false)
        expect(isValidUrl(undefined)).toBe(false)
      })
    })
  })

  describe('isValidEmail', () => {
    describe('valid emails', () => {
      it('should accept standard email addresses', () => {
        expect(isValidEmail('user@example.com')).toBe(true)
        expect(isValidEmail('john.doe@company.org')).toBe(true)
        expect(isValidEmail('test@subdomain.example.com')).toBe(true)
      })

      it('should accept emails with plus tags', () => {
        expect(isValidEmail('user+tag@example.com')).toBe(true)
        expect(isValidEmail('test+filter+another@domain.com')).toBe(true)
      })

      it('should accept emails with numbers and hyphens', () => {
        expect(isValidEmail('user123@example.com')).toBe(true)
        expect(isValidEmail('user-name@example-domain.com')).toBe(true)
      })
    })

    describe('invalid emails', () => {
      it('should reject emails without @', () => {
        expect(isValidEmail('userexample.com')).toBe(false)
        expect(isValidEmail('noatsign')).toBe(false)
      })

      it('should reject emails without domain', () => {
        expect(isValidEmail('user@')).toBe(false)
        expect(isValidEmail('user@domain')).toBe(false)
      })

      it('should reject emails with spaces', () => {
        expect(isValidEmail('user @example.com')).toBe(false)
        expect(isValidEmail('user@ example.com')).toBe(false)
        expect(isValidEmail(' user@example.com ')).toBe(false)
      })

      it('should reject XSS attempts in emails', () => {
        expect(isValidEmail('user@example.com?subject=<script>')).toBe(false)
        expect(isValidEmail('<script>@example.com')).toBe(false)
        expect(isValidEmail('user@example.com>')).toBe(false)
      })

      it('should reject emails with query parameters', () => {
        expect(isValidEmail('user@example.com?subject=test')).toBe(false)
        expect(isValidEmail('user@example.com?cc=other@example.com')).toBe(
          false
        )
      })

      it('should reject null and undefined', () => {
        expect(isValidEmail(null)).toBe(false)
        expect(isValidEmail(undefined)).toBe(false)
      })

      it('should reject empty string', () => {
        expect(isValidEmail('')).toBe(false)
      })
    })
  })

  describe('sanitizeUrl', () => {
    it('should return valid URLs unchanged', () => {
      expect(sanitizeUrl('https://github.com/user')).toBe(
        'https://github.com/user'
      )
      expect(sanitizeUrl('http://localhost:3000')).toBe('http://localhost:3000')
    })

    it('should return undefined for invalid URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBeUndefined()
      expect(sanitizeUrl('data:text/html,...')).toBeUndefined()
      expect(sanitizeUrl('not-a-url')).toBeUndefined()
    })

    it('should return undefined for null/undefined', () => {
      expect(sanitizeUrl(null)).toBeUndefined()
      expect(sanitizeUrl(undefined)).toBeUndefined()
    })
  })

  describe('sanitizeEmail', () => {
    it('should return valid emails trimmed', () => {
      expect(sanitizeEmail('user@example.com')).toBe('user@example.com')
      expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com')
    })

    it('should return undefined for invalid emails', () => {
      expect(sanitizeEmail('invalid')).toBeUndefined()
      expect(sanitizeEmail('user@example.com?subject=xss')).toBeUndefined()
      expect(sanitizeEmail('<script>@evil.com')).toBeUndefined()
    })

    it('should return undefined for null/undefined', () => {
      expect(sanitizeEmail(null)).toBeUndefined()
      expect(sanitizeEmail(undefined)).toBeUndefined()
    })
  })

  describe('generateId', () => {
    it('should generate ID with correct prefix', () => {
      expect(generateId('exp')).toMatch(/^exp-\d+-[a-z0-9]+$/)
      expect(generateId('cert')).toMatch(/^cert-\d+-[a-z0-9]+$/)
      expect(generateId('cat')).toMatch(/^cat-\d+-[a-z0-9]+$/)
      expect(generateId('toast')).toMatch(/^toast-\d+-[a-z0-9]+$/)
    })

    it('should generate unique IDs', () => {
      const ids = new Set<string>()
      for (let i = 0; i < 100; i++) {
        ids.add(generateId('test'))
      }
      // All 100 IDs should be unique
      expect(ids.size).toBe(100)
    })

    it('should include timestamp component', () => {
      const before = Date.now()
      const id = generateId('exp')
      const after = Date.now()

      // Extract timestamp from ID
      const parts = id.split('-')
      const timestamp = parseInt(parts[1] ?? '0', 10)

      expect(timestamp).toBeGreaterThanOrEqual(before)
      expect(timestamp).toBeLessThanOrEqual(after)
    })

    it('should handle empty prefix', () => {
      expect(generateId('')).toMatch(/^-\d+-[a-z0-9]+$/)
    })

    it('should handle special characters in prefix', () => {
      // Special characters should be preserved
      expect(generateId('my-prefix')).toMatch(/^my-prefix-\d+-[a-z0-9]+$/)
    })
  })
})
