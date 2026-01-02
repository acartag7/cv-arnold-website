/**
 * Toast Provider and Context
 *
 * Provides toast notification state management and methods.
 *
 * @module components/ui/ToastProvider
 *
 * @example
 * ```tsx
 * // In your layout
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 *
 * // In any component
 * const toast = useToast()
 * toast.success('Data saved!')
 * toast.error('Something went wrong')
 * ```
 */

'use client'

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
  type ReactNode,
} from 'react'
import {
  ToastContainer,
  type ToastData,
  type ToastVariant,
  type ToastPosition,
} from './Toast'

/**
 * Toast options when showing a notification
 */
export interface ToastOptions {
  /** Duration in milliseconds (0 = infinite) */
  duration?: number
  /** Whether the toast can be dismissed by clicking */
  dismissible?: boolean
  /** Unique ID for the toast (auto-generated if not provided) */
  id?: string
}

/**
 * Toast context value
 */
export interface ToastContextValue {
  /** Add a toast notification */
  toast: (
    message: string,
    variant?: ToastVariant,
    options?: ToastOptions
  ) => string
  /** Show success toast */
  success: (message: string, options?: ToastOptions) => string
  /** Show error toast */
  error: (message: string, options?: ToastOptions) => string
  /** Show warning toast */
  warning: (message: string, options?: ToastOptions) => string
  /** Show info toast */
  info: (message: string, options?: ToastOptions) => string
  /** Dismiss a specific toast by ID */
  dismiss: (id: string) => void
  /** Dismiss all toasts */
  dismissAll: () => void
}

/**
 * Toast provider props
 */
export interface ToastProviderProps {
  children: ReactNode
  /** Maximum number of toasts to show at once */
  maxToasts?: number
  /** Position of the toast container */
  position?: ToastPosition
  /** Default duration for toasts (ms) */
  defaultDuration?: number
}

const ToastContext = createContext<ToastContextValue | null>(null)

/**
 * Generate a unique toast ID
 */
function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Toast Provider Component
 *
 * Wrap your app with this to enable toast notifications.
 */
export function ToastProvider({
  children,
  maxToasts = 5,
  position = 'top-right',
  defaultDuration = 5000,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  const addToast = useCallback(
    (
      message: string,
      variant: ToastVariant = 'info',
      options?: ToastOptions
    ): string => {
      const id = options?.id ?? generateId()
      const duration = options?.duration ?? defaultDuration
      const dismissible = options?.dismissible ?? true

      const newToast: ToastData = {
        id,
        message,
        variant,
        duration,
        dismissible,
      }

      setToasts(prev => {
        // Remove oldest if at max capacity
        const updated = prev.length >= maxToasts ? prev.slice(1) : prev
        return [...updated, newToast]
      })

      return id
    },
    [maxToasts, defaultDuration]
  )

  const success = useCallback(
    (message: string, options?: ToastOptions) =>
      addToast(message, 'success', options),
    [addToast]
  )

  const error = useCallback(
    (message: string, options?: ToastOptions) =>
      addToast(message, 'error', { duration: 7000, ...options }),
    [addToast]
  )

  const warning = useCallback(
    (message: string, options?: ToastOptions) =>
      addToast(message, 'warning', options),
    [addToast]
  )

  const info = useCallback(
    (message: string, options?: ToastOptions) =>
      addToast(message, 'info', options),
    [addToast]
  )

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      toast: addToast,
      success,
      error,
      warning,
      info,
      dismiss,
      dismissAll,
    }),
    [addToast, success, error, warning, info, dismiss, dismissAll]
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} position={position} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

/**
 * Hook to access toast functions
 *
 * @throws Error if used outside ToastProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const toast = useToast()
 *
 *   const handleSave = async () => {
 *     try {
 *       await saveData()
 *       toast.success('Saved successfully!')
 *     } catch (err) {
 *       toast.error('Failed to save')
 *     }
 *   }
 *
 *   return <button onClick={handleSave}>Save</button>
 * }
 * ```
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export default ToastProvider
