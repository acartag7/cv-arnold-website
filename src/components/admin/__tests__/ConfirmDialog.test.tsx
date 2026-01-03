/**
 * Tests for ConfirmDialog Component
 *
 * Tests for confirmation modal with variant styling and loading states.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDialog } from '../ConfirmDialog'

// Mock createPortal for testing
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom')
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  }
})

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders when isOpen is true', () => {
      render(<ConfirmDialog {...defaultProps} />)
      expect(screen.getByText('Delete Item')).toBeInTheDocument()
      expect(
        screen.getByText('Are you sure you want to delete this item?')
      ).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<ConfirmDialog {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('Delete Item')).not.toBeInTheDocument()
    })

    it('renders default button text', () => {
      render(<ConfirmDialog {...defaultProps} />)
      expect(screen.getByText('Confirm')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('renders custom button text', () => {
      render(
        <ConfirmDialog
          {...defaultProps}
          confirmText="Yes, delete"
          cancelText="No, keep it"
        />
      )
      expect(screen.getByText('Yes, delete')).toBeInTheDocument()
      expect(screen.getByText('No, keep it')).toBeInTheDocument()
    })
  })

  describe('variants', () => {
    it('renders danger variant by default', () => {
      render(<ConfirmDialog {...defaultProps} />)
      // The icon container should be present
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('renders warning variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="warning" />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('renders info variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="info" />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onConfirm when confirm button is clicked', () => {
      render(<ConfirmDialog {...defaultProps} />)
      fireEvent.click(screen.getByText('Confirm'))
      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when cancel button is clicked', () => {
      render(<ConfirmDialog {...defaultProps} />)
      fireEvent.click(screen.getByText('Cancel'))
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when Escape is pressed', () => {
      render(<ConfirmDialog {...defaultProps} />)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('loading state', () => {
    it('shows loading indicator when isLoading is true', () => {
      render(<ConfirmDialog {...defaultProps} isLoading />)
      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })

    it('disables buttons when loading', () => {
      render(<ConfirmDialog {...defaultProps} isLoading />)
      expect(screen.getByText('Cancel')).toBeDisabled()
      expect(screen.getByText('Processing...').closest('button')).toBeDisabled()
    })

    it('does not call onConfirm when loading and button is clicked', () => {
      render(<ConfirmDialog {...defaultProps} isLoading />)
      const confirmButton = screen.getByText('Processing...').closest('button')
      if (confirmButton) {
        fireEvent.click(confirmButton)
      }
      expect(defaultProps.onConfirm).not.toHaveBeenCalled()
    })
  })
})
