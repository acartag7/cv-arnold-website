/**
 * Date utility functions for CV display
 */

/**
 * ISO 8601 date format regex for validation
 * Matches: YYYY-MM-DD, YYYY-MM-DDTHH:mm:ss, YYYY-MM-DDTHH:mm:ssZ, etc.
 */
const ISO_8601_REGEX =
  /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)?)?$/

/**
 * Validate that a string is a valid ISO 8601 date format
 * Prevents XSS and injection attacks by ensuring strict date format
 *
 * @param dateString - String to validate
 * @returns True if valid ISO 8601 format
 */
export function isValidISO8601(dateString: string): boolean {
  return ISO_8601_REGEX.test(dateString)
}

/**
 * Validate and parse a date string, throwing if invalid
 *
 * @param dateString - ISO 8601 date string
 * @param fieldName - Field name for error messages
 * @returns Parsed Date object
 * @throws {Error} If date format is invalid or date is invalid
 */
export function parseAndValidateDate(
  dateString: string,
  fieldName: string
): Date {
  // First validate format to prevent injection
  if (!isValidISO8601(dateString)) {
    throw new Error(
      `Invalid ${fieldName} format: expected ISO 8601 (YYYY-MM-DD), got: ${dateString}`
    )
  }

  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ${fieldName}: ${dateString}`)
  }

  return date
}

/**
 * Format a date range for display
 *
 * @param startDate - ISO 8601 start date
 * @param endDate - ISO 8601 end date (null for current)
 * @returns Formatted date range (e.g., "Jan 2020 - Present", "Mar 2018 - Dec 2019")
 * @throws {Error} If startDate or endDate are invalid
 */
export function formatDateRange(
  startDate: string,
  endDate: string | null
): string {
  const start = parseAndValidateDate(startDate, 'start date')
  const startFormatted = formatMonthYear(start)

  if (!endDate) {
    return `${startFormatted} - Present`
  }

  const end = parseAndValidateDate(endDate, 'end date')
  const endFormatted = formatMonthYear(end)

  return `${startFormatted} - ${endFormatted}`
}

/**
 * Format a date as "Mon YYYY" (e.g., "Jan 2020")
 * Uses browser locale for internationalization
 */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString(undefined, {
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
 * @throws {Error} If startDate or endDate are invalid
 */
export function calculateDuration(
  startDate: string,
  endDate: string | null
): string {
  const start = parseAndValidateDate(startDate, 'start date')
  const end = endDate ? parseAndValidateDate(endDate, 'end date') : new Date()

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
 *
 * @param endDate - ISO 8601 end date (null for current)
 * @returns True if end date is null or in the future
 * @throws {Error} If endDate format is invalid
 */
export function isCurrent(endDate: string | null): boolean {
  if (!endDate) return true
  const end = parseAndValidateDate(endDate, 'end date')
  return end > new Date()
}
