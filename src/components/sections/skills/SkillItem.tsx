'use client'

import React from 'react'
import { Skill } from '@/schemas/cv.schema'
import { ProficiencyIndicator } from './ProficiencyIndicator'
import { formatMonthYear } from '@/lib/date-utils'
import { cn } from '@/utils/cn'

export interface SkillItemProps {
  skill: Skill
  className?: string
}

/**
 * SkillItem Component
 *
 * Individual skill display with proficiency indicator.
 * Shows skill name, level, experience, and last used date.
 */
export function SkillItem({ skill, className = '' }: SkillItemProps) {
  const { name, level, yearsOfExperience, lastUsed, featured } = skill

  return (
    <div
      className={cn('skill-item', featured && 'featured', className)}
      role="listitem"
    >
      {/* Skill header */}
      <div className="skill-header">
        <h4 className="skill-name">{name}</h4>
        {featured && (
          <span className="featured-badge" aria-label="Featured skill">
            ⭐
          </span>
        )}
      </div>

      {/* Proficiency indicator */}
      <ProficiencyIndicator level={level} variant="bar" />

      {/* Skill metadata */}
      <div className="skill-metadata">
        {yearsOfExperience !== undefined && (
          <span
            className="years-experience"
            aria-label={`${yearsOfExperience} years of experience`}
          >
            {yearsOfExperience} {yearsOfExperience === 1 ? 'year' : 'years'}
          </span>
        )}

        {lastUsed && (
          <span
            className="last-used"
            aria-label={`Last used ${formatMonthYear(new Date(lastUsed))}`}
          >
            Last used: {formatMonthYear(new Date(lastUsed))}
          </span>
        )}
      </div>

      {/* Skill level label */}
      <span
        className="skill-level-label"
        aria-label={`Proficiency level: ${level}`}
      >
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    </div>
  )
}
