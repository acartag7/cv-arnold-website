'use client'

/**
 * Certification List Component
 *
 * Displays a sortable list of certifications with status badges.
 *
 * @module app/admin/certifications/CertificationList
 */

import { SortableList } from '@/components/admin'
import {
  Edit2,
  Trash2,
  Calendar,
  ExternalLink,
  BadgeCheck,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { CertificationStatus, type Certification } from '@/types/cv'

interface CertificationListProps {
  certifications: Certification[]
  onEdit: (certification: Certification) => void
  onDelete: (certification: Certification) => void
  onReorder: (certifications: Certification[]) => void
  isSaving?: boolean
}

// Status configuration
const statusConfig: Record<
  CertificationStatus,
  { label: string; icon: typeof BadgeCheck; className: string }
> = {
  [CertificationStatus.ACTIVE]: {
    label: 'Active',
    icon: BadgeCheck,
    className:
      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  },
  [CertificationStatus.EXPIRED]: {
    label: 'Expired',
    icon: AlertTriangle,
    className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  },
  [CertificationStatus.IN_PROGRESS]: {
    label: 'In Progress',
    icon: Clock,
    className:
      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  },
}

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function CertificationCard({
  certification,
  onEdit,
  onDelete,
  isSaving = false,
}: {
  certification: Certification
  onEdit: () => void
  onDelete: () => void
  isSaving?: boolean
}) {
  const status = statusConfig[certification.status]
  const StatusIcon = status.icon

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
                {certification.name}
              </h3>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span>{certification.issuer}</span>
                {certification.issuerUrl && (
                  <a
                    href={certification.issuerUrl}
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
            <span
              className={`
                flex items-center gap-1.5 px-2.5 py-1
                text-xs font-medium rounded-lg
                ${status.className}
              `}
            >
              <StatusIcon size={14} />
              {status.label}
            </span>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-2">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              Issued: {formatDate(certification.issueDate)}
            </span>
            {certification.expirationDate && (
              <span>Expires: {formatDate(certification.expirationDate)}</span>
            )}
            {!certification.expirationDate &&
              certification.status === CertificationStatus.ACTIVE && (
                <span className="text-green-600 dark:text-green-400">
                  No expiration
                </span>
              )}
          </div>

          {/* Credential ID */}
          {certification.credentialId && (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>Credential ID: {certification.credentialId}</span>
              {certification.credentialUrl && (
                <a
                  href={certification.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 hover:underline"
                  onClick={e => e.stopPropagation()}
                >
                  Verify
                </a>
              )}
            </div>
          )}

          {/* Description */}
          {certification.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
              {certification.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            disabled={isSaving}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50"
            aria-label={`Edit ${certification.name}`}
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={onDelete}
            disabled={isSaving}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-50"
            aria-label={`Delete ${certification.name}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function CertificationList({
  certifications,
  onEdit,
  onDelete,
  onReorder,
  isSaving = false,
}: CertificationListProps) {
  return (
    <SortableList
      items={certifications}
      keyExtractor={cert => cert.id}
      onReorder={onReorder}
      renderItem={certification => (
        <CertificationCard
          certification={certification}
          onEdit={() => onEdit(certification)}
          onDelete={() => onDelete(certification)}
          isSaving={isSaving}
        />
      )}
    />
  )
}
