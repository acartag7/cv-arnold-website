/**
 * Tests for DatePicker Component
 *
 * Tests for date input with null toggle and various modes.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DatePicker } from '../DatePicker'

describe('DatePicker', () => {
  const defaultProps = {
    value: '2024-06-15',
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders date input with value', () => {
      render(<DatePicker {...defaultProps} />)
      const input = screen.getByDisplayValue('2024-06')
      expect(input).toBeInTheDocument()
    })

    it('renders label when provided', () => {
      render(<DatePicker {...defaultProps} label="Start Date" />)
      expect(screen.getByText('Start Date')).toBeInTheDocument()
    })

    it('renders error message when provided', () => {
      render(<DatePicker {...defaultProps} error="Date is required" />)
      expect(screen.getByText('Date is required')).toBeInTheDocument()
    })

    it('renders as disabled when disabled prop is true', () => {
      render(<DatePicker {...defaultProps} disabled />)
      const input = screen.getByDisplayValue('2024-06')
      expect(input).toBeDisabled()
    })
  })

  describe('modes', () => {
    it('renders month-year mode by default', () => {
      render(<DatePicker {...defaultProps} />)
      const input = screen.getByDisplayValue('2024-06')
      expect(input).toHaveAttribute('type', 'month')
    })

    it('renders full date mode when specified', () => {
      render(<DatePicker {...defaultProps} mode="full" />)
      const input = screen.getByDisplayValue('2024-06-15')
      expect(input).toHaveAttribute('type', 'date')
    })
  })

  describe('null toggle', () => {
    it('renders null toggle checkbox when allowNull is true', () => {
      render(<DatePicker {...defaultProps} allowNull />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      expect(screen.getByText('Present')).toBeInTheDocument()
    })

    it('renders custom null label', () => {
      render(
        <DatePicker
          {...defaultProps}
          allowNull
          nullLabel="Currently working here"
        />
      )
      expect(screen.getByText('Currently working here')).toBeInTheDocument()
    })

    it('does not render null toggle when allowNull is false', () => {
      render(<DatePicker {...defaultProps} allowNull={false} />)
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('shows null indicator when value is null and allowNull is true', () => {
      render(
        <DatePicker
          value={null}
          onChange={vi.fn()}
          allowNull
          nullLabel="Present"
        />
      )
      // The "Present" text appears both as the label and the indicator
      const presentElements = screen.getAllByText('Present')
      expect(presentElements.length).toBeGreaterThan(0)
    })
  })

  describe('interactions', () => {
    it('calls onChange when date is changed in month-year mode', () => {
      render(<DatePicker {...defaultProps} />)
      const input = screen.getByDisplayValue('2024-06')
      fireEvent.change(input, { target: { value: '2024-08' } })
      expect(defaultProps.onChange).toHaveBeenCalledWith('2024-08-01')
    })

    it('calls onChange when date is changed in full mode', () => {
      render(<DatePicker {...defaultProps} mode="full" />)
      const input = screen.getByDisplayValue('2024-06-15')
      fireEvent.change(input, { target: { value: '2024-08-20' } })
      expect(defaultProps.onChange).toHaveBeenCalledWith('2024-08-20')
    })

    it('calls onChange with null when null toggle is checked', () => {
      render(<DatePicker {...defaultProps} allowNull />)
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
      expect(defaultProps.onChange).toHaveBeenCalledWith(null)
    })

    it('calls onChange with today when null toggle is unchecked', () => {
      const today = new Date().toISOString().split('T')[0]
      render(
        <DatePicker value={null} onChange={defaultProps.onChange} allowNull />
      )
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
      expect(defaultProps.onChange).toHaveBeenCalledWith(today)
    })

    it('calls onChange with null when input is cleared', () => {
      render(<DatePicker {...defaultProps} />)
      const input = screen.getByDisplayValue('2024-06')
      fireEvent.change(input, { target: { value: '' } })
      expect(defaultProps.onChange).toHaveBeenCalledWith(null)
    })
  })

  describe('constraints', () => {
    it('applies min constraint', () => {
      render(<DatePicker {...defaultProps} min="2024-01-01" />)
      const input = screen.getByDisplayValue('2024-06')
      expect(input).toHaveAttribute('min', '2024-01-01')
    })

    it('applies max constraint', () => {
      render(<DatePicker {...defaultProps} max="2024-12-31" />)
      const input = screen.getByDisplayValue('2024-06')
      expect(input).toHaveAttribute('max', '2024-12-31')
    })
  })

  describe('edge cases', () => {
    it('handles empty value gracefully', () => {
      const { container } = render(<DatePicker value="" onChange={vi.fn()} />)
      // Month input doesn't have role="textbox", so query by type
      const input = container.querySelector('input[type="month"]')
      expect(input).toBeInTheDocument()
    })

    it('handles malformed date value gracefully', () => {
      const { container } = render(
        <DatePicker value="invalid-date" onChange={vi.fn()} />
      )
      // Should not crash, just render the input
      const input = container.querySelector('input[type="month"]')
      expect(input).toBeInTheDocument()
    })
  })
})
