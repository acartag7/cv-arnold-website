'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

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
 * Uses refs to prevent effect re-runs and unnecessary event listener re-registration.
 * This prevents memory leaks and improves performance.
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

  // Use ref to track last scroll position to avoid effect re-runs
  const lastScrollYRef = useRef(0)

  const updateScrollDirection = useCallback(() => {
    const currentScrollY = window.scrollY

    // Don't update if below threshold
    if (Math.abs(currentScrollY - lastScrollYRef.current) < threshold) {
      return
    }

    const newDirection: ScrollDirection =
      currentScrollY > lastScrollYRef.current ? 'down' : 'up'

    // Only update state if direction actually changed (prevents unnecessary re-renders)
    setScrollDirection(prev => (prev === newDirection ? prev : newDirection))
    setScrollY(currentScrollY)
    lastScrollYRef.current = currentScrollY
  }, [threshold])

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
    const initialY = window.scrollY
    setScrollY(initialY)
    lastScrollYRef.current = initialY

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
