/**
 * Card Component
 * Flexible card system with multiple variants, hover effects, and content sections
 */

'use client'

import React, { forwardRef, memo, useMemo } from 'react'
import type { ElementType } from 'react'
import { cn } from '@/utils/cn'
import type {
  CardProps,
  CardComponentProps,
  CardVariant,
  CardSize,
  CardPadding,
  CardVariantConfig,
  CardSizeConfig,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  CardMediaProps,
} from '@/types/card'

// Card variant configurations with semantic color system
const CARD_VARIANTS: Record<CardVariant, CardVariantConfig> = {
  elevated: {
    base: 'bg-semantic-surface border border-semantic-border shadow-sm',
    hover: 'hover:shadow-md hover:shadow-semantic-shadow/10',
    focus:
      'focus:ring-2 focus:ring-semantic-focus focus:ring-offset-2 focus:ring-offset-semantic-background',
    active: 'active:scale-[0.98] active:shadow-sm',
    disabled: 'opacity-60 cursor-not-allowed',
  },
  outlined: {
    base: 'bg-semantic-surface border-2 border-semantic-border',
    hover: 'hover:border-semantic-primary hover:bg-semantic-surface-hover',
    focus:
      'focus:ring-2 focus:ring-semantic-focus focus:ring-offset-2 focus:ring-offset-semantic-background',
    active: 'active:scale-[0.98] active:border-semantic-primary-active',
    disabled: 'opacity-60 cursor-not-allowed border-semantic-border-subtle',
  },
  ghost: {
    base: 'bg-transparent border border-transparent',
    hover:
      'hover:bg-semantic-surface-hover hover:border-semantic-border-subtle',
    focus:
      'focus:ring-2 focus:ring-semantic-focus focus:ring-offset-2 focus:ring-offset-semantic-background',
    active: 'active:bg-semantic-surface-active active:scale-[0.98]',
    disabled: 'opacity-60 cursor-not-allowed',
  },
}

// Card size configurations with 8px grid alignment
const CARD_SIZES: Record<CardSize, CardSizeConfig> = {
  sm: {
    base: 'min-h-16',
    padding: 'p-4',
    borderRadius: 'rounded-lg',
  },
  md: {
    base: 'min-h-20',
    padding: 'p-6',
    borderRadius: 'rounded-xl',
  },
  lg: {
    base: 'min-h-24',
    padding: 'p-8',
    borderRadius: 'rounded-2xl',
  },
}

// Padding configurations
const CARD_PADDING: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

// Cache for class name combinations with size limit
const MAX_CACHE_SIZE = 100
const classCache = new Map<string, string>()

const addToCache = (key: string, value: string) => {
  if (classCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entries (first inserted)
    const firstKey = classCache.keys().next().value
    if (firstKey) classCache.delete(firstKey)
  }
  classCache.set(key, value)
}

// Main Card component with polymorphic support
const CardComponent = forwardRef<HTMLElement, CardComponentProps<ElementType>>(
  (
    {
      children,
      variant = 'elevated',
      size = 'md',
      padding,
      interactive = false,
      disabled = false,
      hoverable = true,
      as,
      className,
      ...props
    },
    ref
  ) => {
    // Get configuration objects
    const variantConfig = CARD_VARIANTS[variant as CardVariant]
    const sizeConfig = CARD_SIZES[size as CardSize]

    // Determine the component element
    const Component = as || 'div'

    // Generate cache key for class combinations
    const cacheKey = `${variant}-${size}-${padding || 'default'}-${interactive}-${disabled}-${hoverable}`

    // Build CSS classes with caching
    const classes = useMemo(() => {
      if (classCache.has(cacheKey)) {
        return cn(classCache.get(cacheKey)!, className)
      }

      const baseClasses = cn(
        // Base card styles
        'relative overflow-hidden',
        'transition-all duration-normal ease-out',
        'outline-none',

        // Size configuration
        sizeConfig.base,
        sizeConfig.borderRadius,

        // Padding (use explicit padding if provided, otherwise size default)
        padding ? CARD_PADDING[padding as CardPadding] : sizeConfig.padding,

        // Variant styles
        variantConfig.base,

        // Interactive states (only if interactive and not disabled)
        interactive &&
          !disabled && [
            'cursor-pointer select-none',
            hoverable && variantConfig.hover,
            variantConfig.focus,
            variantConfig.active,
          ],

        // Non-interactive hover (only if hoverable and not interactive)
        !interactive && hoverable && !disabled && variantConfig.hover,

        // Disabled state
        disabled && variantConfig.disabled,

        // Focus management
        'focus-visible:outline-none',

        // High contrast support
        'forced-colors:border-[CanvasText]',
        'forced-colors:bg-[Canvas]'
      )

      addToCache(cacheKey, baseClasses)
      return cn(baseClasses, className)
    }, [
      cacheKey,
      className,
      variantConfig,
      sizeConfig,
      padding,
      interactive,
      disabled,
      hoverable,
    ])

    // Handle interactive props
    const interactiveProps: Record<string, unknown> = {}
    if (interactive) {
      if (Component === 'button') {
        interactiveProps.type =
          'type' in props ? (props.type as string) : 'button'
        interactiveProps.disabled = disabled
      }
      if (Component === 'a') {
        interactiveProps.role = 'button'
        if (disabled) {
          interactiveProps['aria-disabled'] = true
          interactiveProps.tabIndex = -1
        }
      }
    }

    return (
      <Component ref={ref} className={classes} {...interactiveProps} {...props}>
        {children}
      </Component>
    )
  }
)

