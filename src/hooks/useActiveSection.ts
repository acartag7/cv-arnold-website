'use client'

import { useState, useEffect, useRef } from 'react'

interface UseActiveSectionOptions {
  /** Section IDs to observe */
  sectionIds: string[]
  /** Root margin for intersection observer */
  rootMargin?: string
  /** Intersection threshold (0 to 1) */
  threshold?: number
}

/**
 * Hook to detect which section is currently visible using Intersection Observer
 *
 * @param options - Configuration options
 * @returns Active section ID
 *
 * @example
 * ```tsx
 * const activeSection = useActiveSection({
 *   sectionIds: ['hero', 'experience', 'skills'],
 *   rootMargin: '-80px 0px -80% 0px',
 * })
 *
 * <a className={activeSection === 'hero' ? 'active' : ''}>
 *   Hero
 * </a>
 * ```
 */
export function useActiveSection({
  sectionIds,
  rootMargin = '-80px 0px -80% 0px',
  threshold = 0,
}: UseActiveSectionOptions) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  // Use ref to track current active section without triggering effect re-runs
  const activeSectionRef = useRef<string | null>(null)

  useEffect(() => {
    // Get all section elements
    const sections = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    if (sections.length === 0) {
      return
    }

    // Track which sections are currently intersecting
    const intersectingSections = new Map<string, number>()

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const sectionId = entry.target.id

          if (entry.isIntersecting) {
            // Store intersection ratio
            intersectingSections.set(sectionId, entry.intersectionRatio)
          } else {
            // Remove from intersecting sections
            intersectingSections.delete(sectionId)
          }
        })

        // Find section with highest intersection ratio
        let maxRatio = 0
        let topSection: string | null = null

        intersectingSections.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio
            topSection = id
          }
        })

        // If no section is intersecting, use the first section ID as fallback
        if (!topSection && sectionIds.length > 0) {
          // Check if we're at the very top of the page
          if (window.scrollY < 100) {
            topSection = sectionIds[0] ?? null
          } else {
            // Find the section closest to the viewport center
            const viewportCenter = window.scrollY + window.innerHeight / 2
            let closestSection = sectionIds[0] ?? null
            let minDistance = Infinity

            sections.forEach(section => {
              const rect = section.getBoundingClientRect()
              const sectionCenter = window.scrollY + rect.top + rect.height / 2
              const distance = Math.abs(sectionCenter - viewportCenter)

              if (distance < minDistance) {
                minDistance = distance
                closestSection = section.id
              }
            })

            topSection = closestSection
          }
        }

        // Only update if section actually changed
        if (topSection !== activeSectionRef.current) {
          activeSectionRef.current = topSection
          setActiveSection(topSection ?? null)
        }
      },
      {
        rootMargin,
        threshold,
      }
    )

    // Observe all sections
    sections.forEach(section => {
      observer.observe(section)
    })

    return () => {
      observer.disconnect()
      intersectingSections.clear()
    }
  }, [sectionIds, rootMargin, threshold])

  return activeSection
}
