'use client'

import { useCallback } from 'react'

interface UseSmoothScrollOptions {
  /** Offset from top in pixels (useful for fixed headers) */
  offset?: number
  /** Duration of scroll animation in milliseconds */
  duration?: number
  /** Easing function name */
  behavior?: ScrollBehavior
}

/**
 * Hook for smooth scrolling to page sections
 *
 * @param options - Configuration options
 * @returns Scroll function
 *
 * @example
 * ```tsx
 * const scrollTo = useSmoothScroll({ offset: 80 })
 *
 * <a href="#section" onClick={(e) => {
 *   e.preventDefault()
 *   scrollTo('section')
 * }}>
 *   Go to Section
 * </a>
 * ```
 */
export function useSmoothScroll({
  offset = 0,
  behavior = 'smooth',
}: UseSmoothScrollOptions = {}) {
  const scrollToSection = useCallback(
    (sectionId: string) => {
      // Remove # if present
      const id = sectionId.replace('#', '')

      // Find target element
      const element = document.getElementById(id)

      if (!element) {
        console.warn(`Element with id "${id}" not found`)
        return
      }

      // Calculate position with offset
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - offset

      // Perform scroll
      window.scrollTo({
        top: offsetPosition,
        behavior,
      })

      // Update URL hash without triggering scroll
      if (history.pushState) {
        history.pushState(null, '', `#${id}`)
      }

      // Set focus to element for accessibility
      element.focus({ preventScroll: true })

      // Ensure element is focusable (add tabindex if needed)
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '-1')
      }
    },
    [offset, behavior]
  )

  return scrollToSection
}
