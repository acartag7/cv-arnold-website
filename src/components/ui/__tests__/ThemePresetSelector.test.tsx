import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemePresetSelector } from '../ThemePresetSelector'
import type { ThemePreset } from '@/types'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Palette: ({ size, style }: { size: number; style?: object }) => (
    <svg data-testid="palette-icon" width={size} style={style} />
  ),
  Check: ({ size, style }: { size: number; style?: object }) => (
    <svg data-testid="check-icon" width={size} style={style} />
  ),
  ChevronDown: ({ size, style }: { size: number; style?: object }) => (
    <svg data-testid="chevron-icon" width={size} style={style} />
  ),
}))

describe('ThemePresetSelector', () => {
  const mockPresets: Record<string, ThemePreset> = {
    terminal: {
      id: 'terminal',
      name: 'Terminal',
      description: 'Classic terminal green theme',
      dark: {
        bg: '#0a0a0f',
        surface: '#12121a',
        surfaceHover: '#1a1a24',
        border: '#2a2a3a',
        text: '#e0e0e0',
        textMuted: '#a0a0a0',
        textDim: '#606070',
        accent: '#00ff88',
        accentDim: '#00ff8820',
      },
      light: {
        bg: '#f5f5f5',
        surface: '#ffffff',
        surfaceHover: '#f0f0f0',
        border: '#e0e0e0',
        text: '#1a1a1a',
        textMuted: '#666666',
        textDim: '#999999',
        accent: '#00aa55',
        accentDim: '#00aa5520',
      },
    },
    clean: {
      id: 'clean',
      name: 'Clean',
      description: 'Modern blue accent theme',
      dark: {
        bg: '#0f0f14',
        surface: '#16161d',
        surfaceHover: '#1e1e26',
        border: '#2d2d3a',
        text: '#e8e8ed',
        textMuted: '#9898a8',
        textDim: '#5a5a6e',
        accent: '#3b82f6',
        accentDim: '#3b82f620',
      },
      light: {
        bg: '#ffffff',
        surface: '#f8f9fa',
        surfaceHover: '#f1f3f4',
        border: '#e1e4e8',
        text: '#1f2328',
        textMuted: '#57606a',
        textDim: '#8b949e',
        accent: '#2563eb',
        accentDim: '#2563eb20',
      },
    },
  }

  const mockColors = {
    surface: '#12121a',
    border: '#2a2a3a',
    text: '#e0e0e0',
    textMuted: '#a0a0a0',
    accent: '#00ff88',
  }

  const defaultProps = {
    presets: mockPresets,
    activePreset: 'terminal',
    onPresetChange: vi.fn(),
    colors: mockColors,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the trigger button with current preset name', () => {
      render(<ThemePresetSelector {...defaultProps} />)

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('Terminal')).toBeInTheDocument()
    })

    it('should render with correct aria attributes', () => {
      render(<ThemePresetSelector {...defaultProps} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-haspopup', 'listbox')
      expect(button).toHaveAttribute('aria-expanded', 'false')
      expect(button).toHaveAttribute('aria-label', 'Theme: Terminal')
    })

    it('should render palette and chevron icons', () => {
      render(<ThemePresetSelector {...defaultProps} />)

      expect(screen.getByTestId('palette-icon')).toBeInTheDocument()
      expect(screen.getByTestId('chevron-icon')).toBeInTheDocument()
    })

    it('should show "Theme" when no preset is selected', () => {
      render(
        <ThemePresetSelector
          {...defaultProps}
          activePreset="nonexistent"
          presets={mockPresets}
        />
      )

      expect(screen.getByText('Theme')).toBeInTheDocument()
    })
  })

  describe('Dropdown Interaction', () => {
    it('should open dropdown when clicking the trigger', async () => {
      const user = userEvent.setup()
      render(<ThemePresetSelector {...defaultProps} />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('should close dropdown when clicking trigger again', async () => {
      const user = userEvent.setup()
      render(<ThemePresetSelector {...defaultProps} />)

      const button = screen.getByRole('button')
      await user.click(button) // open
      await user.click(button) // close

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('should display all preset options when open', async () => {
      const user = userEvent.setup()
      render(<ThemePresetSelector {...defaultProps} />)

      await user.click(screen.getByRole('button'))

      expect(
        screen.getByRole('option', { name: /Terminal/i })
      ).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /Clean/i })).toBeInTheDocument()
    })

    it('should show preset descriptions', async () => {
      const user = userEvent.setup()
      render(<ThemePresetSelector {...defaultProps} />)

      await user.click(screen.getByRole('button'))

      expect(
        screen.getByText('Classic terminal green theme')
      ).toBeInTheDocument()
      expect(screen.getByText('Modern blue accent theme')).toBeInTheDocument()
    })

    it('should show terminal header in dropdown', async () => {
      const user = userEvent.setup()
      render(<ThemePresetSelector {...defaultProps} />)

      await user.click(screen.getByRole('button'))

      expect(screen.getByText('select_theme')).toBeInTheDocument()
    })
  })

  describe('Preset Selection', () => {
    it('should call onPresetChange when selecting a preset', async () => {
      const user = userEvent.setup()
      const onPresetChange = vi.fn()
      render(
        <ThemePresetSelector
          {...defaultProps}
          onPresetChange={onPresetChange}
        />
      )

      await user.click(screen.getByRole('button'))
      await user.click(screen.getByRole('option', { name: /Clean/i }))

      expect(onPresetChange).toHaveBeenCalledWith('clean')
    })

    it('should close dropdown after selection', async () => {
      const user = userEvent.setup()
      render(<ThemePresetSelector {...defaultProps} />)

      await user.click(screen.getByRole('button'))
      await user.click(screen.getByRole('option', { name: /Clean/i }))

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('should mark active preset with check icon', async () => {
      const user = userEvent.setup()
      render(<ThemePresetSelector {...defaultProps} activePreset="terminal" />)

      await user.click(screen.getByRole('button'))

      // The active preset should have aria-selected="true"
      const terminalOption = screen.getByRole('option', { name: /Terminal/i })
      expect(terminalOption).toHaveAttribute('aria-selected', 'true')

      // Check icon should be visible for active preset
      expect(screen.getByTestId('check-icon')).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should open dropdown on Enter key', async () => {
      const user = userEvent.setup()
      render(<ThemePresetSelector {...defaultProps} />)

      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard('{Enter}')

      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('should open dropdown on Space key', async () => {
      const user = userEvent.setup()
      render(<ThemePresetSelector {...defaultProps} />)

      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard(' ')

      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('should open dropdown on ArrowDown key', async () => {
      const user = userEvent.setup()
      render(<ThemePresetSelector {...defaultProps} />)

      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard('{ArrowDown}')

      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('should close dropdown on Escape key', async () => {
      const user = userEvent.setup()
      render(<ThemePresetSelector {...defaultProps} />)

      await user.click(screen.getByRole('button'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()

      await user.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('should navigate down with ArrowDown key', async () => {
      const user = userEvent.setup()
      render(<ThemePresetSelector {...defaultProps} />)

      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard('{ArrowDown}') // Opens and focuses first
      await user.keyboard('{ArrowDown}') // Move to second

      const listbox = screen.getByRole('listbox')
      expect(listbox).toHaveAttribute('aria-activedescendant', 'preset-clean')
    })

    it('should navigate up with ArrowUp key', async () => {
      const user = userEvent.setup()
      render(<ThemePresetSelector {...defaultProps} />)

      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard('{ArrowDown}') // Opens, focuses first (terminal)
      await user.keyboard('{ArrowDown}') // Move to second (clean)
      await user.keyboard('{ArrowUp}') // Move back to first (terminal)

      const listbox = screen.getByRole('listbox')
      expect(listbox).toHaveAttribute(
        'aria-activedescendant',
        'preset-terminal'
      )
    })

    it('should wrap around when navigating past the end', async () => {
      const user = userEvent.setup()
      render(<ThemePresetSelector {...defaultProps} />)

      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard('{ArrowDown}') // Opens, focuses first (terminal)
      await user.keyboard('{ArrowDown}') // Move to second (clean)
      await user.keyboard('{ArrowDown}') // Wrap to first (terminal)

      const listbox = screen.getByRole('listbox')
      expect(listbox).toHaveAttribute(
        'aria-activedescendant',
        'preset-terminal'
      )
    })

    it('should select preset on Enter key', async () => {
      const user = userEvent.setup()
      const onPresetChange = vi.fn()
      render(
        <ThemePresetSelector
          {...defaultProps}
          onPresetChange={onPresetChange}
        />
      )

      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard('{ArrowDown}') // Opens, focuses terminal
      await user.keyboard('{ArrowDown}') // Move to clean
      await user.keyboard('{Enter}') // Select clean

      expect(onPresetChange).toHaveBeenCalledWith('clean')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('should close dropdown on Tab key', async () => {
      const user = userEvent.setup()
      render(<ThemePresetSelector {...defaultProps} />)

      await user.click(screen.getByRole('button'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()

      await user.keyboard('{Tab}')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  describe('Click Outside', () => {
    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <ThemePresetSelector {...defaultProps} />
          <button data-testid="outside-button">Outside</button>
        </div>
      )

      await user.click(screen.getByRole('button', { name: /Theme/i }))
      expect(screen.getByRole('listbox')).toBeInTheDocument()

      // Click outside using fireEvent for mousedown
      fireEvent.mouseDown(screen.getByTestId('outside-button'))

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  describe('Mouse Hover', () => {
    it('should update focus on mouse hover', async () => {
      const user = userEvent.setup()
      render(<ThemePresetSelector {...defaultProps} />)

      await user.click(screen.getByRole('button'))

      const cleanOption = screen.getByRole('option', { name: /Clean/i })
      await user.hover(cleanOption)

      const listbox = screen.getByRole('listbox')
      expect(listbox).toHaveAttribute('aria-activedescendant', 'preset-clean')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA roles for listbox pattern', async () => {
      const user = userEvent.setup()
      render(<ThemePresetSelector {...defaultProps} />)

      await user.click(screen.getByRole('button'))

      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(screen.getAllByRole('option')).toHaveLength(2)
    })

    it('should show keyboard hint in footer', async () => {
      const user = userEvent.setup()
      render(<ThemePresetSelector {...defaultProps} />)

      await user.click(screen.getByRole('button'))

      expect(screen.getByText('Esc')).toBeInTheDocument()
      expect(screen.getByText('to close')).toBeInTheDocument()
    })
  })
})
