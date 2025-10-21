/**
 * CV Data React Context
 *
 * Provides global state management for CV data with:
 * - Loading and error states
 * - Data refresh capabilities
 * - Optimistic updates
 * - Performance optimizations (value splitting, memoization)
 * - TypeScript type safety
 *
 * @module contexts/CVDataContext
 */

'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react'
import type { CVData } from '@/types/cv'
import type { CVDataService } from '@/services/CVDataService'
import {
  CVDataNotFoundError,
  CVValidationError,
  CVStorageError,
} from '@/lib/errors'
import { createLogger } from '@/lib/logger'

const logger = createLogger('CVDataContext')

// ============================================================================
// Types
// ============================================================================

/**
 * Loading state enum for better type safety
 */
export type LoadingState = 'idle' | 'loading' | 'refreshing' | 'updating'

/**
 * Error state type
 */
export interface ErrorState {
  message: string
  code?: string
  details?: unknown
}

/**
 * Context state type (data + meta)
 */
export interface CVDataState {
  /** Current CV data */
  data: CVData | null
  /** Loading state */
  loading: LoadingState
  /** Error state */
  error: ErrorState | null
  /** Last successful fetch timestamp */
  lastFetchedAt: number | null
}

/**
 * Context actions type
 */
export interface CVDataActions {
  /** Refresh data from storage */
  refresh: () => Promise<void>
  /** Update CV data (optimistic) */
  updateData: (data: CVData) => Promise<void>
  /** Clear error state */
  clearError: () => void
  /** Reset to initial state */
  reset: () => void
}

/**
 * Combined context value (split for performance)
 */
export interface CVDataContextValue {
  state: CVDataState
  actions: CVDataActions
}

// ============================================================================
// Context Creation
// ============================================================================

/**
 * State context (frequently accessed)
 */
const CVDataStateContext = createContext<CVDataState | undefined>(undefined)

/**
 * Actions context (rarely changes)
 */
const CVDataActionsContext = createContext<CVDataActions | undefined>(undefined)

// ============================================================================
// Provider Props
// ============================================================================

export interface CVDataProviderProps {
  /** Child components */
  children: ReactNode
  /** CV Data Service instance */
  service: CVDataService
  /** Auto-fetch on mount (default: true) */
  autoFetch?: boolean
  /** Enable DevTools logging (default: false) */
  devTools?: boolean
}

// ============================================================================
// Provider Component
// ============================================================================

/**
 * CV Data Provider Component
 *
 * Provides CV data state and actions to children components.
 * Uses context value splitting for optimal performance.
 *
 * @example
 * ```tsx
 * <CVDataProvider service={cvDataService}>
 *   <App />
 * </CVDataProvider>
 * ```
 */
export const CVDataProvider = React.memo<CVDataProviderProps>(
  ({ children, service, autoFetch = true, devTools = false }) => {
    // State management
    const [state, setState] = useState<CVDataState>({
      data: null,
      loading: 'idle',
      error: null,
      lastFetchedAt: null,
    })

    // DevTools logging
    useEffect(() => {
      if (devTools) {
        logger.debug('CVDataProvider state changed', { state })
      }
    }, [state, devTools])

    // ========================================================================
    // Actions
    // ========================================================================

    /**
     * Fetch CV data from service
     */
    const fetchData = useCallback(
      async (isRefresh = false) => {
        const loadingState: LoadingState = isRefresh ? 'refreshing' : 'loading'

        setState(prev => ({
          ...prev,
          loading: loadingState,
          error: null,
        }))

        try {
          logger.debug('Fetching CV data', { isRefresh })
          const data = await service.getData()

          setState({
            data,
            loading: 'idle',
            error: null,
            lastFetchedAt: Date.now(),
          })

          logger.info('CV data fetched successfully', {
            isRefresh,
            dataSize: JSON.stringify(data).length,
          })
        } catch (error) {
          logger.error('Failed to fetch CV data', { error })

          const errorState: ErrorState = {
            message:
              error instanceof Error ? error.message : 'Unknown error occurred',
            code:
              error instanceof CVDataNotFoundError
                ? 'NOT_FOUND'
                : error instanceof CVValidationError
                  ? 'VALIDATION_ERROR'
                  : error instanceof CVStorageError
                    ? 'STORAGE_ERROR'
                    : 'UNKNOWN',
            details: error,
          }

          setState(prev => ({
            ...prev,
            loading: 'idle',
            error: errorState,
          }))
        }
      },
      [service]
    )

    /**
     * Refresh data from storage
     */
    const refresh = useCallback(async () => {
      await fetchData(true)
    }, [fetchData])

    /**
     * Update CV data with optimistic update
     */
    const updateData = useCallback(
      async (newData: CVData) => {
        // Optimistic update
        const previousData = state.data

        setState(prev => ({
          ...prev,
          data: newData,
          loading: 'updating',
          error: null,
        }))

        try {
          logger.debug('Updating CV data')
          await service.updateData(newData)

          setState(prev => ({
            ...prev,
            loading: 'idle',
            lastFetchedAt: Date.now(),
          }))

          logger.info('CV data updated successfully')
        } catch (error) {
          logger.error('Failed to update CV data', { error })

          // Revert optimistic update on error
          setState(prev => ({
            ...prev,
            data: previousData,
            loading: 'idle',
            error: {
              message: error instanceof Error ? error.message : 'Update failed',
              code: 'UPDATE_ERROR',
              details: error,
            },
          }))
        }
      },
      [service, state.data]
    )

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
      setState(prev => ({ ...prev, error: null }))
    }, [])

    /**
     * Reset to initial state
     */
    const reset = useCallback(() => {
      setState({
        data: null,
        loading: 'idle',
        error: null,
        lastFetchedAt: null,
      })
    }, [])

    // ========================================================================
    // Effects
    // ========================================================================

    /**
     * Auto-fetch on mount
     */
    useEffect(() => {
      if (autoFetch) {
        fetchData()
      }
      // Only run on mount
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ========================================================================
    // Memoized Values
    // ========================================================================

    /**
     * Actions object (stable reference)
     */
    const actions = useMemo<CVDataActions>(
      () => ({
        refresh,
        updateData,
        clearError,
        reset,
      }),
      [refresh, updateData, clearError, reset]
    )

    // ========================================================================
    // Render
    // ========================================================================

    return (
      <CVDataStateContext.Provider value={state}>
        <CVDataActionsContext.Provider value={actions}>
          {children}
        </CVDataActionsContext.Provider>
      </CVDataStateContext.Provider>
    )
  }
)

