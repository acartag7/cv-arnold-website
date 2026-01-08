/**
 * Tests for SkillCategoryList Component
 *
 * Tests the skill category display including:
 * - Category rendering with skill badges
 * - Category actions (edit, delete, add skill)
 * - Skill drag-and-drop reordering within categories
 * - Category reordering via SortableList
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { SkillCategoryList } from '../SkillCategoryList'
import { SkillLevel, type SkillCategory, type Skill } from '@/types/cv'

// Mock SortableList to avoid dnd-kit complexity
vi.mock('@/components/admin', () => ({
  SortableList: ({
    items,
    renderItem,
  }: {
    items: SkillCategory[]
    keyExtractor: (item: SkillCategory) => string
    onReorder: (items: SkillCategory[]) => void
    renderItem: (item: SkillCategory, index: number) => React.ReactNode
  }) => (
    <div data-testid="sortable-list">
      {items.map((item, index) => (
        <div key={item.id} data-testid={`category-${item.id}`}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  ),
}))

// Test data
const mockSkill1: Skill = {
  name: 'React',
  level: SkillLevel.EXPERT,
  featured: true,
}
const mockSkill2: Skill = { name: 'TypeScript', level: SkillLevel.ADVANCED }
const mockSkill3: Skill = { name: 'Node.js', level: SkillLevel.INTERMEDIATE }

const mockCategories: SkillCategory[] = [
  {
    id: 'cat-frontend',
    name: 'Frontend',
    description: 'Frontend technologies',
    skills: [mockSkill1, mockSkill2],
    order: 0,
  },
  {
    id: 'cat-backend',
    name: 'Backend',
    description: 'Server-side technologies',
    skills: [mockSkill3],
    order: 1,
  },
]

describe('SkillCategoryList', () => {
  const defaultProps = {
    categories: mockCategories,
    onEditCategory: vi.fn(),
    onDeleteCategory: vi.fn(),
    onAddSkill: vi.fn(),
    onEditSkill: vi.fn(),
    onDeleteSkill: vi.fn(),
    onReorder: vi.fn(),
    onReorderSkills: vi.fn(),
    isSaving: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders all categories', () => {
      render(<SkillCategoryList {...defaultProps} />)

      expect(screen.getByText('Frontend')).toBeInTheDocument()
      expect(screen.getByText('Backend')).toBeInTheDocument()
    })

    it('renders category descriptions', () => {
      render(<SkillCategoryList {...defaultProps} />)

      expect(screen.getByText('Frontend technologies')).toBeInTheDocument()
      expect(screen.getByText('Server-side technologies')).toBeInTheDocument()
    })

    it('renders skill counts correctly', () => {
      render(<SkillCategoryList {...defaultProps} />)

      expect(screen.getByText('2 skills')).toBeInTheDocument()
      expect(screen.getByText('1 skill')).toBeInTheDocument()
    })

    it('renders skills within categories', () => {
      render(<SkillCategoryList {...defaultProps} />)

      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Node.js')).toBeInTheDocument()
    })

    it('shows featured star for featured skills', () => {
      render(<SkillCategoryList {...defaultProps} />)

      // React is featured, should have a star icon
      const reactBadge = screen.getByText('React').closest('div')
      expect(reactBadge?.querySelector('svg')).toBeInTheDocument()
    })

    it('renders empty state for category with no skills', () => {
      const emptyCategory: SkillCategory = {
        id: 'cat-empty',
        name: 'Empty',
        skills: [],
        order: 0,
      }
      render(
        <SkillCategoryList {...defaultProps} categories={[emptyCategory]} />
      )

      expect(screen.getByText('No skills added yet.')).toBeInTheDocument()
      expect(screen.getByText('Add one')).toBeInTheDocument()
    })
  })

  describe('category actions', () => {
    it('calls onEditCategory when edit button is clicked', () => {
      render(<SkillCategoryList {...defaultProps} />)

      const editButton = screen.getByLabelText('Edit Frontend')
      fireEvent.click(editButton)

      expect(defaultProps.onEditCategory).toHaveBeenCalledWith(
        mockCategories[0]
      )
    })

    it('calls onDeleteCategory when delete button is clicked', () => {
      render(<SkillCategoryList {...defaultProps} />)

      const deleteButton = screen.getByLabelText('Delete Frontend')
      fireEvent.click(deleteButton)

      expect(defaultProps.onDeleteCategory).toHaveBeenCalledWith(
        mockCategories[0]
      )
    })

    it('calls onAddSkill when add skill button is clicked', () => {
      render(<SkillCategoryList {...defaultProps} />)

      const addButton = screen.getByLabelText('Add skill to Frontend')
      fireEvent.click(addButton)

      expect(defaultProps.onAddSkill).toHaveBeenCalledWith('cat-frontend')
    })

    it('disables category actions when isSaving is true', () => {
      render(<SkillCategoryList {...defaultProps} isSaving={true} />)

      const editButton = screen.getByLabelText('Edit Frontend')
      const deleteButton = screen.getByLabelText('Delete Frontend')
      const addButton = screen.getByLabelText('Add skill to Frontend')

      expect(editButton).toBeDisabled()
      expect(deleteButton).toBeDisabled()
      expect(addButton).toBeDisabled()
    })
  })

  describe('skill actions', () => {
    it('calls onEditSkill when skill edit button is clicked', () => {
      render(<SkillCategoryList {...defaultProps} />)

      const editButton = screen.getByLabelText('Edit React')
      fireEvent.click(editButton)

      expect(defaultProps.onEditSkill).toHaveBeenCalledWith(
        mockSkill1,
        'cat-frontend'
      )
    })

    it('calls onDeleteSkill when skill delete button is clicked', () => {
      render(<SkillCategoryList {...defaultProps} />)

      const deleteButton = screen.getByLabelText('Delete React')
      fireEvent.click(deleteButton)

      expect(defaultProps.onDeleteSkill).toHaveBeenCalledWith(
        mockSkill1,
        'cat-frontend'
      )
    })

    it('disables skill actions when isSaving is true', () => {
      render(<SkillCategoryList {...defaultProps} isSaving={true} />)

      const editButton = screen.getByLabelText('Edit React')
      const deleteButton = screen.getByLabelText('Delete React')

      expect(editButton).toBeDisabled()
      expect(deleteButton).toBeDisabled()
    })
  })

  describe('skill drag and drop reordering', () => {
    it('skills are draggable when not saving', () => {
      render(<SkillCategoryList {...defaultProps} />)

      // Get the Frontend category container
      const frontendCategory = screen.getByTestId('category-cat-frontend')
      const draggableSkills = within(frontendCategory)
        .getAllByText(/React|TypeScript/)
        .map(el => el.closest('[draggable]'))
        .filter(Boolean)

      expect(draggableSkills.length).toBe(2)
      draggableSkills.forEach(skill => {
        expect(skill).toHaveAttribute('draggable', 'true')
      })
    })

    it('skills are not draggable when isSaving is true', () => {
      render(<SkillCategoryList {...defaultProps} isSaving={true} />)

      // Check for draggable attributes - should be false when saving
      const draggableElements = document.querySelectorAll('[draggable="true"]')
      expect(draggableElements.length).toBe(0)
    })

    it('reorders skills within a category on drag and drop', () => {
      render(<SkillCategoryList {...defaultProps} />)

      const frontendCategory = screen.getByTestId('category-cat-frontend')
      const skillElements = within(frontendCategory)
        .getAllByText(/React|TypeScript/)
        .map(el => el.closest('[draggable]'))
        .filter(Boolean)

      const dataTransfer = {
        effectAllowed: '',
        dropEffect: '',
        setDragImage: vi.fn(),
      }

      // Drag React (index 0) to TypeScript position (index 1)
      fireEvent.dragStart(skillElements[0] as Element, { dataTransfer })
      fireEvent.dragOver(skillElements[1] as Element, { dataTransfer })
      fireEvent.dragEnd(skillElements[0] as Element)

      // Should call onReorderSkills with categoryId and reordered skills
      expect(defaultProps.onReorderSkills).toHaveBeenCalledWith(
        'cat-frontend',
        [mockSkill2, mockSkill1] // Order is swapped
      )
    })

    it('does not reorder when dropping on same position', () => {
      render(<SkillCategoryList {...defaultProps} />)

      const frontendCategory = screen.getByTestId('category-cat-frontend')
      const skillElements = within(frontendCategory)
        .getAllByText(/React|TypeScript/)
        .map(el => el.closest('[draggable]'))
        .filter(Boolean)

      const dataTransfer = {
        effectAllowed: '',
        dropEffect: '',
        setDragImage: vi.fn(),
      }

      // Drag and drop to same position
      fireEvent.dragStart(skillElements[0] as Element, { dataTransfer })
      fireEvent.dragOver(skillElements[0] as Element, { dataTransfer })
      fireEvent.dragEnd(skillElements[0] as Element)

      expect(defaultProps.onReorderSkills).not.toHaveBeenCalled()
    })

    it('applies visual styles during drag', () => {
      render(<SkillCategoryList {...defaultProps} />)

      const frontendCategory = screen.getByTestId('category-cat-frontend')
      const skillElements = within(frontendCategory)
        .getAllByText(/React|TypeScript/)
        .map(el => el.closest('[draggable]'))
        .filter(Boolean)

      const dataTransfer = {
        effectAllowed: '',
        dropEffect: '',
        setDragImage: vi.fn(),
      }

      // Start dragging
      fireEvent.dragStart(skillElements[0] as Element, { dataTransfer })

      // Dragged element should have opacity-50 class
      expect(skillElements[0]).toHaveClass('opacity-50')
    })

    it('applies drag over styles to target skill', () => {
      render(<SkillCategoryList {...defaultProps} />)

      const frontendCategory = screen.getByTestId('category-cat-frontend')
      const skillElements = within(frontendCategory)
        .getAllByText(/React|TypeScript/)
        .map(el => el.closest('[draggable]'))
        .filter(Boolean)

      const dataTransfer = {
        effectAllowed: '',
        dropEffect: '',
        setDragImage: vi.fn(),
      }

      // Start dragging first skill and hover over second
      fireEvent.dragStart(skillElements[0] as Element, { dataTransfer })
      fireEvent.dragOver(skillElements[1] as Element, { dataTransfer })

      // Target should have ring styles
      expect(skillElements[1]).toHaveClass('ring-2')
    })

    it('hides grip handle when isSaving is true', () => {
      // First render without saving to confirm grip is visible
      const { rerender } = render(<SkillCategoryList {...defaultProps} />)

      // When not saving, skills should be draggable (grip visible)
      let draggableElements = document.querySelectorAll('[draggable="true"]')
      expect(draggableElements.length).toBeGreaterThan(0)

      // Now render with saving
      rerender(<SkillCategoryList {...defaultProps} isSaving={true} />)

      // When saving, no elements should be draggable
      draggableElements = document.querySelectorAll('[draggable="true"]')
      expect(draggableElements.length).toBe(0)
    })
  })

  describe('expand/collapse', () => {
    it('collapses category when header is clicked', () => {
      render(<SkillCategoryList {...defaultProps} />)

      // Skills should be visible initially
      expect(screen.getByText('React')).toBeInTheDocument()

      // Click to collapse
      const frontendHeader = screen.getByText('Frontend')
      fireEvent.click(frontendHeader)

      // Skills should be hidden
      expect(screen.queryByText('React')).not.toBeInTheDocument()
    })

    it('expands collapsed category when clicked again', () => {
      render(<SkillCategoryList {...defaultProps} />)

      // Click to collapse
      const frontendHeader = screen.getByText('Frontend')
      fireEvent.click(frontendHeader)

      // Skills hidden
      expect(screen.queryByText('React')).not.toBeInTheDocument()

      // Click to expand
      fireEvent.click(frontendHeader)

      // Skills visible again
      expect(screen.getByText('React')).toBeInTheDocument()
    })
  })
})
