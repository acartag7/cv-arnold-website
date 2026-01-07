'use client'

/**
 * Section Visibility Toggle Component
 *
 * A reusable toggle for controlling whether a section is visible
 * on the public CV site. Used in individual section editors.
 */

import { Eye, EyeOff } from 'lucide-react'
import { SectionVisibilityKey } from '@/types/cv'

interface SectionVisibilityToggleProps {
  /** The section key to control (e.g., 'experience', 'skills') */
  sectionKey: SectionVisibilityKey
  /** Current visibility state */
  isVisible: boolean
  /** Callback when visibility changes */
  onChange: (sectionKey: SectionVisibilityKey, isVisible: boolean) => void
  /** Whether the toggle is disabled (e.g., during save) */
  disabled?: boolean
  /** Optional custom label */
  label?: string
}

export function SectionVisibilityToggle({
  sectionKey,
  isVisible,
  onChange,
  disabled = false,
  label,
}: SectionVisibilityToggleProps) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(sectionKey, !isVisible)
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        {isVisible ? (
          <Eye className="w-5 h-5 text-emerald-500" />
        ) : (
          <EyeOff className="w-5 h-5 text-slate-400" />
        )}
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label || 'Section Visibility'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isVisible
              ? 'This section is visible on the public site'
              : 'This section is hidden from the public site'}
          </p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isVisible}
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
          border-2 border-transparent transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isVisible ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}
        `}
      >
        <span className="sr-only">
          {isVisible ? 'Hide section' : 'Show section'}
        </span>
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full
            bg-white shadow ring-0 transition duration-200 ease-in-out
            ${isVisible ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  )
}
