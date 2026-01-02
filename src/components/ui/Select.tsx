/**
 * Select Component
 *
 * Dropdown select with error state and accessible styling.
 * Integrates with react-hook-form through standard props.
 *
 * @module components/ui/Select
 */

import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  /** Options to display in the dropdown */
  options: SelectOption[]
  /** Placeholder text (first option with empty value) */
  placeholder?: string
  /** Error message to display below the select */
  error?: string
}

/**
 * Select component for dropdown form fields
 *
 * @example
 * ```tsx
 * <Select
 *   {...register('status')}
 *   options={[
 *     { value: 'available', label: 'Available' },
 *     { value: 'not_available', label: 'Not Available' },
 *   ]}
 *   placeholder="Select status..."
 *   error={errors.status?.message}
 * />
 * ```
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, options, placeholder, ...props }, ref) => {
    const baseStyles = `
      block w-full px-3 py-2 pr-10
      bg-white dark:bg-gray-800
      border rounded-lg
      text-gray-900 dark:text-gray-100
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-colors
      appearance-none cursor-pointer
    `

    const borderStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'

    return (
      <div className="w-full relative">
        <select
          ref={ref}
          className={`${baseStyles} ${borderStyles} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        {error && (
          <p
            id={`${props.id}-error`}
            className="mt-1 text-sm text-red-500"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
