/**
 * Responsive Components
 * Breakpoint-aware UI components for adaptive layouts
 */

// Visibility components
export { Show, ShowAbove, ShowBelow, ShowOnly, ShowBetween } from './Show'

export { Hide, HideAbove, HideBelow, HideOnly, HideBetween } from './Hide'

// Typography components
export {
  ResponsiveText,
  ResponsiveHeading,
  ResponsiveParagraph,
} from './ResponsiveText'

// Media components
export {
  ResponsiveImage,
  ResponsiveBackground,
  ResponsiveAvatar,
} from './ResponsiveImage'

// Re-export types for convenience
export type {
  ResponsiveShowHideProps,
  ResponsiveTextProps,
  ResponsiveImageProps,
} from '../../types/responsive'
