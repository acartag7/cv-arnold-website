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
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
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
    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Component Error Boundary')
      console.error('Error caught by boundary:', error)
      console.error('Error info:', errorInfo)
      console.groupEnd()
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
              <Typography
                variant="caption"
                className="text-red-500 font-mono text-xs"
              >
                {this.state.error.message}
              </Typography>
            )}
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
