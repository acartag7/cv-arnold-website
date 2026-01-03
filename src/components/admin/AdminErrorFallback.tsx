'use client'

/**
 * Admin Error Fallback Component
 *
 * Displayed when an unhandled error occurs in admin pages.
 * Provides recovery options and matches admin UI styling.
 */

import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface AdminErrorFallbackProps {
  error?: Error
  showDetails?: boolean
}

export function AdminErrorFallback({
  error,
  showDetails = process.env.NODE_ENV === 'development',
}: AdminErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        {/* Error Message */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          An unexpected error occurred while loading this page. Please try
          refreshing or return to the dashboard.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleReload}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            <Home size={18} />
            Go to Dashboard
          </Link>
        </div>

        {/* Error Details (development only) */}
        {showDetails && error && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              Error Details
            </summary>
            <div className="mt-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto">
              <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
                {error.name}: {error.message}
              </p>
              {error.stack && (
                <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
