/**
 * Toast Notification Component
 *
 * Displays temporary notifications with different variants.
 * Used with ToastProvider for state management.
 *
 * @module components/ui/Toast
 */

'use client'

import React, { useEffect, memo, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Toast variants with semantic meaning
 */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

/**
 * Toast position on screen
 */
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center'

/**
 * Toast data structure
 */
export interface ToastData {
  id: string
  message: string
  variant?: ToastVariant
  duration?: number
  dismissible?: boolean
}

/**
 * Toast component props
 */
export interface ToastProps extends ToastData {
  onDismiss: (id: string) => void
}

/**
 * Variant configurations for styling
 */
const VARIANT_STYLES: Record<
  ToastVariant,
  { container: string; icon: React.ElementType }
> = {
  success: {
    container:
      'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    icon: CheckCircle,
  },
  error: {
    container:
      'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    icon: AlertCircle,
  },
  warning: {
    container:
      'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    icon: AlertTriangle,
  },
  info: {
    container:
      'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    icon: Info,
  },
}

/**
 * Icon color variants
 */
const ICON_COLORS: Record<ToastVariant, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
}

/**
 * Single Toast notification
 */
export const Toast = memo<ToastProps>(function Toast({
  id,
  message,
  variant = 'info',
  duration = 5000,
  dismissible = true,
  onDismiss,
}) {
  // Auto-dismiss after duration
  useEffect(() => {
    if (duration <= 0) {
      return
    }
    const timer = setTimeout(() => {
      onDismiss(id)
    }, duration)
    return () => clearTimeout(timer)
  }, [id, duration, onDismiss])

  const handleDismiss = useCallback(() => {
    onDismiss(id)
  }, [id, onDismiss])

  const config = VARIANT_STYLES[variant]
  const Icon = config.icon

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg',
        'transform transition-all duration-300 ease-out',
        'animate-in slide-in-from-right-5 fade-in',
        'max-w-md w-full',
        config.container
      )}
    >
      <Icon
        size={20}
        className={cn('flex-shrink-0 mt-0.5', ICON_COLORS[variant])}
      />

      <p className="flex-1 text-sm font-medium">{message}</p>

      {dismissible && (
        <button
          onClick={handleDismiss}
          className={cn(
            'flex-shrink-0 p-1 rounded-md',
            'hover:bg-black/10 dark:hover:bg-white/10',
            'transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            variant === 'success' && 'focus:ring-green-500',
            variant === 'error' && 'focus:ring-red-500',
            variant === 'warning' && 'focus:ring-yellow-500',
            variant === 'info' && 'focus:ring-blue-500'
          )}
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
})

/**
 * Position styles for toast container
 */
export const POSITION_STYLES: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
}

/**
 * Toast container component
 */
export interface ToastContainerProps {
  toasts: ToastData[]
  position?: ToastPosition
  onDismiss: (id: string) => void
}

export const ToastContainer = memo<ToastContainerProps>(
  function ToastContainer({ toasts, position = 'top-right', onDismiss }) {
    if (toasts.length === 0) return null

    return (
      <div
        className={cn(
          'fixed z-50 flex flex-col gap-2',
          'pointer-events-none',
          POSITION_STYLES[position]
        )}
        aria-label="Notifications"
      >
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onDismiss={onDismiss} />
          </div>
        ))}
      </div>
    )
  }
)

export default Toast
