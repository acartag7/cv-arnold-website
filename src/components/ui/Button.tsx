/**
 * Button Component
 * Comprehensive button system with polymorphic support, accessibility, and performance optimization
 */

'use client'

import React, { forwardRef, memo, useMemo } from 'react'
import type { ElementType } from 'react'
import { cn } from '@/utils/cn'
import { resolveResponsiveValue } from '@/utils/breakpoints'
import { useBreakpoint } from '@/hooks/responsive'
import type {
  ButtonProps,
  ButtonComponentProps,
  ButtonVariant,
  ButtonSize,
  ButtonVariantConfig,
  ButtonSizeConfig,
  LoadingSpinnerProps,
} from '@/types/button'

// Button variant configurations with semantic color system
const BUTTON_VARIANTS: Record<ButtonVariant, ButtonVariantConfig> = {
  primary: {
    base: 'bg-semantic-primary text-semantic-text-inverse border-semantic-primary',
    hover:
      'hover:bg-semantic-primary-hover hover:border-semantic-primary-hover',
    focus:
      'focus:ring-2 focus:ring-semantic-focus focus:ring-offset-2 focus:ring-offset-semantic-background',
    active:
      'active:bg-semantic-primary-active active:border-semantic-primary-active active:scale-95',
    disabled:
      'disabled:bg-semantic-text-disabled disabled:text-semantic-text-disabled disabled:border-semantic-border-subtle disabled:cursor-not-allowed',
    loading: 'cursor-wait',
  },
  secondary: {
    base: 'bg-semantic-secondary text-semantic-text-inverse border-semantic-secondary',
    hover:
      'hover:bg-semantic-secondary-hover hover:border-semantic-secondary-hover',
    focus:
      'focus:ring-2 focus:ring-semantic-focus focus:ring-offset-2 focus:ring-offset-semantic-background',
    active:
      'active:bg-semantic-secondary-active active:border-semantic-secondary-active active:scale-95',
    disabled:
      'disabled:bg-semantic-text-disabled disabled:text-semantic-text-disabled disabled:border-semantic-border-subtle disabled:cursor-not-allowed',
    loading: 'cursor-wait',
  },
  ghost: {
    base: 'bg-transparent text-semantic-text border-semantic-border hover:bg-semantic-surface-hover',
    hover: 'hover:bg-semantic-surface-hover hover:text-semantic-primary',
    focus:
      'focus:ring-2 focus:ring-semantic-focus focus:ring-offset-2 focus:ring-offset-semantic-background',
    active: 'active:bg-semantic-surface-active active:scale-95',
    disabled:
      'disabled:bg-transparent disabled:text-semantic-text-disabled disabled:border-semantic-border-subtle disabled:cursor-not-allowed',
    loading: 'cursor-wait',
  },
  danger: {
    base: 'bg-semantic-error text-semantic-text-inverse border-semantic-error',
    hover: 'hover:bg-red-700 hover:border-red-700',
    focus:
      'focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-semantic-background',
    active: 'active:bg-red-800 active:border-red-800 active:scale-95',
    disabled:
      'disabled:bg-semantic-text-disabled disabled:text-semantic-text-disabled disabled:border-semantic-border-subtle disabled:cursor-not-allowed',
    loading: 'cursor-wait',
  },
}

// Button size configurations with 8px grid alignment
const BUTTON_SIZES: Record<ButtonSize, ButtonSizeConfig> = {
  sm: {
    base: 'h-8 min-w-8',
    icon: {
      size: 'w-4 h-4',
      gap: 'gap-1',
    },
    padding: {
      horizontal: 'px-3',
      vertical: 'py-1',
    },
    fontSize: 'text-sm',
    lineHeight: 'leading-tight',
    iconSize: '16px',
  },
  md: {
    base: 'h-10 min-w-10',
    icon: {
      size: 'w-5 h-5',
      gap: 'gap-2',
    },
    padding: {
      horizontal: 'px-4',
      vertical: 'py-2',
    },
    fontSize: 'text-base',
    lineHeight: 'leading-normal',
    iconSize: '20px',
  },
  lg: {
    base: 'h-12 min-w-12',
    icon: {
      size: 'w-6 h-6',
      gap: 'gap-2',
    },
    padding: {
      horizontal: 'px-6',
      vertical: 'py-3',
    },
    fontSize: 'text-lg',
    lineHeight: 'leading-normal',
    iconSize: '24px',
  },
}

