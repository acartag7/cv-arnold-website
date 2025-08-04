/**
 * useBreakpoint Hook
 * Current breakpoint detection with comprehensive breakpoint utilities
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  getCurrentBreakpoint,
  isAboveBreakpoint,
  isBelowBreakpoint,
  isBetweenBreakpoints,
  isOnlyBreakpoint,
  getWindowWidth,
} from '../../utils/breakpoints'
import type { BreakpointKey, UseBreakpointResult } from '../../types/responsive'
import { BREAKPOINT_KEYS } from '../../types/responsive'

/**
 * Hook for detecting current breakpoint and providing breakpoint utilities
 *
 * @returns Object with current breakpoint and utility functions
 *
 * @example
 * ```tsx
 * const { current, isAbove, isBelow, isBetween, isOnly } = useBreakpoint();
 *
 * // Current breakpoint
 * console.log(current); // 'md' | 'lg' | null
 *
 * // Utility functions
 * const isDesktop = isAbove('md');
 * const isMobile = isBelow('md');
 * const isTablet = isBetween('sm', 'lg');
 * const isExactlyLarge = isOnly('lg');
 * ```
 */
export function useBreakpoint(): UseBreakpointResult {
  const [current, setCurrent] = useState<BreakpointKey | null>(() => {
    // SSR-safe initialization
    if (typeof window === 'undefined') {
      return null // Mobile-first default
    }
    return getCurrentBreakpoint(getWindowWidth())
  })

  const [isHydrated, setIsHydrated] = useState<boolean>(
    typeof window !== 'undefined'
  )
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced resize handler to prevent excessive updates
  const handleResize = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const width = getWindowWidth()
      const newBreakpoint = getCurrentBreakpoint(width)

      setCurrent(prevCurrent => {
        // Only update if breakpoint actually changed
        return prevCurrent !== newBreakpoint ? newBreakpoint : prevCurrent
      })
    }, 16) // ~60fps debouncing
  }, [])

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') {
      return
    }

    // Set initial state and mark as hydrated
    const initialWidth = getWindowWidth()
    const initialBreakpoint = getCurrentBreakpoint(initialWidth)
    setCurrent(initialBreakpoint)
    setIsHydrated(true)

    // Use ResizeObserver for better performance if available
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserverRef.current = new ResizeObserver(handleResize)
      resizeObserverRef.current.observe(document.body)
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', handleResize, { passive: true })
    }

    // Cleanup function
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      } else {
        window.removeEventListener('resize', handleResize)
      }

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
        debounceTimeoutRef.current = null
      }
    }
  }, [handleResize])

  // Utility functions with current width caching
  const getCurrentWidth = useCallback(() => getWindowWidth(), [])

  const isAbove = useCallback(
    (breakpoint: BreakpointKey): boolean => {
      if (!isHydrated) {
        return false // Mobile-first SSR default
      }
      return isAboveBreakpoint(getCurrentWidth(), breakpoint)
    },
    [isHydrated, getCurrentWidth]
  )

  const isBelow = useCallback(
    (breakpoint: BreakpointKey): boolean => {
      if (!isHydrated) {
        return true // Mobile-first SSR default
      }
      return isBelowBreakpoint(getCurrentWidth(), breakpoint)
    },
    [isHydrated, getCurrentWidth]
  )

  const isBetween = useCallback(
    (min: BreakpointKey, max: BreakpointKey): boolean => {
      if (!isHydrated) {
        return false // Conservative SSR default
      }
      return isBetweenBreakpoints(getCurrentWidth(), min, max)
    },
    [isHydrated, getCurrentWidth]
  )

  const isOnly = useCallback(
    (breakpoint: BreakpointKey): boolean => {
      if (!isHydrated) {
        return false // Conservative SSR default
      }
      return isOnlyBreakpoint(getCurrentWidth(), breakpoint)
    },
    [isHydrated, getCurrentWidth]
  )

  return {
    current: isHydrated ? current : null,
    isAbove,
    isBelow,
    isBetween,
    isOnly,
  }
}

/**
 * Hook for detecting specific breakpoint matches
 * More performant when you only need to check specific breakpoints
 *
 * @param breakpoints - Array of breakpoints to check
 * @returns Object with boolean flags for each breakpoint
 *
 * @example
 * ```tsx
 * const { sm, md, lg } = useBreakpointMatches(['sm', 'md', 'lg']);
 *
 * if (lg) {
 *   // Desktop layout
 * } else if (md) {
 *   // Tablet layout
 * } else {
 *   // Mobile layout
 * }
 * ```
 */
export function useBreakpointMatches(
  breakpoints: BreakpointKey[] = BREAKPOINT_KEYS
): Record<BreakpointKey, boolean> {
  const [matches, setMatches] = useState<Record<BreakpointKey, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    breakpoints.forEach(bp => {
      initial[bp] = false // SSR-safe default
    })
    return initial as Record<BreakpointKey, boolean>
  })

  const [isHydrated, setIsHydrated] = useState<boolean>(
    typeof window !== 'undefined'
  )
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const updateMatches = useCallback(() => {
    if (typeof window === 'undefined') return

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const width = getWindowWidth()
      const newMatches: Record<string, boolean> = {}

      breakpoints.forEach(bp => {
        newMatches[bp] = isAboveBreakpoint(width, bp)
      })

      setMatches(prev => {
        // Only update if matches actually changed
        const hasChanged = breakpoints.some(bp => prev[bp] !== newMatches[bp])
        return hasChanged
          ? (newMatches as Record<BreakpointKey, boolean>)
          : prev
      })
    }, 16)
  }, [breakpoints])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Initial update and hydration
    updateMatches()
    setIsHydrated(true)

    // Set up resize listener
    window.addEventListener('resize', updateMatches, { passive: true })

    return () => {
      window.removeEventListener('resize', updateMatches)
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [updateMatches])

  return isHydrated
    ? matches
    : breakpoints.reduce(
        (acc, bp) => {
          acc[bp] = false
          return acc
        },
        {} as Record<BreakpointKey, boolean>
      )
}

/**
 * Hook for getting the previous breakpoint value
 * Useful for detecting breakpoint changes and animations
 *
 * @returns Object with current and previous breakpoint
 */
export function useBreakpointChange(): {
  current: BreakpointKey | null
  previous: BreakpointKey | null
  hasChanged: boolean
} {
  const { current } = useBreakpoint()
  const [previous, setPrevious] = useState<BreakpointKey | null>(null)
  const [hasChanged, setHasChanged] = useState<boolean>(false)

  useEffect(() => {
    if (current !== previous) {
      setPrevious(current)
      setHasChanged(true)

      // Reset hasChanged flag after a short delay
      const timeout = setTimeout(() => {
        setHasChanged(false)
      }, 100)

      return () => clearTimeout(timeout)
    }

    // Return undefined explicitly for the else case
    return undefined
  }, [current, previous])

  return {
    current,
    previous,
    hasChanged,
  }
}
