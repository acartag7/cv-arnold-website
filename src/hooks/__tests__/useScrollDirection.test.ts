import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useScrollDirection } from '../useScrollDirection'

describe('useScrollDirection', () => {
  let scrollY = 0

  beforeEach(() => {
    // Mock window.scrollY
    scrollY = 0
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: scrollY,
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('should initialize with null direction', () => {
    const { result } = renderHook(() => useScrollDirection())

    expect(result.current.scrollDirection).toBeNull()
    expect(result.current.scrollY).toBe(0)
    expect(result.current.isScrolled).toBe(false)
  })

  it('should detect scroll down', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() =>
      useScrollDirection({ threshold: 10, debounce: 100 })
    )

    act(() => {
      scrollY = 200
      Object.defineProperty(window, 'scrollY', { value: scrollY })
      window.dispatchEvent(new Event('scroll'))
      vi.advanceTimersByTime(150)
    })

    expect(result.current.scrollDirection).toBe('down')
    expect(result.current.isScrolled).toBe(true)

    vi.useRealTimers()
  })

  it('should detect scroll up', () => {
    vi.useFakeTimers()

    // Start at scrolled position
    scrollY = 200
    Object.defineProperty(window, 'scrollY', { value: scrollY })

    const { result } = renderHook(() =>
      useScrollDirection({ threshold: 10, debounce: 100 })
    )

    // Scroll down first
    act(() => {
      scrollY = 300
      Object.defineProperty(window, 'scrollY', { value: scrollY })
      window.dispatchEvent(new Event('scroll'))
      vi.advanceTimersByTime(150)
    })

    // Then scroll up
    act(() => {
      scrollY = 150
      Object.defineProperty(window, 'scrollY', { value: scrollY })
      window.dispatchEvent(new Event('scroll'))
      vi.advanceTimersByTime(150)
    })

    expect(result.current.scrollDirection).toBe('up')

    vi.useRealTimers()
  })

  it('should respect threshold', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() =>
      useScrollDirection({ threshold: 50, debounce: 100 })
    )

    // Scroll less than threshold
    act(() => {
      scrollY = 30
      Object.defineProperty(window, 'scrollY', { value: scrollY })
      window.dispatchEvent(new Event('scroll'))
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    // Direction should still be null
    expect(result.current.scrollDirection).toBeNull()

    vi.useRealTimers()
  })

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useScrollDirection())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    )

    removeEventListenerSpy.mockRestore()
  })
})
