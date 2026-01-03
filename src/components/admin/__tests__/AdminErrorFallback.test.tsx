/**
 * Tests for AdminErrorFallback Component
 *
 * Tests the error fallback UI displayed when admin pages crash.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AdminErrorFallback } from '../AdminErrorFallback'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

describe('AdminErrorFallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders error message and recovery options', () => {
      render(<AdminErrorFallback />)

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(
        screen.getByText(/An unexpected error occurred/i)
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /Try Again/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: /Go to Dashboard/i })
      ).toBeInTheDocument()
    })

    it('renders dashboard link with correct href', () => {
      render(<AdminErrorFallback />)

      const dashboardLink = screen.getByRole('link', {
        name: /Go to Dashboard/i,
      })
      expect(dashboardLink).toHaveAttribute('href', '/admin')
    })
  })

  describe('error details', () => {
    it('shows error details when showDetails is true', () => {
      const testError = new Error('Test error message')
      testError.stack = 'Error: Test error message\n    at Test.component'

      render(<AdminErrorFallback error={testError} showDetails={true} />)

      expect(screen.getByText('Error Details')).toBeInTheDocument()
      // Check that the error name and message are shown (in the <p> tag)
      const errorParagraph = screen.getByText((content, element) => {
        return (
          element?.tagName === 'P' && content.includes('Test error message')
        )
      })
      expect(errorParagraph).toBeInTheDocument()
    })

    it('hides error details when showDetails is false', () => {
      const testError = new Error('Test error message')

      render(<AdminErrorFallback error={testError} showDetails={false} />)

      expect(screen.queryByText('Error Details')).not.toBeInTheDocument()
    })

    it('hides error details when no error provided', () => {
      render(<AdminErrorFallback showDetails={true} />)

      expect(screen.queryByText('Error Details')).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('reloads page when Try Again is clicked', () => {
      const reloadMock = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      })

      render(<AdminErrorFallback />)

      fireEvent.click(screen.getByRole('button', { name: /Try Again/i }))
      expect(reloadMock).toHaveBeenCalledTimes(1)
    })
  })
})
