/**
 * Default Theme Palettes
 *
 * These serve as fallback values when CMS theme configuration is missing.
 * The green palette is the default brand theme.
 */

import type { ColorPalette } from '@/types'

/**
 * Extended palette with scanlines effect for dashboard theme
 */
export interface DashboardPalette extends ColorPalette {
  scanlines: string
}

/**
 * Default color palettes (green theme)
 * Used as fallback when CMS themeConfig is not configured
 */
export const DEFAULT_PALETTES: Record<'dark' | 'light', DashboardPalette> = {
  dark: {
    bg: '#0A0A0F',
    surface: '#12121A',
    surfaceHover: '#1A1A24',
    border: '#1E1E2E',
    text: '#FFFFFF',
    textMuted: '#B4B4BC',
    textDim: '#6B7280',
    accent: '#00FF94',
    accentDim: 'rgba(0, 255, 148, 0.15)',
    scanlines: 'rgba(255, 255, 255, 0.03)',
  },
  light: {
    bg: '#F8FAFB',
    surface: '#FFFFFF',
    surfaceHover: '#F1F5F9',
    border: '#E2E8F0',
    text: '#0F172A',
    textMuted: '#64748B',
    textDim: '#CBD5E1',
    accent: '#059669',
    accentDim: 'rgba(5, 150, 105, 0.1)',
    scanlines: 'rgba(0, 0, 0, 0.02)',
  },
}
