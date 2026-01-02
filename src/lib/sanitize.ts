/**
 * Input Sanitization Utilities
 *
 * Uses DOMPurify to sanitize HTML/markdown content and prevent XSS attacks.
 * Should be used when:
 * - Rendering user-provided content as HTML
 * - Storing content that will be rendered as HTML
 * - Processing markdown that converts to HTML
 *
 * @module lib/sanitize
 */

import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks.
 *
 * @example
 * ```tsx
 * const safeHtml = sanitizeHtml(userInput)
 * return <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
 * ```
 */
export function sanitizeHtml(dirty: string): string {
  // Only run on client-side (DOMPurify requires DOM)
  if (typeof window === 'undefined') {
    // On server, strip all HTML tags as a fallback
    return dirty.replace(/<[^>]*>/g, '')
  }

  return DOMPurify.sanitize(dirty, {
    // Allow safe HTML tags commonly used in markdown
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'a',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote',
      'code',
      'pre',
    ],
    // Allow safe attributes
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    // Force links to open in new tab with security attributes
    ADD_ATTR: ['target', 'rel'],
    // Transform hooks to add security to links
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  })
}

/**
 * Sanitize plain text input (no HTML allowed).
 * Useful for fields like name, title, etc.
 *
 * @example
 * ```tsx
 * const safeName = sanitizeText(userInput)
 * ```
 */
export function sanitizeText(dirty: string): string {
  // First remove script/style tags with their content
  let clean = dirty.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  )
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  // Then remove all remaining HTML tags
  clean = clean.replace(/<[^>]*>/g, '')
  return clean.trim()
}

/**
 * Sanitize URL to prevent javascript: and data: protocol attacks.
 *
 * @example
 * ```tsx
 * const safeUrl = sanitizeUrl(userProvidedUrl)
 * if (safeUrl) {
 *   return <a href={safeUrl}>Link</a>
 * }
 * ```
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    // Only allow http(s) protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    return parsed.href
  } catch {
    // Invalid URL
    return null
  }
}
