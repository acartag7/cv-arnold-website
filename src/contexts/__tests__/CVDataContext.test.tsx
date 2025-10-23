/**
 * CVDataContext Tests
 *
 * Tests for React Context state management including:
 * - Provider and hooks
 * - State updates
 * - Actions (refresh, update, clear, reset)
 * - Optimistic updates
 * - Error handling
 * - Performance (re-render prevention)
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import {
  render,
  screen,
  waitFor,
  renderHook,
  act,
} from '@testing-library/react'
import React, { type ReactNode } from 'react'
import {
  CVDataProvider,
  useCVDataState,
  useCVDataActions,
  useCVData,
  useCVDataValue,
  useIsLoading,
  useIsUpdating,
  useCVDataError,
} from '../CVDataContext'
import type { CVData } from '@/types/cv'
import type { CVDataService } from '@/services/CVDataService'
import {
  CVDataNotFoundError,
  CVValidationError,
  CVStorageError,
} from '@/lib/errors'

// ============================================================================
// Mock Data
// ============================================================================

const mockCVData: CVData = {
  version: '1.0.0',
  lastUpdated: '2025-10-21',
  personalInfo: {
    fullName: 'Test User',
    title: 'Software Engineer',
    email: 'test@example.com',
    location: {
      city: 'Test City',
      country: 'Test Country',
      countryCode: 'TC',
    },
    summary: 'Test summary',
    availability: {
      status: 'available',
    },
    social: {},
  },
  experience: [],
  skills: [],
  education: [],
  certifications: [],
  achievements: [],
  languages: [],
}

// ============================================================================
// Mock Service
// ============================================================================

const createMockService = (): CVDataService =>
  ({
    getData: vi.fn().mockResolvedValue(mockCVData),
    updateData: vi.fn().mockResolvedValue(undefined),
    getSection: vi.fn(),
    updateSection: vi.fn(),
    deleteSection: vi.fn(),
    exists: vi.fn(),
    delete: vi.fn(),
  }) as unknown as CVDataService

// ============================================================================
// Test Wrapper
// ============================================================================

interface WrapperProps {
  children: ReactNode
  service: CVDataService
  autoFetch?: boolean
}

const Wrapper = ({ children, service, autoFetch = false }: WrapperProps) => (
  <CVDataProvider service={service} autoFetch={autoFetch}>
    {children}
  </CVDataProvider>
)

// ============================================================================
// Tests
// ============================================================================

describe('CVDataContext', () => {
  let mockService: CVDataService

  beforeEach(() => {
    mockService = createMockService()
    vi.clearAllMocks()
  })

  // ==========================================================================
  // Provider Tests
  // ==========================================================================

  describe('CVDataProvider', () => {
    it('should render children', () => {
      render(
        <CVDataProvider service={mockService} autoFetch={false}>
          <div>Test Child</div>
        </CVDataProvider>
      )

      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('should auto-fetch data on mount by default', async () => {
      render(
        <CVDataProvider service={mockService}>
          <div>Test</div>
        </CVDataProvider>
      )

      await waitFor(() => {
        expect(mockService.getData).toHaveBeenCalledTimes(1)
      })
    })

    it('should not auto-fetch when autoFetch is false', () => {
      render(
        <CVDataProvider service={mockService} autoFetch={false}>
          <div>Test</div>
        </CVDataProvider>
      )

      expect(mockService.getData).not.toHaveBeenCalled()
    })
  })

  // ==========================================================================
  // Hook Tests
  // ==========================================================================

  describe('Hooks', () => {
    it('should throw error when useCVDataState is used outside provider', () => {
      // Suppress console.error for this test
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useCVDataState())
      }).toThrow('useCVDataState must be used within CVDataProvider')

      spy.mockRestore()
    })

    it('should throw error when useCVDataActions is used outside provider', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useCVDataActions())
      }).toThrow('useCVDataActions must be used within CVDataProvider')

      spy.mockRestore()
    })

    it('should provide state via useCVDataState', async () => {
      const { result } = renderHook(() => useCVDataState(), {
        wrapper: ({ children }) => (
          <Wrapper service={mockService} autoFetch={true}>
            {children}
          </Wrapper>
        ),
      })

      await waitFor(() => {
        expect(result.current.data).toEqual(mockCVData)
        expect(result.current.loading).toBe('idle')
        expect(result.current.error).toBe(null)
        expect(result.current.lastFetchedAt).toBeTypeOf('number')
      })
    })

    it('should provide actions via useCVDataActions', () => {
      const { result } = renderHook(() => useCVDataActions(), {
        wrapper: ({ children }) => (
          <Wrapper service={mockService} autoFetch={false}>
            {children}
          </Wrapper>
        ),
      })

      expect(result.current).toHaveProperty('refresh')
      expect(result.current).toHaveProperty('updateData')
      expect(result.current).toHaveProperty('clearError')
      expect(result.current).toHaveProperty('reset')
    })

    it('should provide both state and actions via useCVData', async () => {
      const { result } = renderHook(() => useCVData(), {
        wrapper: ({ children }) => (
          <Wrapper service={mockService} autoFetch={true}>
            {children}
          </Wrapper>
        ),
      })

      await waitFor(() => {
        expect(result.current.state.data).toEqual(mockCVData)
      })

      expect(result.current.actions).toHaveProperty('refresh')
      expect(result.current.actions).toHaveProperty('updateData')
    })
  })

  // ==========================================================================
  // Selector Hook Tests
  // ==========================================================================

  describe('Selector Hooks', () => {
    it('should return data via useCVDataValue', async () => {
      const { result } = renderHook(() => useCVDataValue(), {
        wrapper: ({ children }) => (
          <Wrapper service={mockService} autoFetch={true}>
            {children}
          </Wrapper>
        ),
      })

      await waitFor(() => {
        expect(result.current).toEqual(mockCVData)
      })
    })

    it('should return loading state via useIsLoading', async () => {
      const { result } = renderHook(() => useIsLoading(), {
        wrapper: ({ children }) => (
          <Wrapper service={mockService} autoFetch={true}>
            {children}
          </Wrapper>
        ),
      })

      // Should be loading initially
      expect(result.current).toBe(true)

      // Should be false after data loads
      await waitFor(() => {
        expect(result.current).toBe(false)
      })
    })

    it('should return updating state via useIsUpdating', () => {
      const { result } = renderHook(() => useIsUpdating(), {
        wrapper: ({ children }) => (
          <Wrapper service={mockService} autoFetch={false}>
            {children}
          </Wrapper>
        ),
      })

      expect(result.current).toBe(false)
    })

    it('should return error via useCVDataError', () => {
      const { result } = renderHook(() => useCVDataError(), {
        wrapper: ({ children }) => (
          <Wrapper service={mockService} autoFetch={false}>
            {children}
          </Wrapper>
        ),
      })

      expect(result.current).toBe(null)
    })
  })

  // ==========================================================================
  // Action Tests
  // ==========================================================================

  describe('Actions', () => {
    it('should refresh data', async () => {
      const { result } = renderHook(() => useCVData(), {
        wrapper: ({ children }) => (
          <Wrapper service={mockService} autoFetch={false}>
            {children}
          </Wrapper>
        ),
      })

      await act(async () => {
        await result.current.actions.refresh()
      })

      expect(mockService.getData).toHaveBeenCalledTimes(1)
      expect(result.current.state.data).toEqual(mockCVData)
    })

    it('should update data optimistically', async () => {
      const updatedData = { ...mockCVData, version: '2.0.0' }

      const { result } = renderHook(() => useCVData(), {
        wrapper: ({ children }) => (
          <Wrapper service={mockService} autoFetch={true}>
            {children}
          </Wrapper>
        ),
      })

      // Wait for initial data
      await waitFor(() => {
        expect(result.current.state.data).toEqual(mockCVData)
      })

      // Update data
      await act(async () => {
        await result.current.actions.updateData(updatedData)
      })

      expect(mockService.updateData).toHaveBeenCalledWith(updatedData)
      expect(result.current.state.data).toEqual(updatedData)
    })

    it('should revert optimistic update on error', async () => {
      const service = createMockService()
      ;(service.updateData as Mock).mockRejectedValue(
        new Error('Update failed')
      )

      const updatedData = { ...mockCVData, version: '2.0.0' }

      const { result } = renderHook(() => useCVData(), {
        wrapper: ({ children }) => (
          <Wrapper service={service} autoFetch={true}>
            {children}
          </Wrapper>
        ),
      })

      await waitFor(() => {
        expect(result.current.state.data).toEqual(mockCVData)
      })

      await act(async () => {
        await result.current.actions.updateData(updatedData)
      })

      // Should revert to original data
      expect(result.current.state.data).toEqual(mockCVData)
      expect(result.current.state.error).toMatchObject({
        message: 'Update failed',
        code: 'UPDATE_ERROR',
      })
    })

    it('should handle rapid successive updates correctly', async () => {
      const { result } = renderHook(() => useCVData(), {
        wrapper: ({ children }) => (
          <Wrapper service={mockService} autoFetch={true}>
            {children}
          </Wrapper>
        ),
      })

      await waitFor(() => {
        expect(result.current.state.data).toEqual(mockCVData)
      })

      // Fire multiple updates rapidly
      const updates = [
        { ...mockCVData, version: '2.0.0' },
        { ...mockCVData, version: '3.0.0' },
        { ...mockCVData, version: '4.0.0' },
      ]

      await act(async () => {
        await Promise.all(
          updates.map(data => result.current.actions.updateData(data))
        )
      })

      // Last update should win
      expect(result.current.state.data?.version).toBe('4.0.0')
      // Verify all updates were called
      expect(mockService.updateData).toHaveBeenCalledTimes(3)
    })

    it('should clear error', async () => {
      const service = createMockService()
      ;(service.getData as Mock).mockRejectedValue(new Error('Fetch failed'))

      const { result } = renderHook(() => useCVData(), {
        wrapper: ({ children }) => (
          <Wrapper service={service} autoFetch={true}>
            {children}
          </Wrapper>
        ),
      })

      await waitFor(() => {
        expect(result.current.state.error).not.toBe(null)
      })

      act(() => {
        result.current.actions.clearError()
      })

      expect(result.current.state.error).toBe(null)
    })

    it('should reset to initial state', async () => {
      const { result } = renderHook(() => useCVData(), {
        wrapper: ({ children }) => (
          <Wrapper service={mockService} autoFetch={true}>
            {children}
          </Wrapper>
        ),
      })

      await waitFor(() => {
        expect(result.current.state.data).toEqual(mockCVData)
      })

      act(() => {
        result.current.actions.reset()
      })

      expect(result.current.state.data).toBe(null)
      expect(result.current.state.loading).toBe('idle')
      expect(result.current.state.error).toBe(null)
      expect(result.current.state.lastFetchedAt).toBe(null)
    })
  })

  // ==========================================================================
  // Error Handling Tests
  // ==========================================================================

  describe('Error Handling', () => {
    it('should handle CVDataNotFoundError', async () => {
      const service = createMockService()
      ;(service.getData as Mock).mockRejectedValue(
        new CVDataNotFoundError('Data not found')
      )

      const { result } = renderHook(() => useCVData(), {
        wrapper: ({ children }) => (
          <Wrapper service={service} autoFetch={true}>
            {children}
          </Wrapper>
        ),
      })

      await waitFor(() => {
        expect(result.current.state.error).toMatchObject({
          message: 'Data not found',
          code: 'NOT_FOUND',
        })
      })
    })

    it('should handle CVValidationError', async () => {
      const service = createMockService()
      ;(service.getData as Mock).mockRejectedValue(
        new CVValidationError('Validation failed')
      )

      const { result } = renderHook(() => useCVData(), {
        wrapper: ({ children }) => (
          <Wrapper service={service} autoFetch={true}>
            {children}
          </Wrapper>
        ),
      })

      await waitFor(() => {
        expect(result.current.state.error).toMatchObject({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
        })
      })
    })

    it('should handle CVStorageError', async () => {
      const service = createMockService()
      ;(service.getData as Mock).mockRejectedValue(
        new CVStorageError('Storage failed', 'read')
      )

      const { result } = renderHook(() => useCVData(), {
        wrapper: ({ children }) => (
          <Wrapper service={service} autoFetch={true}>
            {children}
          </Wrapper>
        ),
      })

      await waitFor(() => {
        expect(result.current.state.error).toMatchObject({
          message: 'Storage failed',
          code: 'STORAGE_ERROR',
        })
      })
    })

    it('should handle unknown errors', async () => {
      const service = createMockService()
      ;(service.getData as Mock).mockRejectedValue(new Error('Unknown error'))

      const { result } = renderHook(() => useCVData(), {
        wrapper: ({ children }) => (
          <Wrapper service={service} autoFetch={true}>
            {children}
          </Wrapper>
        ),
      })

      await waitFor(() => {
        expect(result.current.state.error).toMatchObject({
          message: 'Unknown error',
          code: 'UNKNOWN',
        })
      })
    })
  })

  // ==========================================================================
  // Loading State Tests
  // ==========================================================================

  describe('Loading States', () => {
    it('should set loading state during initial fetch', async () => {
      const { result } = renderHook(() => useCVData(), {
        wrapper: ({ children }) => (
          <Wrapper service={mockService} autoFetch={true}>
            {children}
          </Wrapper>
        ),
      })

      expect(result.current.state.loading).toBe('loading')

      await waitFor(() => {
        expect(result.current.state.loading).toBe('idle')
      })
    })

    it('should set refreshing state during refresh', async () => {
      // Use a delayed mock to capture intermediate state
      const delayedService = createMockService()
      ;(delayedService.getData as Mock).mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve(mockCVData), 10)
          })
      )

      const { result } = renderHook(() => useCVData(), {
        wrapper: ({ children }) => (
          <Wrapper service={delayedService} autoFetch={false}>
            {children}
          </Wrapper>
        ),
      })

      act(() => {
        result.current.actions.refresh()
      })

      // Check loading state immediately
      expect(result.current.state.loading).toBe('refreshing')

      // Wait for completion
      await waitFor(() => {
        expect(result.current.state.loading).toBe('idle')
      })
    })

    it('should set updating state during data update', async () => {
      // Use a delayed mock to capture intermediate state
      const delayedService = createMockService()
      ;(delayedService.updateData as Mock).mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve(undefined), 10)
          })
      )

      const { result } = renderHook(() => useCVData(), {
        wrapper: ({ children }) => (
          <Wrapper service={delayedService} autoFetch={true}>
            {children}
          </Wrapper>
        ),
      })

      await waitFor(() => {
        expect(result.current.state.data).toEqual(mockCVData)
      })

      act(() => {
        result.current.actions.updateData(mockCVData)
      })

      // Check loading state immediately
      expect(result.current.state.loading).toBe('updating')

      // Wait for completion
      await waitFor(() => {
        expect(result.current.state.loading).toBe('idle')
      })
    })
  })
})
