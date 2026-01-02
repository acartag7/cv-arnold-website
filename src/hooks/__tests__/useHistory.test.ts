/**
 * Tests for useHistory React Query hooks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useHistoryList,
  useSnapshot,
  useCreateSnapshot,
  useDeleteSnapshot,
  isHistoryAPIError,
} from '../useHistory'
import {
  HistoryService,
  HistoryAPIError,
} from '@/services/admin/HistoryService'

// Mock the HistoryService
vi.mock('@/services/admin/HistoryService', () => ({
  HistoryService: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  HistoryAPIError: class HistoryAPIError extends Error {
    constructor(
      message: string,
      public readonly status: number,
      public readonly code?: string
    ) {
      super(message)
      this.name = 'HistoryAPIError'
    }
  },
}))

// Mock snapshot data
const mockSnapshotMetadata = {
  id: 'snap123',
  timestamp: '2025-01-15T10:00:00Z',
  description: 'Test snapshot',
  createdBy: 'test@example.com',
  size: 1024,
  version: '1.0.0',
}

// Mock CV data for full snapshot
const mockCVData = {
  version: '1.0.0',
  lastUpdated: '2025-01-15',
  personalInfo: {
    fullName: 'Test User',
    title: 'Software Engineer',
    email: 'test@example.com',
    location: { city: 'SF', country: 'US', countryCode: 'US' },
    social: {},
    summary: 'Test summary',
    availability: { status: 'open_to_opportunities' as const },
  },
  experience: [],
  skills: [],
  education: [],
  certifications: [],
  achievements: [],
  languages: [],
}

const mockSnapshot = {
  ...mockSnapshotMetadata,
  data: mockCVData,
}

const mockListResponse = {
  snapshots: [mockSnapshotMetadata],
  total: 1,
  limit: 20,
  offset: 0,
}

// Create a wrapper with QueryClientProvider
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    )
  }
}

describe('useHistory', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('useHistoryList hook', () => {
    it('should fetch history list with default options', async () => {
      vi.mocked(HistoryService.list).mockResolvedValueOnce(mockListResponse)

      const { result } = renderHook(() => useHistoryList(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockListResponse)
      expect(HistoryService.list).toHaveBeenCalledWith(undefined)
    })

    it('should fetch history list with pagination options', async () => {
      vi.mocked(HistoryService.list).mockResolvedValueOnce({
        ...mockListResponse,
        limit: 5,
        offset: 10,
      })

      const { result } = renderHook(
        () => useHistoryList({ limit: 5, offset: 10 }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(HistoryService.list).toHaveBeenCalledWith({ limit: 5, offset: 10 })
    })

    it('should handle fetch error', async () => {
      const error = new Error('Fetch failed')
      vi.mocked(HistoryService.list).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useHistoryList(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })
  })

  describe('useSnapshot hook', () => {
    it('should fetch a specific snapshot', async () => {
      vi.mocked(HistoryService.get).mockResolvedValueOnce(mockSnapshot)

      const { result } = renderHook(() => useSnapshot('snap123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockSnapshot)
      expect(HistoryService.get).toHaveBeenCalledWith('snap123')
    })

    it('should not fetch when id is empty', async () => {
      const { result } = renderHook(() => useSnapshot(''), {
        wrapper: createWrapper(),
      })

      // Query should not be enabled
      expect(result.current.isLoading).toBe(false)
      expect(result.current.fetchStatus).toBe('idle')
      expect(HistoryService.get).not.toHaveBeenCalled()
    })

    it('should handle 404 error', async () => {
      const error = new HistoryAPIError('Snapshot not found', 404)
      vi.mocked(HistoryService.get).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useSnapshot('nonexistent'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })
  })

  describe('useCreateSnapshot hook', () => {
    it('should create a snapshot without description', async () => {
      vi.mocked(HistoryService.create).mockResolvedValueOnce(
        mockSnapshotMetadata
      )

      const { result } = renderHook(() => useCreateSnapshot(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(undefined)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockSnapshotMetadata)
      expect(HistoryService.create).toHaveBeenCalledWith(undefined)
    })

    it('should create a snapshot with description', async () => {
      const snapshotWithDesc = {
        ...mockSnapshotMetadata,
        description: 'Before update',
      }
      vi.mocked(HistoryService.create).mockResolvedValueOnce(snapshotWithDesc)

      const { result } = renderHook(() => useCreateSnapshot(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ description: 'Before update' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(HistoryService.create).toHaveBeenCalledWith({
        description: 'Before update',
      })
    })

    it('should handle creation error', async () => {
      const error = new Error('Creation failed')
      vi.mocked(HistoryService.create).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useCreateSnapshot(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(undefined)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })
  })

  describe('useDeleteSnapshot hook', () => {
    it('should delete a snapshot', async () => {
      vi.mocked(HistoryService.delete).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useDeleteSnapshot(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('snap123')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(HistoryService.delete).toHaveBeenCalledWith('snap123')
    })

    it('should handle deletion error', async () => {
      const error = new HistoryAPIError('Snapshot not found', 404)
      vi.mocked(HistoryService.delete).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useDeleteSnapshot(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('nonexistent')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })
  })

  describe('isHistoryAPIError', () => {
    it('should return true for HistoryAPIError instances', () => {
      const error = new HistoryAPIError('Test error', 500, 'TEST')
      expect(isHistoryAPIError(error)).toBe(true)
    })

    it('should return false for regular Error instances', () => {
      const error = new Error('Regular error')
      expect(isHistoryAPIError(error)).toBe(false)
    })

    it('should return false for non-Error values', () => {
      expect(isHistoryAPIError('string')).toBe(false)
      expect(isHistoryAPIError(null)).toBe(false)
      expect(isHistoryAPIError(undefined)).toBe(false)
      expect(isHistoryAPIError({})).toBe(false)
    })
  })
})
