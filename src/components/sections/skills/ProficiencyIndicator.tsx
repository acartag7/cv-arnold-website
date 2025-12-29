'use client'

import React from 'react'
import { SkillLevel } from '@/schemas/cv.schema'
import { cn } from '@/utils/cn'

export interface ProficiencyIndicatorProps {
  level: SkillLevel
  variant?: 'bar' | 'circular' | 'stars' | 'dots'
  showLabel?: boolean
  animated?: boolean
  className?: string
}

/**
 * SVG configuration constants for circular indicator
 * Extracted for maintainability and clarity
 */
const SVG_CONFIG = {
  /** Radius of the circular progress indicator */
  RADIUS: 40,
  /** Width of the progress stroke */
  STROKE_WIDTH: 8,
  /** Center point of the SVG viewBox (100x100) */
  CENTER: 50,
  /** Total size of the SVG viewBox */
  VIEW_BOX_SIZE: 100,
  /** Background circle opacity */
  BG_OPACITY: 0.2,
} as const

/**
 * Proficiency level mappings
 * Centralized configuration to ensure consistency across all variants
 */
const PROFICIENCY_CONFIG = {
  percentage: {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100,
  } as Record<SkillLevel, number>,
  stars: {
    beginner: 2,
    intermediate: 3,
    advanced: 4,
    expert: 5,
  } as Record<SkillLevel, number>,
  dots: {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
  } as Record<SkillLevel, number>,
  /** Total count constants for visual indicators */
  totals: {
    stars: 5,
    dots: 4,
  },
} as const

/**
 * ProficiencyIndicator Component
 *
 * Visual indicator for skill proficiency level.
 * Supports multiple visualization styles: bar, circular, stars, dots.
 *
 * Proficiency mapping:
 * - beginner: 25%
 * - intermediate: 50%
 * - advanced: 75%
 * - expert: 100%
 */
export function ProficiencyIndicator({
  level,
  variant = 'bar',
  showLabel = false,
  animated = true,
  className = '',
}: ProficiencyIndicatorProps) {
  // Map skill level to percentage
  const percentage = PROFICIENCY_CONFIG.percentage[level]

  return (
    <div
      className={cn(
        'proficiency-indicator',
        `proficiency-${variant}`,
        animated && 'animated',
        className
      )}
      role="meter"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Proficiency: ${level} (${percentage}%)`}
      data-level={level}
    >
      {variant === 'bar' && (
        <BarIndicator percentage={percentage} level={level} />
      )}
      {variant === 'circular' && (
        <CircularIndicator percentage={percentage} level={level} />
      )}
      {variant === 'stars' && <StarsIndicator level={level} />}
      {variant === 'dots' && <DotsIndicator level={level} />}

      {showLabel && (
        <span className="proficiency-label" aria-hidden="true">
          {level}
        </span>
      )}
    </div>
  )
}

/**
 * Bar-style proficiency indicator
 */
function BarIndicator({
  percentage,
  level,
}: {
  percentage: number
  level: SkillLevel
}) {
  return (
    <div className="proficiency-bar-container">
      <div
        className={cn('proficiency-bar-fill', `proficiency-${level}`)}
        style={{ width: `${percentage}%` }}
        role="presentation"
      />
    </div>
  )
}

/**
 * Circular/radial proficiency indicator
 */
function CircularIndicator({
  percentage,
  level,
}: {
  percentage: number
  level: SkillLevel
}) {
  const { RADIUS, STROKE_WIDTH, CENTER, VIEW_BOX_SIZE, BG_OPACITY } = SVG_CONFIG
  const circumference = 2 * Math.PI * RADIUS
  const offset = circumference - (percentage / 100) * circumference

  return (
    <svg
      className="proficiency-circular"
      viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`}
      aria-hidden="true"
    >
      {/* Background circle */}
      <circle
        className="proficiency-circle-bg"
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE_WIDTH}
        opacity={BG_OPACITY}
      />
      {/* Progress circle */}
      <circle
        className={cn('proficiency-circle-fill', `proficiency-${level}`)}
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE_WIDTH}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
      />
      {/* Percentage text */}
      <text
        x={CENTER}
        y={CENTER}
        textAnchor="middle"
        dominantBaseline="central"
        className="proficiency-percentage"
      >
        {percentage}%
      </text>
    </svg>
  )
}

/**
 * Stars-style proficiency indicator (1-5 stars)
 */
function StarsIndicator({ level }: { level: SkillLevel }) {
  const filledStars = PROFICIENCY_CONFIG.stars[level]
  const totalStars = PROFICIENCY_CONFIG.totals.stars

  return (
    <div className="proficiency-stars" aria-hidden="true">
      {Array.from({ length: totalStars }, (_, i) => (
        <span
          key={`star-${i}`}
          className={`star ${i < filledStars ? 'filled' : 'empty'}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

/**
 * Dots-style proficiency indicator (1-4 dots)
 */
function DotsIndicator({ level }: { level: SkillLevel }) {
  const filledDots = PROFICIENCY_CONFIG.dots[level]
  const totalDots = PROFICIENCY_CONFIG.totals.dots

  return (
    <div className="proficiency-dots" aria-hidden="true">
      {Array.from({ length: totalDots }, (_, i) => (
        <span
          key={`dot-${i}`}
          className={`dot ${i < filledDots ? 'filled' : 'empty'}`}
        />
      ))}
    </div>
  )
}
