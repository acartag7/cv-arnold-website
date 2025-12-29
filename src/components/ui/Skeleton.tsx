'use client'

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
 */
export function TimelineCardSkeleton({
  className = '',
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        'p-4 border border-semantic-border-subtle rounded-lg',
        className
      )}
      role="status"
      aria-label="Loading experience..."
      aria-busy="true"
    >
      {/* Header skeleton */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          {/* Company name */}
          <Skeleton variant="text" width="60%" height="1.5rem" />
          {/* Position */}
          <Skeleton variant="text" width="40%" height="1rem" />
        </div>
        {/* Expand button placeholder */}
        <Skeleton variant="circular" width={32} height={32} />
      </div>

      {/* Meta info skeleton */}
      <div className="mt-3 flex gap-4">
        <Skeleton variant="text" width={120} height="0.875rem" />
        <Skeleton variant="text" width={100} height="0.875rem" />
      </div>

      <span className="sr-only">Loading experience details...</span>
    </div>
  )
}

/**
 * SkillCardSkeleton Component
 *
 * Skeleton loader matching skill card structure
 */
export function SkillCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={cn('p-3 rounded-lg bg-semantic-bg-subtle', className)}
      role="status"
      aria-label="Loading skill..."
      aria-busy="true"
    >
      <div className="flex items-center justify-between gap-2">
        <Skeleton variant="text" width="70%" height="1rem" />
        <Skeleton variant="rounded" width={60} height={8} />
      </div>
      <span className="sr-only">Loading skill details...</span>
    </div>
  )
}
