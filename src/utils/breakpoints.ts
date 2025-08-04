/**
 * Breakpoint Utilities
 * Helper functions for responsive breakpoint management
 */

import {
  BREAKPOINT_VALUES,
  BREAKPOINT_KEYS,
  type BreakpointKey,
  type ResponsiveValue,
  type BreakpointHelpers,
  type MediaQueryDirection,
} from '../types/responsive'

/**
 * Generate media query string for breakpoint
 */
export function getMediaQuery(
  breakpoint: BreakpointKey,
  direction: MediaQueryDirection = 'up'
): string {
  const value = BREAKPOINT_VALUES[breakpoint]

  switch (direction) {
    case 'up':
      return `(min-width: ${value}px)`
    case 'down':
      // Use max-width with 0.05px subtraction to avoid overlap
      return `(max-width: ${value - 0.05}px)`
    case 'only':
      const nextBreakpointIndex = BREAKPOINT_KEYS.indexOf(breakpoint) + 1
      const nextBreakpoint = BREAKPOINT_KEYS[nextBreakpointIndex]

      if (!nextBreakpoint) {
        // Last breakpoint, just use min-width
        return `(min-width: ${value}px)`
      }

      const nextValue = BREAKPOINT_VALUES[nextBreakpoint]
      return `(min-width: ${value}px) and (max-width: ${nextValue - 0.05}px)`
    default:
      return `(min-width: ${value}px)`
  }
}

/**
 * Generate media query for breakpoint range
 */
export function getMediaQueryBetween(
  min: BreakpointKey,
  max: BreakpointKey
): string {
  const minValue = BREAKPOINT_VALUES[min]
  const maxValue = BREAKPOINT_VALUES[max]

  return `(min-width: ${minValue}px) and (max-width: ${maxValue - 0.05}px)`
}

/**
 * Get current breakpoint based on window width
 */
export function getCurrentBreakpoint(width: number): BreakpointKey | null {
  // Sort breakpoints by value (ascending)
  const sortedBreakpoints = BREAKPOINT_KEYS.sort(
    (a, b) => BREAKPOINT_VALUES[a] - BREAKPOINT_VALUES[b]
  )

  // Find the largest breakpoint that the width meets
  for (let i = sortedBreakpoints.length - 1; i >= 0; i--) {
    const breakpoint = sortedBreakpoints[i]
    if (breakpoint && width >= BREAKPOINT_VALUES[breakpoint]) {
      return breakpoint
    }
  }

  // If no breakpoint matches, return null (mobile)
  return null
}

/**
 * Check if current width is above a breakpoint
 */
export function isAboveBreakpoint(
  width: number,
  breakpoint: BreakpointKey
): boolean {
  return width >= BREAKPOINT_VALUES[breakpoint]
}

/**
 * Check if current width is below a breakpoint
 */
export function isBelowBreakpoint(
  width: number,
  breakpoint: BreakpointKey
): boolean {
  return width < BREAKPOINT_VALUES[breakpoint]
}

/**
 * Check if current width is between two breakpoints
 */
export function isBetweenBreakpoints(
  width: number,
  min: BreakpointKey,
  max: BreakpointKey
): boolean {
  return width >= BREAKPOINT_VALUES[min] && width < BREAKPOINT_VALUES[max]
}

/**
 * Check if current width matches exactly one breakpoint
 */
export function isOnlyBreakpoint(
  width: number,
  breakpoint: BreakpointKey
): boolean {
  const breakpointIndex = BREAKPOINT_KEYS.indexOf(breakpoint)
  const nextBreakpoint = BREAKPOINT_KEYS[breakpointIndex + 1]

  if (!nextBreakpoint) {
    // Last breakpoint, check if above
    return width >= BREAKPOINT_VALUES[breakpoint]
  }

  return isBetweenBreakpoints(width, breakpoint, nextBreakpoint)
}

/**
 * Resolve responsive value based on current breakpoint
 */
export function resolveResponsiveValue<T>(
  value: ResponsiveValue<T>,
  currentBreakpoint: BreakpointKey | null
): T {
  // If not a responsive object, return as-is
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return value as T
  }

  const responsiveObj = value as Partial<Record<BreakpointKey | 'base', T>>

  // If no current breakpoint (mobile), use base value
  if (!currentBreakpoint) {
    const firstBreakpoint = BREAKPOINT_KEYS[0]
    return (
      responsiveObj.base ??
      (firstBreakpoint
        ? (responsiveObj[firstBreakpoint] as T)
        : (Object.values(responsiveObj)[0] as T))
    )
  }

  // Try to find exact match first
  if (responsiveObj[currentBreakpoint] !== undefined) {
    return responsiveObj[currentBreakpoint] as T
  }

  // Fall back to the closest smaller breakpoint
  const currentIndex = BREAKPOINT_KEYS.indexOf(currentBreakpoint)
  for (let i = currentIndex - 1; i >= 0; i--) {
    const bp = BREAKPOINT_KEYS[i]
    if (bp && responsiveObj[bp] !== undefined) {
      return responsiveObj[bp] as T
    }
  }

  // Fall back to base value
  if (responsiveObj.base !== undefined) {
    return responsiveObj.base as T
  }

  // Return first available value
  const firstKey = Object.keys(responsiveObj)[0] as BreakpointKey | 'base'
  return responsiveObj[firstKey] as T
}

/**
 * CSS-in-JS breakpoint helpers
 */
export const breakpoints: BreakpointHelpers = {
  up: (breakpoint: BreakpointKey) =>
    `@media ${getMediaQuery(breakpoint, 'up')}`,
  down: (breakpoint: BreakpointKey) =>
    `@media ${getMediaQuery(breakpoint, 'down')}`,
  only: (breakpoint: BreakpointKey) =>
    `@media ${getMediaQuery(breakpoint, 'only')}`,
  between: (min: BreakpointKey, max: BreakpointKey) =>
    `@media ${getMediaQueryBetween(min, max)}`,
}

/**
 * Get all media queries for breakpoints
 */
export function getAllMediaQueries() {
  const queries: Record<string, string> = {}

  BREAKPOINT_KEYS.forEach(bp => {
    queries[`${bp}Up`] = getMediaQuery(bp, 'up')
    queries[`${bp}Down`] = getMediaQuery(bp, 'down')
    queries[`${bp}Only`] = getMediaQuery(bp, 'only')
  })

  return queries
}

/**
 * Convert responsive prop to CSS custom properties
 */
export function responsiveValueToCSSProps<T extends string | number>(
  value: ResponsiveValue<T>,
  property: string
): Record<string, T> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { [property]: value as T }
  }

  const responsiveObj = value as Partial<Record<BreakpointKey | 'base', T>>
  const result: Record<string, T> = {}

  // Add base value
  if (responsiveObj.base !== undefined) {
    result[property] = responsiveObj.base
  }

  // Add breakpoint-specific values
  BREAKPOINT_KEYS.forEach(bp => {
    if (responsiveObj[bp] !== undefined) {
      result[`${property}-${bp}`] = responsiveObj[bp] as T
    }
  })

  return result
}

/**
 * Create responsive CSS classes
 */
export function createResponsiveClasses(
  baseClass: string,
  value: ResponsiveValue<string>
): string {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return baseClass + (value ? `-${value}` : '')
  }

  const responsiveObj = value as Partial<Record<BreakpointKey | 'base', string>>
  const classes: string[] = []

  // Add base class
  if (responsiveObj.base) {
    classes.push(`${baseClass}-${responsiveObj.base}`)
  }

  // Add breakpoint-specific classes
  BREAKPOINT_KEYS.forEach(bp => {
    if (responsiveObj[bp]) {
      classes.push(`${bp}:${baseClass}-${responsiveObj[bp]}`)
    }
  })

  return classes.join(' ')
}

/**
 * SSR-safe window width detection
 */
export function getWindowWidth(): number {
  if (typeof window === 'undefined') {
    // Return mobile-first default for SSR
    return 375 // iPhone viewport width
  }
  return window.innerWidth
}

/**
 * SSR-safe breakpoint detection
 */
export function getSSRSafeBreakpoint(): BreakpointKey | null {
  return getCurrentBreakpoint(getWindowWidth())
}
