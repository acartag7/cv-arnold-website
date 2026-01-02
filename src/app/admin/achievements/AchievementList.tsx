'use client'

/**
 * Achievement List Component
 *
 * Displays a sortable list of achievements with category badges
 * and featured star toggle.
 *
 * @module app/admin/achievements/AchievementList
 */

import { SortableList } from '@/components/admin'
import {
  Edit2,
  Trash2,
  Calendar,
  ExternalLink,
  Star,
  Award,
  BookOpen,
  Mic,
  Folder,
  GitBranch,
  MoreHorizontal,
} from 'lucide-react'
import { AchievementCategory, type Achievement } from '@/types/cv'

interface AchievementListProps {
  achievements: Achievement[]
  onEdit: (achievement: Achievement) => void
  onDelete: (achievement: Achievement) => void
  onReorder: (achievements: Achievement[]) => void
  onToggleFeatured: (achievement: Achievement) => void
  isSaving?: boolean
}

// Category display configuration
const categoryConfig: Record<
  AchievementCategory,
  { label: string; icon: typeof Award; color: string; bg: string }
> = {
  [AchievementCategory.AWARD]: {
    label: 'Award',
    icon: Award,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  [AchievementCategory.PUBLICATION]: {
    label: 'Publication',
    icon: BookOpen,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  [AchievementCategory.SPEAKING]: {
    label: 'Speaking',
    icon: Mic,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
  },
  [AchievementCategory.PROJECT]: {
    label: 'Project',
    icon: Folder,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
  },
  [AchievementCategory.CONTRIBUTION]: {
    label: 'Contribution',
    icon: GitBranch,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
  [AchievementCategory.OTHER]: {
    label: 'Other',
    icon: MoreHorizontal,
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-700',
  },
}

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function AchievementCard({
  achievement,
  onEdit,
  onDelete,
  onToggleFeatured,
  isSaving = false,
}: {
  achievement: Achievement
  onEdit: () => void
  onDelete: () => void
  onToggleFeatured: () => void
  isSaving?: boolean
}) {
  const category = categoryConfig[achievement.category]
  const CategoryIcon = category.icon

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
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Category icon */}
          <div className={`p-2.5 rounded-lg ${category.bg}`}>
            <CategoryIcon size={20} className={category.color} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {achievement.title}
              </h3>
              {achievement.featured && (
                <Star
                  size={16}
                  className="text-amber-500 fill-amber-500 shrink-0"
                />
              )}
            </div>

            {/* Category badge and issuer */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${category.bg} ${category.color}`}
              >
                {category.label}
              </span>
              {achievement.issuer && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  • {achievement.issuer}
                </span>
              )}
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
              <Calendar size={14} />
              <span>{formatDate(achievement.date)}</span>
              {achievement.url && (
                <a
                  href={achievement.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
                  onClick={e => e.stopPropagation()}
                >
                  <ExternalLink size={14} />
                  View
                </a>
              )}
            </div>

            {/* Description */}
            {achievement.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {achievement.description}
              </p>
            )}

            {/* Technologies */}
            {achievement.technologies &&
              achievement.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {achievement.technologies.slice(0, 4).map(tech => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-xs rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                    >
                      {tech}
                    </span>
                  ))}
                  {achievement.technologies.length > 4 && (
                    <span className="px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400">
                      +{achievement.technologies.length - 4} more
                    </span>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleFeatured}
            disabled={isSaving}
            className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50 ${
              achievement.featured
                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30'
            }`}
            aria-label={
              achievement.featured ? 'Remove from featured' : 'Add to featured'
            }
            title={
              achievement.featured ? 'Remove from featured' : 'Add to featured'
            }
          >
            <Star
              size={18}
              className={achievement.featured ? 'fill-current' : ''}
            />
          </button>
          <button
            onClick={onEdit}
            disabled={isSaving}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50"
            aria-label={`Edit ${achievement.title}`}
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={onDelete}
            disabled={isSaving}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-50"
            aria-label={`Delete ${achievement.title}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function AchievementList({
  achievements,
  onEdit,
  onDelete,
  onReorder,
  onToggleFeatured,
  isSaving = false,
}: AchievementListProps) {
  return (
    <SortableList
      items={achievements}
      keyExtractor={achievement => achievement.id}
      onReorder={onReorder}
      renderItem={achievement => (
        <AchievementCard
          achievement={achievement}
          onEdit={() => onEdit(achievement)}
          onDelete={() => onDelete(achievement)}
          onToggleFeatured={() => onToggleFeatured(achievement)}
          isSaving={isSaving}
        />
      )}
    />
  )
}