CVDataProvider.displayName = 'CVDataProvider'

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access CV data state
 *
 * @returns CV data state
 * @throws Error if used outside CVDataProvider
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useCVDataState()
 * ```
 */
export function useCVDataState(): CVDataState {
  const context = useContext(CVDataStateContext)

  if (context === undefined) {
    throw new Error('useCVDataState must be used within CVDataProvider')
  }

  return context
}

/**
 * Hook to access CV data actions
 *
 * @returns CV data actions
 * @throws Error if used outside CVDataProvider
 *
 * @example
 * ```tsx
 * const { refresh, updateData } = useCVDataActions()
 * ```
 */
export function useCVDataActions(): CVDataActions {
  const context = useContext(CVDataActionsContext)

  if (context === undefined) {
    throw new Error('useCVDataActions must be used within CVDataProvider')
  }

  return context
}

/**
 * Hook to access both state and actions
 *
 * Convenience hook that combines useCVDataState and useCVDataActions.
 * Note: Using split hooks (useCVDataState, useCVDataActions) is preferred
 * for better performance when you only need one or the other.
 *
 * @returns Combined state and actions
 * @throws Error if used outside CVDataProvider
 *
 * @example
 * ```tsx
 * const { state, actions } = useCVData()
 * const { data, loading } = state
 * const { refresh } = actions
 * ```
 */
export function useCVData(): CVDataContextValue {
  const state = useCVDataState()
  const actions = useCVDataActions()

  return useMemo(() => ({ state, actions }), [state, actions])
}

// ============================================================================
// Selector Hooks (Performance Optimized)
// ============================================================================

/**
 * Hook to access only CV data (without metadata)
 *
 * More efficient than useCVDataState when you only need the data.
 *
 * @returns CV data or null
 *
 * @example
 * ```tsx
 * const cvData = useCVDataValue()
 * ```
 */
export function useCVDataValue(): CVData | null {
  const { data } = useCVDataState()
  return data
}

/**
 * Hook to check if data is loading
 *
 * @returns boolean indicating if data is currently loading
 *
 * @example
 * ```tsx
 * const isLoading = useIsLoading()
 * if (isLoading) return <Spinner />
 * ```
 */
export function useIsLoading(): boolean {
  const { loading } = useCVDataState()
  return loading === 'loading' || loading === 'refreshing'
}

/**
 * Hook to check if data is updating
 *
 * @returns boolean indicating if data is currently being updated
 *
 * @example
 * ```tsx
 * const isUpdating = useIsUpdating()
 * ```
 */
export function useIsUpdating(): boolean {
  const { loading } = useCVDataState()
  return loading === 'updating'
}

/**
 * Hook to access error state
 *
 * @returns Error state or null
 *
 * @example
 * ```tsx
 * const error = useCVDataError()
 * if (error) return <ErrorMessage error={error} />
 * ```
 */
export function useCVDataError(): ErrorState | null {
  const { error } = useCVDataState()
  return error
}
