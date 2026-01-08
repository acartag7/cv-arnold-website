/**
 * Contact Form API Handler
 *
 * Handles contact form submissions with:
 * - Cloudflare Turnstile verification (spam protection)
 * - Honeypot detection (bot filtering)
 * - Rate limiting (5 per hour per IP)
 * - Resend email delivery
 * - Optional KV storage backup
 *
 * @module workers/api/handlers/contact
 */

import type { KVNamespace } from '@/services/storage/KVConfig'
import {
  validateContactForm,
  isHoneypotTriggered,
  type ContactSubmission,
} from '@/schemas/contact.schema'
import {
  jsonResponse,
  badRequest,
  validationError,
  internalError,
  rateLimited,
  HttpStatus,
} from '../utils/response'

// ============================================================================
// Types
// ============================================================================

/**
 * Environment bindings for contact handler
 */
export interface ContactHandlerEnv {
  /** Rate limiting KV namespace */
  RATE_LIMIT_KV?: KVNamespace
  /** Contact submissions storage (optional) */
  CONTACT_SUBMISSIONS?: KVNamespace
  /** Cloudflare Turnstile secret key */
  TURNSTILE_SECRET_KEY?: string
  /** Resend API key for email delivery */
  RESEND_API_KEY?: string
  /** Email address to receive contact submissions */
  CONTACT_EMAIL?: string
  /** Domain for sender email (e.g., "example.com" → contact@example.com) */
  CONTACT_FROM_DOMAIN?: string
}

/**
 * Turnstile verification response
 */
interface TurnstileResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

/**
 * Resend API response
 */
interface ResendResponse {
  id?: string
  error?: {
    message: string
    statusCode: number
  }
}

// ============================================================================
// Rate Limiting (5 submissions per hour per IP)
// ============================================================================

const CONTACT_RATE_LIMIT = 5
const CONTACT_RATE_WINDOW_SECONDS = 3600 // 1 hour

/**
 * Check contact-specific rate limit
 *
 * @param kv - Rate limit KV namespace
 * @param ip - Client IP address
 * @returns Rate limit status
 */
async function checkContactRateLimit(
  kv: KVNamespace | undefined,
  ip: string
): Promise<{
  allowed: boolean
  remaining: number
  resetAt: number
}> {
  if (!kv) {
    // No rate limiting without KV
    return {
      allowed: true,
      remaining: CONTACT_RATE_LIMIT,
      resetAt: Date.now() + CONTACT_RATE_WINDOW_SECONDS * 1000,
    }
  }

  const hour = Math.floor(Date.now() / (CONTACT_RATE_WINDOW_SECONDS * 1000))
  const key = `contact-ratelimit:${ip}:${hour}`

  try {
    const currentStr = await kv.get(key)
    const current = currentStr ? parseInt(currentStr, 10) : 0

    if (current >= CONTACT_RATE_LIMIT) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: (hour + 1) * CONTACT_RATE_WINDOW_SECONDS * 1000,
      }
    }

    // Increment counter
    await kv.put(key, String(current + 1), {
      expirationTtl: CONTACT_RATE_WINDOW_SECONDS * 2, // 2 hour expiry for safety
    })

    return {
      allowed: true,
      remaining: CONTACT_RATE_LIMIT - current - 1,
      resetAt: (hour + 1) * CONTACT_RATE_WINDOW_SECONDS * 1000,
    }
  } catch (error) {
    console.error('[Contact] Rate limit check error:', error)
    // Allow request on error (fail open)
    return {
      allowed: true,
      remaining: CONTACT_RATE_LIMIT,
      resetAt: Date.now() + CONTACT_RATE_WINDOW_SECONDS * 1000,
    }
  }
}

// ============================================================================
// Turnstile Verification
// ============================================================================

/**
 * Verify Cloudflare Turnstile token
 *
 * @param token - Client-side Turnstile token
 * @param secret - Turnstile secret key
 * @param ip - Client IP address
 * @returns Verification result
 */
async function verifyTurnstile(
  token: string,
  secret: string,
  ip: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const formData = new FormData()
    formData.append('secret', secret)
    formData.append('response', token)
    formData.append('remoteip', ip)

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: formData,
      }
    )

    const result = (await response.json()) as TurnstileResponse

    if (!result.success) {
      return {
        success: false,
        error: result['error-codes']?.join(', ') || 'Verification failed',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('[Contact] Turnstile verification error:', error)
    return { success: false, error: 'Verification service unavailable' }
  }
}

