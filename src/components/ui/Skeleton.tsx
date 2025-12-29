'use client'

/**
 * @fileoverview Skeleton loading components for async content states
 *
 * Note: These components are intentionally included in Phase 1 (Task 6.1-6.5)
 * for integration in Phase 2 (Task 6.9 - Data Binding Integration).
 *
 * Phase 2 will use these skeletons for:
 * - Timeline loading states while fetching experience data
 * - Skills matrix loading states
 * - Certification cards loading
 *
 * Keeping in Phase 1 to avoid merge conflicts and ensure foundation is ready.
 */

import React from 'react'
import { cn } from '@/utils/cn'

export interface SkeletonProps {
  /** Width of the skeleton (CSS value) */
  width?: string | number
  /** Height of the skeleton (CSS value) */
  height?: string | number
  /** Border radius variant */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  /** Whether to animate the skeleton */
  animated?: boolean
  /** Animation delay in milliseconds for stagger effect */
  delay?: number
  /** Additional CSS classes */
  className?: string
}

/**
 * Skeleton Component
 *
 * Placeholder loading indicator for content that is being fetched.
 * Improves perceived performance by showing content structure while loading.
 *
 * @example
 * ```tsx
 * // Text line skeleton
 * <Skeleton variant="text" width="80%" />
 *
 * // Circular avatar skeleton
 * <Skeleton variant="circular" width={40} height={40} />
 *
 * // Card skeleton
 * <Skeleton variant="rounded" height={200} />
 * ```
 */
export function Skeleton({
  width,
  height,
  variant = 'text',
  animated = true,
  delay = 0,
  className = '',
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  }

  const defaultHeights = {
    text: '1em',
    circular: width || '2.5rem',
    rectangular: '100%',
    rounded: '100%',
  }

  return (
    <div
      className={cn(
        'bg-semantic-bg-subtle',
        animated && 'animate-pulse',
        variantClasses[variant],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width || '100%',
        height:
          typeof height === 'number'
            ? `${height}px`
            : height || defaultHeights[variant],
        // Stagger animation for better perceived performance
        animationDelay: delay > 0 ? `${delay}ms` : undefined,
      }}
      role="status"
      aria-label="Loading..."
      aria-busy="true"
    />
  )
}

/**
 * SkeletonText Component
 *
 * Multiple line text skeleton for paragraphs
 */
export function SkeletonText({
  lines = 3,
  className = '',
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)} role="status" aria-busy="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={`skeleton-line-${i}`}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
          height="1em"
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * TimelineCardSkeleton Component
 *
 * Skeleton loader matching TimelineCard structure
 *
 * @param delay - Animation delay in ms for stagger effect when rendering multiple cards
 */
export function TimelineCardSkeleton({
  className = '',
  delay = 0,
}: {
  className?: string
  /** Animation delay in milliseconds for stagger effect */
  delay?: number
}) {
  return (
    <div
      className={cn(
        'p-4 border border-semantic-border-subtle rounded-lg',
        className
      )}
      style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
      role="status"
      aria-label="Loading experience..."
      aria-busy="true"
    >
      {/* Header skeleton */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          {/* Company name */}
          <Skeleton variant="text" width="60%" height="1.5rem" delay={delay} />
          {/* Position */}
          <Skeleton
            variant="text"
            width="40%"
            height="1rem"
            delay={delay + 50}
          />
        </div>
        {/* Expand button placeholder */}
        <Skeleton variant="circular" width={32} height={32} delay={delay} />
      </div>

      {/* Meta info skeleton */}
      <div className="mt-3 flex gap-4">
        <Skeleton
          variant="text"
          width={120}
          height="0.875rem"
          delay={delay + 100}
        />
        <Skeleton
          variant="text"
          width={100}
          height="0.875rem"
          delay={delay + 150}
        />
      </div>

      <span className="sr-only">Loading experience details...</span>
    </div>
  )
}

/**
 * SkillCardSkeleton Component
 *
 * Skeleton loader matching skill card structure
 *
 * @param delay - Animation delay in ms for stagger effect
 */
export function SkillCardSkeleton({
  className = '',
  delay = 0,
}: {
  className?: string
  /** Animation delay in milliseconds for stagger effect */
  delay?: number
}) {
  return (
    <div
      className={cn('p-3 rounded-lg bg-semantic-bg-subtle', className)}
      style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
      role="status"
      aria-label="Loading skill..."
      aria-busy="true"
    >
      <div className="flex items-center justify-between gap-2">
        <Skeleton variant="text" width="70%" height="1rem" delay={delay} />
        <Skeleton variant="rounded" width={60} height={8} delay={delay + 50} />
      </div>
      <span className="sr-only">Loading skill details...</span>
    </div>
  )
}
