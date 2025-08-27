'use client'

import { useTheme } from '@/hooks/useTheme'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { ThemeVariant } from '@/types/design-tokens'

interface ThemeSwitcherProps {
  className?: string
  showLabels?: boolean
}

/**
 * Theme switcher component for changing between light and dark themes
 *
 * Features:
 * - Visual icons for each theme option
 * - Current theme highlighting
 * - Smooth transitions
 * - Keyboard accessible
 * - Optional labels
 */
export function ThemeSwitcher({
  className,
  showLabels = false,
}: ThemeSwitcherProps) {
  const { setTheme, resolvedTheme, isLoading } = useTheme()

  if (isLoading) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className="w-8 h-8 rounded-md bg-gray-200 animate-pulse" />
        <div className="w-8 h-8 rounded-md bg-gray-200 animate-pulse" />
      </div>
    )
  }

  const themes = [
    {
      id: 'light' as ThemeVariant,
      label: 'Light',
      icon: Sun,
      description: 'Light theme',
    },
    {
      id: 'dark' as ThemeVariant,
      label: 'Dark',
      icon: Moon,
      description: 'Dark theme',
    },
  ]

  return (
    <div
      className={cn('theme-switcher flex items-center space-x-1', className)}
    >
      {themes.map(({ id, label, icon: Icon, description }) => {
        const isActive = resolvedTheme === id

        return (
          <button
            key={id}
            onClick={() => {
              setTheme(id)
              // Dispatch custom event for theme change (performance optimization)
              window.dispatchEvent(
                new CustomEvent('themeChange', {
                  detail: { theme: id, timestamp: Date.now() },
                })
              )
            }}
            className={cn(
              'relative p-2 rounded-md transition-all duration-200',
              'hover:bg-[var(--color-surface-hover)] focus:outline-none',
              'focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2',
              'focus:ring-offset-[var(--color-background)]',
              isActive &&
                'bg-[var(--color-primary)] text-[var(--color-text-inverse)]',
              !isActive &&
                'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            )}
            title={description}
            aria-label={`Switch to ${label.toLowerCase()} theme`}
            aria-pressed={isActive}
          >
            <Icon size={16} className="flex-shrink-0" />
            {showLabels && (
              <span className="ml-2 text-sm font-medium">{label}</span>
            )}

            {/* Active indicator */}
            {isActive && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}
