/**
 * Tests for SectionVisibilityToggle Component
 *
 * Tests for the reusable toggle component that controls section visibility
 * on the public CV site. Used in individual section editors.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SectionVisibilityToggle } from '../SectionVisibilityToggle'
import type { SectionVisibilityKey } from '@/types/cv'

describe('SectionVisibilityToggle', () => {
  const defaultProps = {
    sectionKey: 'experience' as SectionVisibilityKey,
    isVisible: true,
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders with default label when visible', () => {
      render(<SectionVisibilityToggle {...defaultProps} />)
      expect(screen.getByText('Section Visibility')).toBeInTheDocument()
      expect(
        screen.getByText('This section is visible on the public site')
      ).toBeInTheDocument()
    })

    it('renders with default label when hidden', () => {
      render(<SectionVisibilityToggle {...defaultProps} isVisible={false} />)
      expect(screen.getByText('Section Visibility')).toBeInTheDocument()
      expect(
        screen.getByText('This section is hidden from the public site')
      ).toBeInTheDocument()
    })

    it('renders with custom label', () => {
      render(
        <SectionVisibilityToggle
          {...defaultProps}
          label="Show Experience Section"
        />
      )
      expect(screen.getByText('Show Experience Section')).toBeInTheDocument()
    })

    it('renders toggle switch with correct aria attributes when visible', () => {
      render(<SectionVisibilityToggle {...defaultProps} />)
      const toggle = screen.getByRole('switch')
      expect(toggle).toBeInTheDocument()
      expect(toggle).toHaveAttribute('aria-checked', 'true')
    })

    it('renders toggle switch with correct aria attributes when hidden', () => {
      render(<SectionVisibilityToggle {...defaultProps} isVisible={false} />)
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('aria-checked', 'false')
    })

    it('renders Eye icon when visible', () => {
      const { container } = render(
        <SectionVisibilityToggle {...defaultProps} />
      )
      // Eye icon should be present (emerald color class)
      const eyeIcon = container.querySelector('.text-emerald-500')
      expect(eyeIcon).toBeInTheDocument()
    })

    it('renders EyeOff icon when hidden', () => {
      const { container } = render(
        <SectionVisibilityToggle {...defaultProps} isVisible={false} />
      )
      // EyeOff icon should be present (slate color class)
      const eyeOffIcon = container.querySelector('.text-slate-400')
      expect(eyeOffIcon).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onChange with correct params when toggled from visible to hidden', () => {
      render(<SectionVisibilityToggle {...defaultProps} />)
      const toggle = screen.getByRole('switch')
      fireEvent.click(toggle)
      expect(defaultProps.onChange).toHaveBeenCalledTimes(1)
      expect(defaultProps.onChange).toHaveBeenCalledWith('experience', false)
    })

    it('calls onChange with correct params when toggled from hidden to visible', () => {
      render(<SectionVisibilityToggle {...defaultProps} isVisible={false} />)
      const toggle = screen.getByRole('switch')
      fireEvent.click(toggle)
      expect(defaultProps.onChange).toHaveBeenCalledTimes(1)
      expect(defaultProps.onChange).toHaveBeenCalledWith('experience', true)
    })

    it('calls onChange with different section keys', () => {
      const sections: SectionVisibilityKey[] = [
        'experience',
        'skills',
        'certifications',
        'education',
        'languages',
        'achievements',
      ]

      sections.forEach(sectionKey => {
        const onChange = vi.fn()
        const { unmount } = render(
          <SectionVisibilityToggle
            {...defaultProps}
            sectionKey={sectionKey}
            onChange={onChange}
          />
        )
        const toggle = screen.getByRole('switch')
        fireEvent.click(toggle)
        expect(onChange).toHaveBeenCalledWith(sectionKey, false)
        unmount()
      })
    })
  })

  describe('disabled state', () => {
    it('does not call onChange when disabled', () => {
      render(<SectionVisibilityToggle {...defaultProps} disabled />)
      const toggle = screen.getByRole('switch')
      fireEvent.click(toggle)
      expect(defaultProps.onChange).not.toHaveBeenCalled()
    })

    it('has disabled attribute when disabled', () => {
      render(<SectionVisibilityToggle {...defaultProps} disabled />)
      const toggle = screen.getByRole('switch')
      expect(toggle).toBeDisabled()
    })

    it('applies disabled styling when disabled', () => {
      render(<SectionVisibilityToggle {...defaultProps} disabled />)
      const toggle = screen.getByRole('switch')
      expect(toggle.className).toContain('disabled:opacity-50')
      expect(toggle.className).toContain('disabled:cursor-not-allowed')
    })
  })

  describe('accessibility', () => {
    it('has correct role', () => {
      render(<SectionVisibilityToggle {...defaultProps} />)
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('has screen reader text for visible state', () => {
      render(<SectionVisibilityToggle {...defaultProps} />)
      expect(screen.getByText('Hide section')).toBeInTheDocument()
    })

    it('has screen reader text for hidden state', () => {
      render(<SectionVisibilityToggle {...defaultProps} isVisible={false} />)
      expect(screen.getByText('Show section')).toBeInTheDocument()
    })

    it('has focus ring styles for keyboard accessibility', () => {
      render(<SectionVisibilityToggle {...defaultProps} />)
      const toggle = screen.getByRole('switch')
      expect(toggle.className).toContain('focus:ring-2')
      expect(toggle.className).toContain('focus:ring-blue-500')
    })
  })

  describe('visual styling', () => {
    it('has emerald background when visible', () => {
      render(<SectionVisibilityToggle {...defaultProps} />)
      const toggle = screen.getByRole('switch')
      expect(toggle.className).toContain('bg-emerald-500')
    })

    it('has slate background when hidden', () => {
      render(<SectionVisibilityToggle {...defaultProps} isVisible={false} />)
      const toggle = screen.getByRole('switch')
      expect(toggle.className).toContain('bg-slate-300')
    })
  })
})
