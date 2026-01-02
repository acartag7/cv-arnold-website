'use client'

/**
 * Confirm Dialog Component
 *
 * A specialized modal for confirmation actions like deleting items.
 * Uses the Modal component internally with appropriate styling.
 *
 * @module components/admin/ConfirmDialog
 */

import { AlertTriangle, Trash2, Info } from 'lucide-react'
import { Modal } from './Modal'

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean
  /** Callback when confirmed */
  onConfirm: () => void
  /** Callback when cancelled */
  onCancel: () => void
  /** Dialog title */
  title: string
  /** Dialog message/description */
  message: string
  /** Text for confirm button */
  confirmText?: string
  /** Text for cancel button */
  cancelText?: string
  /** Visual variant affecting colors and icon */
  variant?: 'danger' | 'warning' | 'info'
  /** Whether confirm action is in progress */
  isLoading?: boolean
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    buttonBg:
      'bg-red-600 hover:bg-red-500 focus:ring-red-500/30 dark:bg-red-700 dark:hover:bg-red-600',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    buttonBg:
      'bg-amber-600 hover:bg-amber-500 focus:ring-amber-500/30 dark:bg-amber-700 dark:hover:bg-amber-600',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    buttonBg:
      'bg-blue-600 hover:bg-blue-500 focus:ring-blue-500/30 dark:bg-blue-700 dark:hover:bg-blue-600',
  },
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title=""
      size="sm"
      hideCloseButton
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              px-4 py-2.5 text-white font-medium rounded-xl
              transition-all focus:outline-none focus:ring-2
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
              ${config.buttonBg}
            `}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </>
      }
    >
      <div className="text-center">
        {/* Icon */}
        <div
          className={`mx-auto w-14 h-14 rounded-full ${config.iconBg} flex items-center justify-center mb-4`}
        >
          <Icon size={28} className={config.iconColor} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-slate-500 dark:text-slate-400">{message}</p>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
