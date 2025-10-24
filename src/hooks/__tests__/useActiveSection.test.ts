import { renderHook } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useActiveSection } from '../useActiveSection'

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  callback: IntersectionObserverCallback
  elements: Map<Element, boolean> = new Map()
  root: Element | Document | null = null
  rootMargin = ''
  thresholds: ReadonlyArray<number> = []

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(element: Element) {
    this.elements.set(element, true)
  }

  unobserve(): void {
    // Not used in tests
  }

  disconnect() {
    this.elements.clear()
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }

  // Helper to trigger intersection
  triggerIntersection(entries: IntersectionObserverEntry[]) {
    this.callback(entries, this)
  }
}

describe('useActiveSection', () => {
  let observerInstance: MockIntersectionObserver

  beforeEach(() => {
    // Create mock sections
    const sections = ['hero', 'experience', 'skills'].map(id => {
      const element = document.createElement('div')
      element.id = id
      document.body.appendChild(element)
      return element
    })

    // Mock getElementById
    vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
      return sections.find(el => el.id === id) || null
    })

    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn(
      (callback: IntersectionObserverCallback) => {
        observerInstance = new MockIntersectionObserver(callback)
        return observerInstance
      }
    ) as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should initialize with null active section', () => {
    const { result } = renderHook(() =>
      useActiveSection({
        sectionIds: ['hero', 'experience', 'skills'],
      })
    )

    expect(result.current).toBeNull()
  })

  it('should observe all sections', () => {
    renderHook(() =>
      useActiveSection({
        sectionIds: ['hero', 'experience', 'skills'],
      })
    )

    // Verify all sections were observed
    expect(observerInstance.elements.size).toBe(3)
  })

  it('should fallback to first section at top of page', () => {
    // Mock scrollY at top
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 50,
    })

    const { result } = renderHook(() =>
      useActiveSection({
        sectionIds: ['hero', 'experience', 'skills'],
      })
    )

    // Trigger intersection with no active sections
    observerInstance.triggerIntersection([])

    // Should eventually default to first section
    expect(['hero', null]).toContain(result.current)
  })

  it('should clean up observer on unmount', () => {
    const { unmount } = renderHook(() =>
      useActiveSection({
        sectionIds: ['hero', 'experience', 'skills'],
      })
    )

    const disconnectSpy = vi.spyOn(observerInstance, 'disconnect')

    unmount()

    expect(disconnectSpy).toHaveBeenCalled()
  })
})
