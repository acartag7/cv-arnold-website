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
  /** Error message to display below the textarea (string) or error state (boolean) */
  error?: string | boolean
  /** Visual variant */
  variant?: 'default' | 'stripe'
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
  ({ className = '', error, rows = 4, variant = 'default', ...props }, ref) => {
    const hasError = !!error
    const errorMessage = typeof error === 'string' ? error : undefined

    const baseStyles =
      variant === 'stripe'
        ? `
          w-full px-4 py-3
          bg-slate-50 dark:bg-slate-900
          border rounded-xl
          text-slate-900 dark:text-slate-100
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          focus:outline-none focus:ring-2 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all resize-none
        `
        : `
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

    const borderStyles =
      variant === 'stripe'
        ? hasError
          ? 'border-red-300 dark:border-red-700 focus:ring-red-500/30'
          : 'border-slate-200 dark:border-slate-600 focus:ring-blue-500/30'
        : hasError
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
          : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'

    return (
      <div className="w-full">
        <textarea
          ref={ref}
          rows={rows}
          className={`${baseStyles} ${borderStyles} ${className}`}
          aria-invalid={hasError}
          aria-describedby={errorMessage ? `${props.id}-error` : undefined}
          {...props}
        />
        {errorMessage && (
          <p
            id={`${props.id}-error`}
            className="mt-1 text-sm text-red-500"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
