/**
 * Typography System Type Definitions
 * Comprehensive type system for typography components and utilities
 */

import { type ResponsiveValue, type BreakpointKey } from './responsive'
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

// Typography scale sizes
export type TypographySize =
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'

// Typography variants for semantic usage
export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline'

// Font weight options
export type FontWeight =
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black'
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900

// Line height options
export type LineHeight =
  | 'none'
  | 'tight'
  | 'snug'
  | 'normal'
  | 'relaxed'
  | 'loose'

// Letter spacing options
export type LetterSpacing =
  | 'tighter'
  | 'tight'
  | 'normal'
  | 'wide'
  | 'wider'
  | 'widest'

// Text color variants
export type TextColor =
  | 'inherit'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'muted'
  | 'subtle'
  | 'disabled'
  | 'inverse'
  | 'success'
  | 'warning'
  | 'error'

// Text alignment options
export type TextAlign = 'left' | 'center' | 'right' | 'justify'

// Text transform options
export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize'

// Text decoration options
export type TextDecoration = 'none' | 'underline' | 'line-through'

// Text overflow handling
export type TextOverflow = 'clip' | 'ellipsis' | 'truncate'

// Font family options
export type FontFamily = 'sans' | 'serif' | 'mono'

// Typography component props
export interface TypographyProps<T extends ElementType = 'span'> {
  children: ReactNode

  // Semantic variant (overrides other size/weight settings)
  variant?: TypographyVariant

  // Size control
  size?: ResponsiveValue<TypographySize>

  // Typography styling
  weight?: ResponsiveValue<FontWeight>
  lineHeight?: ResponsiveValue<LineHeight>
  letterSpacing?: ResponsiveValue<LetterSpacing>
  family?: ResponsiveValue<FontFamily>

  // Text appearance
  color?: ResponsiveValue<TextColor>
  align?: ResponsiveValue<TextAlign>
  transform?: ResponsiveValue<TextTransform>
  decoration?: ResponsiveValue<TextDecoration>

  // Layout and overflow
  truncate?: boolean
  overflow?: TextOverflow
  maxLines?: number

  // HTML element control
  as?: T

  // Standard HTML attributes
  className?: string
  id?: string

  // Accessibility
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-labelledby'?: string
  role?: string
}

// Polymorphic component type with proper prop forwarding
export type TypographyComponentProps<T extends ElementType> =
  TypographyProps<T> &
    Omit<ComponentPropsWithoutRef<T>, keyof TypographyProps<T>>

// Default variant configurations
export interface VariantConfig {
  size: TypographySize
  weight: FontWeight
  lineHeight: LineHeight
  letterSpacing?: LetterSpacing
  transform?: TextTransform
  element: ElementType
}

// Typography scale configuration
export interface TypographyScale {
  fontSize: Record<TypographySize, string>
  lineHeight: Record<LineHeight, string | number>
  fontWeight: Record<FontWeight, string | number>
  letterSpacing: Record<LetterSpacing, string>
}

// Fluid typography configuration
export interface FluidTypographyConfig {
  minSize: number
  maxSize: number
  minViewport: number
  maxViewport: number
  unit?: 'rem' | 'px' | 'em'
}

// Responsive typography utilities
export interface ResponsiveTypographyUtils {
  // Generate fluid clamp() function
  fluid: (config: FluidTypographyConfig) => string

  // Generate responsive size tokens
  responsive: (
    sizes: Partial<Record<BreakpointKey | 'base', TypographySize>>
  ) => string

  // Generate line height for optimal readability
  optimalLineHeight: (size: TypographySize, isHeading?: boolean) => LineHeight
}

// Typography theme integration
export interface TypographyTheme {
  scale: TypographyScale
  variants: Record<TypographyVariant, VariantConfig>
  defaults: {
    family: FontFamily
    color: TextColor
    lineHeight: LineHeight
    letterSpacing: LetterSpacing
  }
}

// CSS variable mapping for typography
export interface TypographyCSSVars {
  fontSize: Record<TypographySize, string>
  fontWeight: Record<FontWeight, string>
  lineHeight: Record<LineHeight, string>
  letterSpacing: Record<LetterSpacing, string>
  fontFamily: Record<FontFamily, string>
}

// Typography utility classes
export type TypographyClassName =
  | `text-${TypographySize}`
  | `font-${FontWeight}`
  | `leading-${LineHeight}`
  | `tracking-${LetterSpacing}`
  | `text-${TextAlign}`
  | `text-${TextColor}`
  | `font-${FontFamily}`
  | `uppercase`
  | `lowercase`
  | `capitalize`
  | `normal-case`
  | `underline`
  | `line-through`
  | `no-underline`
  | `truncate`

// Preset configurations for common use cases
export interface TypographyPresets {
  heading: {
    primary: VariantConfig
    secondary: VariantConfig
    accent: VariantConfig
  }
  body: {
    large: VariantConfig
    normal: VariantConfig
    small: VariantConfig
  }
  ui: {
    button: VariantConfig
    label: VariantConfig
    caption: VariantConfig
    overline: VariantConfig
  }
}

// Export types for component implementation
export type { ComponentPropsWithoutRef, ElementType, ReactNode }
