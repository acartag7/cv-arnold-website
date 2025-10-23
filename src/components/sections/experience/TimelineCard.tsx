'use client'

import React from 'react'
import { Experience } from '@/schemas/cv.schema'
import { TechnologyTag } from '../skills/TechnologyTag'
import { ChevronDown, ChevronUp, MapPin, Briefcase } from 'lucide-react'

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
      className={`timeline-card ${isExpanded ? 'expanded' : ''} ${className}`}
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
                {location.remote && 'Remote'}
                {location.remote &&
                  (location.city || location.country) &&
                  ' • '}
                {location.city && location.country
                  ? `${location.city}, ${location.country}`
                  : location.city || location.country}
              </span>
            </div>
          )}

          {/* Employment type */}
          <div className="employment-type" aria-label="Employment type">
            <Briefcase size={16} aria-hidden="true" />
            <span>{type.replace('_', ' ')}</span>
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
        <div className="timeline-card-body">
          {/* Description */}
          <div className="description">
            <p>{description}</p>
          </div>

          {/* Achievements */}
          {achievements && achievements.length > 0 && (
            <div className="achievements">
              <h4 className="section-heading">Key Achievements</h4>
              <ul>
                {achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Technologies */}
          {technologies && technologies.length > 0 && (
            <div className="technologies">
              <h4 className="section-heading">Technologies Used</h4>
              <div className="technology-tags">
                {technologies.map((tech, index) => (
                  <TechnologyTag key={index} name={tech} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
