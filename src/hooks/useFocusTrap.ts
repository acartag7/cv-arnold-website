'use client'

import { useEffect, useRef, RefObject } from 'react'

/**
 * Hook to trap focus within a container element
 * Useful for modals, dialogs, and mobile menus
 *
 * @param containerRef - Ref to the container element
 * @param isActive - Whether focus trap is active
 *
 * @example
 * ```tsx
 * const menuRef = useRef<HTMLDivElement>(null)
 * useFocusTrap(menuRef, isMenuOpen)
 * ```
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  isActive: boolean
) {
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // If deactivating, restore focus to previously focused element
    if (!isActive) {
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus()
        previouslyFocusedElementRef.current = null
      }
      return
    }

    if (!containerRef.current) {
      return
    }

    const container = containerRef.current
    const focusableSelectors =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

    // Get all focusable elements
    const getFocusableElements = () => {
      return Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelectors)
      )
    }

    // Store element that had focus before trap (only if not already stored)
    if (!previouslyFocusedElementRef.current) {
      previouslyFocusedElementRef.current =
        document.activeElement as HTMLElement
    }

    // Focus first element
    const focusableElements = getFocusableElements()
    const firstFocusable = focusableElements[0]
    if (firstFocusable) {
      firstFocusable.focus()
    }

    const handleTabKey = (e: Event) => {
      if (!(e instanceof KeyboardEvent) || e.key !== 'Tab') {
        return
      }

      const focusableElements = getFocusableElements()

      if (focusableElements.length === 0) {
        e.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (!firstElement || !lastElement) {
        return
      }

      // Shift + Tab: move to previous element
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      }
      // Tab: move to next element
      else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)

    return () => {
      container.removeEventListener('keydown', handleTabKey)

      // Restore focus to previously focused element on cleanup
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus()
        previouslyFocusedElementRef.current = null
      }
    }
  }, [containerRef, isActive])
}
