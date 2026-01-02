/**
 * Tests for sanitization utilities
 */

import { describe, expect, it } from 'vitest'
import { sanitizeText, sanitizeUrl } from '../sanitize'

// Note: sanitizeHtml requires DOM (window) so we test it separately
// These tests run in happy-dom environment but DOMPurify may behave differently

describe('sanitizeText', () => {
  it('should remove HTML tags', () => {
    expect(sanitizeText('<script>alert("xss")</script>Hello')).toBe('Hello')
    expect(sanitizeText('<b>Bold</b> text')).toBe('Bold text')
    expect(sanitizeText('<img src="x" onerror="alert(1)">Test')).toBe('Test')
  })

  it('should trim whitespace', () => {
    expect(sanitizeText('  Hello World  ')).toBe('Hello World')
  })

  it('should handle empty string', () => {
    expect(sanitizeText('')).toBe('')
  })

  it('should preserve plain text', () => {
    expect(sanitizeText('Just plain text')).toBe('Just plain text')
  })

  it('should handle special characters', () => {
    expect(sanitizeText('Hello & Goodbye <3')).toBe('Hello & Goodbye <3')
  })
})

describe('sanitizeUrl', () => {
  it('should allow https URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com/')
    expect(sanitizeUrl('https://example.com/path?query=1')).toBe(
      'https://example.com/path?query=1'
    )
  })

  it('should allow http URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com/')
  })

  it('should reject javascript: protocol', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull()
  })

  it('should reject data: protocol', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull()
  })

  it('should reject invalid URLs', () => {
    expect(sanitizeUrl('not-a-url')).toBeNull()
    expect(sanitizeUrl('')).toBeNull()
  })

  it('should reject file: protocol', () => {
    expect(sanitizeUrl('file:///etc/passwd')).toBeNull()
  })
})
