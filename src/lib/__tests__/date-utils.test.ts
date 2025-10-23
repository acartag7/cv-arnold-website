import { describe, it, expect } from 'vitest'
import {
  formatDateRange,
  formatMonthYear,
  calculateDuration,
  isCurrent,
} from '../date-utils'

describe('date-utils', () => {
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
  })
})
