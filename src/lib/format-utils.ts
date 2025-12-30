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

/**
 * Validate that a URL is safe for use in links
 * Only allows http: and https: protocols to prevent javascript: and data: attacks.
 *
 * @param url - URL string to validate
 * @returns true if URL is safe, false otherwise
 *
 * @example
 * isValidUrl('https://linkedin.com/in/user')  // true
 * isValidUrl('http://github.com/user')        // true
 * isValidUrl('javascript:alert("xss")')       // false
 * isValidUrl('data:text/html,...')            // false
 */
export function isValidUrl(url: string | undefined | null): boolean {
  if (!url) return false

  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Validate that an email address is safe for use in mailto: links
 * Performs basic format validation and sanitization check.
 *
 * @param email - Email string to validate
 * @returns true if email is safe, false otherwise
 *
 * @example
 * isValidEmail('user@example.com')           // true
 * isValidEmail('user+tag@example.com')       // true
 * isValidEmail('invalid')                    // false
 * isValidEmail('user@example.com?subject=<script>') // false (XSS attempt)
 */
export function isValidEmail(email: string | undefined | null): boolean {
  if (!email) return false

  // Basic email format validation
  // Must contain @ with text before and after, no angle brackets or scripts
  const emailRegex = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/
  if (!emailRegex.test(email)) return false

  // Block potential XSS attempts (query strings, HTML tags)
  if (email.includes('?') || email.includes('<') || email.includes('>')) {
    return false
  }

  return true
}

/**
 * Sanitize an email for safe use in mailto: links
 * Returns the trimmed email if valid, undefined otherwise.
 *
 * @param email - Email string to sanitize
 * @returns Sanitized email or undefined if invalid
 *
 * @example
 * sanitizeEmail('  user@example.com  ')  // 'user@example.com'
 * sanitizeEmail('invalid')               // undefined
 */
export function sanitizeEmail(
  email: string | undefined | null
): string | undefined {
  if (!email) return undefined

  const trimmed = email.trim()
  return isValidEmail(trimmed) ? trimmed : undefined
}

/**
 * Sanitize a URL for safe use in links
 * Returns the URL if valid (http/https), undefined otherwise.
 *
 * @param url - URL string to sanitize
 * @returns Sanitized URL or undefined if invalid
 *
 * @example
 * sanitizeUrl('https://github.com/user')    // 'https://github.com/user'
 * sanitizeUrl('javascript:alert("xss")')   // undefined
 */
export function sanitizeUrl(
  url: string | undefined | null
): string | undefined {
  if (!url) return undefined

  return isValidUrl(url) ? url : undefined
}
