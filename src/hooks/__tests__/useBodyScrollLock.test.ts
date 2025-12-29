import { renderHook } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useBodyScrollLock } from '../useBodyScrollLock'

describe('useBodyScrollLock', () => {
  beforeEach(() => {
    // Reset body styles
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''

    // Mock window.innerWidth and document.documentElement.clientWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    Object.defineProperty(document.documentElement, 'clientWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  it('should not lock scroll when isLocked is false', () => {
    renderHook(() => useBodyScrollLock(false))

    expect(document.body.style.overflow).toBe('')
    expect(document.body.style.paddingRight).toBe('')
  })

  it('should lock scroll when isLocked is true', () => {
    renderHook(() => useBodyScrollLock(true))

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('should add padding to prevent layout shift', () => {
    // Simulate scrollbar width
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 1008, // 16px scrollbar
    })

    renderHook(() => useBodyScrollLock(true))

    expect(document.body.style.paddingRight).toBe('16px')
  })

  it('should restore original styles on unmount', () => {
    document.body.style.overflow = 'auto'
    document.body.style.paddingRight = '10px'

    const { unmount } = renderHook(() => useBodyScrollLock(true))

    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.overflow).toBe('auto')
    expect(document.body.style.paddingRight).toBe('10px')
  })

  it('should update when isLocked changes', () => {
    const { rerender } = renderHook(
      ({ isLocked }) => useBodyScrollLock(isLocked),
      { initialProps: { isLocked: false } }
    )

    expect(document.body.style.overflow).toBe('')

    rerender({ isLocked: true })

    expect(document.body.style.overflow).toBe('hidden')

    rerender({ isLocked: false })

    // Should not be locked anymore
    expect(document.body.style.overflow).not.toBe('hidden')
  })
})
