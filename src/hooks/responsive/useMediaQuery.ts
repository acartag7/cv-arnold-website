/**
 * useMediaQuery Hook
 * Generic media query detection with SSR support
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import type {
  UseMediaQueryResult,
  MediaQueryOptions,
} from '../../types/responsive'

/**
 * Hook for detecting media query matches
 *
 * @param query - Media query string (e.g., "(min-width: 768px)")
 * @param options - Configuration options
 * @returns Object with matches boolean and media string
 *
 * @example
 * ```tsx
 * const { matches } = useMediaQuery('(min-width: 768px)');
 * const { matches: isDesktop } = useMediaQuery('(min-width: 1024px)', {
 *   fallback: true,
 *   ssr: true
 * });
 * ```
 */
export function useMediaQuery(
  query: string,
  options: MediaQueryOptions = {}
): UseMediaQueryResult {
  const { fallback = false, ssr = true, defaultMatches = fallback } = options

  // Use defaultMatches for SSR, then update on client
  const [matches, setMatches] = useState<boolean>(ssr ? defaultMatches : false)
  const [isHydrated, setIsHydrated] = useState<boolean>(!ssr)
  const mediaQueryListRef = useRef<MediaQueryList | null>(null)
  const callbackRef = useRef<((e: MediaQueryListEvent) => void) | null>(null)

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') {
      return
    }

    // Create MediaQueryList
    const mediaQueryList = window.matchMedia(query)
    mediaQueryListRef.current = mediaQueryList

    // Update initial state
    setMatches(mediaQueryList.matches)
    setIsHydrated(true)

    // Create event handler
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    callbackRef.current = handleChange

    // Add listener - use both methods for compatibility
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(handleChange)
    }

    // Cleanup function
    return () => {
      if (mediaQueryListRef.current && callbackRef.current) {
        if (mediaQueryListRef.current.removeEventListener) {
          mediaQueryListRef.current.removeEventListener(
            'change',
            callbackRef.current
          )
        } else {
          // Fallback for older browsers
          mediaQueryListRef.current.removeListener(callbackRef.current)
        }
      }
      mediaQueryListRef.current = null
      callbackRef.current = null
    }
  }, [query])

  // Return SSR-safe values
  return {
    matches: isHydrated ? matches : defaultMatches,
    media: query,
  }
}

/**
 * Hook for detecting multiple media queries
 *
 * @param queries - Array of media query strings
 * @param options - Configuration options
 * @returns Array of UseMediaQueryResult objects
 *
 * @example
 * ```tsx
 * const [mobile, tablet, desktop] = useMediaQueries([
 *   '(max-width: 767px)',
 *   '(min-width: 768px) and (max-width: 1023px)',
 *   '(min-width: 1024px)'
 * ]);
 * ```
 */
export function useMediaQueries(
  queries: string[],
  options: MediaQueryOptions = {}
): UseMediaQueryResult[] {
  // We need to call hooks unconditionally, so we'll limit to a reasonable number
  const maxQueries = 10
  const paddedQueries = [...queries.slice(0, maxQueries)]

  // Add empty queries to maintain consistent hook calls
  while (paddedQueries.length < maxQueries) {
    paddedQueries.push('')
  }

  // Call hooks unconditionally
  const result0 = useMediaQuery(paddedQueries[0] || '(min-width: 0px)', options)
  const result1 = useMediaQuery(paddedQueries[1] || '(min-width: 0px)', options)
  const result2 = useMediaQuery(paddedQueries[2] || '(min-width: 0px)', options)
  const result3 = useMediaQuery(paddedQueries[3] || '(min-width: 0px)', options)
  const result4 = useMediaQuery(paddedQueries[4] || '(min-width: 0px)', options)
  const result5 = useMediaQuery(paddedQueries[5] || '(min-width: 0px)', options)
  const result6 = useMediaQuery(paddedQueries[6] || '(min-width: 0px)', options)
  const result7 = useMediaQuery(paddedQueries[7] || '(min-width: 0px)', options)
  const result8 = useMediaQuery(paddedQueries[8] || '(min-width: 0px)', options)
  const result9 = useMediaQuery(paddedQueries[9] || '(min-width: 0px)', options)

  const allResults = [
    result0,
    result1,
    result2,
    result3,
    result4,
    result5,
    result6,
    result7,
    result8,
    result9,
  ]

  // Return only the results for the actual queries
  return allResults.slice(0, queries.length)
}

/**
 * Hook for detecting media query with cleanup tracking
 * Useful for complex components that need to manage multiple queries
 *
 * @param query - Media query string
 * @param options - Configuration options
 * @returns Object with matches, media, and cleanup function
 */
export function useMediaQueryWithCleanup(
  query: string,
  options: MediaQueryOptions = {}
) {
  const result = useMediaQuery(query, options)
  const cleanupRef = useRef<(() => void) | null>(null)

  const cleanup = () => {
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  return {
    ...result,
    cleanup,
  }
}
