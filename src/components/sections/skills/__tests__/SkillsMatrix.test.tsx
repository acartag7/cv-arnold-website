import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SkillsMatrix } from '../SkillsMatrix'
import { SkillCategory } from '@/schemas/cv.schema'

const mockCategories: SkillCategory[] = [
  {
    id: 'frontend',
    name: 'Frontend',
    description: 'Frontend technologies',
    skills: [
      { name: 'React', level: 'expert', yearsOfExperience: 5 },
      { name: 'TypeScript', level: 'advanced', yearsOfExperience: 4 },
    ],
    order: 0,
    icon: '🎨',
  },
  {
    id: 'backend',
    name: 'Backend',
    skills: [{ name: 'Node.js', level: 'advanced', yearsOfExperience: 3 }],
    order: 1,
  },
]

describe('SkillsMatrix', () => {
  it('should render all skill categories', () => {
    render(<SkillsMatrix categories={mockCategories} />)

    expect(screen.getByText('Frontend')).toBeInTheDocument()
    expect(screen.getByText('Backend')).toBeInTheDocument()
  })

  it('should sort categories by order', () => {
    const unsorted = [...mockCategories].reverse()
    const { container } = render(<SkillsMatrix categories={unsorted} />)

    // Frontend (order 0) should appear before Backend (order 1)
    const sections = container.querySelectorAll('.skill-category-section')
    expect(sections[0]?.textContent).toContain('Frontend')
  })

  it('should have proper ARIA labels', () => {
    render(<SkillsMatrix categories={mockCategories} />)

    const region = screen.getByRole('region', { name: 'Skills matrix' })
    expect(region).toBeInTheDocument()
  })

  it('should support grid layout', () => {
    const { container } = render(
      <SkillsMatrix categories={mockCategories} layout="grid" />
    )

    expect(container.querySelector('.skills-matrix-grid')).toBeInTheDocument()
  })

  it('should support masonry layout', () => {
    const { container } = render(
      <SkillsMatrix categories={mockCategories} layout="masonry" />
    )

    expect(
      container.querySelector('.skills-matrix-masonry')
    ).toBeInTheDocument()
  })

  it('should handle empty categories array', () => {
    const { container } = render(<SkillsMatrix categories={[]} />)

    const sections = container.querySelectorAll('.skill-category-section')
    expect(sections.length).toBe(0)
  })
})
