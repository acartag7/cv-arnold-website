/**
 * ResponsiveText Component
 * Breakpoint-aware text scaling and styling
 */

'use client'

import { forwardRef } from 'react'
import { useResponsiveStyles } from '../../hooks/responsive'
import { cn } from '../../utils/cn'
import type {
  ResponsiveTextProps,
  ResponsiveValue,
} from '../../types/responsive'

/**
 * ResponsiveText component for adaptive text rendering
 *
 * @example
 * ```tsx
 * // Responsive font sizes
 * <ResponsiveText
 *   size={{ base: '14px', md: '16px', lg: '18px' }}
 *   weight={{ base: 400, md: 500, lg: 600 }}
 * >
 *   Adaptive text content
 * </ResponsiveText>
 *
 * // Different colors per breakpoint
 * <ResponsiveText
 *   color={{ base: 'text-gray-600', md: 'text-gray-800', lg: 'text-blue-600' }}
 *   as="h2"
 * >
 *   Heading with responsive colors
 * </ResponsiveText>
 *
 * // Complex responsive styling
 * <ResponsiveText
 *   size={{
 *     base: 'var(--font-size-sm)',
 *     md: 'var(--font-size-base)',
 *     lg: 'var(--font-size-lg)',
 *     xl: 'var(--font-size-xl)'
 *   }}
 *   weight={{ base: 'var(--font-weight-normal)', lg: 'var(--font-weight-medium)' }}
 *   className="leading-relaxed"
 * >
 *   Text using design tokens
 * </ResponsiveText>
 * ```
 */
export const ResponsiveText = forwardRef<HTMLElement, ResponsiveTextProps>(
  (
    {
      children,
      size,
      weight,
      color,
      className,
      as: Component = 'span',
      ...props
    },
    ref
  ) => {
    // Build responsive styles object
    const responsiveStylesObj: Record<
      string,
      ResponsiveValue<string | number>
    > = {}

    if (size) {
      responsiveStylesObj.fontSize = size
    }

    if (weight) {
      responsiveStylesObj.fontWeight = weight
    }

    // Resolve responsive styles
    const styles = useResponsiveStyles(responsiveStylesObj)

    // Handle responsive color classes
    const responsiveColorClass = color
      ? typeof color === 'object' && color !== null && !Array.isArray(color)
        ? Object.entries(color)
            .map(([bp, colorClass]) =>
              bp === 'base' ? colorClass : `${bp}:${colorClass}`
            )
            .join(' ')
        : color
      : ''

    const combinedClassName = cn(responsiveColorClass, className)

    const ElementType = Component as React.ElementType

    return (
      <ElementType
        ref={ref}
        className={combinedClassName}
        style={styles}
        {...props}
      >
        {children}
      </ElementType>
    )
  }
)

ResponsiveText.displayName = 'ResponsiveText'

/**
 * ResponsiveHeading component - preset for headings with responsive typography
 *
 * @example
 * ```tsx
 * <ResponsiveHeading level={1}>
 *   Main Title
 * </ResponsiveHeading>
 *
 * <ResponsiveHeading level={2} color={{ base: 'text-gray-700', md: 'text-gray-900' }}>
 *   Section Heading
 * </ResponsiveHeading>
 * ```
 */
export const ResponsiveHeading = forwardRef<
  HTMLHeadingElement,
  Omit<ResponsiveTextProps, 'as'> & {
    level: 1 | 2 | 3 | 4 | 5 | 6
  }
>(({ level, size, weight, color, children, className, ...props }, ref) => {
  // Default responsive sizes for headings
  const defaultSizes = {
    1: {
      base: 'var(--font-size-2xl)',
      md: 'var(--font-size-3xl)',
      lg: 'var(--font-size-4xl)',
      xl: 'var(--font-size-5xl)',
    },
    2: {
      base: 'var(--font-size-xl)',
      md: 'var(--font-size-2xl)',
      lg: 'var(--font-size-3xl)',
    },
    3: {
      base: 'var(--font-size-lg)',
      md: 'var(--font-size-xl)',
      lg: 'var(--font-size-2xl)',
    },
    4: {
      base: 'var(--font-size-base)',
      md: 'var(--font-size-lg)',
      lg: 'var(--font-size-xl)',
    },
    5: {
      base: 'var(--font-size-sm)',
      md: 'var(--font-size-base)',
      lg: 'var(--font-size-lg)',
    },
    6: {
      base: 'var(--font-size-xs)',
      md: 'var(--font-size-sm)',
      lg: 'var(--font-size-base)',
    },
  }

  // Default responsive weights for headings
  const defaultWeights = {
    1: { base: 'var(--font-weight-bold)', lg: 'var(--font-weight-extrabold)' },
    2: { base: 'var(--font-weight-semibold)', lg: 'var(--font-weight-bold)' },
    3: { base: 'var(--font-weight-semibold)', lg: 'var(--font-weight-bold)' },
    4: { base: 'var(--font-weight-medium)', lg: 'var(--font-weight-semibold)' },
    5: { base: 'var(--font-weight-medium)', lg: 'var(--font-weight-semibold)' },
    6: { base: 'var(--font-weight-medium)' },
  }

  const Component = `h${level}` as React.ElementType

  return (
    <ResponsiveText
      ref={ref}
      as={Component}
      size={size || defaultSizes[level]}
      weight={weight || defaultWeights[level]}
      {...(color && { color })}
      className={className}
      {...props}
    >
      {children}
    </ResponsiveText>
  )
})

ResponsiveHeading.displayName = 'ResponsiveHeading'

/**
 * ResponsiveParagraph component - preset for body text with responsive typography
 *
 * @example
 * ```tsx
 * <ResponsiveParagraph>
 *   Regular paragraph with responsive sizing
 * </ResponsiveParagraph>
 *
 * <ResponsiveParagraph variant="large">
 *   Large paragraph for emphasis
 * </ResponsiveParagraph>
 *
 * <ResponsiveParagraph variant="small">
 *   Small paragraph for secondary content
 * </ResponsiveParagraph>
 * ```
 */
export const ResponsiveParagraph = forwardRef<
  HTMLParagraphElement,
  Omit<ResponsiveTextProps, 'as'> & {
    variant?: 'small' | 'base' | 'large'
  }
>(
  (
    { variant = 'base', size, weight, color, children, className, ...props },
    ref
  ) => {
    // Default responsive sizes for paragraphs
    const defaultSizes = {
      small: {
        base: 'var(--font-size-sm)',
        md: 'var(--font-size-sm)',
        lg: 'var(--font-size-base)',
      },
      base: {
        base: 'var(--font-size-base)',
        md: 'var(--font-size-base)',
        lg: 'var(--font-size-lg)',
      },
      large: {
        base: 'var(--font-size-lg)',
        md: 'var(--font-size-xl)',
        lg: 'var(--font-size-2xl)',
      },
    }

    const defaultWeights = {
      small: { base: 'var(--font-weight-normal)' },
      base: { base: 'var(--font-weight-normal)' },
      large: {
        base: 'var(--font-weight-normal)',
        lg: 'var(--font-weight-medium)',
      },
    }

    return (
      <ResponsiveText
        ref={ref}
        as="p"
        size={size || defaultSizes[variant]}
        weight={weight || defaultWeights[variant]}
        {...(color && { color })}
        className={className}
        {...props}
      >
        {children}
      </ResponsiveText>
    )
  }
)

ResponsiveParagraph.displayName = 'ResponsiveParagraph'
