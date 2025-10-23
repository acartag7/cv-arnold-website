'use client'

import React, { useState } from 'react'
import { SkillCategory } from '@/schemas/cv.schema'
import { SkillItem } from './SkillItem'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface SkillCategorySectionProps {
  category: SkillCategory
  className?: string
  defaultExpanded?: boolean
}

/**
 * SkillCategorySection Component
 *
 * Collapsible section for a skill category.
 * Displays category name, icon, description, and list of skills.
 */
export function SkillCategorySection({
  category,
  className = '',
  defaultExpanded = true,
}: SkillCategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <section
      className={`skill-category-section ${className}`}
      aria-labelledby={`category-${category.id}`}
    >
      {/* Category header */}
      <header className="category-header">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="category-toggle"
          aria-expanded={isExpanded}
          aria-controls={`category-content-${category.id}`}
        >
          {/* Category icon */}
          {category.icon && (
            <span className="category-icon" aria-hidden="true">
              {category.icon}
            </span>
          )}

          {/* Category title */}
          <h3 id={`category-${category.id}`} className="category-title">
            {category.name}
          </h3>

          {/* Skill count badge */}
          <span
            className="skill-count"
            aria-label={`${category.skills.length} skills`}
          >
            {category.skills.length}
          </span>

          {/* Expand/collapse icon */}
          <span className="toggle-icon" aria-hidden="true">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </span>
        </button>

        {/* Category description */}
        {category.description && (
          <p className="category-description">{category.description}</p>
        )}
      </header>

      {/* Skills list */}
      {isExpanded && (
        <div
          id={`category-content-${category.id}`}
          className="category-content"
          role="list"
        >
          {category.skills.map((skill, index) => (
            <SkillItem key={`${skill.name}-${index}`} skill={skill} />
          ))}
        </div>
      )}
    </section>
  )
}
