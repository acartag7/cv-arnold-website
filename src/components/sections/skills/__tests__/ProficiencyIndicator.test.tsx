import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProficiencyIndicator } from '../ProficiencyIndicator'

describe('ProficiencyIndicator', () => {
  it('should render bar variant', () => {
    const { container } = render(
      <ProficiencyIndicator level="advanced" variant="bar" />
    )

    expect(
      container.querySelector('.proficiency-bar-container')
    ).toBeInTheDocument()
  })

  it('should render circular variant', () => {
    const { container } = render(
      <ProficiencyIndicator level="expert" variant="circular" />
    )

    expect(container.querySelector('.proficiency-circular')).toBeInTheDocument()
  })

  it('should render stars variant', () => {
    const { container } = render(
      <ProficiencyIndicator level="intermediate" variant="stars" />
    )

    expect(container.querySelector('.proficiency-stars')).toBeInTheDocument()
  })

  it('should render dots variant', () => {
    const { container } = render(
      <ProficiencyIndicator level="beginner" variant="dots" />
    )

    expect(container.querySelector('.proficiency-dots')).toBeInTheDocument()
  })

  it('should have correct ARIA attributes', () => {
    render(<ProficiencyIndicator level="advanced" />)

    const meter = screen.getByRole('meter')
    expect(meter).toHaveAttribute('aria-valuenow', '75')
    expect(meter).toHaveAttribute('aria-valuemin', '0')
    expect(meter).toHaveAttribute('aria-valuemax', '100')
    expect(meter).toHaveAttribute('aria-label', 'Proficiency: advanced (75%)')
  })

  it('should map skill levels to correct percentages', () => {
    const levels = [
      { level: 'beginner', percentage: 25 },
      { level: 'intermediate', percentage: 50 },
      { level: 'advanced', percentage: 75 },
      { level: 'expert', percentage: 100 },
    ] as const

    levels.forEach(({ level, percentage }) => {
      const { container, unmount } = render(
        <ProficiencyIndicator level={level} variant="bar" />
      )
      const fill = container.querySelector('.proficiency-bar-fill')
      expect(fill).toHaveStyle({ width: `${percentage}%` })
      unmount()
    })
  })

  it('should show label when showLabel is true', () => {
    render(<ProficiencyIndicator level="advanced" showLabel={true} />)

    expect(screen.getByText('advanced')).toBeInTheDocument()
  })

  it('should hide label when showLabel is false', () => {
    render(<ProficiencyIndicator level="advanced" showLabel={false} />)

    expect(screen.queryByText('advanced')).not.toBeInTheDocument()
  })

  it('should apply animated class when animated is true', () => {
    const { container } = render(
      <ProficiencyIndicator level="expert" animated={true} />
    )

    expect(container.querySelector('.proficiency-indicator')).toHaveClass(
      'animated'
    )
  })

  it('should display correct star count', () => {
    const starCounts = [
      { level: 'beginner', stars: 2 },
      { level: 'intermediate', stars: 3 },
      { level: 'advanced', stars: 4 },
      { level: 'expert', stars: 5 },
    ] as const

    starCounts.forEach(({ level, stars }) => {
      const { container, unmount } = render(
        <ProficiencyIndicator level={level} variant="stars" />
      )
      const filledStars = container.querySelectorAll('.star.filled')
      expect(filledStars.length).toBe(stars)
      unmount()
    })
  })

  it('should display correct dot count', () => {
    const dotCounts = [
      { level: 'beginner', dots: 1 },
      { level: 'intermediate', dots: 2 },
      { level: 'advanced', dots: 3 },
      { level: 'expert', dots: 4 },
    ] as const

    dotCounts.forEach(({ level, dots }) => {
      const { container, unmount } = render(
        <ProficiencyIndicator level={level} variant="dots" />
      )
      const filledDots = container.querySelectorAll('.dot.filled')
      expect(filledDots.length).toBe(dots)
      unmount()
    })
  })
})
