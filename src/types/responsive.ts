/**
 * Responsive TypeScript Definitions
 * Type definitions for the responsive breakpoint system
 */

// Breakpoint definitions matching design tokens
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Breakpoint keys
export type BreakpointKey = keyof typeof BREAKPOINTS

// All available breakpoints
export const BREAKPOINT_KEYS: BreakpointKey[] = ['sm', 'md', 'lg', 'xl', '2xl']

// Breakpoint values in pixels (for calculations)
export const BREAKPOINT_VALUES: Record<BreakpointKey, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// Media query directions
export type MediaQueryDirection = 'up' | 'down' | 'only'

// Responsive value type - can be a single value or object with breakpoint keys
export type ResponsiveValue<T> = T | Partial<Record<BreakpointKey | 'base', T>>

// Breakpoint range type
export type BreakpointRange = {
  min?: BreakpointKey
  max?: BreakpointKey
}

// Media query options
export interface MediaQueryOptions {
  fallback?: boolean
  ssr?: boolean
  defaultMatches?: boolean
}

// Hook return types
export interface UseMediaQueryResult {
  matches: boolean
  media: string
}

export interface UseBreakpointResult {
  current: BreakpointKey | null
  isAbove: (breakpoint: BreakpointKey) => boolean
  isBelow: (breakpoint: BreakpointKey) => boolean
  isBetween: (min: BreakpointKey, max: BreakpointKey) => boolean
  isOnly: (breakpoint: BreakpointKey) => boolean
}

export interface UseBreakpointValueOptions {
  fallback?: boolean
  ssr?: boolean
}

export interface UseBreakpointMatchOptions extends MediaQueryOptions {
  breakpoints?: BreakpointKey[]
}

// Component prop types
export interface ResponsiveShowHideProps {
  children: React.ReactNode
  above?: BreakpointKey
  below?: BreakpointKey
  only?: BreakpointKey
  between?: [BreakpointKey, BreakpointKey]
  ssr?: boolean
  fallback?: boolean
}

export interface ResponsiveTextProps {
  children: React.ReactNode
  size?: ResponsiveValue<string>
  weight?: ResponsiveValue<string | number>
  color?: ResponsiveValue<string>
  className?: string | undefined
  as?: React.ElementType
}

export interface ResponsiveImageProps {
  src: string
  alt: string
  sizes?: ResponsiveValue<string>
  className?: string
  priority?: boolean
  quality?: ResponsiveValue<number>
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

// Utility types
export type BreakpointMediaQueries = Record<BreakpointKey, string>
export type BreakpointMatches = Record<BreakpointKey, boolean>

// CSS-in-JS breakpoint helpers
export interface BreakpointHelpers {
  up: (breakpoint: BreakpointKey) => string
  down: (breakpoint: BreakpointKey) => string
  only: (breakpoint: BreakpointKey) => string
  between: (min: BreakpointKey, max: BreakpointKey) => string
}

// Server-side rendering support
export interface SSRBreakpointState {
  currentBreakpoint: BreakpointKey
  matches: BreakpointMatches
  isHydrated: boolean
}
