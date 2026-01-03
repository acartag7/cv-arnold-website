/**
 * Tests for SortableList Component
 *
 * Tests for drag-and-drop sortable list using @dnd-kit.
 * Note: Actual drag behavior is difficult to test, so we focus on
 * rendering and basic functionality.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SortableList, SortableItem } from '../SortableList'

// Type for test items
interface TestItem {
  id: string
  name: string
}

describe('SortableList', () => {
  const testItems: TestItem[] = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
  ]

  const defaultProps = {
    items: testItems,
    onReorder: vi.fn(),
    keyExtractor: (item: TestItem) => item.id,
    renderItem: (item: TestItem) => (
      <div data-testid={`item-${item.id}`}>{item.name}</div>
    ),
  }

  describe('rendering', () => {
    it('renders all items', () => {
      render(<SortableList {...defaultProps} />)
      expect(screen.getByTestId('item-1')).toBeInTheDocument()
      expect(screen.getByTestId('item-2')).toBeInTheDocument()
      expect(screen.getByTestId('item-3')).toBeInTheDocument()
    })

    it('renders items in correct order', () => {
      render(<SortableList {...defaultProps} />)
      const items = screen.getAllByTestId(/^item-/)
      expect(items[0]).toHaveTextContent('Item 1')
      expect(items[1]).toHaveTextContent('Item 2')
      expect(items[2]).toHaveTextContent('Item 3')
    })

    it('renders empty list when no items', () => {
      render(<SortableList {...defaultProps} items={[]} />)
      expect(screen.queryByTestId('item-1')).not.toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <SortableList {...defaultProps} className="custom-class" />
      )
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('drag handles', () => {
    it('shows drag handles by default', () => {
      render(<SortableList {...defaultProps} />)
      const dragHandles = screen.getAllByLabelText('Drag to reorder')
      expect(dragHandles).toHaveLength(3)
    })

    it('hides drag handles when showDragHandle is false', () => {
      render(<SortableList {...defaultProps} showDragHandle={false} />)
      expect(screen.queryByLabelText('Drag to reorder')).not.toBeInTheDocument()
    })
  })

  describe('render function', () => {
    it('passes item and index to render function', () => {
      const renderItem = vi.fn((item: TestItem, index: number) => (
        <div data-testid={`item-${index}`}>{item.name}</div>
      ))

      render(<SortableList {...defaultProps} renderItem={renderItem} />)

      expect(renderItem).toHaveBeenCalledTimes(3)
      expect(renderItem).toHaveBeenCalledWith(testItems[0], 0)
      expect(renderItem).toHaveBeenCalledWith(testItems[1], 1)
      expect(renderItem).toHaveBeenCalledWith(testItems[2], 2)
    })
  })
})

describe('SortableItem', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(
        <SortableItem id="test-item">
          <div data-testid="child">Child content</div>
        </SortableItem>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByText('Child content')).toBeInTheDocument()
    })

    it('shows drag handle by default', () => {
      render(
        <SortableItem id="test-item">
          <div>Content</div>
        </SortableItem>
      )
      expect(screen.getByLabelText('Drag to reorder')).toBeInTheDocument()
    })

    it('hides drag handle when showDragHandle is false', () => {
      render(
        <SortableItem id="test-item" showDragHandle={false}>
          <div>Content</div>
        </SortableItem>
      )
      expect(screen.queryByLabelText('Drag to reorder')).not.toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <SortableItem id="test-item" className="custom-item">
          <div>Content</div>
        </SortableItem>
      )
      expect(container.querySelector('.custom-item')).toBeInTheDocument()
    })
  })
})
