'use client'

import React, { useState } from 'react'
import { cn } from '@/utils/cn'

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

  const handleClick = () => {
    if (onClick) {
      onClick(name)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault()
      onClick(name)
    }
  }

  const hasTooltip = description || category || lastUsed
  const isClickable = !!onClick

  return (
    <span
      className={cn(
        'technology-tag',
        category,
        isClickable && 'clickable',
        className
      )}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      onMouseEnter={() => hasTooltip && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role={isClickable ? 'button' : 'note'}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={description ? `${name}: ${description}` : name}
    >
      <span className="tag-name">{name}</span>

      {/* Tooltip */}
      {hasTooltip && showTooltip && (
        <span className="tag-tooltip" role="tooltip">
          {category && <span className="tooltip-category">{category}</span>}
          {description && (
            <span className="tooltip-description">{description}</span>
          )}
          {lastUsed && (
            <span className="tooltip-last-used">Last used: {lastUsed}</span>
          )}
        </span>
      )}
    </span>
  )
}
