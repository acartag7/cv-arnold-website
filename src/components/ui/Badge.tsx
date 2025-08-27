/**
 * Badge Component
 * Status indicators and tags with multiple variants and sizes
 */

'use client'

import React, { forwardRef, useMemo } from 'react'
import type { ElementType } from 'react'
import { cn } from '@/utils/cn'
import type {
  BadgeProps,
  BadgeComponentProps,
  BadgeVariant,
  BadgeSize,
  BadgeVariantConfig,
  BadgeSizeConfig,
} from '@/types/badge'

// Badge variant configurations with semantic color system
const BADGE_VARIANTS: Record<BadgeVariant, BadgeVariantConfig> = {
  primary: {
    base: 'bg-semantic-primary text-semantic-text-inverse',
    hover: 'hover:bg-semantic-primary-hover',
    focus: 'focus:ring-2 focus:ring-semantic-focus focus:ring-offset-1',
    active: 'active:bg-semantic-primary-active active:scale-95',
  },
  secondary: {
    base: 'bg-semantic-secondary text-semantic-text-inverse',
    hover: 'hover:bg-semantic-secondary-hover',
    focus: 'focus:ring-2 focus:ring-semantic-focus focus:ring-offset-1',
    active: 'active:bg-semantic-secondary-active active:scale-95',
  },
  success: {
    base: 'bg-semantic-success text-white',
    hover: 'hover:bg-success-600',
    focus: 'focus:ring-2 focus:ring-success-500 focus:ring-offset-1',
    active: 'active:bg-success-700 active:scale-95',
  },
  warning: {
    base: 'bg-semantic-warning text-warning-900',
    hover: 'hover:bg-warning-600',
    focus: 'focus:ring-2 focus:ring-warning-500 focus:ring-offset-1',
    active: 'active:bg-warning-700 active:scale-95',
  },
  error: {
    base: 'bg-semantic-error text-white',
    hover: 'hover:bg-error-600',
    focus: 'focus:ring-2 focus:ring-error-500 focus:ring-offset-1',
    active: 'active:bg-error-700 active:scale-95',
  },
  neutral: {
    base: 'bg-neutral-100 text-neutral-800 border border-neutral-200',
    hover: 'hover:bg-neutral-200 hover:border-neutral-300',
    focus: 'focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1',
    active: 'active:bg-neutral-300 active:scale-95',
  },
  accent: {
    base: 'bg-accent-100 text-accent-800 border border-accent-200',
    hover: 'hover:bg-accent-200 hover:border-accent-300',
    focus: 'focus:ring-2 focus:ring-accent-400 focus:ring-offset-1',
    active: 'active:bg-accent-300 active:scale-95',
  },
}

// Dark theme variants
const BADGE_VARIANTS_DARK: Record<BadgeVariant, Partial<BadgeVariantConfig>> = {
  primary: {},
  secondary: {},
  success: {},
  warning: {
    base: 'dark:bg-warning-500 dark:text-warning-50',
  },
  error: {},
  neutral: {
    base: 'dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700',
    hover: 'dark:hover:bg-neutral-700 dark:hover:border-neutral-600',
  },
  accent: {
    base: 'dark:bg-accent-800 dark:text-accent-100 dark:border-accent-700',
    hover: 'dark:hover:bg-accent-700 dark:hover:border-accent-600',
  },
}

// Badge size configurations with 8px grid alignment
const BADGE_SIZES: Record<BadgeSize, BadgeSizeConfig> = {
  sm: {
    base: 'h-5 min-w-5',
    padding: 'px-2 py-0.5',
    fontSize: 'text-xs',
    iconSize: '12px',
  },
  md: {
    base: 'h-6 min-w-6',
    padding: 'px-2.5 py-1',
    fontSize: 'text-sm',
    iconSize: '14px',
  },
  lg: {
    base: 'h-8 min-w-8',
    padding: 'px-3 py-1.5',
    fontSize: 'text-base',
    iconSize: '16px',
  },
}

// Cache for class name combinations to improve performance
const classCache = new Map<string, string>()

// Badge utilities
const badgeUtils = {
  buildVariantClasses: (variant: BadgeVariant) => {
    const base = BADGE_VARIANTS[variant]
    const dark = BADGE_VARIANTS_DARK[variant]

    return {
      base: cn(base.base, dark.base),
      hover: cn(base.hover, dark.hover),
      focus: cn(base.focus, dark.focus),
      active: cn(base.active, dark.active),
    }
  },

  shouldShowIcon: (icon?: React.ReactNode) => Boolean(icon),

  getIconElement: (icon?: React.ReactNode, size?: BadgeSize) => {
    if (!icon) return null

    const sizeConfig = BADGE_SIZES[(size || 'md') as BadgeSize]
    return (
      <span
        className={cn('flex-shrink-0 inline-flex items-center justify-center')}
        style={{ fontSize: sizeConfig.iconSize }}
        aria-hidden="true"
      >
        {icon}
      </span>
    )
  },
}

// Main Badge component with polymorphic support
const BadgeComponent = forwardRef<
  HTMLElement,
  BadgeComponentProps<ElementType>
