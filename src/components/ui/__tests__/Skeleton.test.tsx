import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {
  Skeleton,
  SkeletonText,
  TimelineCardSkeleton,
  SkillCardSkeleton,
} from '../Skeleton'

describe('Skeleton', () => {
  describe('Skeleton component', () => {
    it('should render with default props', () => {
      render(<Skeleton />)
      const skeleton = screen.getByRole('status')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveAttribute('aria-busy', 'true')
      expect(skeleton).toHaveAttribute('aria-label', 'Loading...')
    })

    it('should apply text variant classes', () => {
      render(<Skeleton variant="text" />)
      const skeleton = screen.getByRole('status')
      expect(skeleton).toHaveClass('rounded')
    })

    it('should apply circular variant classes', () => {
      render(<Skeleton variant="circular" />)
      const skeleton = screen.getByRole('status')
      expect(skeleton).toHaveClass('rounded-full')
    })

    it('should apply rectangular variant classes', () => {
      render(<Skeleton variant="rectangular" />)
      const skeleton = screen.getByRole('status')
      expect(skeleton).toHaveClass('rounded-none')
    })

    it('should apply rounded variant classes', () => {
      render(<Skeleton variant="rounded" />)
      const skeleton = screen.getByRole('status')
      expect(skeleton).toHaveClass('rounded-lg')
    })

    it('should apply custom width as number', () => {
      render(<Skeleton width={200} />)
      const skeleton = screen.getByRole('status')
      expect(skeleton).toHaveStyle({ width: '200px' })
    })

    it('should apply custom width as string', () => {
      render(<Skeleton width="80%" />)
      const skeleton = screen.getByRole('status')
      expect(skeleton).toHaveStyle({ width: '80%' })
    })

    it('should apply custom height as number', () => {
      render(<Skeleton height={100} />)
      const skeleton = screen.getByRole('status')
      expect(skeleton).toHaveStyle({ height: '100px' })
    })

    it('should apply custom height as string', () => {
      render(<Skeleton height="2em" />)
      const skeleton = screen.getByRole('status')
      // Style is set inline, verify it's present
      expect(skeleton.style.height).toBe('2em')
    })

    it('should animate by default', () => {
      render(<Skeleton />)
      const skeleton = screen.getByRole('status')
      expect(skeleton).toHaveClass('animate-pulse')
    })

    it('should not animate when animated is false', () => {
      render(<Skeleton animated={false} />)
      const skeleton = screen.getByRole('status')
      expect(skeleton).not.toHaveClass('animate-pulse')
    })

    it('should apply custom className', () => {
      render(<Skeleton className="custom-class" />)
      const skeleton = screen.getByRole('status')
      expect(skeleton).toHaveClass('custom-class')
    })
  })

  describe('SkeletonText component', () => {
    it('should render default number of lines', () => {
      render(<SkeletonText />)
      // Get all status elements - parent container + 3 skeleton lines
      const statuses = screen.getAllByRole('status')
      // Should have parent + 3 lines = 4 total
      expect(statuses.length).toBeGreaterThanOrEqual(3)
    })

    it('should render custom number of lines', () => {
      render(<SkeletonText lines={5} />)
      const statuses = screen.getAllByRole('status')
      // Should have parent + 5 lines = 6 total
      expect(statuses.length).toBeGreaterThanOrEqual(5)
    })

    it('should include screen reader text', () => {
      render(<SkeletonText />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<SkeletonText className="custom-class" />)
      const wrapper = container.querySelector('.custom-class')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('TimelineCardSkeleton component', () => {
    it('should render with proper accessibility attributes', () => {
      render(<TimelineCardSkeleton />)
      const skeleton = screen.getByLabelText('Loading experience...')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveAttribute('aria-busy', 'true')
    })

    it('should include screen reader text', () => {
      render(<TimelineCardSkeleton />)
      expect(
        screen.getByText('Loading experience details...')
      ).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <TimelineCardSkeleton className="custom-class" />
      )
      const wrapper = container.querySelector('.custom-class')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('SkillCardSkeleton component', () => {
    it('should render with proper accessibility attributes', () => {
      render(<SkillCardSkeleton />)
      const skeleton = screen.getByLabelText('Loading skill...')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveAttribute('aria-busy', 'true')
    })

    it('should include screen reader text', () => {
      render(<SkillCardSkeleton />)
      expect(screen.getByText('Loading skill details...')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <SkillCardSkeleton className="custom-class" />
      )
      const wrapper = container.querySelector('.custom-class')
      expect(wrapper).toBeInTheDocument()
    })
  })
})
