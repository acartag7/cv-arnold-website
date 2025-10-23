'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseScrollDirectionOptions {
  /** Threshold in pixels before detecting scroll direction */
  threshold?: number
  /** Debounce delay in milliseconds */
  debounce?: number
}

export type ScrollDirection = 'up' | 'down' | null

/**
 * Hook to detect scroll direction for header hide/show behavior
 *
 * @param options - Configuration options
 * @returns Current scroll direction and position
 *
 * @example
 * ```tsx
 * const { scrollDirection, scrollY } = useScrollDirection({ threshold: 50 })
 * const isHidden = scrollDirection === 'down' && scrollY > 100
 * ```
 */
export function useScrollDirection({
  threshold = 10,
  debounce = 100,
}: UseScrollDirectionOptions = {}) {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null)
  const [scrollY, setScrollY] = useState(0)
  const [lastScrollY, setLastScrollY] = useState(0)

  const updateScrollDirection = useCallback(() => {
    const currentScrollY = window.scrollY

    // Don't update if below threshold
    if (Math.abs(currentScrollY - lastScrollY) < threshold) {
      return
    }

    const newDirection: ScrollDirection =
      currentScrollY > lastScrollY ? 'down' : 'up'

    // Only update if direction changed
    if (newDirection !== scrollDirection) {
      setScrollDirection(newDirection)
    }

    setScrollY(currentScrollY)
    setLastScrollY(currentScrollY)
  }, [lastScrollY, scrollDirection, threshold])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    const handleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        updateScrollDirection()
      }, debounce)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Initialize scroll position
    setScrollY(window.scrollY)
    setLastScrollY(window.scrollY)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [updateScrollDirection, debounce])

  return {
    /** Current scroll direction */
    scrollDirection,
    /** Current Y scroll position */
    scrollY,
    /** Whether scrolled past threshold */
    isScrolled: scrollY > threshold,
  }
}
