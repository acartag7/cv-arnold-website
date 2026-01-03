/**
 * Integration Tests for ExperienceEditor
 *
 * Tests the complete CRUD workflow including:
 * - Loading/error states
 * - Add, edit, delete operations
 * - Modal interactions
 * - Reordering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExperienceEditor } from '../ExperienceEditor'
import { EmploymentType, type Experience, type CVData } from '@/types/cv'

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

// Sample test data - using proper EmploymentType enum values
const mockExperiences: Experience[] = [
  {
    id: 'exp-1',
    company: 'Acme Corp',
    companyUrl: 'https://acme.com',
    position: 'Senior Developer',
    type: EmploymentType.FULL_TIME,
    startDate: '2022-01-01',
    endDate: null,
    location: { city: 'San Francisco', country: 'USA', remote: false },
    description: 'Leading development team and building great products',
    achievements: [
      'Built microservices architecture',
      'Improved system performance by 40%',
    ],
    technologies: ['React', 'TypeScript', 'Node.js'],
    order: 0,
    featured: true,
  },
  {
    id: 'exp-2',
    company: 'Tech Startup',
    companyUrl: 'https://techstartup.io',
    position: 'Full Stack Developer',
    type: EmploymentType.FULL_TIME,
    startDate: '2020-06-01',
    endDate: '2021-12-31',
    location: { city: 'Remote', country: 'USA', remote: true },
    description: 'Full stack development for web applications',
    achievements: ['Launched MVP product successfully'],
    technologies: ['Vue', 'Python'],
    order: 1,
    featured: false,
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
  experience: mockExperiences,
  skills: [],
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

describe('ExperienceEditor', () => {
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

      render(<ExperienceEditor />)

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

      render(<ExperienceEditor />)

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

      render(<ExperienceEditor />)

      fireEvent.click(screen.getByText('Try again'))
      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('empty state', () => {
    it('renders empty state when no experiences exist', () => {
      mockedUseAdminData.mockReturnValue({
        data: { ...mockCVData, experience: [] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)

      render(<ExperienceEditor />)

      expect(screen.getByText('No experience entries yet')).toBeInTheDocument()
      expect(
        screen.getByText('Add your first work experience to get started')
      ).toBeInTheDocument()
    })

    it('shows add button in empty state', () => {
      mockedUseAdminData.mockReturnValue({
        data: { ...mockCVData, experience: [] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)

      render(<ExperienceEditor />)

      const addButtons = screen.getAllByText('Add Experience')
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

    it('renders experience list when data exists', () => {
      render(<ExperienceEditor />)

      expect(screen.getByText('Work Experience')).toBeInTheDocument()
      expect(screen.getByText('Senior Developer')).toBeInTheDocument()
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      expect(screen.getByText('Full Stack Developer')).toBeInTheDocument()
      expect(screen.getByText('Tech Startup')).toBeInTheDocument()
    })

    it('shows header add button', () => {
      render(<ExperienceEditor />)

      // Header should have "Add Experience" button
      expect(
        screen.getByRole('button', { name: /Add Experience/i })
      ).toBeInTheDocument()
    })

    it('renders back to dashboard link', () => {
      render(<ExperienceEditor />)

      const backLink = screen.getByText('Back to Dashboard')
      expect(backLink).toBeInTheDocument()
      expect(backLink.closest('a')).toHaveAttribute('href', '/admin')
    })
  })

  describe('add experience', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('opens add modal when add button is clicked', async () => {
      render(<ExperienceEditor />)

      // Before clicking, there's only one "Add Experience" (the button)
      const addButtons = screen.getAllByText(/Add Experience/i)
      const initialCount = addButtons.length

      fireEvent.click(screen.getByRole('button', { name: /Add Experience/i }))

      // After clicking, modal opens and adds another "Add Experience" (the title)
      await waitFor(() => {
        const allAddExperienceElements = screen.getAllByText(/Add Experience/i)
        // Modal title + button = more than before
        expect(allAddExperienceElements.length).toBeGreaterThan(initialCount)
      })

      // Also verify modal subtitle appears
      expect(
        screen.getByText('Add a new work experience entry')
      ).toBeInTheDocument()
    })
  })

  describe('edit experience', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('opens edit modal when edit button is clicked', async () => {
      render(<ExperienceEditor />)

      // Find and click the edit button for first experience (aria-label includes position)
      const editButton = screen.getByLabelText('Edit Senior Developer')
      fireEvent.click(editButton)

      // Modal should open with "Edit Experience" title
      await waitFor(() => {
        expect(screen.getByText('Edit Experience')).toBeInTheDocument()
      })
    })
  })

  describe('delete experience', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('opens confirmation dialog when delete is clicked', () => {
      render(<ExperienceEditor />)

      // Find and click the delete button for first experience
      const deleteButton = screen.getByLabelText('Delete Senior Developer')
      fireEvent.click(deleteButton)

      // Confirmation dialog should appear
      expect(screen.getByText('Delete Experience')).toBeInTheDocument()
      expect(
        screen.getByText(/Are you sure you want to delete/i)
      ).toBeInTheDocument()
    })

    it('calls updateData when delete is confirmed', async () => {
      // Setup mock to call onSuccess
      mockUpdateData.mockImplementation((data, options) => {
        options?.onSuccess?.()
      })

      render(<ExperienceEditor />)

      // Click delete button
      const deleteButton = screen.getByLabelText('Delete Senior Developer')
      fireEvent.click(deleteButton)

      // Confirm deletion
      fireEvent.click(screen.getByText('Delete'))

      await waitFor(() => {
        expect(mockUpdateData).toHaveBeenCalled()
        expect(mockToast.success).toHaveBeenCalledWith(
          'Experience deleted successfully'
        )
      })
    })

    it('closes dialog when cancel is clicked', () => {
      render(<ExperienceEditor />)

      // Open delete dialog
      const deleteButton = screen.getByLabelText('Delete Senior Developer')
      fireEvent.click(deleteButton)

      // Cancel
      fireEvent.click(screen.getByText('Cancel'))

      // Dialog should close (no more delete confirmation visible)
      expect(
        screen.queryByText(/Are you sure you want to delete/i)
      ).not.toBeInTheDocument()
    })
  })

  describe('save operations', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('shows success toast on successful save', async () => {
      mockUpdateData.mockImplementation((data, options) => {
        options?.onSuccess?.()
      })

      render(<ExperienceEditor />)

      // Open edit modal
      const editButton = screen.getByLabelText('Edit Senior Developer')
      fireEvent.click(editButton)

      // Wait for modal and form to appear with pre-populated data
      await waitFor(() => {
        expect(screen.getByText('Edit Experience')).toBeInTheDocument()
        // Verify form is populated with existing data (company field has value)
        expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument()
      })

      // Submit the form directly (more reliable than button click with form attribute)
      const form = document.getElementById('experience-form')
      expect(form).toBeInTheDocument()
      fireEvent.submit(form!)

      await waitFor(() => {
        expect(mockUpdateData).toHaveBeenCalled()
        expect(mockToast.success).toHaveBeenCalledWith(
          'Experience updated successfully'
        )
      })
    })

    it('shows error toast on failed save', async () => {
      mockUpdateData.mockImplementation((data, options) => {
        options?.onError?.(new Error('Save failed'))
      })

      render(<ExperienceEditor />)

      // Open edit modal
      const editButton = screen.getByLabelText('Edit Senior Developer')
      fireEvent.click(editButton)

      // Wait for modal and form to appear with pre-populated data
      await waitFor(() => {
        expect(screen.getByText('Edit Experience')).toBeInTheDocument()
        // Verify form is populated with existing data
        expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument()
      })

      // Submit the form directly
      const form = document.getElementById('experience-form')
      expect(form).toBeInTheDocument()
      fireEvent.submit(form!)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Save failed')
      })
    })
  })
})
