'use client'

/**
 * Experience List Component
 *
 * Displays a sortable list of experience entries with drag-drop
 * reordering support. Each entry shows key information and
 * provides edit/delete actions.
 *
 * @module app/admin/experience/ExperienceList
 */

import { SortableList } from '@/components/admin'
import {
  Edit2,
  Trash2,
  MapPin,
  Calendar,
  ExternalLink,
  Star,
} from 'lucide-react'
import type { Experience } from '@/types/cv'

interface ExperienceListProps {
  experiences: Experience[]
  onEdit: (experience: Experience) => void
  onDelete: (experience: Experience) => void
  onReorder: (experiences: Experience[]) => void
  isSaving?: boolean
}

// Employment type labels
const employmentTypeLabels: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  freelance: 'Freelance',
  internship: 'Internship',
}

// Format date for display
function formatDate(dateString: string | null): string {
  if (!dateString) return 'Present'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// Calculate duration between dates
function calculateDuration(startDate: string, endDate: string | null): string {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())

  if (months < 12) {
    return `${months} mo${months !== 1 ? 's' : ''}`
  }

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (remainingMonths === 0) {
    return `${years} yr${years !== 1 ? 's' : ''}`
  }

  return `${years} yr${years !== 1 ? 's' : ''} ${remainingMonths} mo${remainingMonths !== 1 ? 's' : ''}`
}

function ExperienceCard({
  experience,
  onEdit,
  onDelete,
  isSaving,
}: {
  experience: Experience
  onEdit: () => void
  onDelete: () => void
  isSaving?: boolean
}) {
  const location = experience.location.remote
    ? 'Remote'
    : [experience.location.city, experience.location.country]
        .filter(Boolean)
        .join(', ') || 'Location not specified'

  return (
    <div
      className={`
        bg-white dark:bg-slate-800
        border border-slate-200 dark:border-slate-700
        rounded-xl p-5
        transition-all
        hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600
        ${isSaving ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start gap-3 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {experience.position}
                </h3>
                {experience.featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                    <Star size={12} />
                    Featured
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="font-medium">{experience.company}</span>
                {experience.companyUrl && (
                  <a
                    href={experience.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                    onClick={e => e.stopPropagation()}
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>

            {/* Employment type badge */}
            <span className="shrink-0 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg">
              {employmentTypeLabels[experience.type] || experience.type}
            </span>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mb-3">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(experience.startDate)} –{' '}
              {formatDate(experience.endDate)}
              <span className="text-slate-400 dark:text-slate-500">
                ({calculateDuration(experience.startDate, experience.endDate)})
              </span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {location}
            </span>
          </div>

          {/* Description preview */}
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
            {experience.description}
          </p>

          {/* Technologies */}
          {experience.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {experience.technologies.slice(0, 6).map(tech => (
                <span
                  key={tech}
                  className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-md"
                >
                  {tech}
                </span>
              ))}
              {experience.technologies.length > 6 && (
                <span className="px-2 py-0.5 text-slate-500 dark:text-slate-400 text-xs">
                  +{experience.technologies.length - 6} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            disabled={isSaving}
            className="
              p-2 rounded-lg
              text-slate-400 hover:text-blue-600 dark:hover:text-blue-400
              hover:bg-blue-50 dark:hover:bg-blue-900/30
              transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30
              disabled:opacity-50
            "
            aria-label={`Edit ${experience.position}`}
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={onDelete}
            disabled={isSaving}
            className="
              p-2 rounded-lg
              text-slate-400 hover:text-red-600 dark:hover:text-red-400
              hover:bg-red-50 dark:hover:bg-red-900/30
              transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30
              disabled:opacity-50
            "
            aria-label={`Delete ${experience.position}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function ExperienceList({
  experiences,
  onEdit,
  onDelete,
  onReorder,
  isSaving = false,
}: ExperienceListProps) {
  return (
    <SortableList
      items={experiences}
      keyExtractor={exp => exp.id}
      onReorder={onReorder}
      renderItem={experience => (
        <ExperienceCard
          experience={experience}
          onEdit={() => onEdit(experience)}
          onDelete={() => onDelete(experience)}
          isSaving={isSaving}
        />
      )}
    />
  )
}
