/**
 * Design Token System Type Definitions
 *
 * Provides TypeScript support for the comprehensive design token system.
 * Includes both simple compatibility variables and semantic token structure.
 */

// Simple compatibility variables (matches main branch expectations)
export interface SimpleTokens {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  'text-muted': string
}

// Color variation structure for semantic tokens
export interface ColorVariations {
  DEFAULT: string
  hover: string
  active: string
  subtle: string
  muted: string
}

// Text color variations
export interface TextColorVariations {
  DEFAULT: string
  subtle: string
  muted: string
  disabled: string
  placeholder: string
  inverse: string
}

// Border color variations
export interface BorderColorVariations {
  DEFAULT: string
  subtle: string
  muted: string
  strong: string
}

// State color variations
export interface StateColorVariations {
  DEFAULT: string
  subtle: string
  muted: string
}

// Surface color variations
export interface SurfaceColorVariations {
  DEFAULT: string
  subtle: string
  muted: string
  hover: string
  active: string
}

// Background color variations
export interface BackgroundColorVariations {
  DEFAULT: string
  subtle: string
  muted: string
}

// Semantic color tokens structure
export interface SemanticColors {
  primary: ColorVariations
  secondary: ColorVariations
  accent: ColorVariations
  background: BackgroundColorVariations
  surface: SurfaceColorVariations
  text: TextColorVariations
  border: BorderColorVariations
  success: StateColorVariations
  warning: StateColorVariations
  error: StateColorVariations
  focus: string
}

// Font family tokens
export interface FontFamilyTokens {
  sans: string
  serif: string
  mono: string
}

// Font size tokens
export interface FontSizeTokens {
  xs: string
  sm: string
  base: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
  '5xl': string
  '6xl': string
  '7xl': string
  '8xl': string
  '9xl': string
}

// Line height tokens
export interface LineHeightTokens {
  none: string
  tight: string
  snug: string
  normal: string
  relaxed: string
  loose: string
}

// Font weight tokens
export interface FontWeightTokens {
  thin: string
  extralight: string
  light: string
  normal: string
  medium: string
  semibold: string
  bold: string
  extrabold: string
  black: string
}

// Spacing tokens
export interface SpacingTokens {
  0: string
  1: string
  2: string
  3: string
  4: string
  5: string
  6: string
  8: string
  10: string
  12: string
  16: string
  20: string
  24: string
  32: string
  40: string
  48: string
  56: string
  64: string
}

// Border radius tokens
export interface BorderRadiusTokens {
  none: string
  sm: string
  DEFAULT: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  full: string
}

// Box shadow tokens
export interface BoxShadowTokens {
  sm: string
  DEFAULT: string
  md: string
  lg: string
  xl: string
  '2xl': string
  inner: string
}

// Z-index tokens
export interface ZIndexTokens {
  hide: string
  auto: string
  base: string
  docked: string
  dropdown: string
  sticky: string
  banner: string
  overlay: string
  modal: string
  popover: string
  skiplink: string
  toast: string
  tooltip: string
}

// Transition duration tokens
export interface TransitionDurationTokens {
  instant: string
  fast: string
  normal: string
  slow: string
}

// Transition timing function tokens
export interface TransitionTimingTokens {
  linear: string
  in: string
  out: string
  'in-out': string
  'back-in': string
  'back-out': string
  'back-in-out': string
}

// Blur tokens
export interface BlurTokens {
  none: string
  sm: string
  DEFAULT: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
}

// Animation tokens
export interface AnimationTokens {
  'fade-in': string
  'slide-up': string
  'slide-down': string
}

// Complete design token system
export interface DesignTokens {
  // Simple compatibility tokens
  simple: SimpleTokens

  // Semantic token system
  semantic: SemanticColors

  // Typography tokens
  fontFamily: FontFamilyTokens
  fontSize: FontSizeTokens
  lineHeight: LineHeightTokens
  fontWeight: FontWeightTokens

  // Layout tokens
  spacing: SpacingTokens
  borderRadius: BorderRadiusTokens
  boxShadow: BoxShadowTokens
  zIndex: ZIndexTokens

  // Animation tokens
  transitionDuration: TransitionDurationTokens
  transitionTimingFunction: TransitionTimingTokens
  blur: BlurTokens
  animation: AnimationTokens
}

// Theme variants
export type ThemeVariant = 'light' | 'dark' | 'high-contrast'

// CSS custom property names for type-safe access
export const CSS_VARIABLES = {
  // Simple compatibility variables
  primary: '--primary',
  secondary: '--secondary',
  accent: '--accent',
  background: '--background',
  surface: '--surface',
  text: '--text',
  textMuted: '--text-muted',

  // Semantic color variables
  colorPrimary: '--color-primary',
  colorPrimaryHover: '--color-primary-hover',
  colorPrimaryActive: '--color-primary-active',
  colorPrimarySubtle: '--color-primary-subtle',
  colorPrimaryMuted: '--color-primary-muted',

  colorSecondary: '--color-secondary',
  colorSecondaryHover: '--color-secondary-hover',
  colorSecondaryActive: '--color-secondary-active',
  colorSecondarySubtle: '--color-secondary-subtle',
  colorSecondaryMuted: '--color-secondary-muted',

  colorAccent: '--color-accent',
  colorAccentHover: '--color-accent-hover',
  colorAccentActive: '--color-accent-active',
  colorAccentSubtle: '--color-accent-subtle',
  colorAccentMuted: '--color-accent-muted',

  colorBackground: '--color-background',
  colorBackgroundSubtle: '--color-background-subtle',
  colorBackgroundMuted: '--color-background-muted',

  colorSurface: '--color-surface',
  colorSurfaceSubtle: '--color-surface-subtle',
  colorSurfaceMuted: '--color-surface-muted',
  colorSurfaceHover: '--color-surface-hover',
  colorSurfaceActive: '--color-surface-active',

  colorText: '--color-text',
  colorTextSubtle: '--color-text-subtle',
  colorTextMuted: '--color-text-muted',
  colorTextDisabled: '--color-text-disabled',
  colorTextPlaceholder: '--color-text-placeholder',
  colorTextInverse: '--color-text-inverse',

  colorBorder: '--color-border',
  colorBorderSubtle: '--color-border-subtle',
  colorBorderMuted: '--color-border-muted',
  colorBorderStrong: '--color-border-strong',

  colorSuccess: '--color-success',
  colorSuccessSubtle: '--color-success-subtle',
  colorSuccessMuted: '--color-success-muted',

  colorWarning: '--color-warning',
  colorWarningSubtle: '--color-warning-subtle',
  colorWarningMuted: '--color-warning-muted',

  colorError: '--color-error',
  colorErrorSubtle: '--color-error-subtle',
  colorErrorMuted: '--color-error-muted',

  colorFocus: '--color-focus',
  colorFocusRing: '--color-focus-ring',

  // Typography variables
  fontFamilySans: '--font-family-sans',
  fontFamilySerif: '--font-family-serif',
  fontFamilyMono: '--font-family-mono',

  // Animation variables
  durationInstant: '--duration-instant',
  durationFast: '--duration-fast',
  durationNormal: '--duration-normal',
  durationSlow: '--duration-slow',

  easeLinear: '--ease-linear',
  easeIn: '--ease-in',
  easeOut: '--ease-out',
  easeInOut: '--ease-in-out',
  easeBackIn: '--ease-back-in',
  easeBackOut: '--ease-back-out',
  easeBackInOut: '--ease-back-in-out',
} as const

// Utility type for CSS variable names
export type CSSVariableName = (typeof CSS_VARIABLES)[keyof typeof CSS_VARIABLES]

// Helper function to get CSS variable value
export function getCSSVariable(name: CSSVariableName): string {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

// Helper function to set CSS variable value
export function setCSSVariable(name: CSSVariableName, value: string): void {
  if (typeof window === 'undefined') return
  document.documentElement.style.setProperty(name, value)
}

// Theme switching utilities
export function setTheme(theme: ThemeVariant): void {
  if (typeof window === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

export function getTheme(): ThemeVariant {
  if (typeof window === 'undefined') return 'light'
  const theme = document.documentElement.getAttribute('data-theme')
  return (theme as ThemeVariant) || 'light'
}

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}