// Loading spinner component with memoization
const LoadingSpinner = memo<LoadingSpinnerProps>(
  ({ size = 'md', className }) => {
    const sizeConfig = BUTTON_SIZES[size]

    return (
      <svg
        className={cn('animate-spin', sizeConfig.icon.size, className)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    )
  }
)
LoadingSpinner.displayName = 'LoadingSpinner'

// Utility functions for button state management
const buttonUtils = {
  isDisabled: (disabled?: boolean, loading?: boolean) => disabled || loading,

  shouldShowLoadingSpinner: (
    loading?: boolean,
    loadingIcon?: React.ReactNode
  ) => loading && !loadingIcon,

  getIconElement: (
    icon?: React.ReactNode,
    loadingIcon?: React.ReactNode,
    loading?: boolean
  ) => {
    if (loading && loadingIcon) return loadingIcon
    return icon
  },

  buildAriaAttributes: (props: ButtonProps) => {
    const aria: Record<string, string | boolean | undefined> = {}

    if (props['aria-label']) aria['aria-label'] = props['aria-label']
    if (props['aria-describedby'])
      aria['aria-describedby'] = props['aria-describedby']
    if (props['aria-labelledby'])
      aria['aria-labelledby'] = props['aria-labelledby']
    if (props['aria-expanded'] !== undefined)
      aria['aria-expanded'] = props['aria-expanded']
    if (props['aria-pressed'] !== undefined)
      aria['aria-pressed'] = props['aria-pressed']
    if (props['aria-controls']) aria['aria-controls'] = props['aria-controls']

    // Add loading state to screen readers
    if (props.loading) {
      aria['aria-busy'] = true
      if (!props['aria-label']) {
        aria['aria-label'] = 'Loading'
      }
    }

    return aria
  },
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

// Main Button component with polymorphic support
const ButtonComponent = forwardRef<
  HTMLElement,
  ButtonComponentProps<ElementType>
>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      icon,
      iconPosition = 'left',
      loadingIcon,
      fullWidth = false,
      rounded = false,
      as,
      className,
      ...props
    },
    ref
  ) => {
    const { current: currentBreakpoint } = useBreakpoint()

    // Resolve responsive values with memoization
    const resolvedVariant = useMemo(
      () => resolveResponsiveValue(variant, currentBreakpoint) as ButtonVariant,
      [variant, currentBreakpoint]
    )
    const resolvedSize = useMemo(
      () => resolveResponsiveValue(size, currentBreakpoint) as ButtonSize,
      [size, currentBreakpoint]
    )

    // Get configuration objects
    const variantConfig = BUTTON_VARIANTS[resolvedVariant]
    const sizeConfig = BUTTON_SIZES[resolvedSize]

    // Determine the component element
    const Component = as || 'button'

    // Calculate derived states
    const isDisabled = buttonUtils.isDisabled(disabled, loading)
    const showLoadingSpinner = buttonUtils.shouldShowLoadingSpinner(
      loading,
      loadingIcon
    )
    const displayIcon = buttonUtils.getIconElement(icon, loadingIcon, loading)
    const hasIconOnly =
      iconPosition === 'only' ||
      (!children && (displayIcon || showLoadingSpinner))

    // Build aria attributes
    const ariaAttributes = useMemo(
      () =>
        buttonUtils.buildAriaAttributes({
          ...(props as ButtonProps),
          loading,
          disabled,
        }),
      [props, loading, disabled]
    )

    // Generate cache key for class combinations
    const cacheKey = `${resolvedVariant}-${resolvedSize}-${isDisabled}-${loading}-${fullWidth}-${rounded}-${hasIconOnly}-${iconPosition}`

    // Build CSS classes with caching
    const classes = useMemo(() => {
      if (classCache.has(cacheKey)) {
        return cn(classCache.get(cacheKey)!, className)
      }

      const baseClasses = cn(
        // Base button styles
        'inline-flex items-center justify-center',
        'font-medium transition-all duration-normal ease-out',
        'border border-solid',
        'outline-none select-none',
        'relative overflow-hidden',

        // Size configuration
        sizeConfig.base,
        sizeConfig.fontSize,
        sizeConfig.lineHeight,

        // Padding (conditional based on icon presence)
        hasIconOnly
          ? 'p-0' // Icon-only buttons use square dimensions
          : cn(sizeConfig.padding.horizontal, sizeConfig.padding.vertical),

        // Icon spacing
        displayIcon && children && sizeConfig.icon.gap,

        // Variant styles
        variantConfig.base,

        // Interactive states (only if not disabled)
        !isDisabled && [
          variantConfig.hover,
          variantConfig.focus,
          variantConfig.active,
        ],

        // Disabled state
        isDisabled && variantConfig.disabled,

        // Loading state
        loading && variantConfig.loading,

        // Layout options
        fullWidth && 'w-full',
        rounded && 'rounded-full',
        !rounded && 'rounded-md',

        // Focus management
        'focus-visible:outline-none',

        // High contrast support
        'forced-colors:border-[ButtonBorder]',
        'forced-colors:text-[ButtonText]',
        'forced-colors:disabled:border-[GrayText]',
        'forced-colors:disabled:text-[GrayText]'
      )

      addToCache(cacheKey, baseClasses)
      return cn(baseClasses, className)
    }, [
      cacheKey,
      className,
      sizeConfig,
      hasIconOnly,
      displayIcon,
      children,
      variantConfig,
      isDisabled,
      loading,
      fullWidth,
      rounded,
    ])

    // Render icon with proper positioning
    const renderIcon = () => {
      if (showLoadingSpinner) {
        return <LoadingSpinner size={resolvedSize} />
      }

      if (displayIcon) {
        return (
          <span
            className={cn(sizeConfig.icon.size, 'flex-shrink-0')}
            style={{ fontSize: sizeConfig.iconSize }}
            aria-hidden="true"
          >
            {displayIcon}
          </span>
        )
      }

      return null
    }

    // Determine content layout based on icon position
    const renderContent = () => {
      if (hasIconOnly) {
        return renderIcon()
      }

      const iconElement = renderIcon()

      if (!iconElement) {
        return children
      }

      if (iconPosition === 'right') {
        return (
          <>
            {children}
            {iconElement}
          </>
        )
      }

      // Default to left position
      return (
        <>
          {iconElement}
          {children}
        </>
      )
    }

    // Handle button-specific props
    const buttonProps: Record<string, unknown> = {}
    if (Component === 'button') {
      buttonProps.type = 'type' in props ? (props.type as string) : 'button'
      buttonProps.disabled = isDisabled
    }

    // Development-time validation (removed console warnings for production safety)

    return (
      <Component
        ref={ref}
        className={classes}
        {...buttonProps}
        {...ariaAttributes}
        {...props}
      >
        {renderContent()}
      </Component>
    )
  }
)

