'use client'

import { useEffect, useState } from 'react'
import { Calendar, ExternalLink, Loader2 } from 'lucide-react'
import type { ThemeColors } from './ContactForm'

interface CalEmbedProps {
  /** Cal.com username or booking link */
  calLink: string
  /** Theme colors from CMS config */
  colors: ThemeColors
  /** Optional specific event type slug */
  eventType?: string
  /** Hide branding (requires paid plan) */
  hideBranding?: boolean
}

/**
 * Terminal-styled Cal.com embed for scheduling meetings
 *
 * Loads the Cal.com embed script dynamically and renders
 * an inline calendar widget with the terminal aesthetic.
 */
export function CalEmbed({
  calLink,
  colors,
  eventType,
  hideBranding = false,
}: CalEmbedProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Construct the full Cal.com URL
  const fullCalLink = eventType ? `${calLink}/${eventType}` : calLink
  const calUrl = `https://cal.com/${fullCalLink}`

  useEffect(() => {
    // Load Cal.com embed script
    const script = document.createElement('script')
    script.src = 'https://app.cal.com/embed/embed.js'
    script.async = true

    script.onload = () => {
      // Initialize Cal embed once script loads
      if (window.Cal) {
        window.Cal('init', { origin: 'https://cal.com' })
        window.Cal('inline', {
          elementOrSelector: '#cal-inline-embed',
          calLink: fullCalLink,
          layout: 'month_view',
          config: {
            hideEventTypeDetails: false,
            hideBranding: hideBranding,
          },
        })
        setIsLoading(false)
      }
    }

    script.onerror = () => {
      setHasError(true)
      setIsLoading(false)
    }

    document.body.appendChild(script)

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [fullCalLink, hideBranding])

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${colors.border}`, background: colors.bg }}
    >
      {/* Terminal Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          background: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span
            className="text-sm font-mono"
            style={{ color: colors.textMuted }}
          >
            schedule-call.sh
          </span>
        </div>
        <a
          href={calUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:opacity-80"
          style={{ color: colors.textMuted }}
          title="Open in new tab"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Calendar Body */}
      <div className="min-h-[500px] relative">
        {isLoading && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: colors.bg }}
          >
            <Loader2
              className="w-8 h-8 animate-spin mb-3"
              style={{ color: colors.accent }}
            />
            <p className="text-sm" style={{ color: colors.textMuted }}>
              Loading calendar...
            </p>
          </div>
        )}

        {hasError && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            style={{ background: colors.bg }}
          >
            <Calendar
              className="w-12 h-12 mb-4"
              style={{ color: colors.textMuted }}
            />
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: colors.text }}
            >
              Unable to load calendar
            </h3>
            <p className="mb-4 max-w-sm" style={{ color: colors.textMuted }}>
              The scheduling widget couldn&apos;t be loaded. You can still book
              directly.
            </p>
            <a
              href={calUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-mono text-sm hover:opacity-80"
              style={{
                border: `1px solid ${colors.border}`,
                background: colors.surface,
                color: colors.text,
              }}
            >
              <Calendar className="w-4 h-4" />
              Open Calendar
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Cal.com Embed Container */}
        <div
          id="cal-inline-embed"
          className={`w-full min-h-[500px] ${isLoading || hasError ? 'invisible' : 'visible'}`}
          style={{ overflow: 'auto' }}
        />
      </div>
    </div>
  )
}

// Add Cal.com types to window
declare global {
  interface Window {
    Cal?: (action: string, ...args: unknown[]) => void
  }
}
