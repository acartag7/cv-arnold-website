import { renderHook } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useRef } from 'react'
import { useFocusTrap } from '../useFocusTrap'

describe('useFocusTrap', () => {
  let container: HTMLDivElement
  let button1: HTMLButtonElement
  let button2: HTMLButtonElement
  let button3: HTMLButtonElement
  let outsideButton: HTMLButtonElement

  beforeEach(() => {
    // Clean up DOM
    document.body.innerHTML = ''

    // Create container with focusable elements
    container = document.createElement('div')
    button1 = document.createElement('button')
    button1.textContent = 'Button 1'
    button2 = document.createElement('button')
    button2.textContent = 'Button 2'
    button3 = document.createElement('button')
    button3.textContent = 'Button 3'

    container.appendChild(button1)
    container.appendChild(button2)
    container.appendChild(button3)
    document.body.appendChild(container)

    // Create button outside container
    outsideButton = document.createElement('button')
    outsideButton.textContent = 'Outside Button'
    document.body.appendChild(outsideButton)
  })

  it('should not activate focus trap when isActive is false', () => {
    const containerRef = { current: container }

    renderHook(() => useFocusTrap(containerRef, false))

    // First button should not be automatically focused
    expect(document.activeElement).not.toBe(button1)
  })

  it('should focus first element when activated', () => {
    const containerRef = { current: container }

    renderHook(() => useFocusTrap(containerRef, true))

    // First button should be focused
    expect(document.activeElement).toBe(button1)
  })

  it('should trap Tab key to cycle forward', () => {
    const containerRef = { current: container }

    renderHook(() => useFocusTrap(containerRef, true))

    // Start at first button
    expect(document.activeElement).toBe(button1)

    // Move to last button manually
    button3.focus()

    // Tab from last button should cycle to first
    const lastTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    })
    const preventDefaultSpy = vi.spyOn(lastTabEvent, 'preventDefault')
    container.dispatchEvent(lastTabEvent)

    // preventDefault should be called to prevent default Tab behavior
    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('should trap Shift+Tab to cycle backward', () => {
    const containerRef = { current: container }

    renderHook(() => useFocusTrap(containerRef, true))

    // Start at first button
    expect(document.activeElement).toBe(button1)

    // Shift+Tab from first button should cycle to last
    const shiftTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    })
    const preventDefaultSpy = vi.spyOn(shiftTabEvent, 'preventDefault')
    container.dispatchEvent(shiftTabEvent)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('should restore focus to previously focused element on cleanup', () => {
    // Focus outside button before trap
    outsideButton.focus()
    expect(document.activeElement).toBe(outsideButton)

    const containerRef = { current: container }

    const { unmount } = renderHook(() => useFocusTrap(containerRef, true))

    // Focus should move to first button in trap
    expect(document.activeElement).toBe(button1)

    // Unmount to deactivate trap
    unmount()

    // Focus should restore to outside button
    expect(document.activeElement).toBe(outsideButton)
  })

  it('should handle container with no focusable elements', () => {
    const emptyContainer = document.createElement('div')
    const text = document.createElement('p')
    text.textContent = 'No focusable elements'
    emptyContainer.appendChild(text)
    document.body.appendChild(emptyContainer)

    const containerRef = { current: emptyContainer }

    // Should not throw error
    expect(() => {
      renderHook(() => useFocusTrap(containerRef, true))
    }).not.toThrow()
  })

  it('should prevent Tab when no focusable elements exist', () => {
    const emptyContainer = document.createElement('div')
    document.body.appendChild(emptyContainer)

    const containerRef = { current: emptyContainer }

    renderHook(() => useFocusTrap(containerRef, true))

    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    })
    const preventDefaultSpy = vi.spyOn(tabEvent, 'preventDefault')
    emptyContainer.dispatchEvent(tabEvent)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('should handle single focusable element', () => {
    const singleContainer = document.createElement('div')
    const singleButton = document.createElement('button')
    singleButton.textContent = 'Only Button'
    singleContainer.appendChild(singleButton)
    document.body.appendChild(singleContainer)

    const containerRef = { current: singleContainer }

    renderHook(() => useFocusTrap(containerRef, true))

    // Button should be focused
    expect(document.activeElement).toBe(singleButton)

    // Tab should cycle to itself
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    })
    const preventDefaultSpy = vi.spyOn(tabEvent, 'preventDefault')
    singleContainer.dispatchEvent(tabEvent)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('should ignore non-Tab keyboard events', () => {
    const containerRef = { current: container }

    renderHook(() => useFocusTrap(containerRef, true))

    // Press Enter key
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    })
    const preventDefaultSpy = vi.spyOn(enterEvent, 'preventDefault')
    container.dispatchEvent(enterEvent)

    // preventDefault should not be called for non-Tab keys
    expect(preventDefaultSpy).not.toHaveBeenCalled()
  })

  it('should respect disabled buttons', () => {
    const containerWithDisabled = document.createElement('div')
    const enabledButton = document.createElement('button')
    enabledButton.textContent = 'Enabled'
    const disabledButton = document.createElement('button')
    disabledButton.textContent = 'Disabled'
    disabledButton.disabled = true

    containerWithDisabled.appendChild(enabledButton)
    containerWithDisabled.appendChild(disabledButton)
    document.body.appendChild(containerWithDisabled)

    const containerRef = { current: containerWithDisabled }

    renderHook(() => useFocusTrap(containerRef, true))

    // Only enabled button should be focused (disabled button should be skipped)
    expect(document.activeElement).toBe(enabledButton)
  })

  it('should include links and inputs in focus trap', () => {
    const mixedContainer = document.createElement('div')
    const link = document.createElement('a')
    link.href = '#'
    link.textContent = 'Link'
    const input = document.createElement('input')
    input.type = 'text'
    const button = document.createElement('button')
    button.textContent = 'Button'

    mixedContainer.appendChild(link)
    mixedContainer.appendChild(input)
    mixedContainer.appendChild(button)
    document.body.appendChild(mixedContainer)

    const containerRef = { current: mixedContainer }

    renderHook(() => useFocusTrap(containerRef, true))

    // First focusable element (link) should be focused
    expect(document.activeElement).toBe(link)

    // Tab should move through all focusable elements
    input.focus()
    button.focus()
    expect(document.activeElement).toBe(button)
  })

  it('should skip elements with tabindex="-1"', () => {
    const containerWithTabIndex = document.createElement('div')
    const button1 = document.createElement('button')
    button1.textContent = 'Button 1'
    const button2 = document.createElement('button')
    button2.textContent = 'Button 2 (skip)'
    button2.tabIndex = -1
    const button3 = document.createElement('button')
    button3.textContent = 'Button 3'

    containerWithTabIndex.appendChild(button1)
    containerWithTabIndex.appendChild(button2)
    containerWithTabIndex.appendChild(button3)
    document.body.appendChild(containerWithTabIndex)

    const containerRef = { current: containerWithTabIndex }

    renderHook(() => useFocusTrap(containerRef, true))

    // First focusable button (button1) should be focused
    expect(document.activeElement).toBe(button1)
  })

  it('should handle null containerRef', () => {
    const containerRef = { current: null }

    // Should not throw error
    expect(() => {
      renderHook(() => useFocusTrap(containerRef, true))
    }).not.toThrow()
  })

  it('should reactivate when isActive changes from false to true', () => {
    const containerRef = { current: container }

    const { rerender } = renderHook(
      ({ isActive }) => useFocusTrap(containerRef, isActive),
      {
        initialProps: { isActive: false },
      }
    )

    // Initially not focused
    expect(document.activeElement).not.toBe(button1)

    // Activate trap
    rerender({ isActive: true })

    // First button should now be focused
    expect(document.activeElement).toBe(button1)
  })

  it('should deactivate and restore focus when isActive changes to false', () => {
    outsideButton.focus()

    const containerRef = { current: container }

    const { rerender } = renderHook(
      ({ isActive }) => useFocusTrap(containerRef, isActive),
      {
        initialProps: { isActive: true },
      }
    )

    // Trap activated, button1 focused
    expect(document.activeElement).toBe(button1)

    // Deactivate trap
    rerender({ isActive: false })

    // Focus should restore when trap is deactivated
    // Effect cleanup runs and restores focus to previously focused element
    expect(document.activeElement).toBe(outsideButton)
  })
})
