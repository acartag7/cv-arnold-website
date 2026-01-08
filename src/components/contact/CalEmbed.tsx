'use client'

import { useEffect, useState } from 'react'
import { Calendar, ExternalLink, Loader2 } from 'lucide-react'

interface CalEmbedProps {
  /** Cal.com username or booking link */
  calLink: string
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
    <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--background)]">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface)] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-sm text-[var(--text-muted)] font-mono">
            schedule-call.sh
          </span>
        </div>
        <a
          href={calUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
          title="Open in new tab"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Calendar Body */}
      <div className="min-h-[500px] relative">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--background)]">
            <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin mb-3" />
            <p className="text-sm text-[var(--text-muted)]">
              Loading calendar...
            </p>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--background)] p-6 text-center">
            <Calendar className="w-12 h-12 text-[var(--text-muted)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
              Unable to load calendar
            </h3>
            <p className="text-[var(--text-muted)] mb-4 max-w-sm">
              The scheduling widget couldn&apos;t be loaded. You can still book
              directly.
            </p>
            <a
              href={calUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] bg-[var(--surface)] text-[var(--text)] rounded-lg hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors font-mono text-sm"
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
