import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useTheme } from '../useTheme'

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}))

// Mock design tokens
vi.mock('@/types/design-tokens', () => ({
  getSystemTheme: vi.fn(() => 'dark'),
}))

// Mock theme utils
vi.mock('@/utils/theme', () => ({
  isValidTheme: vi.fn((theme: string) =>
    ['light', 'dark', 'high-contrast'].includes(theme)
  ),
}))

import { useTheme as useNextTheme } from 'next-themes'
import { getSystemTheme } from '@/types/design-tokens'

describe('useTheme', () => {
  let mockSetTheme: ReturnType<typeof vi.fn>
  let mockMediaQueryList: {
    matches: boolean
    addEventListener: ReturnType<typeof vi.fn>
    removeEventListener: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockSetTheme = vi.fn()
    mockMediaQueryList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    // Mock window.matchMedia
    global.window.matchMedia = vi.fn(
      () => mockMediaQueryList as unknown as MediaQueryList
    )

    // Default next-themes mock
    vi.mocked(useNextTheme).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      themes: ['light', 'dark', 'high-contrast', 'system'],
      resolvedTheme: 'light',
      systemTheme: undefined,
      forcedTheme: undefined,
    })

    vi.mocked(getSystemTheme).mockReturnValue('dark')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should start with mounted state in tests', () => {
      const { result } = renderHook(() => useTheme())

      // In test environment, hooks mount synchronously
      expect(result.current.isLoading).toBe(false)
      expect(result.current.theme).toBe('light')
    })

    it('should return theme after mounting', async () => {
      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.theme).toBe('light')
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.resolvedTheme).toBe('light')
    })

    it('should return available themes', async () => {
      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.themes).toEqual([
          'light',
          'dark',
          'high-contrast',
        ])
      })
    })

    it('should filter out system from themes list', async () => {
      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.themes).not.toContain('system')
      })
    })
  })

  describe('System Theme Detection', () => {
    it('should detect system theme on mount', async () => {
      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.systemTheme).toBe('dark')
      })

      expect(getSystemTheme).toHaveBeenCalled()
    })

    it('should listen for system theme changes', async () => {
      renderHook(() => useTheme())

      await waitFor(() => {
        expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith(
          'change',
          expect.any(Function)
        )
      })
    })

    it('should update system theme when media query changes', async () => {
      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.systemTheme).toBe('dark')
      })

      // Change system theme
      vi.mocked(getSystemTheme).mockReturnValue('light')

      // Trigger media query change
      const changeHandler =
        mockMediaQueryList.addEventListener.mock.calls[0]?.[1]
      act(() => {
        changeHandler?.()
      })

      await waitFor(() => {
        expect(result.current.systemTheme).toBe('light')
      })
    })

    it('should clean up media query listener on unmount', async () => {
      const { unmount } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(mockMediaQueryList.addEventListener).toHaveBeenCalled()
      })

      unmount()

      expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      )
    })
  })

  describe('isSystemTheme', () => {
    it('should return true when theme is system', async () => {
      vi.mocked(useNextTheme).mockReturnValue({
        theme: 'system',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
        resolvedTheme: 'dark',
        systemTheme: 'dark',
        forcedTheme: undefined,
      })

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isSystemTheme).toBe(true)
      })
    })

    it('should return false when theme is not system', async () => {
      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isSystemTheme).toBe(false)
      })
    })
  })

  describe('setTheme', () => {
    it('should set theme when mounted', async () => {
      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setTheme('dark')
      })

      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('should always allow setting theme in test environment', async () => {
      const { result } = renderHook(() => useTheme())

      // In test environment, hooks mount synchronously
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setTheme('dark')
      })

      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('should allow setting system theme', async () => {
      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setTheme('system')
      })

      expect(mockSetTheme).toHaveBeenCalledWith('system')
    })

    it('should validate theme and use fallback for invalid theme', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {})

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result.current.setTheme('invalid-theme' as any)
      })

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid theme: invalid-theme')
      )
      expect(mockSetTheme).toHaveBeenCalledWith('light')

      consoleWarnSpy.mockRestore()
    })
  })

  describe('toggleTheme', () => {
    it('should toggle from light to dark', async () => {
      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.resolvedTheme).toBe('light')
      })

      act(() => {
        result.current.toggleTheme()
      })

      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('should toggle from dark to light', async () => {
      vi.mocked(useNextTheme).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        themes: ['light', 'dark'],
        resolvedTheme: 'dark',
        systemTheme: undefined,
        forcedTheme: undefined,
      })

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.resolvedTheme).toBe('dark')
      })

      act(() => {
        result.current.toggleTheme()
      })

      expect(mockSetTheme).toHaveBeenCalledWith('light')
    })

    it('should always allow toggle in test environment', async () => {
      const { result } = renderHook(() => useTheme())

      // In test environment, hooks mount synchronously
      await waitFor(() => {
        expect(result.current.resolvedTheme).toBe('light')
      })

      act(() => {
        result.current.toggleTheme()
      })

      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('should not toggle if resolvedTheme is undefined', async () => {
      vi.mocked(useNextTheme).mockReturnValue({
        theme: undefined,
        setTheme: mockSetTheme,
        themes: ['light', 'dark'],
        resolvedTheme: undefined,
        systemTheme: undefined,
        forcedTheme: undefined,
      })

      const { result } = renderHook(() => useTheme())

      // Wait for mount
      await waitFor(() => {
        expect(result.current.theme).toBeUndefined()
      })

      // isLoading should be true when theme is undefined
      expect(result.current.isLoading).toBe(true)

      act(() => {
        result.current.toggleTheme()
      })

      expect(mockSetTheme).not.toHaveBeenCalled()
    })
  })

  describe('isTheme', () => {
    it('should return true for current theme', async () => {
      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isTheme('light')).toBe(true)
      })
    })

    it('should return false for non-current theme', async () => {
      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isTheme('dark')).toBe(false)
      })
    })

    it('should work with high-contrast theme', async () => {
      vi.mocked(useNextTheme).mockReturnValue({
        theme: 'high-contrast',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'high-contrast'],
        resolvedTheme: 'high-contrast',
        systemTheme: undefined,
        forcedTheme: undefined,
      })

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isTheme('high-contrast')).toBe(true)
        expect(result.current.isTheme('light')).toBe(false)
        expect(result.current.isTheme('dark')).toBe(false)
      })
    })
  })

  describe('refreshTheme', () => {
    it('should refresh system theme when on system theme', async () => {
      vi.mocked(useNextTheme).mockReturnValue({
        theme: 'system',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
        resolvedTheme: 'dark',
        systemTheme: 'dark',
        forcedTheme: undefined,
      })

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isSystemTheme).toBe(true)
      })

      vi.clearAllMocks()
      vi.mocked(getSystemTheme).mockReturnValue('light')

      act(() => {
        result.current.refreshTheme()
      })

      await waitFor(() => {
        expect(getSystemTheme).toHaveBeenCalled()
        expect(result.current.systemTheme).toBe('light')
      })
    })

    it('should not refresh when not on system theme', async () => {
      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      vi.clearAllMocks()

      act(() => {
        result.current.refreshTheme()
      })

      expect(getSystemTheme).not.toHaveBeenCalled()
    })
  })

  describe('isLoading', () => {
    it('should be false after mounting in test environment', () => {
      const { result } = renderHook(() => useTheme())

      // In test environment, hooks mount synchronously
      expect(result.current.isLoading).toBe(false)
    })

    it('should be false after mounting', async () => {
      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should be true when theme is undefined', async () => {
      vi.mocked(useNextTheme).mockReturnValue({
        theme: undefined,
        setTheme: mockSetTheme,
        themes: ['light', 'dark'],
        resolvedTheme: undefined,
        systemTheme: undefined,
        forcedTheme: undefined,
      })

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        // Even after mounting, if theme is undefined, loading should be true
        expect(result.current.isLoading).toBe(true)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing themes from next-themes', async () => {
      vi.mocked(useNextTheme).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: [] as string[], // Empty array instead of undefined
        resolvedTheme: 'light',
        systemTheme: undefined,
        forcedTheme: undefined,
      })

      const { result } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.themes).toEqual([
          'light',
          'dark',
          'high-contrast',
        ])
      })
    })

    it('should memoize themes list', async () => {
      const { result, rerender } = renderHook(() => useTheme())

      await waitFor(() => {
        expect(result.current.themes).toEqual([
          'light',
          'dark',
          'high-contrast',
        ])
      })

      const firstThemesReference = result.current.themes

      rerender()

      expect(result.current.themes).toBe(firstThemesReference)
    })
  })
})
