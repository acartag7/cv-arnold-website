'use client'

import React from 'react'
import { Experience, EmploymentType } from '@/schemas/cv.schema'
import { TechnologyTag } from '../skills/TechnologyTag'
import { ChevronDown, ChevronUp, MapPin, Briefcase } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Type-safe mapping of employment types to display labels
 * Prevents runtime string manipulation and ensures all types are handled
 */
const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  freelance: 'Freelance',
  internship: 'Internship',
} as const

export interface TimelineCardProps {
  experience: Experience
  isExpanded: boolean
  onToggle: () => void
  className?: string
}

/**
 * TimelineCard Component
 *
 * Expandable card displaying job experience details.
 * Shows company, position, location, and technologies.
 * Expands to show full description and achievements.
 */
export function TimelineCard({
  experience,
  isExpanded,
  onToggle,
  className = '',
}: TimelineCardProps) {
  const {
    company,
    companyUrl,
    position,
    location,
    description,
    achievements,
    technologies,
    type,
  } = experience

  return (
    <article
      className={cn('timeline-card', isExpanded && 'expanded', className)}
    >
      {/* Card header - always visible */}
      <header className="timeline-card-header">
        <div className="timeline-card-title">
          <h3 className="company-name">
            {companyUrl ? (
              <a
                href={companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="company-link"
              >
                {company}
              </a>
            ) : (
              company
            )}
          </h3>
          <p className="position-title">{position}</p>
        </div>

        <div className="timeline-card-meta">
          {/* Location */}
          {(location.city || location.country || location.remote) && (
            <div className="location" aria-label="Location">
              <MapPin size={16} aria-hidden="true" />
              <span>
                {(() => {
                  // Filter out city if it's just "Remote" (avoid "Remote • Remote")
                  const city =
                    location.city?.toLowerCase() === 'remote'
                      ? undefined
                      : location.city

                  const parts: string[] = []
                  if (location.remote) parts.push('Remote')
                  if (city && location.country) {
                    parts.push(`${city}, ${location.country}`)
                  } else if (city || location.country) {
                    parts.push(city || location.country || '')
                  }

                  return parts.filter(Boolean).join(' • ')
                })()}
              </span>
            </div>
          )}

          {/* Employment type */}
          <div className="employment-type" aria-label="Employment type">
            <Briefcase size={16} aria-hidden="true" />
            <span>{EMPLOYMENT_TYPE_LABELS[type]}</span>
          </div>
        </div>

        {/* Expand/collapse button */}
        <button
          type="button"
          onClick={onToggle}
          className="expand-button"
          aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <ChevronUp size={20} aria-hidden="true" />
          ) : (
            <ChevronDown size={20} aria-hidden="true" />
          )}
        </button>
      </header>

      {/* Card body - expandable content */}
      {isExpanded && (
        <div className="timeline-card-body" aria-live="polite">
          {/* Description */}
          <div className="description">
            <p>{description}</p>
          </div>

          {/* Achievements */}
          {achievements && achievements.length > 0 && (
            <div className="achievements">
              <h4 className="section-heading">Key Achievements</h4>
              <ul>
                {achievements.map(achievement => (
                  <li key={`${experience.id}-${achievement.slice(0, 50)}`}>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technologies */}
          {technologies && technologies.length > 0 && (
            <div className="technologies">
              <h4 className="section-heading">Technologies Used</h4>
              <div className="technology-tags">
                {technologies.map(tech => (
                  <TechnologyTag key={`${experience.id}-${tech}`} name={tech} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