CardComponent.displayName = 'Card'

// Card Header component
export const CardHeader = memo<CardHeaderProps>(({ className, children }) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5',
      'pb-4 border-b border-semantic-border-subtle',
      className
    )}
  >
    {children}
  </div>
))
CardHeader.displayName = 'CardHeader'

// Card Body component
export const CardBody = memo<CardBodyProps>(({ className, children }) => (
  <div className={cn('flex-1', className)}>{children}</div>
))
CardBody.displayName = 'CardBody'

// Card Footer component
export const CardFooter = memo<CardFooterProps>(({ className, children }) => (
  <div
    className={cn(
      'flex items-center',
      'pt-4 border-t border-semantic-border-subtle',
      className
    )}
  >
    {children}
  </div>
))
CardFooter.displayName = 'CardFooter'

// Card Media component with aspect ratio support
export const CardMedia = memo<CardMediaProps>(
  ({ className, children, aspectRatio = 'video' }) => {
    const aspectRatioClasses = {
      square: 'aspect-square',
      video: 'aspect-video',
      wide: 'aspect-[21/9]',
      tall: 'aspect-[9/16]',
    }

    return (
      <div
        className={cn(
          'relative overflow-hidden bg-semantic-surface-subtle',
          aspectRatioClasses[aspectRatio],
          className
        )}
      >
        {children}
      </div>
    )
  }
)
CardMedia.displayName = 'CardMedia'

// Export the main component with proper typing
export const Card = CardComponent as <T extends ElementType = 'div'>(
  props: CardComponentProps<T> & { ref?: React.Ref<HTMLElement> }
) => React.ReactElement | null

// Convenience components for common card types
export const ElevatedCard = forwardRef<
  HTMLDivElement,
  Omit<CardComponentProps<'div'>, 'variant'>
>((props, ref) => <Card ref={ref} variant="elevated" {...props} />)
ElevatedCard.displayName = 'ElevatedCard'

export const OutlinedCard = forwardRef<
  HTMLDivElement,
  Omit<CardComponentProps<'div'>, 'variant'>
>((props, ref) => <Card ref={ref} variant="outlined" {...props} />)
OutlinedCard.displayName = 'OutlinedCard'

export const GhostCard = forwardRef<
  HTMLDivElement,
  Omit<CardComponentProps<'div'>, 'variant'>
>((props, ref) => <Card ref={ref} variant="ghost" {...props} />)
GhostCard.displayName = 'GhostCard'

// Interactive card variants
export const InteractiveCard = forwardRef<
  HTMLButtonElement,
  Omit<CardComponentProps<'button'>, 'interactive' | 'as'>
>((props, ref) => <Card ref={ref} as="button" interactive {...props} />)
InteractiveCard.displayName = 'InteractiveCard'

export const LinkCard = forwardRef<
  HTMLAnchorElement,
  Omit<CardComponentProps<'a'>, 'interactive' | 'as'>
>((props, ref) => <Card ref={ref} as="a" interactive {...props} />)
LinkCard.displayName = 'LinkCard'

// Card utilities for external usage
export const cardUtils = {
  /**
   * Get the CSS classes for a card variant
   */
  getVariantClasses: (variant: CardVariant) => CARD_VARIANTS[variant],

  /**
   * Get the CSS classes for a card size
   */
  getSizeClasses: (size: CardSize) => CARD_SIZES[size],

  /**
   * Clear the class cache (useful for testing)
   */
  clearCache: () => classCache.clear(),
} as const

export default Card

// Export types for external usage
export type {
  CardProps,
  CardVariant,
  CardSize,
  CardPadding,
  CardComponentProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  CardMediaProps,
}
