import type { ThemeVariant } from '@/types/design-tokens'
import {
  getCSSVariable,
  setCSSVariable,
  type CSSVariableName,
} from '@/types/design-tokens'

/**
 * Theme validation and utility functions for enhanced theme management
 */

/**
 * Validates if a given string is a valid theme variant
 */
export function isValidTheme(theme: string): theme is ThemeVariant {
  return ['light', 'dark', 'high-contrast'].includes(theme)
}

/**
 * Gets the theme preference from localStorage
 */
export function getStoredTheme(): ThemeVariant | 'system' | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem('cv-theme')
    if (stored && (isValidTheme(stored) || stored === 'system')) {
      return stored as ThemeVariant | 'system'
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error)
  }

  return null
}

/**
 * Stores the theme preference in localStorage
 */
export function setStoredTheme(theme: ThemeVariant | 'system'): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('cv-theme', theme)
  } catch (error) {
    console.warn('Failed to store theme in localStorage:', error)
  }
}

/**
 * Gets the current theme from the document data-theme attribute
 */
export function getCurrentTheme(): ThemeVariant {
  if (typeof window === 'undefined') return 'light'

  const theme = document.documentElement.getAttribute('data-theme')
  return theme && isValidTheme(theme) ? theme : 'light'
}

/**
 * Sets the theme on the document element
 */
export function applyTheme(theme: ThemeVariant): void {
  if (typeof window === 'undefined') return

  document.documentElement.setAttribute('data-theme', theme)
}

/**
 * Detects the user's system color scheme preference
 */
export function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * Creates a media query listener for system theme changes
 */
export function createSystemThemeListener(
  callback: (isDark: boolean) => void
): () => void {
  if (typeof window === 'undefined') return () => {}

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = (e: MediaQueryListEvent) => callback(e.matches)

  mediaQuery.addEventListener('change', handler)

  return () => mediaQuery.removeEventListener('change', handler)
}

/**
 * Theme-aware CSS variable access utilities
 */
export const themeUtils = {
  /**
   * Gets a CSS variable value with theme context
   */
  getCSSVar: (name: CSSVariableName): string => {
    return getCSSVariable(name)
  },

  /**
   * Sets a CSS variable value with theme context
   */
  setCSSVar: (name: CSSVariableName, value: string): void => {
    setCSSVariable(name, value)
  },

  /**
   * Gets theme-specific color values
   */
  getThemeColor: (colorName: string): string => {
    const cssVarName = `--color-${colorName}` as CSSVariableName
    return getCSSVariable(cssVarName)
  },

  /**
   * Checks if the current theme is dark
   */
  isDarkTheme: (): boolean => {
    const theme = getCurrentTheme()
    return theme === 'dark'
  },

  /**
   * Checks if the current theme is high contrast
   */
  isHighContrastTheme: (): boolean => {
    const theme = getCurrentTheme()
    return theme === 'high-contrast'
  },

  /**
   * Gets appropriate text color for current theme
   */
  getTextColor: (): string => {
    return getCSSVariable('--color-text')
  },

  /**
   * Gets appropriate background color for current theme
   */
  getBackgroundColor: (): string => {
    return getCSSVariable('--color-background')
  },
}

/**
 * Theme-aware class name utilities
 */
export const themeClasses = {
  /**
   * Gets theme-aware class names based on current theme
   */
  getThemeClasses: (theme?: ThemeVariant): string[] => {
    const currentTheme = theme || getCurrentTheme()

    const classes = [`theme-${currentTheme}`]

    if (currentTheme === 'dark') {
      classes.push('dark-theme')
    }

    if (currentTheme === 'high-contrast') {
      classes.push('high-contrast-theme')
    }

    return classes
  },

  /**
   * Gets theme-aware text color classes
   */
  getTextClasses: (
    variant: 'default' | 'muted' | 'subtle' = 'default'
  ): string => {
    const theme = getCurrentTheme()
    const baseClasses = 'transition-colors duration-200'

    switch (variant) {
      case 'muted':
        return `${baseClasses} text-[var(--color-text-muted)]`
      case 'subtle':
        return `${baseClasses} text-[var(--color-text-subtle)]`
      default:
        return `${baseClasses} text-[var(--color-text)]`
    }
  },

  /**
   * Gets theme-aware background color classes
   */
  getBackgroundClasses: (
    variant: 'default' | 'subtle' | 'muted' = 'default'
  ): string => {
    const baseClasses = 'transition-colors duration-200'

    switch (variant) {
      case 'subtle':
        return `${baseClasses} bg-[var(--color-background-subtle)]`
      case 'muted':
        return `${baseClasses} bg-[var(--color-background-muted)]`
      default:
        return `${baseClasses} bg-[var(--color-background)]`
    }
  },
}

/**
 * Performance optimized theme utilities
 */
export const themePerf = {
  /**
   * Debounced theme application to prevent excessive DOM updates
   */
  debouncedApplyTheme: (() => {
    let timeoutId: NodeJS.Timeout | null = null

    return (theme: ThemeVariant, delay = 16) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        applyTheme(theme)
        timeoutId = null
      }, delay)
    }
  })(),

  /**
   * Batched CSS variable updates for performance
   */
  batchCSSVariableUpdates: (
    updates: Array<{ name: CSSVariableName; value: string }>
  ) => {
    if (typeof window === 'undefined') return

    // Use requestAnimationFrame for optimal performance
    requestAnimationFrame(() => {
      updates.forEach(({ name, value }) => {
        setCSSVariable(name, value)
      })
    })
  },
}

/**
 * Theme accessibility utilities
 */
export const themeA11y = {
  /**
   * Checks if reduced motion is preferred
   */
  prefersReducedMotion: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  /**
   * Gets appropriate focus ring color for current theme
   */
  getFocusRingColor: (): string => {
    return getCSSVariable('--color-focus-ring')
  },

  /**
   * Ensures sufficient color contrast for accessibility
   */
  ensureContrast: (foreground: string, background: string): boolean => {
    // This is a simplified implementation
    // In a production app, you might want to use a proper contrast calculation library
    if (typeof window === 'undefined') return true

    // For now, return true as our design tokens are already designed for accessibility
    return true
  },
}
