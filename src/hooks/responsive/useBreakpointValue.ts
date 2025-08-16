/**
 * useBreakpointValue Hook
 * Responsive value selection based on current breakpoint
 */

'use client'

import { useMemo } from 'react'
import { useBreakpoint } from './useBreakpoint'
import { resolveResponsiveValue } from '../../utils/breakpoints'
import type {
  ResponsiveValue,
  UseBreakpointValueOptions,
  BreakpointKey,
} from '../../types/responsive'

/**
 * Hook for selecting values based on current breakpoint
 *
 * @param value - Responsive value object or single value
 * @param options - Configuration options
 * @returns Resolved value for current breakpoint
 *
 * @example
 * ```tsx
 * // Single responsive value
 * const fontSize = useBreakpointValue({
 *   base: '14px',
 *   md: '16px',
 *   lg: '18px'
 * });
 *
 * // With fallback for SSR
 * const columns = useBreakpointValue({
 *   base: 1,
 *   sm: 2,
 *   md: 3,
 *   lg: 4
 * }, { fallback: true });
 *
 * // Simple value (non-responsive)
 * const color = useBreakpointValue('blue'); // Returns 'blue'
 * ```
 */
export function useBreakpointValue<T>(
  value: ResponsiveValue<T>,
  options: UseBreakpointValueOptions = {}
): T {
  const { fallback = false, ssr = true } = options
  const { current } = useBreakpoint()

  const resolvedValue = useMemo(() => {
    // Handle SSR case
    if (ssr && typeof window === 'undefined') {
      if (
        fallback &&
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const responsiveObj = value as Partial<
          Record<BreakpointKey | 'base', T>
        >
        return responsiveObj.base ?? (Object.values(responsiveObj)[0] as T)
      }
      return value as T
    }

    return resolveResponsiveValue(value, current)
  }, [value, current, fallback, ssr])

  return resolvedValue
}

/**
 * Hook for selecting multiple values based on current breakpoint
 *
 * @param values - Array of responsive values
 * @param options - Configuration options
 * @returns Array of resolved values for current breakpoint
 *
 * @example
 * ```tsx
 * const [fontSize, padding, margin] = useBreakpointValues([
 *   { base: '14px', md: '16px', lg: '18px' },
 *   { base: '8px', md: '12px', lg: '16px' },
 *   { base: '4px', md: '6px', lg: '8px' }
 * ]);
 * ```
 */
export function useBreakpointValues<T>(
  values: ResponsiveValue<T>[],
  options: UseBreakpointValueOptions = {}
): T[] {
  const { current } = useBreakpoint()

  const resolvedValues = useMemo(() => {
    return values.map(value => {
      // Handle SSR case
      if (options.ssr && typeof window === 'undefined') {
        if (
          options.fallback &&
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          const responsiveObj = value as Partial<
            Record<BreakpointKey | 'base', T>
          >
          return responsiveObj.base ?? (Object.values(responsiveObj)[0] as T)
        }
        return value as T
      }

      return resolveResponsiveValue(value, current)
    })
  }, [values, current, options.fallback, options.ssr])

  return resolvedValues
}

/**
 * Hook for creating responsive CSS properties
 *
 * @param styles - Object with responsive CSS properties
 * @param options - Configuration options
 * @returns Resolved CSS properties object
 *
 * @example
 * ```tsx
 * const styles = useResponsiveStyles({
 *   fontSize: { base: '14px', md: '16px', lg: '18px' },
 *   padding: { base: '8px', md: '12px' },
 *   color: 'blue' // Non-responsive
 * });
 *
 * return <div style={styles}>Content</div>;
 * ```
 */
export function useResponsiveStyles<
  T extends Record<string, ResponsiveValue<string | number>>,
>(
  styles: T,
  options: UseBreakpointValueOptions = {}
): Record<keyof T, string | number> {
  const { current } = useBreakpoint()

  const resolvedStyles = useMemo(() => {
    const result: Record<string, string | number> = {}

    Object.entries(styles).forEach(([property, value]) => {
      // Handle SSR case
      if (options.ssr && typeof window === 'undefined') {
        if (
          options.fallback &&
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          const responsiveObj = value as Partial<
            Record<BreakpointKey | 'base', string | number>
          >
          result[property] =
            responsiveObj.base ??
            (Object.values(responsiveObj)[0] as string | number)
        } else {
          result[property] = value as string | number
        }
      } else {
        result[property] = resolveResponsiveValue(value, current)
      }
    })

    return result as Record<keyof T, string | number>
  }, [styles, current, options.fallback, options.ssr])

  return resolvedStyles
}

/**
 * Hook for responsive class name selection
 *
 * @param classNames - Responsive class name object
 * @param options - Configuration options
 * @returns Resolved class name string
 *
 * @example
 * ```tsx
 * const className = useResponsiveClassName({
 *   base: 'text-sm p-2',
 *   md: 'text-base p-4',
 *   lg: 'text-lg p-6'
 * });
 *
 * return <div className={className}>Content</div>;
 * ```
 */
export function useResponsiveClassName(
  classNames: ResponsiveValue<string>,
  options: UseBreakpointValueOptions = {}
): string {
  const resolvedClassName = useBreakpointValue(classNames, options)
  return resolvedClassName || ''
}

/**
 * Hook for conditional responsive values
 *
 * @param condition - Responsive condition object
 * @param trueValue - Value when condition is true
 * @param falseValue - Value when condition is false
 * @param options - Configuration options
 * @returns Resolved value based on condition
 *
 * @example
 * ```tsx
 * const showSidebar = useResponsiveConditional(
 *   { base: false, lg: true },
 *   'visible',
 *   'hidden'
 * );
 *
 * const columns = useResponsiveConditional(
 *   { base: false, md: true },
 *   { base: 2, lg: 3 },
 *   1
 * );
 * ```
 */
export function useResponsiveConditional<T>(
  condition: ResponsiveValue<boolean>,
  trueValue: ResponsiveValue<T>,
  falseValue: ResponsiveValue<T>,
  options: UseBreakpointValueOptions = {}
): T {
  const resolvedCondition = useBreakpointValue(condition, options)
  const targetValue = resolvedCondition ? trueValue : falseValue
  return useBreakpointValue(targetValue, options)
}
