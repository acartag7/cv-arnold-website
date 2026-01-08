'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  ContactFormSchema,
  type ContactFormData,
} from '@/schemas/contact.schema'
import { motion, AnimatePresence } from 'framer-motion'

interface ContactFormProps {
  /** Cloudflare Turnstile site key */
  turnstileSiteKey: string
  /** API endpoint for form submission */
  apiEndpoint?: string
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

/**
 * Terminal-styled contact form with Turnstile spam protection
 *
 * Features:
 * - React Hook Form + Zod validation
 * - Cloudflare Turnstile widget
 * - Honeypot field for bot detection
 * - Terminal aesthetic matching site design
 */
export function ContactForm({
  turnstileSiteKey,
  apiEndpoint = '/api/v1/contact',
}: ContactFormProps) {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const turnstileRef = useRef<TurnstileInstance | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      honeypot: '',
      turnstileToken: '',
    },
  })

  const onTurnstileSuccess = (token: string) => {
    setValue('turnstileToken', token, { shouldValidate: true })
  }

  const onTurnstileExpire = () => {
    setValue('turnstileToken', '', { shouldValidate: true })
  }

  const onSubmit = async (data: ContactFormData) => {
    setStatus('submitting')
    setErrorMessage('')

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.error?.message || result.message || 'Failed to send message'
        )
      }

      setStatus('success')
      reset()
      turnstileRef.current?.reset()
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      )
      turnstileRef.current?.reset()
    }
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--background)]">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[var(--surface)] border-b border-[var(--color-border)]">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-sm text-[var(--text-muted)] font-mono">
          send-message.sh
        </span>
      </div>

      {/* Terminal Body */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-[var(--text)] mb-2">
                Message Sent!
              </h3>
              <p className="text-[var(--text-muted)] mb-6">
                Thank you for reaching out. I&apos;ll get back to you soon.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="px-4 py-2 text-sm font-medium text-[var(--primary)] hover:underline"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Honeypot field - hidden from humans */}
              <input
                type="text"
                {...register('honeypot')}
                tabIndex={-1}
                autoComplete="off"
                className="absolute -left-[9999px] opacity-0 pointer-events-none"
                aria-hidden="true"
              />

              {/* Name Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-mono text-[var(--text-muted)] mb-2">
                  <span className="text-[var(--primary)]">$</span>
                  name
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-lg bg-[var(--surface)] border border-[var(--color-border)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-mono text-[var(--text-muted)] mb-2">
                  <span className="text-[var(--primary)]">$</span>
                  email
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg bg-[var(--surface)] border border-[var(--color-border)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Subject Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-mono text-[var(--text-muted)] mb-2">
                  <span className="text-[var(--primary)]">$</span>
                  subject
                </label>
                <input
                  type="text"
                  {...register('subject')}
                  placeholder="Project Inquiry"
                  className="w-full px-4 py-3 rounded-lg bg-[var(--surface)] border border-[var(--color-border)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-mono text-[var(--text-muted)] mb-2">
                  <span className="text-[var(--primary)]">$</span>
                  message{' '}
                  <span className="text-[var(--text-muted)]/60">
                    &lt;&lt; EOF
                  </span>
                </label>
                <textarea
                  {...register('message')}
                  rows={5}
                  placeholder="Tell me about your project or idea..."
                  className="w-full px-4 py-3 rounded-lg bg-[var(--surface)] border border-[var(--color-border)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all resize-none"
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Turnstile Widget */}
              <div className="flex justify-center py-2">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={turnstileSiteKey}
                  onSuccess={onTurnstileSuccess}
                  onExpire={onTurnstileExpire}
                  options={{
                    theme: 'auto',
                    size: 'normal',
                  }}
                />
              </div>
              {errors.turnstileToken && (
                <p className="text-sm text-red-500 text-center">
                  {errors.turnstileToken.message}
                </p>
              )}

              {/* Error Message */}
              {status === 'error' && errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{errorMessage}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'submitting' || !isValid}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    ./send.sh
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
