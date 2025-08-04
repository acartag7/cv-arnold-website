'use client'

import { useTheme as useNextTheme } from 'next-themes'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ThemeVariant } from '@/types/design-tokens'
import { getSystemTheme } from '@/types/design-tokens'
import { isValidTheme } from '@/utils/theme'

interface UseThemeReturn {
  /** Current active theme */
  theme: ThemeVariant | undefined
  /** Set theme function */
  setTheme: (theme: ThemeVariant | 'system') => void
  /** All available themes */
  themes: ThemeVariant[]
  /** Current system theme preference */
  systemTheme: 'light' | 'dark' | undefined
  /** Whether the theme is currently loading/hydrating */
  isLoading: boolean
  /** Whether the current theme matches system preference */
  isSystemTheme: boolean
  /** Resolved theme (never 'system', always actual theme) */
  resolvedTheme: ThemeVariant | undefined
  /** Force refresh theme detection */
  refreshTheme: () => void
  /** Toggle between light and dark themes */
  toggleTheme: () => void
  /** Check if a specific theme is currently active */
  isTheme: (themeToCheck: ThemeVariant) => boolean
}

/**
 * Enhanced theme hook that extends next-themes with our design system integration
 *
 * Features:
 * - Type-safe theme access with our ThemeVariant types
 * - System theme detection and preference handling
 * - Convenient theme switching utilities
 * - Loading states for SSR compatibility
 * - Theme validation and error handling
 *
 * @returns Enhanced theme state and controls
 */
export function useTheme(): UseThemeReturn {
  const {
    theme: nextTheme,
    setTheme: nextSetTheme,
    themes: nextThemes,
    resolvedTheme: nextResolvedTheme,
  } = useNextTheme()

  const [mounted, setMounted] = useState(false)
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark' | undefined>(
    undefined
  )

  // Track mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update system theme preference
  useEffect(() => {
    if (mounted) {
      const updateSystemTheme = () => {
        setSystemTheme(getSystemTheme())
      }

      updateSystemTheme()

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateSystemTheme)

      return () => mediaQuery.removeEventListener('change', updateSystemTheme)
    }
    return undefined
  }, [mounted])

  // Validate and convert theme values
  const theme = useMemo(() => {
    if (!mounted) return undefined
    return nextTheme as ThemeVariant | undefined
  }, [nextTheme, mounted])

  const resolvedTheme = useMemo(() => {
    if (!mounted) return undefined
    return nextResolvedTheme as ThemeVariant | undefined
  }, [nextResolvedTheme, mounted])

  const themes = useMemo(() => {
    return (nextThemes?.filter(t => t !== 'system') || [
      'light',
      'dark',
      'high-contrast',
    ]) as ThemeVariant[]
  }, [nextThemes])

  const isSystemTheme = useMemo(() => {
    return nextTheme === 'system'
  }, [nextTheme])

  const isLoading = useMemo(() => {
    return !mounted || theme === undefined
  }, [mounted, theme])

  // Enhanced setTheme with validation
  const setTheme = useCallback(
    (newTheme: ThemeVariant | 'system') => {
      if (!mounted) return

      // Validate theme value using centralized validation
      if (newTheme !== 'system' && !isValidTheme(newTheme)) {
        console.warn(`Invalid theme: ${newTheme}. Using 'light' as fallback.`)
        nextSetTheme('light')
        return
      }

      nextSetTheme(newTheme)
    },
    [nextSetTheme, mounted]
  )

  // Force refresh theme detection
  const refreshTheme = useCallback(() => {
    if (mounted && isSystemTheme) {
      setSystemTheme(getSystemTheme())
    }
  }, [mounted, isSystemTheme])

  // Toggle between light and dark themes
  const toggleTheme = useCallback(() => {
    if (!mounted || !resolvedTheme) return

    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }, [resolvedTheme, setTheme, mounted])

  // Check if a specific theme is currently active
  const isTheme = useCallback(
    (themeToCheck: ThemeVariant) => {
      return resolvedTheme === themeToCheck
    },
    [resolvedTheme]
  )

  return {
    theme,
    setTheme,
    themes,
    systemTheme,
    isLoading,
    isSystemTheme,
    resolvedTheme,
    refreshTheme,
    toggleTheme,
    isTheme,
  }
}
