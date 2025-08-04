'use client'

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
import { useEffect, useState } from 'react'

interface CustomThemeProviderProps
  extends Omit<ThemeProviderProps, 'attribute' | 'themes'> {
  children: React.ReactNode
  enableTransitions?: boolean
}

/**
 * Custom ThemeProvider that wraps next-themes with our design system integration
 *
 * Features:
 * - Integrates with our data-theme attribute system
 * - Supports smooth transitions between themes
 * - Provides enhanced theme switching capabilities
 * - Maintains SSR compatibility
 */
export function ThemeProvider({
  children,
  enableTransitions = true,
  ...props
}: CustomThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Add transition class to document for smooth theme changes
  useEffect(() => {
    if (mounted && enableTransitions) {
      const handleThemeChange = () => {
        document.documentElement.classList.add('theme-transition')

        // Remove transition class after animation completes
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transition')
        }, 300) // Match CSS transition duration
      }

      // Listen for theme changes
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (
            mutation.type === 'attributes' &&
            mutation.attributeName === 'data-theme'
          ) {
            handleThemeChange()
          }
        })
      })

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      })

      return () => observer.disconnect()
    }
    return undefined
  }, [mounted, enableTransitions])

  if (!mounted) {
    return null
  }

  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      themes={['light', 'dark', 'high-contrast']}
      storageKey="cv-theme"
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
