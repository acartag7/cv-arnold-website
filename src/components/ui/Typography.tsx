/**
 * Typography Component
 * Comprehensive typography system with responsive scaling, semantic variants, and theme integration
 */

'use client'

import React, { forwardRef } from 'react'
import type { ElementType } from 'react'
import { cn } from '@/utils/cn'
import { resolveResponsiveValue } from '@/utils/breakpoints'
import { useBreakpoint } from '@/hooks/responsive'
import type {
  TypographyProps,
  TypographyComponentProps,
  TypographyVariant,
  TypographySize,
  FontWeight,
  LineHeight,
  LetterSpacing,
  TextColor,
  TextAlign,
  TextTransform,
  FontFamily,
  VariantConfig,
} from '@/types/typography'

// Default variant configurations with semantic meaning
const VARIANT_CONFIGS: Record<TypographyVariant, VariantConfig> = {
  h1: {
    size: '4xl',
    weight: 'bold',
    lineHeight: 'tight',
    letterSpacing: 'tight',
    element: 'h1',
  },
  h2: {
    size: '3xl',
    weight: 'bold',
    lineHeight: 'tight',
    letterSpacing: 'tight',
    element: 'h2',
  },
  h3: {
    size: '2xl',
    weight: 'semibold',
    lineHeight: 'snug',
    letterSpacing: 'tight',
    element: 'h3',
  },
  h4: {
    size: 'xl',
    weight: 'semibold',
    lineHeight: 'snug',
    letterSpacing: 'normal',
    element: 'h4',
  },
  h5: {
    size: 'lg',
    weight: 'medium',
    lineHeight: 'normal',
    letterSpacing: 'normal',
    element: 'h5',
  },
  h6: {
    size: 'base',
    weight: 'medium',
    lineHeight: 'normal',
    letterSpacing: 'normal',
    element: 'h6',
  },
  subtitle1: {
    size: 'lg',
    weight: 'normal',
    lineHeight: 'relaxed',
    letterSpacing: 'normal',
    element: 'p',
  },
  subtitle2: {
    size: 'base',
    weight: 'normal',
    lineHeight: 'relaxed',
    letterSpacing: 'normal',
    element: 'p',
  },
  body1: {
    size: 'base',
    weight: 'normal',
    lineHeight: 'relaxed',
    letterSpacing: 'normal',
    element: 'p',
  },
  body2: {
    size: 'sm',
    weight: 'normal',
    lineHeight: 'normal',
    letterSpacing: 'normal',
    element: 'p',
  },
  caption: {
    size: 'xs',
    weight: 'normal',
    lineHeight: 'normal',
    letterSpacing: 'wide',
    element: 'span',
  },
  overline: {
    size: 'xs',
    weight: 'medium',
    lineHeight: 'normal',
    letterSpacing: 'wider',
    transform: 'uppercase',
    element: 'span',
  },
}

// Typography size to CSS class mapping
const SIZE_CLASSES: Record<TypographySize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
}

// Font weight to CSS class mapping
const WEIGHT_CLASSES: Record<FontWeight, string> = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
  300: 'font-light',
  400: 'font-normal',
  500: 'font-medium',
  600: 'font-semibold',
  700: 'font-bold',
  800: 'font-extrabold',
  900: 'font-black',
}

// Line height to CSS class mapping
const LINE_HEIGHT_CLASSES: Record<LineHeight, string> = {
  none: 'leading-none',
  tight: 'leading-tight',
  snug: 'leading-snug',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
  loose: 'leading-loose',
}

// Letter spacing to CSS class mapping
const LETTER_SPACING_CLASSES: Record<LetterSpacing, string> = {
  tighter: 'tracking-tighter',
  tight: 'tracking-tight',
  normal: 'tracking-normal',
  wide: 'tracking-wide',
  wider: 'tracking-wider',
  widest: 'tracking-widest',
}

// Text color to CSS class mapping (using semantic color system)
const TEXT_COLOR_CLASSES: Record<TextColor, string> = {
  inherit: 'text-inherit',
  primary: 'text-semantic-primary',
  secondary: 'text-semantic-secondary',
  accent: 'text-semantic-accent',
  muted: 'text-semantic-text-muted',
  subtle: 'text-semantic-text-subtle',
  disabled: 'text-semantic-text-disabled',
  inverse: 'text-semantic-text-inverse',
  success: 'text-semantic-success',
  warning: 'text-semantic-warning',
  error: 'text-semantic-error',
}

