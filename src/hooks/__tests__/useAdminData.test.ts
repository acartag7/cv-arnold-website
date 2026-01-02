/**
 * Tests for useAdminData React Query hooks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useAdminData,
  useAdminSection,
  useUpdateData,
  useExportData,
  useImportData,
  usePreviewImport,
  isAdminAPIError,
} from '../useAdminData'
import {
  AdminDataService,
  AdminAPIError,
} from '@/services/admin/AdminDataService'
import type { CVData } from '@/types'

// Mock the AdminDataService
vi.mock('@/services/admin/AdminDataService', () => ({
  AdminDataService: {
    getData: vi.fn(),
    getSection: vi.fn(),
    updateData: vi.fn(),
    exportData: vi.fn(),
    importData: vi.fn(),
    previewImport: vi.fn(),
  },
  AdminAPIError: class AdminAPIError extends Error {
    constructor(
      message: string,
      public readonly status: number,
      public readonly code?: string
    ) {
      super(message)
      this.name = 'AdminAPIError'
    }
  },
}))

// Mock CV data for testing
const mockCVData: CVData = {
  version: '1.0.0',
  lastUpdated: '2025-01-15',
  personalInfo: {
    fullName: 'Test User',
    title: 'Software Engineer',
    email: 'test@example.com',
    location: { city: 'SF', country: 'US', countryCode: 'US' },
    social: {},
    summary: 'Test summary',
    availability: { status: 'open_to_opportunities' },
  },
  experience: [],
  skills: [],
  education: [],
  certifications: [],
  achievements: [],
  languages: [],
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

describe('useAdminData', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('useAdminData hook', () => {
    it('should fetch CV data successfully', async () => {
      vi.mocked(AdminDataService.getData).mockResolvedValueOnce(mockCVData)

      const { result } = renderHook(() => useAdminData(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockCVData)
      expect(AdminDataService.getData).toHaveBeenCalledTimes(1)
    })

    it('should handle fetch error', async () => {
      const error = new Error('Fetch failed')
      vi.mocked(AdminDataService.getData).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useAdminData(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })
  })

  describe('useAdminSection hook', () => {
    it('should fetch a specific section', async () => {
      // Mock return value for the experience section
      const mockExperience = mockCVData.experience
      vi.mocked(AdminDataService.getSection).mockResolvedValueOnce(
        mockExperience as Awaited<
          ReturnType<typeof AdminDataService.getSection>
        >
      )

      const { result } = renderHook(() => useAdminSection('experience'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockExperience)
      expect(AdminDataService.getSection).toHaveBeenCalledWith('experience')
    })
  })

  describe('useUpdateData hook', () => {
    it('should update CV data', async () => {
      vi.mocked(AdminDataService.updateData).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useUpdateData(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(mockCVData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(AdminDataService.updateData).toHaveBeenCalledWith(mockCVData)
    })

    it('should handle update error', async () => {
      const error = new Error('Update failed')
      vi.mocked(AdminDataService.updateData).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useUpdateData(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(mockCVData)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })
  })

  describe('useExportData hook', () => {
    it('should export data as JSON', async () => {
      const mockBlob = new Blob(['{}'], { type: 'application/json' })
      vi.mocked(AdminDataService.exportData).mockResolvedValueOnce(mockBlob)

      const { result } = renderHook(() => useExportData(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('json')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockBlob)
      expect(AdminDataService.exportData).toHaveBeenCalledWith('json')
    })

    it('should export data as YAML', async () => {
      const mockBlob = new Blob(['version: 1.0.0'], {
        type: 'application/x-yaml',
      })
      vi.mocked(AdminDataService.exportData).mockResolvedValueOnce(mockBlob)

      const { result } = renderHook(() => useExportData(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('yaml')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(AdminDataService.exportData).toHaveBeenCalledWith('yaml')
    })
  })

  describe('useImportData hook', () => {
    it('should import data from file', async () => {
      const mockResult = {
        message: 'Imported',
        format: 'json' as const,
        version: '1.0.0',
      }
      vi.mocked(AdminDataService.importData).mockResolvedValueOnce(mockResult)

      const file = new File([JSON.stringify(mockCVData)], 'cv.json', {
        type: 'application/json',
      })

      const { result } = renderHook(() => useImportData(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(file)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResult)
      expect(AdminDataService.importData).toHaveBeenCalledWith(file)
    })
  })

  describe('usePreviewImport hook', () => {
    it('should preview import without saving', async () => {
      const mockResult = {
        message: 'Validation successful',
        preview: true,
        format: 'json' as const,
        version: '1.0.0',
        sections: {
          personalInfo: true,
          experience: 0,
          skills: 0,
          education: 0,
          certifications: 0,
          languages: 0,
        },
      }
      vi.mocked(AdminDataService.previewImport).mockResolvedValueOnce(
        mockResult
      )

      const file = new File([JSON.stringify(mockCVData)], 'cv.json', {
        type: 'application/json',
      })

      const { result } = renderHook(() => usePreviewImport(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(file)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResult)
      expect(AdminDataService.previewImport).toHaveBeenCalledWith(file)
    })
  })

  describe('isAdminAPIError', () => {
    it('should return true for AdminAPIError instances', () => {
      const error = new AdminAPIError('Test error', 500, 'TEST')
      expect(isAdminAPIError(error)).toBe(true)
    })

    it('should return false for regular Error instances', () => {
      const error = new Error('Regular error')
      expect(isAdminAPIError(error)).toBe(false)
    })

    it('should return false for non-Error values', () => {
      expect(isAdminAPIError('string')).toBe(false)
      expect(isAdminAPIError(null)).toBe(false)
      expect(isAdminAPIError(undefined)).toBe(false)
      expect(isAdminAPIError({})).toBe(false)
    })
  })
})
