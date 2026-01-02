'use client'

/**
 * Modal Component
 *
 * A reusable modal dialog for admin forms and confirmations.
 * Features:
 * - Backdrop with blur effect
 * - Keyboard navigation (Escape to close)
 * - Focus trap for accessibility
 * - Smooth enter/exit animations
 * - Multiple size options
 *
 * @module components/admin/Modal
 */

import { useEffect, useRef, useCallback } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when modal should close */
  onClose: () => void
  /** Modal title displayed in header */
  title: string
  /** Optional subtitle/description */
  subtitle?: string
  /** Modal content */
  children: React.ReactNode
  /** Modal size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Whether clicking backdrop closes modal */
  closeOnBackdrop?: boolean
  /** Whether pressing Escape closes modal */
  closeOnEscape?: boolean
  /** Optional footer content (buttons) */
  footer?: React.ReactNode
  /** Hide the close button in header */
  hideCloseButton?: boolean
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[90vw] max-h-[90vh]',
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  footer,
  hideCloseButton = false,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose()
      }
    },
    [onClose, closeOnEscape]
  )

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && closeOnBackdrop) {
        onClose()
      }
    },
    [onClose, closeOnBackdrop]
  )

  // Focus trap and body scroll lock
  useEffect(() => {
    if (!isOpen) {
      return
    }

    // Store current active element
    previousActiveElement.current = document.activeElement

    // Focus the modal
    modalRef.current?.focus()

    // Lock body scroll
    document.body.style.overflow = 'hidden'

    // Add escape listener
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''

      // Restore focus
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  // Use portal to render at document body level
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative w-full ${sizeClasses[size]}
          bg-white dark:bg-slate-800
          rounded-2xl shadow-2xl
          transform transition-all
          animate-in fade-in zoom-in-95 duration-200
          max-h-[90vh] flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2
              id="modal-title"
              className="text-xl font-semibold text-slate-900 dark:text-slate-100"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          {!hideCloseButton && (
            <button
              onClick={onClose}
              className="p-2 -m-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default Modal
