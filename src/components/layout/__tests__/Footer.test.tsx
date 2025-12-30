import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Footer from '../Footer'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Linkedin: () => <div data-testid="linkedin-icon">LinkedIn</div>,
  Github: () => <div data-testid="github-icon">GitHub</div>,
  Mail: () => <div data-testid="mail-icon">Mail</div>,
  Heart: () => <div data-testid="heart-icon">Heart</div>,
}))

describe('Footer', () => {
  const defaultProps = {
    name: 'John Doe',
    title: 'Software Engineer',
  }

  beforeEach(() => {
    // Mock scrollTo
    window.scrollTo = vi.fn()
    // Mock getElementById
    document.getElementById = vi.fn().mockReturnValue({
      getBoundingClientRect: () => ({ top: 100 }),
    })
  })

  describe('rendering', () => {
    it('should render with required props', () => {
      render(<Footer {...defaultProps} />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    })

    it('should render navigation links', () => {
      render(<Footer {...defaultProps} />)

      expect(screen.getByText('About')).toBeInTheDocument()
      expect(screen.getByText('Experience')).toBeInTheDocument()
      expect(screen.getByText('Skills')).toBeInTheDocument()
      expect(screen.getByText('Certifications')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
    })

    it('should render copyright with current year and name', () => {
      render(<Footer {...defaultProps} />)

      const currentYear = new Date().getFullYear()
      expect(
        screen.getByText(`© ${currentYear} John Doe. All rights reserved.`)
      ).toBeInTheDocument()
    })

    it('should render "Built with" tagline', () => {
      render(<Footer {...defaultProps} />)

      expect(screen.getByText(/Built with/)).toBeInTheDocument()
      expect(screen.getByText(/Next.js & Cloudflare/)).toBeInTheDocument()
    })
  })

  describe('social links', () => {
    it('should render LinkedIn link when provided', () => {
      render(
        <Footer
          {...defaultProps}
          socialLinks={{ linkedin: 'https://linkedin.com/in/johndoe' }}
        />
      )

      const linkedinLink = screen.getByLabelText('LinkedIn Profile')
      expect(linkedinLink).toBeInTheDocument()
      expect(linkedinLink).toHaveAttribute(
        'href',
        'https://linkedin.com/in/johndoe'
      )
      expect(linkedinLink).toHaveAttribute('target', '_blank')
      expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should render GitHub link when provided', () => {
      render(
        <Footer
          {...defaultProps}
          socialLinks={{ github: 'https://github.com/johndoe' }}
        />
      )

      const githubLink = screen.getByLabelText('GitHub Profile')
      expect(githubLink).toBeInTheDocument()
      expect(githubLink).toHaveAttribute('href', 'https://github.com/johndoe')
    })

    it('should render email link when provided', () => {
      render(<Footer {...defaultProps} email="john@example.com" />)

      const emailLink = screen.getByLabelText('Send Email')
      expect(emailLink).toBeInTheDocument()
      expect(emailLink).toHaveAttribute('href', 'mailto:john@example.com')
    })

    it('should not render social links when not provided', () => {
      render(<Footer {...defaultProps} />)

      expect(
        screen.queryByLabelText('LinkedIn Profile')
      ).not.toBeInTheDocument()
      expect(screen.queryByLabelText('GitHub Profile')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Send Email')).not.toBeInTheDocument()
    })

    it('should render all social links when all provided', () => {
      render(
        <Footer
          {...defaultProps}
          socialLinks={{
            linkedin: 'https://linkedin.com/in/johndoe',
            github: 'https://github.com/johndoe',
          }}
          email="john@example.com"
        />
      )

      expect(screen.getByLabelText('LinkedIn Profile')).toBeInTheDocument()
      expect(screen.getByLabelText('GitHub Profile')).toBeInTheDocument()
      expect(screen.getByLabelText('Send Email')).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('should handle navigation click with smooth scroll', () => {
      render(<Footer {...defaultProps} />)

      const aboutLink = screen.getByText('About')
      fireEvent.click(aboutLink)

      expect(document.getElementById).toHaveBeenCalledWith('hero')
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: 'smooth',
      })
    })

    it('should handle brand name click', () => {
      render(<Footer {...defaultProps} />)

      const brandLink = screen.getByText('John Doe')
      fireEvent.click(brandLink)

      expect(document.getElementById).toHaveBeenCalledWith('hero')
      expect(window.scrollTo).toHaveBeenCalled()
    })

    it('should have correct href attributes on nav links', () => {
      render(<Footer {...defaultProps} />)

      expect(screen.getByText('About').closest('a')).toHaveAttribute(
        'href',
        '#hero'
      )
      expect(screen.getByText('Experience').closest('a')).toHaveAttribute(
        'href',
        '#experience'
      )
      expect(screen.getByText('Skills').closest('a')).toHaveAttribute(
        'href',
        '#skills'
      )
    })
  })

  describe('accessibility', () => {
    it('should have proper role for footer', () => {
      render(<Footer {...defaultProps} />)

      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('should have navigation landmark', () => {
      render(<Footer {...defaultProps} />)

      expect(screen.getByLabelText('Footer navigation')).toBeInTheDocument()
    })

    it('should have proper headings', () => {
      render(<Footer {...defaultProps} />)

      expect(screen.getByText('Quick Links')).toBeInTheDocument()
      expect(screen.getByText('Connect')).toBeInTheDocument()
    })

    it('should have accessible link labels for social icons', () => {
      render(
        <Footer
          {...defaultProps}
          socialLinks={{
            linkedin: 'https://linkedin.com',
            github: 'https://github.com',
          }}
          email="test@example.com"
        />
      )

      expect(screen.getByLabelText('LinkedIn Profile')).toBeInTheDocument()
      expect(screen.getByLabelText('GitHub Profile')).toBeInTheDocument()
      expect(screen.getByLabelText('Send Email')).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <Footer {...defaultProps} className="custom-class" />
      )

      const footer = container.querySelector('footer')
      expect(footer).toHaveClass('custom-class')
    })

    it('should have focus-visible styles on links', () => {
      render(<Footer {...defaultProps} />)

      const brandLink = screen.getByText('John Doe')
      expect(brandLink).toHaveClass('focus-visible:ring-2')
    })
  })

  describe('data-driven content', () => {
    it('should display different names and titles', () => {
      const { rerender } = render(
        <Footer name="Alice Smith" title="Product Designer" />
      )

      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      expect(screen.getByText('Product Designer')).toBeInTheDocument()

      rerender(<Footer name="Bob Johnson" title="DevOps Engineer" />)

      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
      expect(screen.getByText('DevOps Engineer')).toBeInTheDocument()
    })

    it('should update copyright with provided name', () => {
      render(<Footer name="Test User" title="Test Title" />)

      const currentYear = new Date().getFullYear()
      expect(
        screen.getByText(`© ${currentYear} Test User. All rights reserved.`)
      ).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle empty social links object', () => {
      render(<Footer {...defaultProps} socialLinks={{}} />)

      expect(
        screen.queryByLabelText('LinkedIn Profile')
      ).not.toBeInTheDocument()
      expect(screen.queryByLabelText('GitHub Profile')).not.toBeInTheDocument()
    })

    it('should handle navigation when element not found', () => {
      document.getElementById = vi.fn().mockReturnValue(null)

      render(<Footer {...defaultProps} />)

      const aboutLink = screen.getByText('About')
      fireEvent.click(aboutLink)

      // Should not throw, scrollTo should not be called
      expect(window.scrollTo).not.toHaveBeenCalled()
    })

    it('should handle special characters in name', () => {
      render(<Footer name="José García" title="Ingeniero" />)

      expect(screen.getByText('José García')).toBeInTheDocument()
    })
  })
})
