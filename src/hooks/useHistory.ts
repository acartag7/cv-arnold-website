/**
 * React Query Hooks for History/Snapshot Management
 *
 * Provides hooks for listing, fetching, creating, and deleting snapshots.
 *
 * @module hooks/useHistory
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import {
  HistoryService,
  type HistoryListResponse,
  type Snapshot,
  type CreateSnapshotRequest,
  HistoryAPIError,
} from '@/services/admin/HistoryService'

/**
 * Hook to fetch paginated history list
 *
 * @param options - Pagination options
 * @returns Query result with snapshot list
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useHistoryList({ limit: 10 })
 * ```
 */
export function useHistoryList(options?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: [...queryKeys.history.list(), options?.limit, options?.offset],
    queryFn: () => HistoryService.list(options),
  })
}

/**
 * Hook to fetch a specific snapshot
 *
 * @param id - Snapshot ID
 * @returns Query result with full snapshot data
 *
 * @example
 * ```tsx
 * const { data: snapshot, isLoading } = useSnapshot('abc123')
 * ```
 */
export function useSnapshot(id: string) {
  return useQuery({
    queryKey: queryKeys.history.snapshot(id),
    queryFn: () => HistoryService.get(id),
    enabled: !!id,
  })
}

/**
 * Hook to create a new snapshot
 *
 * Automatically invalidates history list on success.
 *
 * @example
 * ```tsx
 * const { mutate: createSnapshot, isPending } = useCreateSnapshot()
 * createSnapshot({ description: 'Before major update' }, {
 *   onSuccess: () => toast.success('Snapshot created'),
 * })
 * ```
 */
export function useCreateSnapshot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request?: CreateSnapshotRequest) =>
      HistoryService.create(request),
    onSuccess: () => {
      // Invalidate history list to show new snapshot
      queryClient.invalidateQueries({ queryKey: queryKeys.history.all })
    },
  })
}

/**
 * Hook to delete a snapshot
 *
 * Automatically invalidates history list on success.
 *
 * @example
 * ```tsx
 * const { mutate: deleteSnapshot, isPending } = useDeleteSnapshot()
 * deleteSnapshot('abc123', {
 *   onSuccess: () => toast.success('Snapshot deleted'),
 * })
 * ```
 */
export function useDeleteSnapshot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => HistoryService.delete(id),
    onSuccess: (_data, id) => {
      // Invalidate history list
      queryClient.invalidateQueries({ queryKey: queryKeys.history.all })
      // Remove specific snapshot from cache
      queryClient.removeQueries({ queryKey: queryKeys.history.snapshot(id) })
    },
  })
}

/**
 * Type guard for HistoryAPIError
 */
export function isHistoryAPIError(error: unknown): error is HistoryAPIError {
  return error instanceof HistoryAPIError
}

// Re-export types for convenience
export type { HistoryListResponse, Snapshot, CreateSnapshotRequest }
