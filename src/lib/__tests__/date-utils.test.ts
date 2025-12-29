import { describe, it, expect } from 'vitest'
import {
  formatDateRange,
  formatMonthYear,
  calculateDuration,
  isCurrent,
  isValidISO8601,
} from '../date-utils'

describe('date-utils', () => {
  describe('isValidISO8601', () => {
    it('should accept valid YYYY-MM-DD format', () => {
      expect(isValidISO8601('2020-01-15')).toBe(true)
      expect(isValidISO8601('2021-12-31')).toBe(true)
      expect(isValidISO8601('1999-06-01')).toBe(true)
    })

    it('should accept valid ISO 8601 with time', () => {
      expect(isValidISO8601('2020-01-15T12:30:45')).toBe(true)
      expect(isValidISO8601('2020-01-15T00:00:00')).toBe(true)
      expect(isValidISO8601('2020-01-15T23:59:59')).toBe(true)
    })

    it('should accept valid ISO 8601 with timezone', () => {
      expect(isValidISO8601('2020-01-15T12:30:45Z')).toBe(true)
      expect(isValidISO8601('2020-01-15T12:30:45+05:00')).toBe(true)
      expect(isValidISO8601('2020-01-15T12:30:45-08:00')).toBe(true)
    })

    it('should accept valid ISO 8601 with milliseconds', () => {
      expect(isValidISO8601('2020-01-15T12:30:45.123Z')).toBe(true)
      expect(isValidISO8601('2020-01-15T12:30:45.999+00:00')).toBe(true)
    })

    it('should reject invalid formats', () => {
      expect(isValidISO8601('01-15-2020')).toBe(false) // US format
      expect(isValidISO8601('15/01/2020')).toBe(false) // EU format
      expect(isValidISO8601('2020/01/15')).toBe(false) // Wrong separator
      expect(isValidISO8601('Jan 15, 2020')).toBe(false) // Human readable
      expect(isValidISO8601('not-a-date')).toBe(false) // Random string
    })

    it('should reject potentially malicious inputs', () => {
      expect(isValidISO8601('<script>alert("xss")</script>')).toBe(false)
      expect(isValidISO8601('2020-01-15; DROP TABLE users;')).toBe(false)
      expect(isValidISO8601('javascript:alert(1)')).toBe(false)
      expect(isValidISO8601('')).toBe(false)
    })

    it('should reject invalid month values', () => {
      expect(isValidISO8601('2020-00-15')).toBe(false) // Month 00
      expect(isValidISO8601('2020-13-15')).toBe(false) // Month 13
    })

    it('should reject invalid day values', () => {
      expect(isValidISO8601('2020-01-00')).toBe(false) // Day 00
      expect(isValidISO8601('2020-01-32')).toBe(false) // Day 32
    })
  })

  describe('formatDateRange', () => {
    it('should format date range with end date', () => {
      const result = formatDateRange('2020-01-15', '2021-12-31')
      expect(result).toBe('Jan 2020 - Dec 2021')
    })

    it('should format date range without end date as Present', () => {
      const result = formatDateRange('2020-01-15', null)
      expect(result).toBe('Jan 2020 - Present')
    })

    it('should handle same year dates', () => {
      const result = formatDateRange('2020-01-15', '2020-06-30')
      expect(result).toBe('Jan 2020 - Jun 2020')
    })

    it('should throw for invalid start date format', () => {
      expect(() => formatDateRange('invalid', '2021-12-31')).toThrow(
        'Invalid start date format'
      )
    })

    it('should throw for invalid end date format', () => {
      expect(() => formatDateRange('2020-01-15', 'invalid')).toThrow(
        'Invalid end date format'
      )
    })

    it('should throw for potentially malicious input', () => {
      expect(() =>
        formatDateRange('<script>alert(1)</script>', '2021-12-31')
      ).toThrow('Invalid start date format')
    })
  })

  describe('formatMonthYear', () => {
    it('should format date as Mon YYYY', () => {
      const date = new Date('2020-03-15')
      expect(formatMonthYear(date)).toBe('Mar 2020')
    })

    it('should handle January correctly', () => {
      const date = new Date('2021-01-01')
      expect(formatMonthYear(date)).toBe('Jan 2021')
    })

    it('should handle December correctly', () => {
      const date = new Date('2021-12-31')
      expect(formatMonthYear(date)).toBe('Dec 2021')
    })
  })

  describe('calculateDuration', () => {
    it('should calculate years and months', () => {
      const result = calculateDuration('2020-01-01', '2022-06-30')
      expect(result).toBe('2 years 5 months')
    })

    it('should handle exact years', () => {
      const result = calculateDuration('2020-01-01', '2022-01-01')
      expect(result).toBe('2 years')
    })

    it('should handle months only', () => {
      const result = calculateDuration('2020-01-01', '2020-06-30')
      expect(result).toBe('5 months')
    })

    it('should handle single year', () => {
      const result = calculateDuration('2020-01-01', '2021-01-01')
      expect(result).toBe('1 year')
    })

    it('should handle single month', () => {
      const result = calculateDuration('2020-01-01', '2020-02-01')
      expect(result).toBe('1 month')
    })

    it('should handle less than 1 month', () => {
      const result = calculateDuration('2020-01-01', '2020-01-15')
      expect(result).toBe('Less than 1 month')
    })

    it('should calculate duration to present when end date is null', () => {
      const result = calculateDuration('2020-01-01', null)
      // Result depends on current date, just verify it's a valid format
      expect(result).toMatch(
        /^(\d+ years?)?(\s\d+ months?)?$|Less than 1 month/
      )
    })

    it('should throw for invalid start date format', () => {
      expect(() => calculateDuration('invalid', '2021-12-31')).toThrow(
        'Invalid start date format'
      )
    })

    it('should throw for invalid end date format', () => {
      expect(() => calculateDuration('2020-01-01', 'invalid')).toThrow(
        'Invalid end date format'
      )
    })
  })

  describe('isCurrent', () => {
    it('should return true for null end date', () => {
      expect(isCurrent(null)).toBe(true)
    })

    it('should return false for past end date', () => {
      expect(isCurrent('2020-01-01')).toBe(false)
    })

    it('should return true for future end date', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      expect(isCurrent(futureDate.toISOString())).toBe(true)
    })

    it('should throw for invalid end date format', () => {
      expect(() => isCurrent('invalid')).toThrow('Invalid end date format')
    })
  })
})
