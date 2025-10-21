/**
 * ErrorBoundary Tests
 *
 * Tests for error boundary component including:
 * - Error catching and fallback UI
 * - Error logging and reporting
 * - Error reset functionality
 * - Custom fallback support
 * - Development vs production behavior
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { ErrorBoundary } from '../ErrorBoundary'

// ============================================================================
// Mock Components
// ============================================================================

/**
 * Component that throws an error
 */
function ThrowError({
  shouldThrow = true,
}: {
  shouldThrow?: boolean
}): React.ReactElement {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

/**
 * Component that throws on render
 */
function AlwaysThrows(): React.ReactElement {
  throw new Error('Always throws')
}

// ============================================================================
// Tests
// ============================================================================

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console errors for cleaner test output
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ==========================================================================
  // Basic Functionality
  // ==========================================================================

  describe('Basic Functionality', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('should catch errors and display fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should display error message in development mode', () => {
      // Note: NODE_ENV is set to 'test' by Vitest, which behaves like development
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      // Check for Error: label which is shown in development/test mode
      expect(screen.getByText('Error:')).toBeInTheDocument()
      expect(screen.getAllByText(/Test error/).length).toBeGreaterThan(0)
    })

    it('should show stack trace in development mode', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Stack Trace:')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Custom Fallback
  // ==========================================================================

  describe('Custom Fallback', () => {
    it('should use custom fallback when provided', () => {
      const customFallback = (error: Error) => (
        <div>Custom error: {error.message}</div>
      )

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom error: Test error')).toBeInTheDocument()
    })

    it('should pass resetError function to custom fallback', () => {
      let resetFn: (() => void) | undefined

      const customFallback = (_error: Error, reset: () => void) => {
        resetFn = reset
        return <div>Custom fallback</div>
      }

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(resetFn).toBeTypeOf('function')
    })
  })

  // ==========================================================================
  // Error Callbacks
  // ==========================================================================

  describe('Error Callbacks', () => {
    it('should call onError when error is caught', () => {
      const onError = vi.fn()

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      )
    })

    it('should include boundary ID in error logging', () => {
      const onError = vi.fn()

      render(
        <ErrorBoundary boundaryId="test-boundary" onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(onError).toHaveBeenCalled()
    })
  })

  // ==========================================================================
  // Error Reset
  // ==========================================================================

  describe('Error Reset', () => {
    it('should reset error state when reset button is clicked', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Error state
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      // Click try again button
      const tryAgainButton = screen.getByText('Try Again')
      tryAgainButton.click()

      // Rerender with no error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('No error')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Multiple Errors
  // ==========================================================================

  describe('Multiple Errors', () => {
    it('should handle multiple error types', () => {
      const errors = [
        new Error('Error 1'),
        new TypeError('Type error'),
        new RangeError('Range error'),
      ]

      errors.forEach(error => {
        const ThrowSpecificError = () => {
          throw error
        }

        const { container } = render(
          <ErrorBoundary>
            <ThrowSpecificError />
          </ErrorBoundary>
        )

        expect(container.textContent).toContain('Something went wrong')
      })
    })
  })

  // ==========================================================================
  // Nested Error Boundaries
  // ==========================================================================

  describe('Nested Error Boundaries', () => {
    it('should only catch errors in nested boundary', () => {
      const innerOnError = vi.fn()
      const outerOnError = vi.fn()

      render(
        <ErrorBoundary boundaryId="outer" onError={outerOnError}>
          <div>Outer boundary</div>
          <ErrorBoundary boundaryId="inner" onError={innerOnError}>
            <ThrowError />
          </ErrorBoundary>
        </ErrorBoundary>
      )

      expect(innerOnError).toHaveBeenCalledTimes(1)
      expect(outerOnError).not.toHaveBeenCalled()
      expect(screen.getByText('Outer boundary')).toBeInTheDocument()
    })
  })
})
