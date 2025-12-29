'use client'

import React, { useState } from 'react'
import { Experience } from '@/schemas/cv.schema'
import { TimelineCard } from './TimelineCard'
import { formatDateRange } from '@/lib/date-utils'
import { cn } from '@/utils/cn'

export interface TimelineItemProps {
  experience: Experience
  index: number
  variant?: 'vertical' | 'horizontal'
  className?: string
}

/**
 * TimelineItem Component
 *
 * Individual timeline entry with connector line and card.
 * Handles expand/collapse state and animations.
 */
export function TimelineItem({
  experience,
  index,
  variant = 'vertical', // eslint-disable-line @typescript-eslint/no-unused-vars
  className = '',
}: TimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const dateRange = formatDateRange(experience.startDate, experience.endDate)
  const isCurrent = !experience.endDate

  return (
    <div
      className={cn('timeline-item', className)}
      role="listitem"
      data-index={index}
      data-current={isCurrent}
    >
      {/* Timeline connector */}
      <div className="timeline-connector" aria-hidden="true">
        <div className="timeline-line" />
        <div className={cn('timeline-dot', isCurrent && 'current')} />
      </div>

      {/* Timeline content */}
      <div className="timeline-content">
        {/* Date badge */}
        <div className="timeline-date" aria-label={`Duration: ${dateRange}`}>
          {dateRange}
          {isCurrent && (
            <span className="current-badge" aria-label="Current position">
              Current
            </span>
          )}
        </div>

        {/* Experience card */}
        <TimelineCard
          experience={experience}
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
        />
      </div>
    </div>
  )
}
