import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TimelineCard } from '../TimelineCard'
import { Experience } from '@/schemas/cv.schema'

const mockExperience: Experience = {
  id: '1',
  company: 'Tech Corp',
  companyUrl: 'https://techcorp.com',
  position: 'Senior Developer',
  type: 'full_time',
  startDate: '2022-01-01',
  endDate: null,
  location: { city: 'San Francisco', country: 'USA', remote: false },
  description: 'Working on innovative projects',
  achievements: ['Increased performance by 50%', 'Led team of 5 developers'],
  technologies: ['TypeScript', 'React', 'Node.js'],
  order: 0,
}

describe('TimelineCard', () => {
  it('should render company and position', () => {
    render(
      <TimelineCard
        experience={mockExperience}
        isExpanded={false}
        onToggle={() => {}}
      />
    )

    expect(screen.getByText('Tech Corp')).toBeInTheDocument()
    expect(screen.getByText('Senior Developer')).toBeInTheDocument()
  })

  it('should render company as link when URL provided', () => {
    render(
      <TimelineCard
        experience={mockExperience}
        isExpanded={false}
        onToggle={() => {}}
      />
    )

    const link = screen.getByRole('link', { name: 'Tech Corp' })
    expect(link).toHaveAttribute('href', 'https://techcorp.com')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('should show location', () => {
    render(
      <TimelineCard
        experience={mockExperience}
        isExpanded={false}
        onToggle={() => {}}
      />
    )

    expect(screen.getByText('San Francisco, USA')).toBeInTheDocument()
  })

  it('should show remote indicator', () => {
    const remoteExperience = {
      ...mockExperience,
      location: { ...mockExperience.location, remote: true },
    }
    render(
      <TimelineCard
        experience={remoteExperience}
        isExpanded={false}
        onToggle={() => {}}
      />
    )

    expect(screen.getByText(/Remote/)).toBeInTheDocument()
  })

  it('should toggle expand/collapse on button click', () => {
    const onToggle = vi.fn()
    render(
      <TimelineCard
        experience={mockExperience}
        isExpanded={false}
        onToggle={onToggle}
      />
    )

    const button = screen.getByLabelText('Expand details')
    fireEvent.click(button)

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('should show expanded content when isExpanded is true', () => {
    render(
      <TimelineCard
        experience={mockExperience}
        isExpanded={true}
        onToggle={() => {}}
      />
    )

    expect(
      screen.getByText('Working on innovative projects')
    ).toBeInTheDocument()
    expect(screen.getByText('Key Achievements')).toBeInTheDocument()
    expect(screen.getByText('Increased performance by 50%')).toBeInTheDocument()
  })

  it('should hide expanded content when isExpanded is false', () => {
    render(
      <TimelineCard
        experience={mockExperience}
        isExpanded={false}
        onToggle={() => {}}
      />
    )

    expect(
      screen.queryByText('Working on innovative projects')
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Key Achievements')).not.toBeInTheDocument()
  })

  it('should render technology tags when expanded', () => {
    render(
      <TimelineCard
        experience={mockExperience}
        isExpanded={true}
        onToggle={() => {}}
      />
    )

    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
  })

  it('should format employment type', () => {
    render(
      <TimelineCard
        experience={mockExperience}
        isExpanded={false}
        onToggle={() => {}}
      />
    )

    expect(screen.getByText('Full Time')).toBeInTheDocument()
  })
})
