/**
 * Show Component
 * Conditional visibility based on breakpoints
 */

'use client'

import { type ReactNode } from 'react'
import { useBreakpoint, useBreakpointRange } from '../../hooks/responsive'
import type {
  ResponsiveShowHideProps,
  BreakpointKey,
} from '../../types/responsive'

/**
 * Show component for conditional rendering based on breakpoints
 *
 * @example
 * ```tsx
 * // Show only on desktop
 * <Show above="lg">
 *   <DesktopNavigation />
 * </Show>
 *
 * // Show only on mobile
 * <Show below="md">
 *   <MobileMenu />
 * </Show>
 *
 * // Show only at specific breakpoint
 * <Show only="md">
 *   <TabletLayout />
 * </Show>
 *
 * // Show between breakpoints
 * <Show between={['sm', 'lg']}>
 *   <TabletAndSmallDesktop />
 * </Show>
 * ```
 */
export function Show({
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
    // Return children based on fallback setting for SSR
    return fallback ? children : null
  }

  // Determine visibility based on props
  let shouldShow = true

  if (above && !isAbove(above)) {
    shouldShow = false
  }

  if (below && !isBelow(below)) {
    shouldShow = false
  }

  if (only && !isOnly(only)) {
    shouldShow = false
  }

  if (between && rangeResult && !rangeResult.matches) {
    shouldShow = false
  }

  return shouldShow ? children : null
}

/**
 * ShowAbove component - shorthand for showing content above a breakpoint
 *
 * @example
 * ```tsx
 * <ShowAbove breakpoint="md">
 *   <DesktopFeature />
 * </ShowAbove>
 * ```
 */
export function ShowAbove({
  children,
  breakpoint,
  ssr = true,
  fallback = false,
}: {
  children: ReactNode
  breakpoint: BreakpointKey
  ssr?: boolean
  fallback?: boolean
}) {
  return (
    <Show above={breakpoint} ssr={ssr} fallback={fallback}>
      {children}
    </Show>
  )
}

/**
 * ShowBelow component - shorthand for showing content below a breakpoint
 *
 * @example
 * ```tsx
 * <ShowBelow breakpoint="lg">
 *   <MobileTabletContent />
 * </ShowBelow>
 * ```
 */
export function ShowBelow({
  children,
  breakpoint,
  ssr = true,
  fallback = true, // Default to true for mobile-first
}: {
  children: ReactNode
  breakpoint: BreakpointKey
  ssr?: boolean
  fallback?: boolean
}) {
  return (
    <Show below={breakpoint} ssr={ssr} fallback={fallback}>
      {children}
    </Show>
  )
}

/**
 * ShowOnly component - shorthand for showing content at specific breakpoint only
 *
 * @example
 * ```tsx
 * <ShowOnly breakpoint="md">
 *   <TabletSpecificFeature />
 * </ShowOnly>
 * ```
 */
export function ShowOnly({
  children,
  breakpoint,
  ssr = true,
  fallback = false,
}: {
  children: ReactNode
  breakpoint: BreakpointKey
  ssr?: boolean
  fallback?: boolean
}) {
  return (
    <Show only={breakpoint} ssr={ssr} fallback={fallback}>
      {children}
    </Show>
  )
}

/**
 * ShowBetween component - shorthand for showing content between breakpoints
 *
 * @example
 * ```tsx
 * <ShowBetween min="sm" max="lg">
 *   <TabletRangeContent />
 * </ShowBetween>
 * ```
 */
export function ShowBetween({
  children,
  min,
  max,
  ssr = true,
  fallback = false,
}: {
  children: ReactNode
  min: BreakpointKey
  max: BreakpointKey
  ssr?: boolean
  fallback?: boolean
}) {
  return (
    <Show between={[min, max]} ssr={ssr} fallback={fallback}>
      {children}
    </Show>
  )
}
