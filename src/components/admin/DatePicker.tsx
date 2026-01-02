'use client'

/**
 * Date Picker Component
 *
 * A date input with optional "present" or "no end date" toggle.
 * Features:
 * - Standard date input with month/year or full date modes
 * - Optional checkbox to indicate ongoing/null date
 * - Accessible labels and error states
 *
 * @module components/admin/DatePicker
 */

import { useState, useEffect } from 'react'
import { Calendar, Check } from 'lucide-react'

export interface DatePickerProps {
  /** Current date value (ISO 8601 string or null) */
  value: string | null
  /** Callback when date changes */
  onChange: (date: string | null) => void
  /** Whether null values are allowed */
  allowNull?: boolean
  /** Label for the null checkbox (e.g., "Currently working here", "No expiration") */
  nullLabel?: string
  /** Input label */
  label?: string
  /** Whether the input is disabled */
  disabled?: boolean
  /** Error message (undefined means no error) */
  error?: string | undefined
  /** Whether to show full date or just month/year */
  mode?: 'full' | 'month-year'
  /** Minimum selectable date */
  min?: string
  /** Maximum selectable date */
  max?: string
  /** Additional CSS classes */
  className?: string
}

export function DatePicker({
  value,
  onChange,
  allowNull = false,
  nullLabel = 'Present',
  label,
  disabled = false,
  error,
  mode = 'month-year',
  min,
  max,
  className = '',
}: DatePickerProps) {
  const [isNull, setIsNull] = useState(value === null && allowNull)

  // Sync isNull state when value changes externally
  useEffect(() => {
    if (allowNull) {
      setIsNull(value === null)
    }
  }, [value, allowNull])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue) {
      // For month-year mode, convert YYYY-MM to full date (first of month)
      if (mode === 'month-year' && newValue.match(/^\d{4}-\d{2}$/)) {
        onChange(`${newValue}-01`)
      } else {
        onChange(newValue)
      }
    } else {
      onChange(null)
    }
  }

  const handleNullToggle = () => {
    if (isNull) {
      // Switching from null to a date - set to today
      const today = new Date().toISOString().split('T')[0] ?? ''
      onChange(today)
      setIsNull(false)
    } else {
      // Switching to null
      onChange(null)
      setIsNull(true)
    }
  }

  // Format value for input based on mode
  const getInputValue = () => {
    if (!value || isNull) return ''

    // Parse the date value
    const dateParts = value.split('-')
    if (dateParts.length < 2) return ''

    if (mode === 'month-year') {
      // Return YYYY-MM format
      return `${dateParts[0]}-${dateParts[1]}`
    }

    // Return full date
    return value
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}

      <div className="flex flex-col gap-2">
        {/* Date input */}
        {!isNull && (
          <div className="relative">
            <input
              type={mode === 'month-year' ? 'month' : 'date'}
              value={getInputValue()}
              onChange={handleDateChange}
              disabled={disabled || isNull}
              min={min}
              max={max}
              className={`
                w-full px-4 py-2.5 pr-10
                bg-white dark:bg-slate-800
                border rounded-xl
                text-slate-900 dark:text-slate-100
                transition-colors
                ${error ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                [&::-webkit-calendar-picker-indicator]:opacity-0
                [&::-webkit-calendar-picker-indicator]:absolute
                [&::-webkit-calendar-picker-indicator]:right-0
                [&::-webkit-calendar-picker-indicator]:w-10
                [&::-webkit-calendar-picker-indicator]:h-full
                [&::-webkit-calendar-picker-indicator]:cursor-pointer
              `}
            />
            <Calendar
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}

        {/* Null toggle checkbox */}
        {allowNull && (
          <label
            className={`
              inline-flex items-center gap-2 cursor-pointer select-none
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={isNull}
              onClick={handleNullToggle}
              disabled={disabled}
              className={`
                w-5 h-5 rounded-md border-2 flex items-center justify-center
                transition-all
                ${
                  isNull
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                }
                ${!disabled && 'hover:border-blue-500'}
                focus:outline-none focus:ring-2 focus:ring-blue-500/30
              `}
            >
              {isNull && <Check size={14} strokeWidth={3} />}
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {nullLabel}
            </span>
          </label>
        )}

        {/* Show "Present" indicator when null is selected */}
        {isNull && (
          <div
            className="
              flex items-center gap-2 px-4 py-2.5
              bg-blue-50 dark:bg-blue-900/20
              border border-blue-200 dark:border-blue-800
              rounded-xl text-blue-700 dark:text-blue-300
            "
          >
            <Calendar size={18} />
            <span className="font-medium">{nullLabel}</span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}

export default DatePicker
