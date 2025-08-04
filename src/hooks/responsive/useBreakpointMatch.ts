/**
 * useBreakpointMatch Hook
 * Multiple breakpoint matching with advanced query support
 */

'use client'

import { useMemo } from 'react'
import { useMediaQuery, useMediaQueries } from './useMediaQuery'
import { getMediaQuery, getMediaQueryBetween } from '../../utils/breakpoints'
import type { BreakpointKey, MediaQueryOptions } from '../../types/responsive'

/**
 * Hook for matching specific breakpoint conditions
 *
 * @param breakpoint - Breakpoint to match
 * @param direction - Direction of match ('up', 'down', 'only')
 * @param options - Configuration options
 * @returns Match result object
 *
 * @example
 * ```tsx
 * // Match medium and above
 * const { matches: isTabletUp } = useBreakpointMatch('md', 'up');
 *
 * // Match only large screens
 * const { matches: isDesktop } = useBreakpointMatch('lg', 'only');
 *
 * // Match below medium (mobile)
 * const { matches: isMobile } = useBreakpointMatch('md', 'down');
 * ```
 */
export function useBreakpointMatch(
  breakpoint: BreakpointKey,
  direction: 'up' | 'down' | 'only' = 'up',
  options: MediaQueryOptions = {}
) {
  const query = useMemo(
    () => getMediaQuery(breakpoint, direction),
    [breakpoint, direction]
  )

  return useMediaQuery(query, options)
}

/**
 * Hook for matching multiple breakpoint conditions
 *
 * @param conditions - Array of breakpoint condition objects
 * @param options - Configuration options
 * @returns Array of match results
 *
 * @example
 * ```tsx
 * const [mobile, tablet, desktop] = useBreakpointMatches([
 *   { breakpoint: 'md', direction: 'down' },
 *   { breakpoint: 'md', direction: 'up' },
 *   { breakpoint: 'lg', direction: 'up' }
 * ]);
 * ```
 */
export function useBreakpointConditions(
  conditions: Array<{
    breakpoint: BreakpointKey
    direction?: 'up' | 'down' | 'only'
  }>,
  options: MediaQueryOptions = {}
) {
  const queries = useMemo(
    () =>
      conditions.map(({ breakpoint, direction = 'up' }) =>
        getMediaQuery(breakpoint, direction)
      ),
    [conditions]
  )

  return useMediaQueries(queries, options)
}

/**
 * Hook for matching breakpoint ranges
 *
 * @param min - Minimum breakpoint
 * @param max - Maximum breakpoint
 * @param options - Configuration options
 * @returns Match result for the range
 *
 * @example
 * ```tsx
 * // Match tablet range (md to lg)
 * const { matches: isTablet } = useBreakpointRange('md', 'lg');
 *
 * // Match small desktop range (lg to xl)
 * const { matches: isSmallDesktop } = useBreakpointRange('lg', 'xl');
 * ```
 */
export function useBreakpointRange(
  min: BreakpointKey,
  max: BreakpointKey,
  options: MediaQueryOptions = {}
) {
  const query = useMemo(() => getMediaQueryBetween(min, max), [min, max])

  return useMediaQuery(query, options)
}

/**
 * Hook for comprehensive breakpoint matching
 * Provides boolean flags for common breakpoint patterns
 *
 * @param options - Configuration options
 * @returns Object with boolean flags for different screen sizes
 *
 * @example
 * ```tsx
 * const {
 *   isMobile,
 *   isTablet,
 *   isDesktop,
 *   isLargeDesktop,
 *   isMobileOnly,
 *   isTabletOnly
 * } = useBreakpointFlags();
 *
 * if (isMobile) {
 *   // Mobile layout
 * } else if (isTablet) {
 *   // Tablet layout
 * } else {
 *   // Desktop layout
 * }
 * ```
 */
