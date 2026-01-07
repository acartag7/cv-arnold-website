/**
 * Tests for DatePicker Component
 *
 * Tests for date input with null toggle and various modes.
 * The component uses custom dropdowns for month-year mode and native input for full date mode.
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
    it('renders month and year dropdowns in month-year mode', () => {
      render(<DatePicker {...defaultProps} />)
      // Month dropdown should have "June" selected
      const monthSelect = screen.getByDisplayValue('June')
      expect(monthSelect).toBeInTheDocument()
      // Year dropdown should have "2024" selected
      const yearSelect = screen.getByDisplayValue('2024')
      expect(yearSelect).toBeInTheDocument()
    })

    it('renders label when provided', () => {
      render(<DatePicker {...defaultProps} label="Start Date" />)
      expect(screen.getByText('Start Date')).toBeInTheDocument()
    })

    it('renders error message when provided', () => {
      render(<DatePicker {...defaultProps} error="Date is required" />)
      expect(screen.getByText('Date is required')).toBeInTheDocument()
    })

    it('renders dropdowns as disabled when disabled prop is true', () => {
      render(<DatePicker {...defaultProps} disabled />)
      const monthSelect = screen.getByDisplayValue('June')
      const yearSelect = screen.getByDisplayValue('2024')
      expect(monthSelect).toBeDisabled()
      expect(yearSelect).toBeDisabled()
    })
  })

  describe('modes', () => {
    it('renders dropdown selects in month-year mode by default', () => {
      render(<DatePicker {...defaultProps} />)
      // Should have comboboxes (select elements)
      const selects = screen.getAllByRole('combobox')
      expect(selects.length).toBe(2) // month and year
    })

    it('renders full date input when specified', () => {
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
    it('calls onChange when month is changed', () => {
      render(<DatePicker {...defaultProps} />)
      const monthSelect = screen.getByDisplayValue('June')
      fireEvent.change(monthSelect, { target: { value: '08' } })
      expect(defaultProps.onChange).toHaveBeenCalledWith('2024-08-01')
    })

    it('calls onChange when year is changed', () => {
      render(<DatePicker {...defaultProps} />)
      const yearSelect = screen.getByDisplayValue('2024')
      fireEvent.change(yearSelect, { target: { value: '2023' } })
      expect(defaultProps.onChange).toHaveBeenCalledWith('2023-06-01')
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
      const today = new Date()
      const year = today.getFullYear().toString()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const expectedDate = `${year}-${month}-01`

      render(
        <DatePicker value={null} onChange={defaultProps.onChange} allowNull />
      )
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
      expect(defaultProps.onChange).toHaveBeenCalledWith(expectedDate)
    })
  })

  describe('full mode constraints', () => {
    it('applies min constraint to full date input', () => {
      render(<DatePicker {...defaultProps} mode="full" min="2024-01-01" />)
      const input = screen.getByDisplayValue('2024-06-15')
      expect(input).toHaveAttribute('min', '2024-01-01')
    })

    it('applies max constraint to full date input', () => {
      render(<DatePicker {...defaultProps} mode="full" max="2024-12-31" />)
      const input = screen.getByDisplayValue('2024-06-15')
      expect(input).toHaveAttribute('max', '2024-12-31')
    })
  })

  describe('edge cases', () => {
    it('handles empty value gracefully with placeholder dropdowns', () => {
      render(<DatePicker value="" onChange={vi.fn()} />)
      // Should render month dropdown with placeholder
      const monthSelect = screen.getByDisplayValue('Month')
      expect(monthSelect).toBeInTheDocument()
    })

    it('handles null value gracefully without dropdowns visible', () => {
      render(<DatePicker value={null} onChange={vi.fn()} allowNull />)
      // Dropdowns should be hidden, null indicator shown
      expect(screen.queryByDisplayValue('Month')).not.toBeInTheDocument()
      // The "Present" text appears in both the label and the indicator
      const presentElements = screen.getAllByText('Present')
      expect(presentElements.length).toBeGreaterThanOrEqual(1)
    })

    it('handles malformed date value gracefully', () => {
      render(<DatePicker value="invalid-date" onChange={vi.fn()} />)
      // Should not crash, render with placeholder
      const monthSelect = screen.getByDisplayValue('Month')
      expect(monthSelect).toBeInTheDocument()
    })
  })
})
