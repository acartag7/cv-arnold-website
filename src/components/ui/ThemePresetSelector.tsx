'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Palette, Check, ChevronDown } from 'lucide-react'
import type { ThemePreset } from '@/types'

interface ThemePresetSelectorProps {
  presets: Record<string, ThemePreset>
  activePreset: string
  onPresetChange: (presetId: string) => void
  colors: {
    surface: string
    border: string
    text: string
    textMuted: string
    accent: string
  }
}

export function ThemePresetSelector({
  presets,
  activePreset,
  onPresetChange,
  colors,
}: ThemePresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const presetEntries = Object.values(presets)
  const currentPreset = presets[activePreset]

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) {
        if (
          event.key === 'Enter' ||
          event.key === ' ' ||
          event.key === 'ArrowDown'
        ) {
          event.preventDefault()
          setIsOpen(true)
          setFocusedIndex(0)
        }
        return
      }

      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          setIsOpen(false)
          setFocusedIndex(-1)
          triggerRef.current?.focus()
          break
        case 'ArrowDown':
          event.preventDefault()
          setFocusedIndex(prev =>
            prev < presetEntries.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusedIndex(prev =>
            prev > 0 ? prev - 1 : presetEntries.length - 1
          )
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < presetEntries.length) {
            const selectedPreset = presetEntries[focusedIndex]
            if (selectedPreset) {
              onPresetChange(selectedPreset.id)
              setIsOpen(false)
              setFocusedIndex(-1)
              triggerRef.current?.focus()
            }
          }
          break
        case 'Tab':
          setIsOpen(false)
          setFocusedIndex(-1)
          break
      }
    },
    [isOpen, focusedIndex, presetEntries, onPresetChange]
  )

  const handlePresetSelect = (presetId: string) => {
    onPresetChange(presetId)
    setIsOpen(false)
    setFocusedIndex(-1)
  }

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]')
      items[focusedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [focusedIndex])

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ fontFamily: 'inherit' }}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Theme: ${currentPreset?.name || 'Select theme'}`}
        className="flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-all duration-200"
        style={{
          background: colors.surface,
          border: `1px solid ${isOpen ? colors.accent : colors.border}`,
          color: colors.textMuted,
          boxShadow: isOpen
            ? `0 0 0 1px ${colors.accent}40, 0 0 12px ${colors.accent}20`
            : 'none',
        }}
      >
        <Palette
          size={14}
          style={{
            color: colors.accent,
            filter: `drop-shadow(0 0 2px ${colors.accent}60)`,
          }}
        />
        <span
          className="hidden sm:inline"
          style={{ color: isOpen ? colors.accent : colors.textMuted }}
        >
          {currentPreset?.name || 'Theme'}
        </span>
        <ChevronDown
          size={12}
          style={{
            color: colors.textMuted,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease',
          }}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          aria-activedescendant={
            focusedIndex >= 0
              ? `preset-${presetEntries[focusedIndex]?.id}`
              : undefined
          }
          onKeyDown={handleKeyDown}
          className="absolute top-full right-0 mt-2 min-w-[200px] rounded-lg overflow-hidden z-50"
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 4px 24px rgba(0, 0, 0, 0.3), 0 0 1px ${colors.accent}30`,
            animation: 'themeDropdownEnter 150ms ease-out',
          }}
        >
          {/* Terminal Header */}
          <div
            className="flex items-center gap-2 px-3 py-2 text-xs"
            style={{
              borderBottom: `1px solid ${colors.border}`,
              background: `linear-gradient(180deg, ${colors.surface} 0%, transparent 100%)`,
            }}
          >
            <span style={{ color: colors.accent }}>&gt;</span>
            <span style={{ color: colors.textMuted }}>select_theme</span>
          </div>

          {/* Preset Options */}
          <div className="py-1">
            {presetEntries.map((preset, index) => {
              const isActive = activePreset === preset.id
              const isFocused = focusedIndex === index

              return (
                <button
                  key={preset.id}
                  id={`preset-${preset.id}`}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handlePresetSelect(preset.id)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150"
                  style={{
                    background: isFocused
                      ? `${colors.accent}15`
                      : isActive
                        ? `${colors.accent}10`
                        : 'transparent',
                    borderLeft: isActive
                      ? `2px solid ${colors.accent}`
                      : '2px solid transparent',
                    color: colors.text,
                  }}
                >
                  {/* Color Preview Dots */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: preset.dark.accent,
                        boxShadow: `0 0 4px ${preset.dark.accent}80`,
                      }}
                      title="Dark mode accent"
                    />
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: preset.light.accent,
                        border: `1px solid ${colors.border}`,
                      }}
                      title="Light mode accent"
                    />
                  </div>

                  {/* Preset Info */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-medium truncate"
                      style={{
                        color: isActive ? colors.accent : colors.text,
                      }}
                    >
                      {preset.name}
                    </div>
                    {preset.description && (
                      <div
                        className="text-xs truncate mt-0.5"
                        style={{ color: colors.textMuted }}
                      >
                        {preset.description}
                      </div>
                    )}
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <Check
                      size={14}
                      style={{
                        color: colors.accent,
                        filter: `drop-shadow(0 0 3px ${colors.accent})`,
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Footer Hint */}
          <div
            className="px-3 py-1.5 text-xs"
            style={{
              borderTop: `1px solid ${colors.border}`,
              color: colors.textMuted,
              opacity: 0.7,
            }}
          >
            <kbd
              className="px-1 py-0.5 rounded text-[10px]"
              style={{
                background: colors.border,
                color: colors.textMuted,
              }}
            >
              Esc
            </kbd>
            <span className="ml-1.5">to close</span>
          </div>
        </div>
      )}

      {/* Animation Keyframes */}
      <style jsx global>{`
        @keyframes themeDropdownEnter {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}
