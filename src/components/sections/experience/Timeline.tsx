'use client'

import React, { useMemo } from 'react'
import { Experience } from '@/schemas/cv.schema'
import { TimelineItem } from './TimelineItem'
import { cn } from '@/utils/cn'

export interface TimelineProps {
  experiences: Experience[]
  className?: string
  variant?: 'vertical' | 'horizontal'
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
 */
export function Timeline({
  experiences,
  className = '',
  variant = 'vertical',
}: TimelineProps) {
  // Sort experiences by start date (most recent first)
  // Memoized to prevent re-sorting on every render
  const sortedExperiences = useMemo(
    () =>
      [...experiences].sort((a, b) => {
        const dateA = new Date(a.startDate).getTime()
        const dateB = new Date(b.startDate).getTime()
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
      {sortedExperiences.map((experience, index) => (
        <TimelineItem
          key={experience.id}
          experience={experience}
          index={index}
          variant={variant}
        />
      ))}
    </div>
  )
}
