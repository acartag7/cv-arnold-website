/**
 * Date utility functions for CV display
 */

/**
 * Format a date range for display
 *
 * @param startDate - ISO 8601 start date
 * @param endDate - ISO 8601 end date (null for current)
 * @returns Formatted date range (e.g., "Jan 2020 - Present", "Mar 2018 - Dec 2019")
 */
export function formatDateRange(
  startDate: string,
  endDate: string | null
): string {
  const start = new Date(startDate)
  const startFormatted = formatMonthYear(start)

  if (!endDate) {
    return `${startFormatted} - Present`
  }

  const end = new Date(endDate)
  const endFormatted = formatMonthYear(end)

  return `${startFormatted} - ${endFormatted}`
}

/**
 * Format a date as "Mon YYYY" (e.g., "Jan 2020")
 */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Calculate duration between two dates
 *
 * @param startDate - ISO 8601 start date
 * @param endDate - ISO 8601 end date (null for current)
 * @returns Duration string (e.g., "2 years 3 months", "6 months")
 */
export function calculateDuration(
  startDate: string,
  endDate: string | null
): string {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()

  const totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())

  if (totalMonths < 1) {
    return 'Less than 1 month'
  }

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  const parts: string[] = []
  if (years > 0) {
    parts.push(`${years} year${years > 1 ? 's' : ''}`)
  }
  if (months > 0) {
    parts.push(`${months} month${months > 1 ? 's' : ''}`)
  }

  return parts.join(' ')
}

/**
 * Check if a date range is current (no end date or end date is in the future)
 */
export function isCurrent(endDate: string | null): boolean {
  if (!endDate) return true
  return new Date(endDate) > new Date()
}
