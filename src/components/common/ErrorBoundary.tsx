/**
 * Error Boundary Component
 * Catches React errors and provides fallback UI
 */

'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { Typography } from '@/components/ui/Typography'
import { Card } from '@/components/ui/Card'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  showError?: boolean
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Store error info for detailed reporting
    this.setState({ errorInfo })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Enhanced error logging for debugging
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Component Error Boundary')
      console.error('Error caught by boundary:', error)
      console.error('Component stack trace:', errorInfo.componentStack)
      console.error('Error stack trace:', error.stack)
      console.groupEnd()

      // Log additional context
      console.table({
        'Error Message': error.message,
        'Error Name': error.name,
        Component:
          errorInfo.componentStack?.split('\n')[1]?.trim() || 'Unknown',
        Time: new Date().toISOString(),
      })
    } else {
      // Production error reporting (could integrate with service like Sentry)
      console.error('Component error:', error.message)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card variant="outlined" className="border-red-200 bg-red-50">
          <div className="p-4 text-center">
            <Typography variant="h6" className="text-red-700 mb-2">
              Component Error
            </Typography>
            <Typography variant="body2" className="text-red-600 mb-3">
              Something went wrong rendering this component.
            </Typography>
            {this.props.showError && this.state.error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
                <Typography
                  variant="caption"
                  className="text-red-700 font-mono text-xs block mb-2"
                >
                  <strong>Error:</strong> {this.state.error.message}
                </Typography>
                {this.state.errorInfo && (
                  <details className="text-xs text-red-600">
                    <summary className="cursor-pointer font-semibold mb-1">
                      Stack Trace
                    </summary>
                    <pre className="whitespace-pre-wrap text-xs overflow-x-auto">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
