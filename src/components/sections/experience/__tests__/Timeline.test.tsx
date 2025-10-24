import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Timeline } from '../Timeline'
import { Experience } from '@/schemas/cv.schema'

const mockExperiences: Experience[] = [
  {
    id: '1',
    company: 'Tech Corp',
    position: 'Senior Developer',
    type: 'full_time',
    startDate: '2022-01-01',
    endDate: null,
    location: { city: 'San Francisco', country: 'USA', remote: false },
    description: 'Working on cool stuff',
    achievements: [],
    technologies: ['TypeScript', 'React'],
    order: 0,
  },
  {
    id: '2',
    company: 'StartupCo',
    position: 'Developer',
    type: 'full_time',
    startDate: '2020-01-01',
    endDate: '2021-12-31',
    location: { city: 'New York', country: 'USA', remote: true },
    description: 'Built features',
    achievements: [],
    technologies: ['JavaScript'],
    order: 1,
  },
]

describe('Timeline', () => {
  it('should render all experiences', () => {
    render(<Timeline experiences={mockExperiences} />)

    expect(screen.getByText('Tech Corp')).toBeInTheDocument()
    expect(screen.getByText('StartupCo')).toBeInTheDocument()
  })

  it('should sort experiences by date (most recent first)', () => {
    render(<Timeline experiences={mockExperiences} />)

    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveAttribute('data-index', '0')
  })

  it('should have proper ARIA labels', () => {
    render(<Timeline experiences={mockExperiences} />)

    const timeline = screen.getByRole('list', {
      name: 'Work experience timeline',
    })
    expect(timeline).toBeInTheDocument()
  })

  it('should support vertical variant', () => {
    const { container } = render(
      <Timeline experiences={mockExperiences} variant="vertical" />
    )

    expect(container.querySelector('.timeline-vertical')).toBeInTheDocument()
  })

  it('should support horizontal variant', () => {
    const { container } = render(
      <Timeline experiences={mockExperiences} variant="horizontal" />
    )

    expect(container.querySelector('.timeline-horizontal')).toBeInTheDocument()
  })

  it('should handle empty experiences array', () => {
    const { container } = render(<Timeline experiences={[]} />)

    const items = container.querySelectorAll('.timeline-item')
    expect(items.length).toBe(0)
  })
})