// ============================================================================
// Email Sending
// ============================================================================

/**
 * Escape HTML for email template
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Generate HTML email template
 */
function generateEmailHtml(
  name: string,
  email: string,
  subject: string,
  message: string,
  fromDomain: string
): string {
  const timestamp = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Form Submission</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
      New Contact Form Submission
    </h1>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">
      via ${escapeHtml(fromDomain)}
    </p>
  </div>

  <!-- Body -->
  <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
    <!-- Sender Info -->
    <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #6366f1;">
      <h2 style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">
        From
      </h2>
      <p style="margin: 0 0 8px 0; font-size: 16px;">
        <strong style="color: #111827;">${escapeHtml(name)}</strong>
      </p>
      <p style="margin: 0;">
        <a href="mailto:${escapeHtml(email)}" style="color: #6366f1; text-decoration: none; font-size: 14px;">
          ${escapeHtml(email)}
        </a>
      </p>
    </div>

    <!-- Subject -->
    <div style="margin-bottom: 24px;">
      <h2 style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">
        Subject
      </h2>
      <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 500;">
        ${escapeHtml(subject)}
      </p>
    </div>

    <!-- Message -->
    <div style="margin-bottom: 24px;">
      <h2 style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">
        Message
      </h2>
      <div style="background: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(message)}</p>
      </div>
    </div>

    <!-- Quick Reply Button -->
    <div style="text-align: center; margin-top: 32px;">
      <a href="mailto:${escapeHtml(email)}?subject=Re: ${encodeURIComponent(subject)}"
         style="display: inline-block; background: #6366f1; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Reply to ${escapeHtml(name.split(' ')[0] || name)}
      </a>
    </div>

    <!-- Footer -->
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        Received on ${timestamp}
      </p>
    </div>
  </div>
</body>
</html>`
}

/**
 * Send email via Resend API
 *
 * @param apiKey - Resend API key
 * @param to - Recipient email
 * @param from - Sender info
 * @param subject - Email subject
 * @param message - Email body
 * @param fromDomain - Domain for sender address (e.g., "example.com")
 * @returns Send result
 */
async function sendEmail(
  apiKey: string,
  to: string,
  from: { name: string; email: string },
  subject: string,
  message: string,
  fromDomain: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = generateEmailHtml(
      from.name,
      from.email,
      subject,
      message,
      fromDomain
    )
    // Configurable sender domain for OSS platform compatibility
    const senderEmail = `contact@${fromDomain}`

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `CV Contact Form <${senderEmail}>`,
        to: [to],
        reply_to: from.email,
        subject: `[CV Contact] ${subject}`,
        html,
      }),
    })

    const result = (await response.json()) as ResendResponse

    if (!response.ok || result.error) {
      console.error('[Contact] Resend API error:', result.error)
      return {
        success: false,
        error: result.error?.message || 'Failed to send email',
      }
    }

    console.log('[Contact] Email sent successfully, ID:', result.id)
    return { success: true }
  } catch (error) {
    console.error('[Contact] Email send error:', error)
    return { success: false, error: 'Email service unavailable' }
  }
}

// ============================================================================
// Storage
// ============================================================================

/**
 * Store contact submission in KV (backup)
 *
 * @param kv - KV namespace
 * @param submission - Submission data
 */
async function storeSubmission(
  kv: KVNamespace,
  submission: ContactSubmission
): Promise<void> {
  try {
    const key = `contact:${submission.id}`
    await kv.put(key, JSON.stringify(submission), {
      expirationTtl: 60 * 60 * 24 * 90, // 90 days retention
    })
    console.log('[Contact] Submission stored:', submission.id)
  } catch (error) {
    console.error('[Contact] Storage error:', error)
    // Non-critical, don't fail the request
  }
}

// ============================================================================
// Handler
// ============================================================================

/**
 * POST /api/v1/contact
 *
 * Handle contact form submission
 *
 * @param request - Incoming request
 * @param env - Environment bindings
 * @returns API response
 */
export async function handlePostContact(
  request: Request,
  env: ContactHandlerEnv
): Promise<Response> {
  const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown'
  const userAgent = request.headers.get('User-Agent') || 'unknown'

  console.log(`[Contact] POST: Received submission from IP ${clientIp}`)

  // ── Check Rate Limit ──────────────────────────────────────────────────────
  const rateLimit = await checkContactRateLimit(env.RATE_LIMIT_KV, clientIp)

  if (!rateLimit.allowed) {
    console.warn(`[Contact] Rate limit exceeded for IP ${clientIp}`)
    const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
    // Include standard rate limit headers for client feedback
    const rateLimitHeaders = {
      'X-RateLimit-Limit': CONTACT_RATE_LIMIT.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': Math.floor(rateLimit.resetAt / 1000).toString(),
    }
    return rateLimited(retryAfter, rateLimitHeaders)
  }

  // ── Parse Request Body ────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Invalid JSON in request body')
  }

  // ── Validate Form Data ────────────────────────────────────────────────────
  const validation = validateContactForm(body)
  if (!validation.success) {
    console.warn('[Contact] Validation failed:', validation.error.format())
    return validationError('Form validation failed', validation.error.format())
  }

  const { name, email, subject, message, honeypot, turnstileToken } =
    validation.data

  // ── Honeypot Check ────────────────────────────────────────────────────────
  // Bots will fill the hidden honeypot field. Silently accept to not alert them.
  if (isHoneypotTriggered(honeypot)) {
    console.warn('[Contact] Honeypot triggered - likely bot')
    return jsonResponse(
      { success: true, message: 'Thank you for your message!' },
      HttpStatus.OK
    )
  }

  // ── Verify Turnstile ──────────────────────────────────────────────────────
  // Note: Turnstile tokens are single-use. Cloudflare automatically invalidates
  // them after verification, preventing replay attacks. No additional check needed.
  if (!env.TURNSTILE_SECRET_KEY) {
    console.error('[Contact] TURNSTILE_SECRET_KEY not configured')
    return internalError('Server configuration error')
  }

  const turnstileResult = await verifyTurnstile(
    turnstileToken,
    env.TURNSTILE_SECRET_KEY,
    clientIp
  )

  if (!turnstileResult.success) {
    console.warn(
      '[Contact] Turnstile verification failed:',
      turnstileResult.error
    )
    return badRequest('Security verification failed. Please try again.')
  }

  // ── Check Required Config ─────────────────────────────────────────────────
  if (!env.RESEND_API_KEY || !env.CONTACT_EMAIL || !env.CONTACT_FROM_DOMAIN) {
    console.error(
      '[Contact] Missing required config: RESEND_API_KEY, CONTACT_EMAIL, or CONTACT_FROM_DOMAIN'
    )
    return internalError('Server configuration error')
  }

  // Validate CONTACT_EMAIL format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(env.CONTACT_EMAIL)) {
    console.error('[Contact] Invalid CONTACT_EMAIL format:', env.CONTACT_EMAIL)
    return internalError('Server configuration error')
  }

  // ── Send Email ────────────────────────────────────────────────────────────
  const emailResult = await sendEmail(
    env.RESEND_API_KEY,
    env.CONTACT_EMAIL,
    { name, email },
    subject,
    message,
    env.CONTACT_FROM_DOMAIN
  )

  // ── Store Submission (Optional) ───────────────────────────────────────────
  const submissionId = crypto.randomUUID()
  const submission: ContactSubmission = {
    id: submissionId,
    name,
    email,
    subject,
    message,
    submittedAt: new Date().toISOString(),
    ipAddress: clientIp,
    userAgent,
    emailSent: emailResult.success,
  }

  if (env.CONTACT_SUBMISSIONS) {
    await storeSubmission(env.CONTACT_SUBMISSIONS, submission)
  }

  // ── Return Response ───────────────────────────────────────────────────────
  if (!emailResult.success) {
    console.error('[Contact] Email send failed:', emailResult.error)
    return internalError(
      'Failed to send message. Please try again later or email directly.'
    )
  }

  console.log(`[Contact] Successfully processed submission from ${email}`)

  return jsonResponse(
    {
      success: true,
      message: 'Thank you! Your message has been sent successfully.',
    },
    HttpStatus.OK
  )
}
