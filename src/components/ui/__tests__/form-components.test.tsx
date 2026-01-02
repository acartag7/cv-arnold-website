/**
 * Tests for Form UI Components
 *
 * Tests for Input, Textarea, Select, Label, and FormField components.
 * Ensures proper rendering, accessibility, and error handling.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '../Input'
import { Textarea } from '../Textarea'
import { Select } from '../Select'
import { Label } from '../Label'
import { FormField } from '../FormField'

describe('Input', () => {
  it('renders with default type text', () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
  })

  it('renders with specified type', () => {
    render(<Input type="email" placeholder="Enter email" />)
    const input = screen.getByPlaceholderText('Enter email')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('displays error message when provided', () => {
    render(<Input id="test-input" error="This field is required" />)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'This field is required'
    )
  })

  it('sets aria-invalid when error is present', () => {
    render(<Input id="test-input" error="Invalid value" placeholder="Test" />)
    const input = screen.getByPlaceholderText('Test')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('links error message via aria-describedby', () => {
    render(<Input id="test-input" error="Error message" placeholder="Test" />)
    const input = screen.getByPlaceholderText('Test')
    expect(input).toHaveAttribute('aria-describedby', 'test-input-error')
  })

  it('handles onChange events', () => {
    const handleChange = vi.fn()
    render(<Input placeholder="Test" onChange={handleChange} />)
    const input = screen.getByPlaceholderText('Test')
    fireEvent.change(input, { target: { value: 'new value' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Input ref={ref} placeholder="Test" />)
    expect(ref).toHaveBeenCalled()
  })

  it('applies disabled state', () => {
    render(<Input disabled placeholder="Disabled input" />)
    expect(screen.getByPlaceholderText('Disabled input')).toBeDisabled()
  })
})

describe('Textarea', () => {
  it('renders with default rows', () => {
    render(<Textarea placeholder="Enter text" />)
    const textarea = screen.getByPlaceholderText('Enter text')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('rows', '4')
  })

  it('renders with specified rows', () => {
    render(<Textarea rows={6} placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toHaveAttribute(
      'rows',
      '6'
    )
  })

  it('displays error message when provided', () => {
    render(<Textarea id="test-textarea" error="Too short" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Too short')
  })

  it('sets aria-invalid when error is present', () => {
    render(<Textarea id="test-textarea" error="Invalid" placeholder="Test" />)
    expect(screen.getByPlaceholderText('Test')).toHaveAttribute(
      'aria-invalid',
      'true'
    )
  })

  it('handles onChange events', () => {
    const handleChange = vi.fn()
    render(<Textarea placeholder="Test" onChange={handleChange} />)
    fireEvent.change(screen.getByPlaceholderText('Test'), {
      target: { value: 'new content' },
    })
    expect(handleChange).toHaveBeenCalled()
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Textarea ref={ref} placeholder="Test" />)
    expect(ref).toHaveBeenCalled()
  })
})

describe('Select', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
  ]

  it('renders all options', () => {
    render(<Select options={options} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
    expect(screen.getByText('Option 3')).toBeInTheDocument()
  })

  it('renders placeholder when provided', () => {
    render(<Select options={options} placeholder="Select an option" />)
    expect(screen.getByText('Select an option')).toBeInTheDocument()
  })

  it('displays error message when provided', () => {
    render(<Select id="test-select" options={options} error="Required" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
  })

  it('sets aria-invalid when error is present', () => {
    render(<Select id="test-select" options={options} error="Invalid" />)
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('handles disabled options', () => {
    render(<Select options={options} />)
    const disabledOption = screen.getByText('Option 3')
    expect(disabledOption).toBeDisabled()
  })

  it('handles onChange events', () => {
    const handleChange = vi.fn()
    render(<Select options={options} onChange={handleChange} />)
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'option2' },
    })
    expect(handleChange).toHaveBeenCalled()
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Select ref={ref} options={options} />)
    expect(ref).toHaveBeenCalled()
  })
})

describe('Label', () => {
  it('renders children', () => {
    render(<Label htmlFor="test">Field Label</Label>)
    expect(screen.getByText('Field Label')).toBeInTheDocument()
  })

  it('links to input via htmlFor', () => {
    render(<Label htmlFor="email-input">Email</Label>)
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email-input')
  })

  it('shows required indicator when required prop is true', () => {
    render(
      <Label htmlFor="required-field" required>
        Required Field
      </Label>
    )
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('does not show required indicator when required is false', () => {
    render(<Label htmlFor="optional-field">Optional Field</Label>)
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Label htmlFor="test" className="custom-class">
        Label
      </Label>
    )
    expect(screen.getByText('Label')).toHaveClass('custom-class')
  })
})

describe('FormField', () => {
  it('renders label with correct htmlFor', () => {
    render(
      <FormField label="Email" name="email">
        <input id="email" />
      </FormField>
    )
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email')
  })

  it('shows required indicator when required prop is true', () => {
    render(
      <FormField label="Name" name="name" required>
        <input id="name" />
      </FormField>
    )
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('displays error message when provided', () => {
    render(
      <FormField label="Email" name="email" error="Invalid email">
        <input id="email" />
      </FormField>
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email')
  })

  it('displays description when provided', () => {
    render(
      <FormField
        label="Bio"
        name="bio"
        description="Write a brief bio about yourself"
      >
        <textarea id="bio" />
      </FormField>
    )
    expect(
      screen.getByText('Write a brief bio about yourself')
    ).toBeInTheDocument()
  })

  it('renders children (input elements)', () => {
    render(
      <FormField label="Username" name="username">
        <input id="username" data-testid="username-input" />
      </FormField>
    )
    expect(screen.getByTestId('username-input')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <FormField label="Test" name="test" className="custom-field">
        <input id="test" />
      </FormField>
    )
    expect(container.firstChild).toHaveClass('custom-field')
  })
})
