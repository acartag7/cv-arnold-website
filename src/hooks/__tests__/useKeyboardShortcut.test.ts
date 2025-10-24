import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useKeyboardShortcut } from '../useKeyboardShortcut'

describe('useKeyboardShortcut', () => {
  beforeEach(() => {
    // Clear all event listeners
    window.removeEventListener('keydown', () => {})
  })

  it('should trigger callback on matching key', () => {
    const callback = vi.fn()

    renderHook(() =>
      useKeyboardShortcut(callback, {
        key: 'k',
        ctrlKey: false,
      })
    )

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: false,
      metaKey: false,
    })

    window.dispatchEvent(event)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should require Ctrl/Cmd modifier when specified', () => {
    const callback = vi.fn()

    renderHook(() =>
      useKeyboardShortcut(callback, {
        key: 'k',
        ctrlKey: true,
      })
    )

    // Without modifier
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }))
    expect(callback).not.toHaveBeenCalled()

    // With Ctrl
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })
    )
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should work with Cmd key on Mac', () => {
    const callback = vi.fn()

    renderHook(() =>
      useKeyboardShortcut(callback, {
        key: 'k',
        ctrlKey: true,
      })
    )

    // With Meta (Cmd on Mac)
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true })
    )

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should not trigger when typing in input', () => {
    const callback = vi.fn()

    renderHook(() =>
      useKeyboardShortcut(callback, {
        key: 'k',
      })
    )

    // Create input element
    const input = document.createElement('input')
    document.body.appendChild(input)

    // Dispatch event from input
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      bubbles: true,
    })
    Object.defineProperty(event, 'target', {
      value: input,
      enumerable: true,
    })

    window.dispatchEvent(event)

    expect(callback).not.toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('should allow Escape key even when typing', () => {
    const callback = vi.fn()

    renderHook(() =>
      useKeyboardShortcut(callback, {
        key: 'Escape',
      })
    )

    const input = document.createElement('input')
    document.body.appendChild(input)

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    })
    Object.defineProperty(event, 'target', {
      value: input,
      enumerable: true,
    })

    window.dispatchEvent(event)

    expect(callback).toHaveBeenCalledTimes(1)

    document.body.removeChild(input)
  })

  it('should not trigger when disabled', () => {
    const callback = vi.fn()

    renderHook(() =>
      useKeyboardShortcut(callback, {
        key: 'k',
        enabled: false,
      })
    )

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }))

    expect(callback).not.toHaveBeenCalled()
  })

  it('should clean up event listener on unmount', () => {
    const callback = vi.fn()
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() =>
      useKeyboardShortcut(callback, { key: 'k' })
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )

    removeEventListenerSpy.mockRestore()
  })
})
