/**
 * React Query Hooks for Admin Data
 *
 * Provides hooks for fetching and mutating CV data with:
 * - Automatic caching
 * - Background refetching
 * - Optimistic updates
 * - Error handling
 *
 * @module hooks/useAdminData
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AdminDataService,
  AdminAPIError,
} from '@/services/admin/AdminDataService'
import { queryKeys } from '@/lib/queryClient'
import type { CVData } from '@/types'

/**
 * Hook to fetch complete CV data
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAdminData()
 * ```
 */
export function useAdminData() {
  return useQuery({
    queryKey: queryKeys.cv.data(),
    queryFn: () => AdminDataService.getData(),
  })
}

/**
 * Hook to fetch a specific section of CV data
 *
 * @param section - Section name to fetch
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useAdminSection('experience')
 * ```
 */
export function useAdminSection<K extends keyof CVData>(section: K) {
  return useQuery({
    queryKey: queryKeys.cv.section(section),
    queryFn: () => AdminDataService.getSection(section),
  })
}

/**
 * Hook to update CV data
 *
 * Provides mutation function with automatic cache invalidation
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useUpdateData()
 * mutate(newData, {
 *   onSuccess: () => toast.success('Saved!'),
 *   onError: (error) => toast.error(error.message),
 * })
 * ```
 */
export function useUpdateData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CVData) => AdminDataService.updateData(data),
    onSuccess: () => {
      // Invalidate all CV-related queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.cv.all })
    },
  })
}

/**
 * Hook to export CV data
 *
 * @example
 * ```tsx
 * const { mutate: exportData, isPending } = useExportData()
 * exportData('json', {
 *   onSuccess: (blob) => downloadBlob(blob, 'cv-data.json'),
 * })
 * ```
 */
export function useExportData() {
  return useMutation({
    mutationFn: (format: 'json' | 'yaml') =>
      AdminDataService.exportData(format),
  })
}

/**
 * Hook to import CV data
 *
 * @example
 * ```tsx
 * const { mutate: importData, isPending } = useImportData()
 * importData(file, {
 *   onSuccess: (data) => console.log('Imported:', data),
 * })
 * ```
 */
export function useImportData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => AdminDataService.importData(file),
    onSuccess: () => {
      // Invalidate all CV-related queries after import
      queryClient.invalidateQueries({ queryKey: queryKeys.cv.all })
    },
  })
}

/**
 * Hook to preview import data (validation only)
 *
 * @example
 * ```tsx
 * const { mutate: previewImport, data: preview } = usePreviewImport()
 * previewImport(file, {
 *   onSuccess: (data) => setPreviewData(data),
 * })
 * ```
 */
export function usePreviewImport() {
  return useMutation({
    mutationFn: (file: File) => AdminDataService.previewImport(file),
  })
}

/**
 * Type guard for AdminAPIError
 */
export function isAdminAPIError(error: unknown): error is AdminAPIError {
  return error instanceof AdminAPIError
}
