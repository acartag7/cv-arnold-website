'use client'

import React from 'react'
import { SkillCategory } from '@/schemas/cv.schema'
import { SkillCategorySection } from './SkillCategorySection'
import { cn } from '@/utils/cn'

export interface SkillsMatrixProps {
  categories: SkillCategory[]
  className?: string
  layout?: 'grid' | 'masonry'
}

/**
 * SkillsMatrix Component
 *
 * Displays skills organized by categories with visual proficiency indicators.
 * Supports grid and masonry layouts for optimal space usage.
 *
 * Features:
 * - Collapsible category sections
 * - Visual proficiency indicators
 * - Category icons and descriptions
 * - Responsive layout
 */
export function SkillsMatrix({
  categories,
  className = '',
  layout = 'grid',
}: SkillsMatrixProps) {
  // Sort categories by order
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order)

  return (
    <div
      className={cn('skills-matrix', `skills-matrix-${layout}`, className)}
      role="region"
      aria-label="Skills matrix"
    >
      {sortedCategories.map(category => (
        <SkillCategorySection key={category.id} category={category} />
      ))}
    </div>
  )
}