ButtonComponent.displayName = 'Button'

// Export the main component with proper typing
export const Button = ButtonComponent as <T extends ElementType = 'button'>(
  props: ButtonComponentProps<T> & { ref?: React.Ref<HTMLElement> }
) => React.ReactElement | null

// Convenience components for common button types
export const PrimaryButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonComponentProps<'button'>, 'variant'>
>((props, ref) => <Button ref={ref} variant="primary" {...props} />)
PrimaryButton.displayName = 'PrimaryButton'

export const SecondaryButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonComponentProps<'button'>, 'variant'>
>((props, ref) => <Button ref={ref} variant="secondary" {...props} />)
SecondaryButton.displayName = 'SecondaryButton'

export const GhostButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonComponentProps<'button'>, 'variant'>
>((props, ref) => <Button ref={ref} variant="ghost" {...props} />)
GhostButton.displayName = 'GhostButton'

export const DangerButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonComponentProps<'button'>, 'variant'>
>((props, ref) => <Button ref={ref} variant="danger" {...props} />)
DangerButton.displayName = 'DangerButton'

// Icon button convenience component
export const IconButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonComponentProps<'button'>, 'iconPosition' | 'children'> & {
    icon: React.ReactNode
    'aria-label': string // Required for icon buttons
  }
>((props, ref) => (
  <Button ref={ref} iconPosition="only" {...props}>
    {/* Children are ignored for icon buttons */}
  </Button>
))
IconButton.displayName = 'IconButton'

// Link button component for navigation
export const LinkButton = forwardRef<
  HTMLAnchorElement,
  Omit<ButtonComponentProps<'a'>, 'as'>
>((props, ref) => <Button ref={ref} as="a" {...props} />)
LinkButton.displayName = 'LinkButton'

// Button utilities for external usage
export const buttonUtilsExport = {
  /**
   * Get the CSS classes for a button variant
   */
  getVariantClasses: (variant: ButtonVariant) => BUTTON_VARIANTS[variant],

  /**
   * Get the CSS classes for a button size
   */
  getSizeClasses: (size: ButtonSize) => BUTTON_SIZES[size],

  /**
   * Check if a button should be disabled
   */
  isDisabled: buttonUtils.isDisabled,

  /**
   * Get ARIA attributes for a button
   */
  getAriaAttributes: buttonUtils.buildAriaAttributes,

  /**
   * Clear the class cache (useful for testing)
   */
  clearCache: () => classCache.clear(),
} as const

export default Button

// Export types for external usage
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonComponentProps }
