/**
 * Hide Component
 * Inverse conditional visibility based on breakpoints
 */

'use client'

import { type ReactNode } from 'react'
import { useBreakpoint, useBreakpointRange } from '../../hooks/responsive'
import type {
  ResponsiveShowHideProps,
  BreakpointKey,
} from '../../types/responsive'

/**
 * Hide component for conditional hiding based on breakpoints
 * Inverse of Show component - hides content when conditions are met
 *
 * @example
 * ```tsx
 * // Hide on desktop (show on mobile/tablet)
 * <Hide above="lg">
 *   <MobileOnlyContent />
 * </Hide>
 *
 * // Hide on mobile (show on tablet+)
 * <Hide below="md">
 *   <DesktopTabletContent />
 * </Hide>
 *
 * // Hide at specific breakpoint
 * <Hide only="md">
 *   <NotForTablets />
 * </Hide>
 *
 * // Hide between breakpoints
 * <Hide between={['sm', 'lg']}>
 *   <OnlyMobileAndDesktop />
 * </Hide>
 * ```
 */
export function Hide({
  children,
  above,
  below,
  only,
  between,
  ssr = true,
  fallback = false,
}: ResponsiveShowHideProps): ReactNode {
  const { isAbove, isBelow, isOnly } = useBreakpoint()
  // Always call the hook to maintain hook call order
  const rangeResult = useBreakpointRange(
    between?.[0] || 'sm',
    between?.[1] || 'md',
    { fallback, ssr, defaultMatches: fallback }
  )

  // SSR handling
  if (ssr && typeof window === 'undefined') {
    // Return children based on inverse fallback setting for SSR
    return !fallback ? children : null
  }

  // Determine visibility based on props (inverse logic)
  let shouldHide = false

  if (above && isAbove(above)) {
    shouldHide = true
  }

  if (below && isBelow(below)) {
    shouldHide = true
  }

  if (only && isOnly(only)) {
    shouldHide = true
  }

  if (between && rangeResult.matches) {
    shouldHide = true
  }

  return shouldHide ? null : children
}

/**
 * HideAbove component - shorthand for hiding content above a breakpoint
 *
 * @example
 * ```tsx
 * <HideAbove breakpoint="lg">
 *   <MobileTabletOnly />
 * </HideAbove>
 * ```
 */
export function HideAbove({
  children,
  breakpoint,
  ssr = true,
  fallback = true, // Default to true for mobile-first (show on mobile)
}: {
  children: ReactNode
  breakpoint: BreakpointKey
  ssr?: boolean
  fallback?: boolean
}) {
  return (
    <Hide above={breakpoint} ssr={ssr} fallback={fallback}>
      {children}
    </Hide>
  )
}

/**
 * HideBelow component - shorthand for hiding content below a breakpoint
 *
 * @example
 * ```tsx
 * <HideBelow breakpoint="md">
 *   <DesktopTabletOnly />
 * </HideBelow>
 * ```
 */
export function HideBelow({
  children,
  breakpoint,
  ssr = true,
  fallback = false, // Default to false (hide on mobile)
}: {
  children: ReactNode
  breakpoint: BreakpointKey
  ssr?: boolean
  fallback?: boolean
}) {
  return (
    <Hide below={breakpoint} ssr={ssr} fallback={fallback}>
      {children}
    </Hide>
  )
}

/**
 * HideOnly component - shorthand for hiding content at specific breakpoint only
 *
 * @example
 * ```tsx
 * <HideOnly breakpoint="md">
 *   <NotForTablets />
 * </HideOnly>
 * ```
 */
export function HideOnly({
  children,
  breakpoint,
  ssr = true,
  fallback = true, // Default to true (show unless specifically hidden)
}: {
  children: ReactNode
  breakpoint: BreakpointKey
  ssr?: boolean
  fallback?: boolean
}) {
  return (
    <Hide only={breakpoint} ssr={ssr} fallback={fallback}>
      {children}
    </Hide>
  )
}

/**
 * HideBetween component - shorthand for hiding content between breakpoints
 *
 * @example
 * ```tsx
 * <HideBetween min="sm" max="lg">
 *   <OnlyMobileAndDesktop />
 * </HideBetween>
 * ```
 */
export function HideBetween({
  children,
  min,
  max,
  ssr = true,
  fallback = true, // Default to true (show unless specifically hidden)
}: {
  children: ReactNode
  min: BreakpointKey
  max: BreakpointKey
  ssr?: boolean
  fallback?: boolean
}) {
  return (
    <Hide between={[min, max]} ssr={ssr} fallback={fallback}>
      {children}
    </Hide>
  )
}