// Text alignment to CSS class mapping
const TEXT_ALIGN_CLASSES: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
}

// Text transform to CSS class mapping
const TEXT_TRANSFORM_CLASSES: Record<TextTransform, string> = {
  none: 'normal-case',
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
}

// Font family to CSS class mapping
const FONT_FAMILY_CLASSES: Record<FontFamily, string> = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
}

/**
 * Generate fluid typography using CSS clamp()
 * Provides smooth scaling between breakpoints
 */
function generateFluidSize(size: TypographySize): string {
  const sizeConfigs = {
    xs: { min: 12, max: 12 },
    sm: { min: 14, max: 14 },
    base: { min: 16, max: 16 },
    lg: { min: 18, max: 20 },
    xl: { min: 20, max: 24 },
    '2xl': { min: 24, max: 32 },
    '3xl': { min: 30, max: 48 },
    '4xl': { min: 36, max: 64 },
    '5xl': { min: 48, max: 80 },
    '6xl': { min: 60, max: 96 },
  }

  const config = sizeConfigs[size]
  const minVw = 375 // Mobile viewport
  const maxVw = 1536 // 2xl breakpoint

  // Convert to rem (assuming 16px base)
  const minRem = config.min / 16
  const maxRem = config.max / 16
  const slope = (maxRem - minRem) / (maxVw - minVw)
  const intersection = -minVw * slope + minRem

  return `clamp(${minRem}rem, ${intersection.toFixed(4)}rem + ${(slope * 100).toFixed(4)}vw, ${maxRem}rem)`
}

// Forward ref component with proper typing
const TypographyComponent = forwardRef<
  HTMLElement,
  TypographyComponentProps<ElementType>
>(
  (
    {
      children,
      variant,
      size,
      weight,
      lineHeight,
      letterSpacing,
      family = 'sans',
      color = 'inherit',
      align,
      transform,
      decoration,
      truncate = false,
      overflow,
      maxLines,
      as,
      className,
      ...props
    },
    ref
  ) => {
    const { current: currentBreakpoint } = useBreakpoint()

    // Get variant configuration if specified
    const variantConfig =
      variant && variant in VARIANT_CONFIGS
        ? VARIANT_CONFIGS[variant as TypographyVariant]
        : null

    // Determine the component element
    const Component = as || variantConfig?.element || 'span'

    // Resolve responsive values
    const resolvedSize = resolveResponsiveValue(
      size || variantConfig?.size || 'base',
      currentBreakpoint
    )
    const resolvedWeight = resolveResponsiveValue(
      weight || variantConfig?.weight || 'normal',
      currentBreakpoint
    )
    const resolvedLineHeight = resolveResponsiveValue(
      lineHeight || variantConfig?.lineHeight || 'normal',
      currentBreakpoint
    )
    const resolvedLetterSpacing = resolveResponsiveValue(
      letterSpacing || variantConfig?.letterSpacing || 'normal',
      currentBreakpoint
    )
    const resolvedFamily = resolveResponsiveValue(family, currentBreakpoint)
    const resolvedColor = resolveResponsiveValue(color, currentBreakpoint)
    const resolvedAlign = align
      ? resolveResponsiveValue(align, currentBreakpoint)
      : undefined
    const resolvedTransform =
      transform || variantConfig?.transform
        ? resolveResponsiveValue(
            transform || variantConfig?.transform || 'none',
            currentBreakpoint
          )
        : undefined

    // Build CSS classes
    const classes = cn(
      // Base typography classes
      SIZE_CLASSES[resolvedSize as TypographySize],
      WEIGHT_CLASSES[resolvedWeight as FontWeight],
      LINE_HEIGHT_CLASSES[resolvedLineHeight as LineHeight],
      LETTER_SPACING_CLASSES[resolvedLetterSpacing as LetterSpacing],
      FONT_FAMILY_CLASSES[resolvedFamily as FontFamily],
      TEXT_COLOR_CLASSES[resolvedColor as TextColor],

      // Optional styling
      resolvedAlign && TEXT_ALIGN_CLASSES[resolvedAlign as TextAlign],
      resolvedTransform &&
        TEXT_TRANSFORM_CLASSES[resolvedTransform as TextTransform],

      // Text overflow handling
      truncate && 'truncate',
      overflow === 'ellipsis' && 'text-ellipsis',

      // Line clamping for multi-line truncation
      maxLines && [
        'overflow-hidden',
        'display-box',
        'box-orient-vertical',
        `line-clamp-${maxLines}`,
      ],

      // Decoration
      decoration === 'underline' && 'underline',
      decoration === 'line-through' && 'line-through',
      decoration === 'none' && 'no-underline',

      // Custom classes
      className
    )

    // Custom CSS variables for fluid typography (if needed)
    const customStyles: React.CSSProperties = {}

    // Add fluid sizing for larger text
    if (['2xl', '3xl', '4xl', '5xl', '6xl'].includes(resolvedSize as string)) {
      customStyles.fontSize = generateFluidSize(resolvedSize as TypographySize)
    }

    return (
      <Component
        ref={ref}
        className={classes}
        style={Object.keys(customStyles).length > 0 ? customStyles : undefined}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

TypographyComponent.displayName = 'Typography'

// Export the component with proper typing
export const Typography = TypographyComponent as <
  T extends ElementType = 'span',
>(
  props: TypographyComponentProps<T> & { ref?: React.Ref<HTMLElement> }
) => React.ReactElement | null

// Convenience components for common variants
export const Heading1 = forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps<'h1'>, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant="h1" as="h1" {...props} />)
Heading1.displayName = 'Heading1'

export const Heading2 = forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps<'h2'>, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant="h2" as="h2" {...props} />)
Heading2.displayName = 'Heading2'

export const Heading3 = forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps<'h3'>, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant="h3" as="h3" {...props} />)
Heading3.displayName = 'Heading3'

