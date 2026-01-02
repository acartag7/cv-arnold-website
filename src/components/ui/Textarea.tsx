/**
 * Textarea Component
 *
 * Multi-line text input with error state and accessible styling.
 * Integrates with react-hook-form through standard props.
 *
 * @module components/ui/Textarea
 */

import { forwardRef } from 'react'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Error message to display below the textarea */
  error?: string
}

/**
 * Textarea component for multi-line form fields
 *
 * @example
 * ```tsx
 * <Textarea
 *   {...register('summary')}
 *   placeholder="Write your professional summary..."
 *   rows={6}
 *   error={errors.summary?.message}
 * />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, rows = 4, ...props }, ref) => {
    const baseStyles = `
      block w-full px-3 py-2
      bg-white dark:bg-gray-800
      border rounded-lg
      text-gray-900 dark:text-gray-100
      placeholder:text-gray-400 dark:placeholder:text-gray-500
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-colors
      resize-y min-h-[80px]
    `

    const borderStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'

    return (
      <div className="w-full">
        <textarea
          ref={ref}
          rows={rows}
          className={`${baseStyles} ${borderStyles} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
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

Textarea.displayName = 'Textarea'

export default Textarea
