/**
 * Format utilities for display formatting
 *
 * @module lib/format-utils
 */

/**
 * Format a phone number for display
 * Handles Swiss (+41), Spanish (+34), Czech (+420), and international formats
 *
 * @example
 * formatPhoneNumber('+41795301426')  // '+41 79 530 14 26'
 * formatPhoneNumber('+34612345678')  // '+34 612 345 678'
 * formatPhoneNumber('+420123456789') // '+420 123 456 789'
 * formatPhoneNumber('+1234567890')   // '+1 234 567 890'
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except leading +
  const hasPlus = phone.startsWith('+')
  const digits = phone.replace(/\D/g, '')

  // Swiss number format: +41 XX XXX XX XX (11 digits total)
  if (digits.startsWith('41') && digits.length === 11) {
    return `+41 ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`
  }

  // Spanish number format: +34 XXX XXX XXX (11 digits total)
  if (digits.startsWith('34') && digits.length === 11) {
    return `+34 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
  }

  // Czech number format: +420 XXX XXX XXX (12 digits total)
  if (digits.startsWith('420') && digits.length === 12) {
    return `+420 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
  }

  // Generic international format: group in 3s after country code
  if (hasPlus && digits.length > 6) {
    const countryCode = digits.slice(0, digits.length > 10 ? 2 : 1)
    const rest = digits.slice(countryCode.length)

    // Group remaining digits in chunks of 3
    const groups = rest.match(/.{1,3}/g) || []
    return `+${countryCode} ${groups.join(' ')}`
  }

  // Return original if no formatting applied
  return phone
}
