/**
 * Tests for CORS origin parsing and validation functions
 *
 * These functions are used by the Cloudflare Worker to parse
 * the ALLOWED_ORIGINS environment variable and validate the
 * format of origin URLs.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseAllowedOrigins, validateAllowedOrigins } from '../index'

describe('parseAllowedOrigins', () => {
  describe('empty/undefined input', () => {
    it('returns wildcard for undefined input', () => {
      expect(parseAllowedOrigins(undefined)).toBe('*')
    })

    it('returns wildcard for empty string', () => {
      expect(parseAllowedOrigins('')).toBe('*')
    })

    it('returns wildcard for whitespace-only string', () => {
      expect(parseAllowedOrigins('   ')).toBe('*')
    })
  })

  describe('single origin', () => {
    it('returns single origin as string', () => {
      expect(parseAllowedOrigins('https://example.com')).toBe(
        'https://example.com'
      )
    })

    it('trims whitespace from single origin', () => {
      expect(parseAllowedOrigins('  https://example.com  ')).toBe(
        'https://example.com'
      )
    })

    it('handles localhost origin', () => {
      expect(parseAllowedOrigins('http://localhost:3000')).toBe(
        'http://localhost:3000'
      )
    })
  })

  describe('multiple origins', () => {
    it('returns array for multiple origins', () => {
      const result = parseAllowedOrigins(
        'https://example.com,https://api.example.com'
      )
      expect(result).toEqual(['https://example.com', 'https://api.example.com'])
    })

    it('trims whitespace from each origin', () => {
      const result = parseAllowedOrigins(
        '  https://example.com  ,  https://api.example.com  '
      )
      expect(result).toEqual(['https://example.com', 'https://api.example.com'])
    })

    it('filters empty strings from comma-separated list', () => {
      const result = parseAllowedOrigins(
        'https://example.com,,https://api.example.com,'
      )
      expect(result).toEqual(['https://example.com', 'https://api.example.com'])
    })

    it('handles production-like configuration', () => {
      const result = parseAllowedOrigins(
        'https://cv-arnold-website.cartagena-arnold.workers.dev,https://cv.arnoldcartagena.com,https://arnoldcartagena.com,http://localhost:3000'
      )
      expect(result).toEqual([
        'https://cv-arnold-website.cartagena-arnold.workers.dev',
        'https://cv.arnoldcartagena.com',
        'https://arnoldcartagena.com',
        'http://localhost:3000',
      ])
    })
  })
})

describe('validateAllowedOrigins', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  describe('valid inputs', () => {
    it('returns true for undefined (allow all)', () => {
      expect(validateAllowedOrigins(undefined)).toBe(true)
    })

    it('returns true for empty string (allow all)', () => {
      expect(validateAllowedOrigins('')).toBe(true)
    })

    it('returns true for wildcard', () => {
      expect(validateAllowedOrigins('*')).toBe(true)
    })

    it('returns true for valid https URL', () => {
      expect(validateAllowedOrigins('https://example.com')).toBe(true)
    })

    it('returns true for valid http URL', () => {
      expect(validateAllowedOrigins('http://localhost:3000')).toBe(true)
    })

    it('returns true for multiple valid origins', () => {
      expect(
        validateAllowedOrigins('https://example.com,https://api.example.com')
      ).toBe(true)
    })

    it('returns true for wildcard subdomain pattern', () => {
      expect(validateAllowedOrigins('*.example.com')).toBe(true)
    })

    it('returns true for production-like configuration', () => {
      expect(
        validateAllowedOrigins(
          'https://cv-arnold-website.cartagena-arnold.workers.dev,https://cv.arnoldcartagena.com,https://arnoldcartagena.com,http://localhost:3000'
        )
      ).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('returns false for invalid URL format', () => {
      expect(validateAllowedOrigins('not-a-url')).toBe(false)
    })

    it('returns false for ftp protocol', () => {
      expect(validateAllowedOrigins('ftp://files.example.com')).toBe(false)
    })

    it('returns false for file protocol', () => {
      expect(validateAllowedOrigins('file:///path/to/file')).toBe(false)
    })

    it('returns false if any origin in list is invalid', () => {
      expect(
        validateAllowedOrigins(
          'https://valid.com,invalid-url,https://also-valid.com'
        )
      ).toBe(false)
    })

    it('logs warning for invalid origin format', () => {
      validateAllowedOrigins('not-a-url')
      expect(console.warn).toHaveBeenCalledWith(
        '[CORS] Invalid origin format: not-a-url'
      )
    })

    it('logs warning for invalid protocol', () => {
      validateAllowedOrigins('ftp://files.example.com')
      expect(console.warn).toHaveBeenCalledWith(
        '[CORS] Invalid origin protocol: ftp://files.example.com'
      )
    })
  })

  describe('edge cases', () => {
    it('handles origins with ports', () => {
      expect(validateAllowedOrigins('https://example.com:8080')).toBe(true)
    })

    it('handles origins with paths (still validates as URL)', () => {
      // URLs with paths are technically valid URLs, just not typical for CORS origins
      expect(validateAllowedOrigins('https://example.com/path')).toBe(true)
    })

    it('handles comma with only whitespace between', () => {
      expect(validateAllowedOrigins('https://example.com,   ,')).toBe(true)
    })
  })
})
