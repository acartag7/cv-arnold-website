/**
 * FormField Component
 *
 * Wrapper that combines Label + Input/Select + Error message
 * for consistent form field styling and accessibility.
 *
 * @module components/ui/FormField
 */

import { Label } from './Label'

export interface FormFieldProps {
  /** Field label text */
  label: string
  /** Input name/id for accessibility linking */
  name: string
  /** Whether the field is required */
  required?: boolean
  /** Error message to display */
  error?: string
  /** Optional helper text */
  description?: string
  /** Field input element */
  children: React.ReactNode
  /** Additional class names */
  className?: string
}

/**
 * FormField wrapper component
 *
 * @example
 * ```tsx
 * <FormField label="Email" name="email" required error={errors.email?.message}>
 *   <Input {...register('email')} type="email" />
 * </FormField>
 * ```
 */
export function FormField({
  label,
  name,
  required,
  error,
  description,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={name} required={required ?? undefined}>
        {label}
      </Label>

      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}

      {children}

      {error && (
        <p id={`${name}-error`} className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField
