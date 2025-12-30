/**
 * Layout Constants
 *
 * Shared constants for consistent spacing and dimensions across components.
 *
 * @module constants/layout
 */

/**
 * Header height in pixels
 * Used for calculating scroll offsets in navigation
 */
export const HEADER_HEIGHT = 80

/**
 * Standard spacing values (in pixels)
 */
export const SPACING = {
  /** Extra small spacing (4px) */
  XS: 4,
  /** Small spacing (8px) */
  SM: 8,
  /** Medium spacing (16px) */
  MD: 16,
  /** Large spacing (24px) */
  LG: 24,
  /** Extra large spacing (32px) */
  XL: 32,
} as const

/**
 * Container max widths (in pixels)
 */
export const CONTAINER_MAX_WIDTH = {
  /** Small container (640px) */
  SM: 640,
  /** Medium container (768px) */
  MD: 768,
  /** Large container (1024px) */
  LG: 1024,
  /** Extra large container (1280px) */
  XL: 1280,
  /** Content max width (1152px / 6xl) */
  CONTENT: 1152,
} as const
