/**
 * Error Boundary Component
 *
 * Catches React errors in the component tree and provides graceful fallback UI.
 * Integrates with logging service for error tracking and reporting.
 *
 * @module components/ErrorBoundary
 */

'use client'

import React, { Component, type ReactNode, type ErrorInfo } from 'react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('ErrorBoundary')

// ============================================================================
// Types
// ============================================================================

export interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode
  /** Custom fallback UI (receives error and reset function) */
  fallback?: (error: Error, resetError: () => void) => ReactNode
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Error boundary identifier for logging */
  boundaryId?: string
}

export interface ErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean
  /** The caught error */
  error: Error | null
  /** Error information from React */
  errorInfo: ErrorInfo | null
}

// ============================================================================
// Error Boundary Component
// ============================================================================

/**
 * Error Boundary that catches errors in component tree
 *
 * Features:
 * - Graceful error fallback UI
 * - Error logging and reporting
 * - Error reset functionality
 * - Custom fallback support
 * - Development vs production error details
 *
 * @example
 * ```tsx
 * <ErrorBoundary boundaryId="app">
 *   <App />
 * </ErrorBoundary>
 * ```
 *
 * @example With custom fallback
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, resetError) => (
 *     <div>
 *       <h1>Something went wrong</h1>
 *       <button onClick={resetError}>Try again</button>
 *     </div>
 *   )}
 * >
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  /**
   * Static method called when error is caught
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  /**
   * Lifecycle method called after error is caught
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, boundaryId } = this.props

    // Log error
    logger.error('Error caught by boundary', {
      boundaryId: boundaryId || 'unknown',
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })

    // Update state with error info
    this.setState({ errorInfo })

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo)
    }
  }

  /**
   * Reset error state
   */
  resetError = (): void => {
    logger.info('Error boundary reset', {
      boundaryId: this.props.boundaryId || 'unknown',
    })

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback } = this.props

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.resetError)
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          resetError={this.resetError}
        />
      )
    }

    return children
  }
}

// ============================================================================
// Default Fallback Component
// ============================================================================

interface DefaultErrorFallbackProps {
  error: Error
  errorInfo: ErrorInfo | null
  resetError: () => void
}

/**
 * Default error fallback UI
 */
function DefaultErrorFallback({
  error,
  errorInfo,
  resetError,
}: DefaultErrorFallbackProps): ReactNode {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          padding: '1.5rem',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#c00',
            marginBottom: '1rem',
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            color: '#666',
            marginBottom: '1rem',
          }}
        >
          {isDevelopment
            ? 'An error occurred while rendering this component. See details below.'
            : 'We encountered an unexpected error. Please try refreshing the page.'}
        </p>

        {isDevelopment && (
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '1rem',
              marginBottom: '1rem',
              overflowX: 'auto',
            }}
          >
            <p
              style={{
                fontWeight: '600',
                marginBottom: '0.5rem',
              }}
            >
              Error:
            </p>
            <pre
              style={{
                fontSize: '0.875rem',
                color: '#c00',
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}
            >
              {error.message}
            </pre>

            {error.stack && (
              <>
                <p
                  style={{
                    fontWeight: '600',
                    marginTop: '1rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  Stack Trace:
                </p>
                <pre
                  style={{
                    fontSize: '0.75rem',
                    color: '#666',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {error.stack}
                </pre>
              </>
            )}

            {errorInfo?.componentStack && (
              <>
                <p
                  style={{
                    fontWeight: '600',
                    marginTop: '1rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  Component Stack:
                </p>
                <pre
                  style={{
                    fontSize: '0.75rem',
                    color: '#666',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {errorInfo.componentStack}
                </pre>
              </>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={resetError}
            style={{
              backgroundColor: '#c00',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Try Again
          </button>

          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#fff',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}
