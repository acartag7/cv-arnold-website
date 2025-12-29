import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TechnologyTag, sanitizeText } from '../TechnologyTag'

describe('sanitizeText', () => {
  describe('XSS prevention', () => {
    it('should strip HTML tags', () => {
      // Parentheses are allowed for tech names like "React (Hooks)"
      expect(sanitizeText('<script>alert("xss")</script>')).toBe('alert(xss)')
      expect(sanitizeText('<img src=x onerror=alert(1)>')).toBe('')
      expect(sanitizeText('<div>React</div>')).toBe('React')
    })

    it('should strip nested HTML tags', () => {
      expect(sanitizeText('<div><span>Test</span></div>')).toBe('Test')
      expect(sanitizeText('<<script>>alert(1)<</script>>')).toBe('alert(1)')
    })

    it('should remove dangerous characters', () => {
      expect(sanitizeText('React<>Vue')).toBe('ReactVue')
      expect(sanitizeText('Test`eval`')).toBe('Testeval')
      expect(sanitizeText('Name;DROP TABLE')).toBe('NameDROP TABLE')
    })

    it('should handle javascript: protocol attempts', () => {
      // Colons are stripped, parentheses are kept
      expect(sanitizeText('javascript:alert(1)')).toBe('javascriptalert(1)')
    })

    it('should handle data: protocol attempts', () => {
      // Colons and commas are stripped, slashes are kept
      expect(sanitizeText('data:text/html,<script>alert(1)</script>')).toBe(
        'datatext/htmlalert(1)'
      )
    })
  })

  describe('allowed characters', () => {
    it('should allow alphanumeric characters', () => {
      expect(sanitizeText('React18')).toBe('React18')
      expect(sanitizeText('Vue3')).toBe('Vue3')
    })

    it('should allow spaces', () => {
      expect(sanitizeText('Visual Studio Code')).toBe('Visual Studio Code')
    })

    it('should allow dots', () => {
      expect(sanitizeText('Node.js')).toBe('Node.js')
      expect(sanitizeText('.NET')).toBe('.NET')
    })

    it('should allow hyphens', () => {
      expect(sanitizeText('ci-cd')).toBe('ci-cd')
      expect(sanitizeText('kebab-case')).toBe('kebab-case')
    })

    it('should allow plus signs', () => {
      expect(sanitizeText('C++')).toBe('C++')
      expect(sanitizeText('Google+')).toBe('Google+')
    })

    it('should allow hash symbols', () => {
      expect(sanitizeText('C#')).toBe('C#')
      expect(sanitizeText('F#')).toBe('F#')
    })

    it('should allow slashes', () => {
      expect(sanitizeText('CI/CD')).toBe('CI/CD')
      expect(sanitizeText('Next.js/React')).toBe('Next.js/React')
    })

    it('should allow parentheses', () => {
      expect(sanitizeText('React (Hooks)')).toBe('React (Hooks)')
    })

    it('should allow apostrophes', () => {
      expect(sanitizeText("O'Reilly")).toBe("O'Reilly")
    })

    it('should allow @ symbol', () => {
      expect(sanitizeText('@angular/core')).toBe('@angular/core')
    })

    it('should allow ampersand', () => {
      expect(sanitizeText('AT&T')).toBe('AT&T')
    })
  })

  describe('length limit', () => {
    it('should truncate text over 100 characters', () => {
      const longText = 'a'.repeat(150)
      expect(sanitizeText(longText).length).toBe(100)
    })

    it('should not truncate text under 100 characters', () => {
      const shortText = 'a'.repeat(50)
      expect(sanitizeText(shortText).length).toBe(50)
    })
  })

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(sanitizeText('')).toBe('')
    })

    it('should handle null-like values', () => {
      expect(sanitizeText(null as unknown as string)).toBe('')
      expect(sanitizeText(undefined as unknown as string)).toBe('')
    })

    it('should handle non-string values', () => {
      expect(sanitizeText(123 as unknown as string)).toBe('')
      expect(sanitizeText({} as unknown as string)).toBe('')
    })

    it('should trim whitespace', () => {
      expect(sanitizeText('  React  ')).toBe('React')
      expect(sanitizeText('\n\tVue\n\t')).toBe('Vue')
    })

    it('should handle strings with only invalid characters', () => {
      // @ and # are allowed for tech names like "@angular/core" and "C#"
      expect(sanitizeText('<>!@#$%^*=')).toBe('@#')
    })
  })
})

