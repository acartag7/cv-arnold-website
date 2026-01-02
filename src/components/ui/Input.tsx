/**
 * Input Component
 *
 * Text input with error state and accessible styling.
 * Integrates with react-hook-form through standard props.
 *
 * @module components/ui/Input
 */

import { forwardRef } from 'react'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Error message to display below the input (string) or error state (boolean) */
  error?: string | boolean
  /** Visual variant */
  variant?: 'default' | 'stripe'
}

/**
 * Input component for form text fields
 *
 * @example
 * ```tsx
 * <Input
 *   {...register('email')}
 *   type="email"
 *   placeholder="you@example.com"
 *   error={errors.email?.message}
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className = '', error, type = 'text', variant = 'default', ...props },
    ref
  ) => {
    const hasError = !!error
    const errorMessage = typeof error === 'string' ? error : undefined

    const baseStyles =
      variant === 'stripe'
        ? `
          w-full px-4 py-2.5
          bg-slate-50 dark:bg-slate-900
          border rounded-xl
          text-slate-900 dark:text-slate-100
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          focus:outline-none focus:ring-2 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all
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
        <input
          ref={ref}
          type={type}
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

Input.displayName = 'Input'

export default Input
