import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRef } from 'react'
import { useFocusTrap } from '../useFocusTrap'

describe('useFocusTrap', () => {
  let container: HTMLDivElement
  let button1: HTMLButtonElement
  let button2: HTMLButtonElement
  let button3: HTMLButtonElement
  let outsideButton: HTMLButtonElement

  beforeEach(() => {
    // Create container with focusable elements
    container = document.createElement('div')
    container.id = 'test-container'

    button1 = document.createElement('button')
    button1.textContent = 'Button 1'
    button1.id = 'btn1'

    button2 = document.createElement('button')
    button2.textContent = 'Button 2'
    button2.id = 'btn2'

    button3 = document.createElement('button')
    button3.textContent = 'Button 3'
    button3.id = 'btn3'

    container.appendChild(button1)
    container.appendChild(button2)
    container.appendChild(button3)

    // Create outside button to track focus restoration
    outsideButton = document.createElement('button')
    outsideButton.textContent = 'Outside'
    outsideButton.id = 'outside-btn'

    document.body.appendChild(outsideButton)
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    document.body.removeChild(outsideButton)
  })

  describe('Focus Management', () => {
    it('should focus first element when activated', () => {
      outsideButton.focus()

      renderHook(() => {
        const ref = useRef<HTMLDivElement>(container)
        useFocusTrap(ref, true)
        return ref
      })

      expect(document.activeElement).toBe(button1)
    })

    it('should restore focus to previously focused element when deactivated', () => {
      outsideButton.focus()
      expect(document.activeElement).toBe(outsideButton)

      const { rerender } = renderHook(
        ({ isActive }) => {
          const ref = useRef<HTMLDivElement>(container)
          useFocusTrap(ref, isActive)
          return ref
        },
        { initialProps: { isActive: true } }
      )

      // Focus trap is active, first element should be focused
      expect(document.activeElement).toBe(button1)

      // Deactivate focus trap
      rerender({ isActive: false })

      // Focus should be restored to outside button
      expect(document.activeElement).toBe(outsideButton)
    })

    it('should not do anything if container ref is null', () => {
      outsideButton.focus()

      renderHook(() => {
        const ref = useRef<HTMLDivElement>(null)
        useFocusTrap(ref, true)
        return ref
      })

      // Focus should remain on outside button
      expect(document.activeElement).toBe(outsideButton)
    })

    it('should not do anything if isActive is false', () => {
      outsideButton.focus()

      renderHook(() => {
        const ref = useRef<HTMLDivElement>(container)
        useFocusTrap(ref, false)
        return ref
      })

      // Focus should remain on outside button
      expect(document.activeElement).toBe(outsideButton)
    })
  })

  describe('Tab Key Navigation', () => {
    it('should trap focus when tabbing forward', () => {
      renderHook(() => {
        const ref = useRef<HTMLDivElement>(container)
        useFocusTrap(ref, true)
        return ref
      })

      // First element focused on activation
      expect(document.activeElement).toBe(button1)

      // Manually focus last element
      button3.focus()
      expect(document.activeElement).toBe(button3)

      // Simulate Tab key
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      })

      const preventDefault = vi.spyOn(tabEvent, 'preventDefault')
      container.dispatchEvent(tabEvent)

      // Should wrap to first element
      expect(preventDefault).toHaveBeenCalled()
      expect(document.activeElement).toBe(button1)
    })

    it('should trap focus when tabbing backward with Shift+Tab', () => {
      renderHook(() => {
        const ref = useRef<HTMLDivElement>(container)
        useFocusTrap(ref, true)
        return ref
      })

      // First element focused on activation
      expect(document.activeElement).toBe(button1)

      // Simulate Shift+Tab key
      const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      })

      const preventDefault = vi.spyOn(shiftTabEvent, 'preventDefault')
      container.dispatchEvent(shiftTabEvent)

      // Should wrap to last element
      expect(preventDefault).toHaveBeenCalled()
      expect(document.activeElement).toBe(button3)
    })

    it('should allow normal tab navigation within the container', () => {
      renderHook(() => {
        const ref = useRef<HTMLDivElement>(container)
        useFocusTrap(ref, true)
        return ref
      })

      // First element focused on activation
      expect(document.activeElement).toBe(button1)

      // Focus second element (middle element)
      button2.focus()
      expect(document.activeElement).toBe(button2)

      // Simulate Tab key
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      })

      const preventDefault = vi.spyOn(tabEvent, 'preventDefault')
      container.dispatchEvent(tabEvent)

      // Should NOT prevent default (allow normal navigation)
      expect(preventDefault).not.toHaveBeenCalled()
    })

    it('should prevent tab if no focusable elements', () => {
      // Create empty container
      const emptyContainer = document.createElement('div')
      document.body.appendChild(emptyContainer)

      renderHook(() => {
        const ref = useRef<HTMLDivElement>(emptyContainer)
        useFocusTrap(ref, true)
        return ref
      })

      // Simulate Tab key
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      })

      const preventDefault = vi.spyOn(tabEvent, 'preventDefault')
      emptyContainer.dispatchEvent(tabEvent)

      // Should prevent default
      expect(preventDefault).toHaveBeenCalled()

      document.body.removeChild(emptyContainer)
    })

    it('should ignore non-Tab keys', () => {
      renderHook(() => {
        const ref = useRef<HTMLDivElement>(container)
        useFocusTrap(ref, true)
        return ref
      })

      button3.focus()

      // Simulate Enter key
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      })

      const preventDefault = vi.spyOn(enterEvent, 'preventDefault')
      container.dispatchEvent(enterEvent)

      // Should NOT prevent default or change focus
      expect(preventDefault).not.toHaveBeenCalled()
      expect(document.activeElement).toBe(button3)
    })
  })

  describe('Cleanup', () => {
    it('should restore focus on unmount', () => {
      outsideButton.focus()

      const { unmount } = renderHook(() => {
        const ref = useRef<HTMLDivElement>(container)
        useFocusTrap(ref, true)
        return ref
      })

      // Focus trap active
      expect(document.activeElement).toBe(button1)

      // Unmount
      unmount()

      // Focus should be restored
      expect(document.activeElement).toBe(outsideButton)
    })

    it('should remove event listener on cleanup', () => {
      const removeEventListenerSpy = vi.spyOn(container, 'removeEventListener')

      const { unmount } = renderHook(() => {
        const ref = useRef<HTMLDivElement>(container)
        useFocusTrap(ref, true)
        return ref
      })

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      )
    })

    it('should only store previous focus once', () => {
      outsideButton.focus()

      const { rerender } = renderHook(
        ({ isActive }) => {
          const ref = useRef<HTMLDivElement>(container)
          useFocusTrap(ref, isActive)
          return ref
        },
        { initialProps: { isActive: true } }
      )

      // Focus trap active, first element focused
      expect(document.activeElement).toBe(button1)

      // Manually change focus within container
      button2.focus()

      // Deactivate and reactivate (shouldn't reset previous focus)
      rerender({ isActive: false })
      expect(document.activeElement).toBe(outsideButton)

      // Reactivate - should still remember original previous focus
      rerender({ isActive: true })
      expect(document.activeElement).toBe(button1)

      // Deactivate again
      rerender({ isActive: false })

      // Should restore to original outside button
      expect(document.activeElement).toBe(outsideButton)
    })
  })

  describe('Disabled Elements', () => {
    it('should skip disabled elements when trapping focus', () => {
      // Add disabled button
      const disabledButton = document.createElement('button')
      disabledButton.textContent = 'Disabled'
      disabledButton.disabled = true
      container.insertBefore(disabledButton, button2)

      renderHook(() => {
        const ref = useRef<HTMLDivElement>(container)
        useFocusTrap(ref, true)
        return ref
      })

      // Should focus first enabled element
      expect(document.activeElement).toBe(button1)

      // Tab from last element should skip disabled button
      button3.focus()
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      })
      container.dispatchEvent(tabEvent)

      // Should wrap to first enabled element (button1)
      expect(document.activeElement).toBe(button1)
    })
  })
})
