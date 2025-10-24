'use client'

import { useEffect, useRef } from 'react'

interface KeyboardShortcutOptions {
  /** Key to listen for (e.g., 'k', 'Escape') */
  key: string
  /** Whether Ctrl/Cmd key must be pressed */
  ctrlKey?: boolean
  /** Whether Alt key must be pressed */
  altKey?: boolean
  /** Whether Shift key must be pressed */
  shiftKey?: boolean
  /** Whether the shortcut is enabled */
  enabled?: boolean
}

/**
 * Hook to handle keyboard shortcuts
 *
 * @param callback - Function to call when shortcut is pressed
 * @param options - Shortcut configuration
 *
 * @example
 * ```tsx
 * useKeyboardShortcut(
 *   () => setIsCommandPaletteOpen(true),
 *   { key: 'k', ctrlKey: true }
 * )
 * ```
 */
export function useKeyboardShortcut(
  callback: () => void,
  {
    key,
    ctrlKey = false,
    altKey = false,
    shiftKey = false,
    enabled = true,
  }: KeyboardShortcutOptions
) {
  // Use ref to store callback without triggering effect re-runs
  const callbackRef = useRef(callback)

  // Update ref on every render to always have latest callback
  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const target = e.target as HTMLElement
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      // Don't trigger shortcut if user is typing (unless it's Escape)
      if (isTyping && key !== 'Escape') {
        return
      }

      // Check for Cmd on Mac, Ctrl on Windows/Linux
      const isModifierPressed = ctrlKey
        ? e.ctrlKey || e.metaKey
        : e.metaKey === false

      const matches =
        e.key.toLowerCase() === key.toLowerCase() &&
        isModifierPressed &&
        e.altKey === altKey &&
        e.shiftKey === shiftKey

      if (matches) {
        e.preventDefault()
        callbackRef.current()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [key, ctrlKey, altKey, shiftKey, enabled])
}
