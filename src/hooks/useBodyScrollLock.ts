'use client'

import { useEffect } from 'react'

/**
 * Hook to lock body scroll (useful for modals/menus)
 *
 * @param isLocked - Whether scroll should be locked
 *
 * @example
 * ```tsx
 * const [isMenuOpen, setIsMenuOpen] = useState(false)
 * useBodyScrollLock(isMenuOpen)
 * ```
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) {
      return
    }

    // Store original overflow and padding
    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    // Calculate scrollbar width
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth

    // Lock scroll
    document.body.style.overflow = 'hidden'

    // Prevent layout shift by adding padding equal to scrollbar width
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      // Restore original styles
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [isLocked])
}