describe('TechnologyTag', () => {
  describe('rendering', () => {
    it('should render the technology name', () => {
      render(<TechnologyTag name="React" />)
      expect(screen.getByText('React')).toBeInTheDocument()
    })

    it('should sanitize the displayed name', () => {
      render(<TechnologyTag name="<script>alert(1)</script>React" />)
      expect(screen.getByText('alert(1)React')).toBeInTheDocument()
      expect(screen.queryByText('<script>')).not.toBeInTheDocument()
    })

    it('should not render if name is empty after sanitization', () => {
      const { container } = render(<TechnologyTag name="<>" />)
      expect(container.firstChild).toBeNull()
    })

    it('should have role="note" when not clickable', () => {
      render(<TechnologyTag name="React" />)
      expect(screen.getByRole('note')).toBeInTheDocument()
    })

    it('should have role="button" when clickable', () => {
      render(<TechnologyTag name="React" onClick={vi.fn()} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('click handling', () => {
    it('should call onClick with sanitized name', () => {
      const handleClick = vi.fn()
      render(
        <TechnologyTag name="React<script>bad</script>" onClick={handleClick} />
      )

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledWith('Reactbad')
    })

    it('should handle keyboard activation', () => {
      const handleClick = vi.fn()
      render(<TechnologyTag name="React" onClick={handleClick} />)

      fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
      expect(handleClick).toHaveBeenCalledWith('React')

      fireEvent.keyDown(screen.getByRole('button'), { key: ' ' })
      expect(handleClick).toHaveBeenCalledTimes(2)
    })
  })

  describe('tooltip', () => {
    it('should show tooltip on hover when description exists', () => {
      render(<TechnologyTag name="React" description="A JavaScript library" />)

      fireEvent.mouseEnter(screen.getByRole('note'))
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
      expect(screen.getByText('A JavaScript library')).toBeInTheDocument()
    })

    it('should sanitize tooltip content', () => {
      render(
        <TechnologyTag
          name="React"
          description="<script>alert(1)</script>Safe"
          category="<b>Frontend</b>"
        />
      )

      fireEvent.mouseEnter(screen.getByRole('note'))
      expect(screen.getByText('alert(1)Safe')).toBeInTheDocument()
      expect(screen.getByText('Frontend')).toBeInTheDocument()
    })

    it('should hide tooltip on mouse leave', () => {
      render(<TechnologyTag name="React" description="A JavaScript library" />)

      fireEvent.mouseEnter(screen.getByRole('note'))
      expect(screen.getByRole('tooltip')).toBeInTheDocument()

      fireEvent.mouseLeave(screen.getByRole('note'))
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have aria-label with sanitized content', () => {
      render(
        <TechnologyTag
          name="React<script>bad</script>"
          description="Library<b>text</b>"
        />
      )
      expect(screen.getByLabelText('Reactbad: Librarytext')).toBeInTheDocument()
    })

    it('should be focusable when clickable', () => {
      render(<TechnologyTag name="React" onClick={vi.fn()} />)
      expect(screen.getByRole('button')).toHaveAttribute('tabIndex', '0')
    })

    it('should not be focusable when not clickable', () => {
      render(<TechnologyTag name="React" />)
      expect(screen.getByRole('note')).not.toHaveAttribute('tabIndex')
    })
  })
})
