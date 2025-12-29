'use client'

import React, { useMemo } from 'react'
import { Experience } from '@/schemas/cv.schema'
import { TimelineItem } from './TimelineItem'
import { cn } from '@/utils/cn'
import { parseAndValidateDate } from '@/lib/date-utils'

export interface TimelineProps {
  experiences: Experience[]
  className?: string
  variant?: 'vertical' | 'horizontal'
}

/**
 * Safely parse a date string, returning 0 for invalid dates
 * This ensures timeline sorting doesn't crash on bad data
 */
function safeGetDateTimestamp(dateString: string): number {
  try {
    return parseAndValidateDate(dateString, 'date').getTime()
  } catch {
    // Log in development, but don't crash - return 0 to sort invalid dates last
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Timeline: Invalid date format "${dateString}"`)
    }
    return 0
  }
}

/**
 * Timeline Component
 *
 * Displays work experience in a chronological timeline layout.
 * Supports both vertical (default) and horizontal layouts.
 *
 * Features:
 * - Responsive design
 * - Animated entry on scroll
 * - Expandable detail cards
 * - Technology tag filtering
 * - Resilient date parsing (graceful handling of invalid dates)
 */
export function Timeline({
  experiences,
  className = '',
  variant = 'vertical',
}: TimelineProps) {
  // Sort experiences by start date (most recent first)
  // Memoized to prevent re-sorting on every render
  // Uses safe date parsing to handle invalid dates gracefully
  const sortedExperiences = useMemo(
    () =>
      [...experiences].sort((a, b) => {
        const dateA = safeGetDateTimestamp(a.startDate)
        const dateB = safeGetDateTimestamp(b.startDate)
        return dateB - dateA // Descending order
      }),
    [experiences]
  )

  return (
    <div
      className={cn('timeline', `timeline-${variant}`, className)}
      role="list"
      aria-label="Work experience timeline"
    >
      {sortedExperiences.map((experience, index) => {
        // Skip rendering experiences with critical data issues
        if (!experience.id || !experience.company) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              'Timeline: Skipping experience with missing id or company'
            )
          }
          return null
        }

        return (
          <TimelineItem
            key={experience.id}
            experience={experience}
            index={index}
            variant={variant}
          />
        )
      })}
    </div>
  )
}