>(
  (
    {
      children,
      variant = 'neutral',
      size = 'md',
      interactive = false,
      rounded = false,
      icon,
      iconPosition = 'left',
      as,
      className,
      ...props
    },
    ref
  ) => {
    // Get configuration objects
    const variantConfig = badgeUtils.buildVariantClasses(
      variant as BadgeVariant
    )
    const sizeConfig = BADGE_SIZES[size as BadgeSize]

    // Determine the component element
    const Component = as || 'span'

    // Calculate derived states
    const showIcon = badgeUtils.shouldShowIcon(icon)
    const displayIcon = badgeUtils.getIconElement(icon, size)
    const hasOnlyIcon = !children && showIcon

    // Generate cache key for class combinations
    const cacheKey = `${variant}-${size}-${interactive}-${rounded}-${showIcon}-${iconPosition}`

    // Build CSS classes with caching
    const classes = useMemo(() => {
      if (classCache.has(cacheKey)) {
        return cn(classCache.get(cacheKey)!, className)
      }

      const baseClasses = cn(
        // Base badge styles
        'inline-flex items-center justify-center',
        'font-medium whitespace-nowrap',
        'transition-all duration-normal ease-out',
        'outline-none select-none',

        // Size configuration
        sizeConfig.base,
        sizeConfig.fontSize,

        // Padding (adjust for icon-only badges)
        hasOnlyIcon ? 'p-1' : sizeConfig.padding,

        // Icon spacing
        showIcon &&
          children &&
          (iconPosition === 'right' ? 'gap-1.5' : 'gap-1.5'),

        // Variant styles
        variantConfig.base,

        // Interactive states (only if interactive)
        interactive && [
          'cursor-pointer',
          variantConfig.hover,
          variantConfig.focus,
          variantConfig.active,
        ],

        // Border radius
        rounded ? 'rounded-full' : 'rounded-md',

        // Focus management
        'focus-visible:outline-none',

        // High contrast support
        'forced-colors:border-[ButtonBorder]',
        'forced-colors:text-[ButtonText]'
      )

      classCache.set(cacheKey, baseClasses)
      return cn(baseClasses, className)
    }, [
      cacheKey,
      className,
      sizeConfig,
      variantConfig,
      interactive,
      rounded,
      hasOnlyIcon,
      showIcon,
      children,
      iconPosition,
    ])

    // Handle interactive props
    const interactiveProps: Record<string, unknown> = {}
    if (interactive) {
      if (Component === 'button') {
        interactiveProps.type =
          'type' in props ? (props.type as string) : 'button'
      }
      if (Component === 'a') {
        interactiveProps.role = 'button'
      }
    }

    // Render content with proper icon positioning
    const renderContent = () => {
      if (hasOnlyIcon) {
        return displayIcon
      }

      if (!displayIcon) {
        return children
      }

      if (iconPosition === 'right') {
        return (
          <>
            {children}
            {displayIcon}
          </>
        )
      }

      // Default to left position
      return (
        <>
          {displayIcon}
          {children}
        </>
      )
    }

    return (
      <Component ref={ref} className={classes} {...interactiveProps} {...props}>
        {renderContent()}
      </Component>
    )
  }
)

BadgeComponent.displayName = 'Badge'

// Export the main component with proper typing
export const Badge = BadgeComponent as <T extends ElementType = 'span'>(
  props: BadgeComponentProps<T> & { ref?: React.Ref<HTMLElement> }
) => React.ReactElement | null

// Convenience components for common badge variants
export const PrimaryBadge = forwardRef<
  HTMLSpanElement,
  Omit<BadgeComponentProps<'span'>, 'variant'>
>((props, ref) => <Badge ref={ref} variant="primary" {...props} />)
PrimaryBadge.displayName = 'PrimaryBadge'

export const SecondaryBadge = forwardRef<
  HTMLSpanElement,
  Omit<BadgeComponentProps<'span'>, 'variant'>
>((props, ref) => <Badge ref={ref} variant="secondary" {...props} />)
SecondaryBadge.displayName = 'SecondaryBadge'

export const SuccessBadge = forwardRef<
  HTMLSpanElement,
  Omit<BadgeComponentProps<'span'>, 'variant'>
>((props, ref) => <Badge ref={ref} variant="success" {...props} />)
SuccessBadge.displayName = 'SuccessBadge'

export const WarningBadge = forwardRef<
  HTMLSpanElement,
  Omit<BadgeComponentProps<'span'>, 'variant'>
>((props, ref) => <Badge ref={ref} variant="warning" {...props} />)
WarningBadge.displayName = 'WarningBadge'

export const ErrorBadge = forwardRef<
  HTMLSpanElement,
  Omit<BadgeComponentProps<'span'>, 'variant'>
>((props, ref) => <Badge ref={ref} variant="error" {...props} />)
ErrorBadge.displayName = 'ErrorBadge'

export const NeutralBadge = forwardRef<
  HTMLSpanElement,
  Omit<BadgeComponentProps<'span'>, 'variant'>
>((props, ref) => <Badge ref={ref} variant="neutral" {...props} />)
NeutralBadge.displayName = 'NeutralBadge'

// Interactive badge variants
export const InteractiveBadge = forwardRef<
  HTMLButtonElement,
  Omit<BadgeComponentProps<'button'>, 'interactive' | 'as'>
>((props, ref) => <Badge ref={ref} as="button" interactive {...props} />)
InteractiveBadge.displayName = 'InteractiveBadge'

export const LinkBadge = forwardRef<
  HTMLAnchorElement,
  Omit<BadgeComponentProps<'a'>, 'interactive' | 'as'>
>((props, ref) => <Badge ref={ref} as="a" interactive {...props} />)
LinkBadge.displayName = 'LinkBadge'

// Badge utilities for external usage
export const badgeUtilsExport = {
  /**
   * Get the CSS classes for a badge variant
   */
  getVariantClasses: (variant: BadgeVariant) =>
    badgeUtils.buildVariantClasses(variant),

  /**
   * Get the CSS classes for a badge size
   */
  getSizeClasses: (size: BadgeSize) => BADGE_SIZES[size],

  /**
   * Clear the class cache (useful for testing)
   */
  clearCache: () => classCache.clear(),
} as const

export default Badge

// Export types for external usage
export type { BadgeProps, BadgeVariant, BadgeSize, BadgeComponentProps }
