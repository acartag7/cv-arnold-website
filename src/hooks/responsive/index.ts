/**
 * Responsive Hooks
 * Comprehensive responsive breakpoint system for React applications
 */

// Core hooks
export {
  useMediaQuery,
  useMediaQueries,
  useMediaQueryWithCleanup,
} from './useMediaQuery'

export {
  useBreakpoint,
  useBreakpointMatches,
  useBreakpointChange,
} from './useBreakpoint'

export {
  useBreakpointValue,
  useBreakpointValues,
  useResponsiveStyles,
  useResponsiveClassName,
  useResponsiveConditional,
} from './useBreakpointValue'

export {
  useBreakpointMatch,
  useBreakpointConditions,
  useBreakpointRange,
  useBreakpointFlags,
  useCustomBreakpointMatch,
  useOrientationBreakpointMatch,
} from './useBreakpointMatch'

// Re-export types for convenience
export type {
  BreakpointKey,
  ResponsiveValue,
  UseMediaQueryResult,
  UseBreakpointResult,
  MediaQueryOptions,
  UseBreakpointValueOptions,
  UseBreakpointMatchOptions,
} from '../../types/responsive'
