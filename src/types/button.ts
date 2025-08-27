/**
 * Button Component Type Definitions
 * Comprehensive type system for button components with polymorphic support
 */

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'
import type { ResponsiveValue } from './responsive'

// Button variants for semantic usage
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

// Button sizes
export type ButtonSize = 'sm' | 'md' | 'lg'

// Button states
export type ButtonState =
  | 'default'
  | 'hover'
  | 'focus'
  | 'active'
  | 'disabled'
  | 'loading'

// Icon positions
export type IconPosition = 'left' | 'right' | 'only'

// Base button props
export interface BaseButtonProps {
  children?: ReactNode

  // Appearance
  variant?: ResponsiveValue<ButtonVariant>
  size?: ResponsiveValue<ButtonSize>

  // State management
  disabled?: boolean
  loading?: boolean

  // Icon support
  icon?: ReactNode
  iconPosition?: IconPosition
  loadingIcon?: ReactNode

  // Visual styling
  fullWidth?: boolean
  rounded?: boolean

  // Accessibility
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-labelledby'?: string
  'aria-expanded'?: boolean
  'aria-pressed'?: boolean
  'aria-controls'?: string

  // Standard HTML attributes
  className?: string
  id?: string
  title?: string
}

// Button props with polymorphic element support
export interface ButtonProps<T extends ElementType = 'button'>
  extends BaseButtonProps {
  as?: T
}

// Polymorphic component type with proper prop forwarding
export type ButtonComponentProps<T extends ElementType> = ButtonProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof ButtonProps<T>>

// Button variant configurations
export interface ButtonVariantConfig {
  base: string
  hover: string
  focus: string
  active: string
  disabled: string
  loading: string
}

// Button size configurations
export interface ButtonSizeConfig {
  base: string
  icon: {
    size: string
    gap: string
  }
  padding: {
    horizontal: string
    vertical: string
  }
  fontSize: string
  lineHeight: string
  iconSize: string
}

// Complete button configuration
export interface ButtonConfig {
  variants: Record<ButtonVariant, ButtonVariantConfig>
  sizes: Record<ButtonSize, ButtonSizeConfig>
  defaults: {
    variant: ButtonVariant
    size: ButtonSize
    iconPosition: IconPosition
  }
}

// Loading spinner props
export interface LoadingSpinnerProps {
  size?: ButtonSize
  className?: string
}

// Button group props for future implementation
export interface ButtonGroupProps {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  orientation?: 'horizontal' | 'vertical'
  connected?: boolean
  className?: string
}

// Animation configurations
export interface ButtonAnimationConfig {
  duration: string
  easing: string
  scale: {
    hover: string
    active: string
  }
  transition: string
}

// Button theme integration
export interface ButtonTheme {
  config: ButtonConfig
  animations: ButtonAnimationConfig
  a11y: {
    focusRing: string
    highContrast: Record<ButtonVariant, ButtonVariantConfig>
  }
}

// CSS variable mapping for buttons
export interface ButtonCSSVars {
  variants: Record<ButtonVariant, Record<string, string>>
  sizes: Record<ButtonSize, Record<string, string>>
  animations: Record<string, string>
}

// Utility types for component implementation
export type ButtonElement = HTMLButtonElement | HTMLAnchorElement
export type ButtonRef<T extends ElementType> = T extends 'button'
  ? HTMLButtonElement
  : T extends 'a'
    ? HTMLAnchorElement
    : HTMLElement

// State management utilities
export interface ButtonStateUtils {
  isDisabled: (props: BaseButtonProps) => boolean
  isLoading: (props: BaseButtonProps) => boolean
  canReceiveFocus: (props: BaseButtonProps) => boolean
  getAriaAttributes: (
    props: BaseButtonProps
  ) => Record<string, string | boolean | undefined>
}

// Performance optimization types
export interface ButtonPerformanceConfig {
  memoization: boolean
  lazyLoadIcons: boolean
  optimizeAnimations: boolean
}

// Export types for external usage
export type { ComponentPropsWithoutRef, ElementType, ReactNode }
