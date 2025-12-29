import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSmoothScroll } from '../useSmoothScroll'

describe('useSmoothScroll', () => {
  beforeEach(() => {
    // Mock document.getElementById
    vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
      const element = document.createElement('div')
      element.id = id
      element.getBoundingClientRect = () => ({
        top: 500,
        bottom: 600,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 500,
        toJSON: () => ({}),
      })
      element.focus = vi.fn()
      return element
    })

    // Mock window.scrollTo
    window.scrollTo = vi.fn()

    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    })

    // Mock history.pushState
    window.history.pushState = vi.fn()
  })

  it('should scroll to section with default offset', () => {
    const { result } = renderHook(() => useSmoothScroll())

    act(() => {
      result.current('test-section')
    })

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 500, // 500 (element top) + 0 (scrollY) - 0 (offset)
      behavior: 'smooth',
    })
  })

  it('should scroll to section with custom offset', () => {
    const { result } = renderHook(() => useSmoothScroll({ offset: 80 }))

    act(() => {
      result.current('test-section')
    })

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 420, // 500 - 80 (offset)
      behavior: 'smooth',
    })
  })

  it('should handle # prefix in section ID', () => {
    const { result } = renderHook(() => useSmoothScroll())

    act(() => {
      result.current('#test-section')
    })

    expect(document.getElementById).toHaveBeenCalledWith('test-section')
  })

  it('should update URL hash', () => {
    const { result } = renderHook(() => useSmoothScroll())

    act(() => {
      result.current('test-section')
    })

    expect(window.history.pushState).toHaveBeenCalledWith(
      null,
      '',
      '#test-section'
    )
  })

  it('should focus element for accessibility', () => {
    const mockElement = document.createElement('div')
    mockElement.id = 'test-section'
    mockElement.focus = vi.fn()
    mockElement.getBoundingClientRect = () => ({
      top: 500,
      bottom: 600,
      left: 0,
      right: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 500,
      toJSON: () => ({}),
    })

    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement)

    const { result } = renderHook(() => useSmoothScroll())

    act(() => {
      result.current('test-section')
    })

    expect(mockElement.focus).toHaveBeenCalledWith({ preventScroll: true })
  })

  it('should warn when element not found', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(document, 'getElementById').mockReturnValue(null)

    const { result } = renderHook(() => useSmoothScroll())

    act(() => {
      result.current('non-existent')
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      'Element with id "non-existent" not found'
    )

    consoleSpy.mockRestore()
  })
})