export const Heading4 = forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps<'h4'>, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant="h4" as="h4" {...props} />)
Heading4.displayName = 'Heading4'

export const Heading5 = forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps<'h5'>, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant="h5" as="h5" {...props} />)
Heading5.displayName = 'Heading5'

export const Heading6 = forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps<'h6'>, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant="h6" as="h6" {...props} />)
Heading6.displayName = 'Heading6'

export const Subtitle = forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps<'p'>, 'variant' | 'as'> & {
    variant?: 'subtitle1' | 'subtitle2'
  }
>(({ variant = 'subtitle1', ...props }, ref) => (
  <Typography ref={ref} variant={variant} as="p" {...props} />
))
Subtitle.displayName = 'Subtitle'

export const Body = forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps<'p'>, 'variant' | 'as'> & { variant?: 'body1' | 'body2' }
>(({ variant = 'body1', ...props }, ref) => (
  <Typography ref={ref} variant={variant} as="p" {...props} />
))
Body.displayName = 'Body'

export const Caption = forwardRef<
  HTMLSpanElement,
  Omit<TypographyProps<'span'>, 'variant' | 'as'>
>((props, ref) => (
  <Typography ref={ref} variant="caption" as="span" {...props} />
))
Caption.displayName = 'Caption'

export const Overline = forwardRef<
  HTMLSpanElement,
  Omit<TypographyProps<'span'>, 'variant' | 'as'>
>((props, ref) => (
  <Typography ref={ref} variant="overline" as="span" {...props} />
))
Overline.displayName = 'Overline'

// Typography utilities for programmatic usage
export const typographyUtils = {
  /**
   * Get the CSS class for a typography size
   */
  getSizeClass: (size: TypographySize): string => SIZE_CLASSES[size],

  /**
   * Get the CSS class for a font weight
   */
  getWeightClass: (weight: FontWeight): string => WEIGHT_CLASSES[weight],

  /**
   * Get the CSS class for line height
   */
  getLineHeightClass: (lineHeight: LineHeight): string =>
    LINE_HEIGHT_CLASSES[lineHeight],

  /**
   * Get the CSS class for letter spacing
   */
  getLetterSpacingClass: (letterSpacing: LetterSpacing): string =>
    LETTER_SPACING_CLASSES[letterSpacing],

  /**
   * Get the CSS class for text color
   */
  getColorClass: (color: TextColor): string => TEXT_COLOR_CLASSES[color],

  /**
   * Generate fluid typography CSS
   */
  generateFluidSize,

  /**
   * Get variant configuration
   */
  getVariantConfig: (variant: TypographyVariant): VariantConfig =>
    VARIANT_CONFIGS[variant],
}

export default Typography

// Export types for external usage
export type {
  TypographyProps,
  TypographyVariant,
  TypographySize,
  FontWeight,
  LineHeight,
  LetterSpacing,
  TextColor,
  TextAlign,
  TextTransform,
  FontFamily,
}
