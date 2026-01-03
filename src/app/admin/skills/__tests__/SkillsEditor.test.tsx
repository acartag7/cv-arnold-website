/**
 * Integration Tests for SkillsEditor
 *
 * Tests the complete CRUD workflow for skill categories and skills including:
 * - Loading/error states
 * - Category add, edit, delete operations
 * - Skill add, edit, delete operations
 * - Modal interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SkillsEditor } from '../SkillsEditor'
import { SkillLevel, type SkillCategory, type CVData } from '@/types/cv'

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

// Mock createPortal for modals
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom')
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  }
})

// Mock hooks
const mockRefetch = vi.fn()
const mockUpdateData = vi.fn()
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
}

vi.mock('@/hooks/useAdminData', () => ({
  useAdminData: vi.fn(),
  useUpdateData: () => ({
    mutate: mockUpdateData,
    isPending: false,
  }),
}))

vi.mock('@/components/ui/ToastProvider', () => ({
  useToast: () => mockToast,
}))

// Import the mocked hook for control
import { useAdminData } from '@/hooks/useAdminData'
const mockedUseAdminData = vi.mocked(useAdminData)

// Sample test data - using proper SkillLevel enum values
const mockSkillCategories: SkillCategory[] = [
  {
    id: 'cat-1',
    name: 'Frontend',
    description: 'Frontend technologies',
    skills: [
      { name: 'React', level: SkillLevel.EXPERT, featured: true },
      { name: 'TypeScript', level: SkillLevel.ADVANCED },
    ],
    order: 0,
  },
  {
    id: 'cat-2',
    name: 'Backend',
    description: 'Server-side technologies',
    skills: [
      { name: 'Node.js', level: SkillLevel.ADVANCED },
      { name: 'Python', level: SkillLevel.INTERMEDIATE },
    ],
    order: 1,
  },
]

const mockCVData: CVData = {
  version: '1.0.0',
  lastUpdated: '2024-01-01T00:00:00Z',
  personalInfo: {
    fullName: 'John Doe',
    title: 'Developer',
    email: 'john@example.com',
    location: { city: 'NYC', country: 'USA', countryCode: 'US' },
    summary: 'A developer',
    social: {},
    availability: { status: 'available' },
  },
  experience: [],
  skills: mockSkillCategories,
  certifications: [],
  education: [],
  languages: [],
  achievements: [],
  heroStats: [],
  sectionTitles: {
    heroPath: '~/dev',
    experience: 'Experience',
    skills: 'Skills',
    certifications: 'Certs',
    contact: 'Contact',
  },
  themeConfig: {
    defaultTheme: 'dark',
    allowToggle: true,
    dark: {
      bg: '#000',
      surface: '#111',
      surfaceHover: '#222',
      border: '#333',
      text: '#fff',
      textMuted: '#999',
      textDim: '#666',
      accent: '#0f0',
      accentDim: '#060',
    },
    light: {
      bg: '#fff',
      surface: '#f5f5f5',
      surfaceHover: '#eee',
      border: '#ddd',
      text: '#000',
      textMuted: '#666',
      textDim: '#999',
      accent: '#0a0',
      accentDim: '#cfc',
    },
  },
  siteConfig: {
    branding: 'CV',
    version: '1.0',
    footerText: 'Footer',
    navLinks: [],
    seo: {
      title: 'CV',
      description: 'CV',
    },
  },
}

describe('SkillsEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('renders loading skeleton when data is loading', () => {
      mockedUseAdminData.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)

      render(<SkillsEditor />)

      // Should show loading skeleton (animated pulse elements)
      const container = document.querySelector('.animate-pulse')
      expect(container).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('renders error message when fetch fails', () => {
      mockedUseAdminData.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)

      render(<SkillsEditor />)

      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    it('allows retry on error', () => {
      mockedUseAdminData.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)

      render(<SkillsEditor />)

      fireEvent.click(screen.getByText('Try again'))
      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('empty state', () => {
    it('renders empty state when no categories exist', () => {
      mockedUseAdminData.mockReturnValue({
        data: { ...mockCVData, skills: [] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)

      render(<SkillsEditor />)

      expect(screen.getByText('No skill categories yet')).toBeInTheDocument()
      expect(
        screen.getByText('Add your first skill category to get started')
      ).toBeInTheDocument()
    })

    it('shows add button in empty state', () => {
      mockedUseAdminData.mockReturnValue({
        data: { ...mockCVData, skills: [] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)

      render(<SkillsEditor />)

      const addButtons = screen.getAllByText('Add Category')
      expect(addButtons.length).toBeGreaterThan(0)
    })
  })

  describe('list rendering', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('renders skill categories when data exists', () => {
      render(<SkillsEditor />)

      expect(screen.getByText('Skills')).toBeInTheDocument()
      expect(screen.getByText('Frontend')).toBeInTheDocument()
      expect(screen.getByText('Backend')).toBeInTheDocument()
    })

    it('renders skills within categories', () => {
      render(<SkillsEditor />)

      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Node.js')).toBeInTheDocument()
      expect(screen.getByText('Python')).toBeInTheDocument()
    })

    it('shows header add category button', () => {
      render(<SkillsEditor />)

      expect(
        screen.getByRole('button', { name: /Add Category/i })
      ).toBeInTheDocument()
    })

    it('renders back to dashboard link', () => {
      render(<SkillsEditor />)

      const backLink = screen.getByText('Back to Dashboard')
      expect(backLink).toBeInTheDocument()
      expect(backLink.closest('a')).toHaveAttribute('href', '/admin')
    })

    it('shows skill count for each category', () => {
      render(<SkillsEditor />)

      // Both categories have 2 skills each
      const skillCounts = screen.getAllByText('2 skills')
      expect(skillCounts).toHaveLength(2)
    })
  })

  describe('add category', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('opens add category modal when add button is clicked', async () => {
      render(<SkillsEditor />)

      // Before clicking, get count of "Add Category" elements
      const addButtons = screen.getAllByText(/Add Category/i)
      const initialCount = addButtons.length

      fireEvent.click(screen.getByRole('button', { name: /Add Category/i }))

      // After clicking, modal opens with "Add Category" title
      await waitFor(() => {
        const allElements = screen.getAllByText(/Add Category/i)
        // Modal title + buttons = more than before
        expect(allElements.length).toBeGreaterThan(initialCount)
      })

      // Verify modal subtitle appears
      expect(
        screen.getByText('Create a new skill category')
      ).toBeInTheDocument()
    })
  })

  describe('edit category', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('opens edit modal when edit category button is clicked', async () => {
      render(<SkillsEditor />)

      // Click edit button for Frontend category
      const editButton = screen.getByLabelText('Edit Frontend')
      fireEvent.click(editButton)

      // Modal should open with "Edit Category" title
      await waitFor(() => {
        expect(screen.getByText('Edit Category')).toBeInTheDocument()
      })
    })
  })

  describe('delete category', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('opens confirmation dialog when delete category is clicked', () => {
      render(<SkillsEditor />)

      // Click delete button for Frontend category
      const deleteButton = screen.getByLabelText('Delete Frontend')
      fireEvent.click(deleteButton)

      // Confirmation dialog should appear
      expect(screen.getByText('Delete Category')).toBeInTheDocument()
      expect(
        screen.getByText(/Are you sure you want to delete "Frontend"/i)
      ).toBeInTheDocument()
    })

    it('calls updateData when delete category is confirmed', async () => {
      mockUpdateData.mockImplementation((data, options) => {
        options?.onSuccess?.()
      })

      render(<SkillsEditor />)

      // Click delete button
      const deleteButton = screen.getByLabelText('Delete Frontend')
      fireEvent.click(deleteButton)

      // Confirm deletion
      fireEvent.click(screen.getByText('Delete'))

      await waitFor(() => {
        expect(mockUpdateData).toHaveBeenCalled()
        expect(mockToast.success).toHaveBeenCalledWith(
          'Category deleted successfully'
        )
      })
    })

    it('closes dialog when cancel is clicked', () => {
      render(<SkillsEditor />)

      // Open delete dialog
      const deleteButton = screen.getByLabelText('Delete Frontend')
      fireEvent.click(deleteButton)

      // Cancel
      fireEvent.click(screen.getByText('Cancel'))

      // Dialog should close
      expect(
        screen.queryByText(/Are you sure you want to delete "Frontend"/i)
      ).not.toBeInTheDocument()
    })
  })

  describe('add skill', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('opens add skill modal when add skill button is clicked', async () => {
      render(<SkillsEditor />)

      // Click add skill button for Frontend category
      const addSkillButton = screen.getByLabelText('Add skill to Frontend')
      fireEvent.click(addSkillButton)

      // Modal should open with subtitle for adding skill
      await waitFor(() => {
        expect(
          screen.getByText('Add a new skill to this category')
        ).toBeInTheDocument()
      })
    })
  })

  describe('edit skill', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('opens edit skill modal when edit skill button is clicked', async () => {
      render(<SkillsEditor />)

      // Click edit button for React skill
      const editButton = screen.getByLabelText('Edit React')
      fireEvent.click(editButton)

      // Modal should open with "Edit Skill" title
      await waitFor(() => {
        expect(screen.getByText('Edit Skill')).toBeInTheDocument()
      })
    })
  })

  describe('delete skill', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('opens confirmation dialog when delete skill is clicked', () => {
      render(<SkillsEditor />)

      // Click delete button for React skill
      const deleteButton = screen.getByLabelText('Delete React')
      fireEvent.click(deleteButton)

      // Confirmation dialog should appear
      expect(screen.getByText('Delete Skill')).toBeInTheDocument()
      expect(
        screen.getByText(/Are you sure you want to delete "React"/i)
      ).toBeInTheDocument()
    })

    it('calls updateData when delete skill is confirmed', async () => {
      mockUpdateData.mockImplementation((data, options) => {
        options?.onSuccess?.()
      })

      render(<SkillsEditor />)

      // Click delete button
      const deleteButton = screen.getByLabelText('Delete React')
      fireEvent.click(deleteButton)

      // Confirm deletion
      fireEvent.click(screen.getByText('Delete'))

      await waitFor(() => {
        expect(mockUpdateData).toHaveBeenCalled()
        expect(mockToast.success).toHaveBeenCalledWith(
          'Skill deleted successfully'
        )
      })
    })
  })
})
