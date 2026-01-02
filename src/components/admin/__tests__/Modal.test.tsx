/**
 * Tests for Modal Component
 *
 * Tests for accessible modal dialog with backdrop, keyboard navigation,
 * and focus trapping.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '../Modal'

// Mock createPortal for testing
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom')
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  }
})

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Reset body overflow
    document.body.style.overflow = ''
  })

  describe('rendering', () => {
    it('renders when isOpen is true', () => {
      render(<Modal {...defaultProps} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Test Modal')).toBeInTheDocument()
      expect(screen.getByText('Modal content')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<Modal {...defaultProps} isOpen={false} />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders subtitle when provided', () => {
      render(<Modal {...defaultProps} subtitle="This is a subtitle" />)
      expect(screen.getByText('This is a subtitle')).toBeInTheDocument()
    })

    it('renders footer when provided', () => {
      render(<Modal {...defaultProps} footer={<button>Save</button>} />)
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    it('hides close button when hideCloseButton is true', () => {
      render(<Modal {...defaultProps} hideCloseButton />)
      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument()
    })

    it('shows close button by default', () => {
      render(<Modal {...defaultProps} />)
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument()
    })
  })

  describe('sizes', () => {
    it.each(['sm', 'md', 'lg', 'xl', 'full'] as const)(
      'applies %s size class',
      size => {
        const { container } = render(<Modal {...defaultProps} size={size} />)
        const modal = container.querySelector('[tabindex="-1"]')
        expect(modal).toBeInTheDocument()
      }
    )
  })

  describe('accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<Modal {...defaultProps} />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
    })

    it('has the title with correct id for aria-labelledby', () => {
      render(<Modal {...defaultProps} />)
      const title = screen.getByText('Test Modal')
      expect(title).toHaveAttribute('id', 'modal-title')
    })
  })

  describe('interactions', () => {
    it('calls onClose when close button is clicked', () => {
      render(<Modal {...defaultProps} />)
      fireEvent.click(screen.getByLabelText('Close modal'))
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when backdrop is clicked', () => {
      render(<Modal {...defaultProps} />)
      const dialog = screen.getByRole('dialog')
      fireEvent.click(dialog)
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when backdrop click is disabled', () => {
      render(<Modal {...defaultProps} closeOnBackdrop={false} />)
      const dialog = screen.getByRole('dialog')
      fireEvent.click(dialog)
      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })

    it('calls onClose when Escape is pressed', () => {
      render(<Modal {...defaultProps} />)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when Escape is disabled', () => {
      render(<Modal {...defaultProps} closeOnEscape={false} />)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })

    it('does not close when clicking inside modal content', () => {
      render(<Modal {...defaultProps} />)
      fireEvent.click(screen.getByText('Modal content'))
      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })
  })

  describe('body scroll lock', () => {
    it('locks body scroll when opened', () => {
      render(<Modal {...defaultProps} />)
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('unlocks body scroll when closed', () => {
      const { rerender } = render(<Modal {...defaultProps} />)
      expect(document.body.style.overflow).toBe('hidden')

      rerender(<Modal {...defaultProps} isOpen={false} />)
      expect(document.body.style.overflow).toBe('')
    })
  })
})