export function useBreakpointFlags(options: MediaQueryOptions = {}) {
  const queries = useMemo(
    () => [
      getMediaQuery('md', 'down'), // Mobile: < md
      getMediaQuery('md', 'up'), // Tablet+: >= md
      getMediaQuery('lg', 'up'), // Desktop+: >= lg
      getMediaQuery('xl', 'up'), // Large Desktop+: >= xl
      getMediaQuery('sm', 'only'), // Mobile only: sm only
      getMediaQuery('md', 'only'), // Tablet only: md only
      getMediaQueryBetween('sm', 'md'), // Small mobile: sm to md
      getMediaQueryBetween('md', 'lg'), // Tablet range: md to lg
      getMediaQueryBetween('lg', 'xl'), // Desktop range: lg to xl
    ],
    []
  )

  const results = useMediaQueries(queries, options)

  // Safely extract results
  const isMobile = results[0] || { matches: false }
  const isTabletUp = results[1] || { matches: false }
  const isDesktop = results[2] || { matches: false }
  const isLargeDesktop = results[3] || { matches: false }
  const isMobileOnly = results[4] || { matches: false }
  const isTabletOnly = results[5] || { matches: false }
  const isSmallMobile = results[6] || { matches: false }
  const isTabletRange = results[7] || { matches: false }
  const isDesktopRange = results[8] || { matches: false }

  return {
    // Primary flags
    isMobile: isMobile.matches,
    isTablet: isTabletUp.matches && !isDesktop.matches,
    isDesktop: isDesktop.matches,
    isLargeDesktop: isLargeDesktop.matches,

    // Specific ranges
    isMobileOnly: isMobileOnly.matches,
    isTabletOnly: isTabletOnly.matches,
    isSmallMobile: isSmallMobile.matches,
    isTabletRange: isTabletRange.matches,
    isDesktopRange: isDesktopRange.matches,

    // Utility flags
    isTabletUp: isTabletUp.matches,
    isTouch: isMobile.matches || isTabletRange.matches,
    isNonDesktop: !isDesktop.matches,
  }
}

/**
 * Hook for custom media query matching with breakpoint context
 *
 * @param customQuery - Custom media query string or function
 * @param options - Configuration options
 * @returns Match result with additional breakpoint context
 *
 * @example
 * ```tsx
 * // Custom query with function
 * const { matches } = useCustomBreakpointMatch(
 *   (bp) => `(min-width: ${bp.md}) and (orientation: landscape)`
 * );
 *
 * // Direct custom query
 * const { matches } = useCustomBreakpointMatch(
 *   '(min-width: 768px) and (max-height: 600px)'
 * );
 * ```
 */
export function useCustomBreakpointMatch(
  customQuery:
    | string
    | ((breakpoints: Record<BreakpointKey, string>) => string),
  options: MediaQueryOptions = {}
) {
  const query = useMemo(() => {
    if (typeof customQuery === 'string') {
      return customQuery
    }

    // Create breakpoint values object
    const breakpointValues: Record<BreakpointKey, string> = {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    }

    return customQuery(breakpointValues)
  }, [customQuery])

  return useMediaQuery(query, options)
}

/**
 * Hook for orientation-aware breakpoint matching
 *
 * @param breakpoint - Breakpoint to match
 * @param orientation - Screen orientation
 * @param options - Configuration options
 * @returns Match result considering both breakpoint and orientation
 *
 * @example
 * ```tsx
 * // Match medium screens in landscape
 * const { matches } = useOrientationBreakpointMatch('md', 'landscape');
 *
 * // Match large screens in portrait
 * const { matches } = useOrientationBreakpointMatch('lg', 'portrait');
 * ```
 */
export function useOrientationBreakpointMatch(
  breakpoint: BreakpointKey,
  orientation: 'portrait' | 'landscape',
  options: MediaQueryOptions = {}
) {
  const query = useMemo(
    () =>
      `${getMediaQuery(breakpoint, 'up')} and (orientation: ${orientation})`,
    [breakpoint, orientation]
  )

  return useMediaQuery(query, options)
}
