/**
 * Contact Form Zod Schema
 *
 * Runtime validation for contact form submissions.
 * Used by both frontend (React Hook Form) and backend (Workers API).
 *
 * @module schemas/contact
 */

import { z } from 'zod'

/**
 * Email validation schema
 * Matches RFC 5322 format with reasonable length limits
 */
const contactEmailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must not exceed 255 characters')

/**
 * Contact form submission schema
 *
 * Fields:
 * - name: Sender's name (2-100 chars)
 * - email: Sender's email (validated format)
 * - subject: Message subject (5-200 chars)
 * - message: Message body (10-2000 chars)
 * - honeypot: Hidden field for bot detection (must be empty)
 * - turnstileToken: Cloudflare Turnstile verification token
 */
export const ContactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),

  email: contactEmailSchema,

  subject: z
    .string()
    .min(1, 'Subject is required')
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must not exceed 200 characters')
    .trim(),

  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must not exceed 2000 characters')
    .trim(),

  // Honeypot field - bots will fill this, humans won't see it
  // Validation is intentionally permissive - we check in the handler
  // to silently accept bot submissions without alerting them
  // Note: Must be required (no .default()) to satisfy exactOptionalPropertyTypes
  honeypot: z.string(),

  // Cloudflare Turnstile verification token
  turnstileToken: z
    .string()
    .min(1, 'Please complete the security verification'),
})

/**
 * Server-side submission schema (for storage)
 * Excludes client-only fields, adds metadata
 */
export const ContactSubmissionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  subject: z.string(),
  message: z.string(),
  submittedAt: z.string().datetime(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  emailSent: z.boolean(),
})

/**
 * API response schema for contact form
 */
export const ContactResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

// ============================================================================
// Type Exports
// ============================================================================

/** Contact form data (frontend) */
export type ContactFormData = z.infer<typeof ContactFormSchema>

/** Stored contact submission (backend) */
export type ContactSubmission = z.infer<typeof ContactSubmissionSchema>

/** API response for contact form */
export type ContactResponse = z.infer<typeof ContactResponseSchema>

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate contact form data
 * Returns a SafeParseResult with either success data or validation errors
 *
 * @param data - Unknown data to validate
 * @returns SafeParseResult with typed data or error details
 *
 * @example
 * ```ts
 * const result = validateContactForm(requestBody)
 * if (!result.success) {
 *   return badRequest(result.error.format())
 * }
 * const { name, email, subject, message } = result.data
 * ```
 */
export function validateContactForm(data: unknown) {
  return ContactFormSchema.safeParse(data)
}

/**
 * Check if honeypot field was filled (indicates bot)
 *
 * @param honeypot - Value of honeypot field
 * @returns true if likely a bot submission
 */
export function isHoneypotTriggered(honeypot: string): boolean {
  return honeypot.length > 0
}
