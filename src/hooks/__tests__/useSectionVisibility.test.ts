/**
 * Tests for useSectionVisibility hook
 *
 * Tests for the custom hook that manages section visibility toggles
 * across admin section editors.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useSectionVisibility } from '../useSectionVisibility'
import type { CVData } from '@/types'

// Mock useUpdateData hook
const mockMutate = vi.fn()
const mockUseUpdateData = vi.fn(() => ({
  mutate: mockMutate,
  isPending: false,
}))

// Mock useToast hook
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
const mockUseToast = vi.fn(() => ({
  success: mockToastSuccess,
  error: mockToastError,
}))

vi.mock('@/hooks/useAdminData', () => ({
  useUpdateData: () => mockUseUpdateData(),
}))

vi.mock('@/components/ui/ToastProvider', () => ({
  useToast: () => mockUseToast(),
}))

// Minimal mock CV data for testing
const createMockCVData = (siteConfig?: CVData['siteConfig']): CVData => {
  const baseData = {
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

  // Only include siteConfig if it's defined (for exactOptionalPropertyTypes)
  if (siteConfig !== undefined) {
    return { ...baseData, siteConfig }
  }
  return baseData
}

// Create a wrapper with QueryClientProvider
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
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

describe('useSectionVisibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseUpdateData.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })
  })

  describe('handleVisibilityChange', () => {
    it('does nothing when data is undefined', () => {
      const { result } = renderHook(
        () => useSectionVisibility({ data: undefined }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.handleVisibilityChange('experience', true)
      })

      expect(mockMutate).not.toHaveBeenCalled()
    })

    it('calls updateData with correct params when toggling visibility', () => {
      const mockData = createMockCVData({
        branding: '~/cv',
        version: 'v1.0.0',
      })

      const { result } = renderHook(
        () => useSectionVisibility({ data: mockData }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.handleVisibilityChange('experience', false)
      })

      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          siteConfig: expect.objectContaining({
            sectionVisibility: expect.objectContaining({
              experience: false,
            }),
          }),
        }),
        expect.any(Object)
      )
    })

    it('preserves existing siteConfig when updating visibility', () => {
      const mockData = createMockCVData({
        branding: '~/developer',
        version: 'v2.0.0',
        footerText: 'Custom footer',
      })

      const { result } = renderHook(
        () => useSectionVisibility({ data: mockData }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.handleVisibilityChange('skills', true)
      })

      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          siteConfig: expect.objectContaining({
            branding: '~/developer',
            version: 'v2.0.0',
            footerText: 'Custom footer',
            sectionVisibility: expect.objectContaining({
              skills: true,
            }),
          }),
        }),
        expect.any(Object)
      )
    })

    it('provides default siteConfig when none exists', () => {
      const mockData = createMockCVData(undefined)

      const { result } = renderHook(
        () => useSectionVisibility({ data: mockData }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.handleVisibilityChange('certifications', false)
      })

      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          siteConfig: expect.objectContaining({
            branding: '~/cv',
            version: 'v1.0.0',
            sectionVisibility: expect.objectContaining({
              certifications: false,
            }),
          }),
        }),
        expect.any(Object)
      )
    })

    it('preserves existing sectionVisibility settings', () => {
      const mockData = createMockCVData({
        branding: '~/cv',
        version: 'v1.0.0',
        sectionVisibility: {
          experience: false,
          skills: true,
        },
      })

      const { result } = renderHook(
        () => useSectionVisibility({ data: mockData }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.handleVisibilityChange('education', true)
      })

      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          siteConfig: expect.objectContaining({
            sectionVisibility: expect.objectContaining({
              experience: false,
              skills: true,
              education: true,
            }),
          }),
        }),
        expect.any(Object)
      )
    })

    it('calls success callback on successful update', () => {
      const mockData = createMockCVData()
      mockMutate.mockImplementation((_, options) => {
        options?.onSuccess?.()
      })

      const { result } = renderHook(
        () => useSectionVisibility({ data: mockData }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.handleVisibilityChange('experience', true)
      })

      expect(mockToastSuccess).toHaveBeenCalledWith(
        'Section is now visible on public site'
      )
    })

    it('shows hidden message when visibility is turned off', () => {
      const mockData = createMockCVData()
      mockMutate.mockImplementation((_, options) => {
        options?.onSuccess?.()
      })

      const { result } = renderHook(
        () => useSectionVisibility({ data: mockData }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.handleVisibilityChange('experience', false)
      })

      expect(mockToastSuccess).toHaveBeenCalledWith(
        'Section is now hidden from public site'
      )
    })

    it('calls error callback on failed update', () => {
      const mockData = createMockCVData()
      const testError = new Error('Update failed')
      mockMutate.mockImplementation((_, options) => {
        options?.onError?.(testError)
      })

      const { result } = renderHook(
        () => useSectionVisibility({ data: mockData }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.handleVisibilityChange('experience', true)
      })

      expect(mockToastError).toHaveBeenCalledWith('Update failed')
    })

    it('shows generic error message for non-Error objects', () => {
      const mockData = createMockCVData()
      mockMutate.mockImplementation((_, options) => {
        options?.onError?.('unknown error')
      })

      const { result } = renderHook(
        () => useSectionVisibility({ data: mockData }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.handleVisibilityChange('experience', true)
      })

      expect(mockToastError).toHaveBeenCalledWith('Failed to update visibility')
    })
  })

  describe('isSaving state', () => {
    it('returns false when not saving', () => {
      const { result } = renderHook(
        () => useSectionVisibility({ data: createMockCVData() }),
        { wrapper: createWrapper() }
      )

      expect(result.current.isSaving).toBe(false)
    })

    it('returns true when mutation is pending', () => {
      mockUseUpdateData.mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      })

      const { result } = renderHook(
        () => useSectionVisibility({ data: createMockCVData() }),
        { wrapper: createWrapper() }
      )

      expect(result.current.isSaving).toBe(true)
    })
  })
})
