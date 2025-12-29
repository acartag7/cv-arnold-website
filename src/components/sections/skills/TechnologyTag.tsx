'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '@/utils/cn'

/**
 * Sanitize text to prevent XSS attacks
 * Allows only alphanumeric characters, spaces, and common tech name symbols
 * Removes any HTML tags or script-like content
 *
 * @param text - Input text to sanitize
 * @returns Sanitized text safe for rendering
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return ''

  // Remove HTML tags and script content
  const stripped = text.replace(/<[^>]*>/g, '')

  // Only allow safe characters for technology names
  // Allows: letters, numbers, spaces, dots, hyphens, plus signs, hash, slashes, parentheses
  const sanitized = stripped.replace(/[^\w\s.\-+#/()'@&]/g, '')

  // Trim and limit length to prevent DoS
  return sanitized.trim().slice(0, 100)
}

export interface TechnologyTagProps {
  name: string
  category?: string
  description?: string
  lastUsed?: string
  onClick?: (name: string) => void
  className?: string
}

/**
 * TechnologyTag Component
 *
 * Interactive tag displaying a technology name.
 * Shows tooltip with additional info on hover.
 * Can be clicked to filter timeline/skills.
 *
 * Security: All text props are sanitized to prevent XSS attacks
 */
export function TechnologyTag({
  name,
  category,
  description,
  lastUsed,
  onClick,
  className = '',
}: TechnologyTagProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  // Sanitize all text inputs to prevent XSS
  const safeName = useMemo(() => sanitizeText(name), [name])
  const safeCategory = useMemo(
    () => (category ? sanitizeText(category) : undefined),
    [category]
  )
  const safeDescription = useMemo(
    () => (description ? sanitizeText(description) : undefined),
    [description]
  )
  const safeLastUsed = useMemo(
    () => (lastUsed ? sanitizeText(lastUsed) : undefined),
    [lastUsed]
  )

  const handleClick = () => {
    if (onClick) {
      onClick(safeName)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault()
      onClick(safeName)
    }
  }

  const hasTooltip = safeDescription || safeCategory || safeLastUsed
  const isClickable = !!onClick

  // Don't render if name is empty after sanitization
  if (!safeName) {
    return null
  }

  return (
    <span
      className={cn(
        'technology-tag',
        safeCategory,
        isClickable && 'clickable',
        className
      )}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      onMouseEnter={() => hasTooltip && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role={isClickable ? 'button' : 'note'}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={
        safeDescription ? `${safeName}: ${safeDescription}` : safeName
      }
    >
      <span className="tag-name">{safeName}</span>

      {/* Tooltip */}
      {hasTooltip && showTooltip && (
        <span className="tag-tooltip" role="tooltip">
          {safeCategory && (
            <span className="tooltip-category">{safeCategory}</span>
          )}
          {safeDescription && (
            <span className="tooltip-description">{safeDescription}</span>
          )}
          {safeLastUsed && (
            <span className="tooltip-last-used">Last used: {safeLastUsed}</span>
          )}
        </span>
      )}
    </span>
  )
}
