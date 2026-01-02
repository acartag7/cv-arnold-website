/**
 * Label Component
 *
 * Form label with optional required indicator.
 * Designed for accessibility with proper htmlFor linking.
 *
 * @module components/ui/Label
 */

import { forwardRef } from 'react'

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Whether the associated field is required */
  required?: boolean | undefined
}

/**
 * Label component for form fields
 *
 * @example
 * ```tsx
 * <Label htmlFor="email" required>Email</Label>
 * <Input id="email" name="email" />
 * ```
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}
        {...props}
      >
        {children}
        {required && (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
    )
  }
)

Label.displayName = 'Label'

export default Label
