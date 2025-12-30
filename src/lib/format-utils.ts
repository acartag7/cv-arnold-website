/**
 * Format utilities for display formatting
 *
 * @module lib/format-utils
 */

/**
 * Format a phone number for display
 * Handles Swiss (+41), Spanish (+34), and Czech (+420) formats.
 * Returns original for unsupported formats to avoid mangling.
 *
 * @example
 * formatPhoneNumber('+41795301426')  // '+41 79 530 14 26'
 * formatPhoneNumber('+34612345678')  // '+34 612 345 678'
 * formatPhoneNumber('+420123456789') // '+420 123 456 789'
 * formatPhoneNumber('+447911123456') // '+447911123456' (unsupported, returns original)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except leading +
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

  // For unsupported formats, return original unmodified
  // This prevents mangling numbers from countries with different formats
  // (e.g., UK +44, Germany +49, US +1 have varying digit counts and groupings)
  return phone
}
