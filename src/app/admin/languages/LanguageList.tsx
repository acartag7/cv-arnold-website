'use client'

/**
 * Language List Component
 *
 * Displays a sortable list of languages with proficiency levels.
 *
 * @module app/admin/languages/LanguageList
 */

import { SortableList } from '@/components/admin'
import { Edit2, Trash2, Star } from 'lucide-react'
import { LanguageProficiency, type Language } from '@/types/cv'

interface LanguageListProps {
  languages: Language[]
  onEdit: (language: Language) => void
  onDelete: (language: Language) => void
  onReorder: (languages: Language[]) => void
  isSaving?: boolean
}

// Proficiency display configuration
const proficiencyConfig: Record<
  LanguageProficiency,
  { label: string; color: string; bg: string; level: number }
> = {
  [LanguageProficiency.A1]: {
    label: 'A1 - Beginner',
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-700',
    level: 1,
  },
  [LanguageProficiency.A2]: {
    label: 'A2 - Elementary',
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-200 dark:bg-slate-600',
    level: 2,
  },
  [LanguageProficiency.B1]: {
    label: 'B1 - Intermediate',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    level: 3,
  },
  [LanguageProficiency.B2]: {
    label: 'B2 - Upper Intermediate',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-200 dark:bg-blue-800/40',
    level: 4,
  },
  [LanguageProficiency.C1]: {
    label: 'C1 - Advanced',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    level: 5,
  },
  [LanguageProficiency.C2]: {
    label: 'C2 - Proficient',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-200 dark:bg-purple-800/40',
    level: 6,
  },
  [LanguageProficiency.NATIVE]: {
    label: 'Native',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    level: 7,
  },
}

function ProficiencyBar({ level }: { level: number }) {
  const maxLevel = 7
  return (
    <div className="flex gap-1">
      {Array.from({ length: maxLevel }).map((_, i) => (
        <div
          key={i}
          className={`
            h-2 w-4 rounded-sm transition-colors
            ${i < level ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-600'}
          `}
        />
      ))}
    </div>
  )
}

function LanguageCard({
  language,
  onEdit,
  onDelete,
  isSaving = false,
}: {
  language: Language
  onEdit: () => void
  onDelete: () => void
  isSaving?: boolean
}) {
  const proficiency = proficiencyConfig[language.proficiency]

  return (
    <div
      className={`
        bg-white dark:bg-slate-800
        border border-slate-200 dark:border-slate-700
        rounded-xl p-4
        transition-all
        hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600
        ${isSaving ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Language code badge */}
          <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 font-mono text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
            {language.code}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {language.name}
              </h3>
              {language.native && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                  <Star size={12} />
                  Native
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-sm ${proficiency.color}`}>
                {proficiency.label}
              </span>
            </div>
            <div className="mt-2">
              <ProficiencyBar level={proficiency.level} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            disabled={isSaving}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50"
            aria-label={`Edit ${language.name}`}
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={onDelete}
            disabled={isSaving}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-50"
            aria-label={`Delete ${language.name}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function LanguageList({
  languages,
  onEdit,
  onDelete,
  onReorder,
  isSaving = false,
}: LanguageListProps) {
  // Languages don't have an 'id' field, so we use 'name' as key
  return (
    <SortableList
      items={languages}
      keyExtractor={lang => lang.name}
      onReorder={onReorder}
      renderItem={language => (
        <LanguageCard
          language={language}
          onEdit={() => onEdit(language)}
          onDelete={() => onDelete(language)}
          isSaving={isSaving}
        />
      )}
    />
  )
}
