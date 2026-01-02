'use client'

/**
 * Education List Component
 *
 * Displays a sortable list of education entries with institution
 * details, dates, and optional location/highlights.
 *
 * @module app/admin/education/EducationList
 */

import { SortableList } from '@/components/admin'
import {
  Edit2,
  Trash2,
  Calendar,
  ExternalLink,
  MapPin,
  BookOpen,
} from 'lucide-react'
import type { Education } from '@/types/cv'

interface EducationListProps {
  educationList: Education[]
  onEdit: (education: Education) => void
  onDelete: (education: Education) => void
  onReorder: (educationList: Education[]) => void
  isSaving?: boolean
}

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function EducationCard({
  education,
  onEdit,
  onDelete,
  isSaving = false,
}: {
  education: Education
  onEdit: () => void
  onDelete: () => void
  isSaving?: boolean
}) {
  const isInProgress = !education.endDate

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
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start gap-3 mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {education.degree}
              </h3>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span>{education.institution}</span>
                {education.institutionUrl && (
                  <a
                    href={education.institutionUrl}
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

            {/* Status badge */}
            {isInProgress && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                In Progress
              </span>
            )}
          </div>

          {/* Field of study */}
          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mb-2">
            <BookOpen size={14} />
            <span>{education.field}</span>
            {education.grade && (
              <span className="ml-2 text-slate-500">
                • Grade: {education.grade}
              </span>
            )}
          </div>

          {/* Dates & Location */}
          <div className="flex items-center flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mb-2">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(education.startDate)} -{' '}
              {education.endDate ? formatDate(education.endDate) : 'Present'}
            </span>
            {education.location && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {education.location.city}, {education.location.country}
              </span>
            )}
          </div>

          {/* Description */}
          {education.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
              {education.description}
            </p>
          )}

          {/* Highlights */}
          {education.highlights && education.highlights.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1.5">
                {education.highlights.slice(0, 3).map((highlight, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  >
                    {highlight.length > 40
                      ? highlight.substring(0, 40) + '...'
                      : highlight}
                  </span>
                ))}
                {education.highlights.length > 3 && (
                  <span className="px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400">
                    +{education.highlights.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            disabled={isSaving}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50"
            aria-label={`Edit ${education.degree}`}
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={onDelete}
            disabled={isSaving}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-50"
            aria-label={`Delete ${education.degree}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function EducationList({
  educationList,
  onEdit,
  onDelete,
  onReorder,
  isSaving = false,
}: EducationListProps) {
  return (
    <SortableList
      items={educationList}
      keyExtractor={edu => edu.id}
      onReorder={onReorder}
      renderItem={education => (
        <EducationCard
          education={education}
          onEdit={() => onEdit(education)}
          onDelete={() => onDelete(education)}
          isSaving={isSaving}
        />
      )}
    />
  )
}
