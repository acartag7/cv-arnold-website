import { describe, it, expect } from 'vitest'
import { formatPhoneNumber } from '../format-utils'

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
})
