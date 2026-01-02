/**
 * React Query Client Configuration
 *
 * Configures the query client for the admin interface with:
 * - Retry logic for failed requests
 * - Stale time configuration
 * - Error handling defaults
 *
 * @module lib/queryClient
 */

import { QueryClient, keepPreviousData } from '@tanstack/react-query'

/**
 * Default stale time for queries (5 minutes)
 * Data is considered fresh for this duration
 */
const DEFAULT_STALE_TIME = 5 * 60 * 1000

/**
 * Create a new QueryClient instance
 *
 * Used by QueryClientProvider in the admin layout.
 * Each request gets a fresh client to avoid SSR hydration issues.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is fresh for 5 minutes
        staleTime: DEFAULT_STALE_TIME,
        // Retry failed requests up to 3 times
        retry: 3,
        // Don't refetch on window focus in admin (manual control)
        refetchOnWindowFocus: false,
        // Keep previous data while refetching (React Query v5 recommended pattern)
        placeholderData: keepPreviousData,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
  })
}

/**
 * Query keys for consistent cache management
 *
 * Using a factory pattern for type-safe query keys
 */
export const queryKeys = {
  /** CV data queries */
  cv: {
    all: ['cv'] as const,
    data: () => [...queryKeys.cv.all, 'data'] as const,
    section: (name: string) => [...queryKeys.cv.all, 'section', name] as const,
  },
  /** History queries */
  history: {
    all: ['history'] as const,
    list: () => [...queryKeys.history.all, 'list'] as const,
    snapshot: (id: string) =>
      [...queryKeys.history.all, 'snapshot', id] as const,
  },
} as const
