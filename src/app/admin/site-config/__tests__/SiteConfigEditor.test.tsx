/**
 * Integration Tests for SiteConfigEditor
 *
 * Tests the site configuration editor including:
 * - Loading/error states
 * - Form validation
 * - Section visibility toggles
 * - Nav link management
 * - SEO settings
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SiteConfigEditor } from '../SiteConfigEditor'
import type { CVData } from '@/types/cv'

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

// Sample test data
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
    branding: '~/arnold.dev',
    version: 'v2024.12',
    footerText: '© {{year}} All rights reserved.',
    navLinks: [{ label: 'GitHub', href: 'https://github.com', external: true }],
    seo: {
      title: 'Arnold - Platform Engineer',
      description: 'Platform engineer with expertise in Kubernetes',
      keywords: ['kubernetes', 'platform', 'devops'],
    },
    sectionVisibility: {
      hero: true,
      experience: true,
      skills: true,
      certifications: true,
      education: false,
      languages: false,
      achievements: true,
      contact: true,
    },
  },
}

describe('SiteConfigEditor', () => {
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

      render(<SiteConfigEditor />)

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

      render(<SiteConfigEditor />)

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

      render(<SiteConfigEditor />)

      fireEvent.click(screen.getByText('Try again'))
      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('form rendering', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('renders the site config form with data', () => {
      render(<SiteConfigEditor />)

      expect(screen.getByText('Site Config')).toBeInTheDocument()
      expect(screen.getByDisplayValue('~/arnold.dev')).toBeInTheDocument()
      expect(screen.getByDisplayValue('v2024.12')).toBeInTheDocument()
    })

    it('renders back to dashboard link', () => {
      render(<SiteConfigEditor />)

      const backLink = screen.getByText('Back to Dashboard')
      expect(backLink).toBeInTheDocument()
      expect(backLink.closest('a')).toHaveAttribute('href', '/admin')
    })

    it('renders branding section', () => {
      render(<SiteConfigEditor />)

      expect(screen.getByText('Branding')).toBeInTheDocument()
      expect(screen.getByText(/Site Branding/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('~/arnold.dev')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('v2024.12')).toBeInTheDocument()
    })

    it('renders navigation links section', () => {
      render(<SiteConfigEditor />)

      expect(screen.getByText('Navigation Links')).toBeInTheDocument()
      // Existing nav link - appears in form and preview
      const githubElements = screen.getAllByText('GitHub')
      expect(githubElements.length).toBeGreaterThan(0)
    })

    it('renders SEO section', () => {
      render(<SiteConfigEditor />)

      expect(screen.getByText('SEO Settings')).toBeInTheDocument()
      expect(screen.getByText('Meta Title')).toBeInTheDocument()
      expect(screen.getByText('Meta Description')).toBeInTheDocument()
      // Keywords label exists (may appear multiple times due to hint text)
      const keywordsElements = screen.getAllByText(/Keywords/i)
      expect(keywordsElements.length).toBeGreaterThan(0)
    })
  })

  describe('section visibility', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('renders section visibility controls', () => {
      render(<SiteConfigEditor />)

      expect(screen.getByText('Section Visibility')).toBeInTheDocument()
      expect(screen.getByText('Hero / About')).toBeInTheDocument()
      expect(screen.getByText('Experience')).toBeInTheDocument()
      expect(screen.getByText('Skills')).toBeInTheDocument()
      expect(screen.getByText('Certifications')).toBeInTheDocument()
      expect(screen.getByText('Education')).toBeInTheDocument()
      expect(screen.getByText('Languages')).toBeInTheDocument()
      expect(screen.getByText('Achievements')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
    })

    it('loads section visibility state from data', () => {
      render(<SiteConfigEditor />)

      // Education and Languages should be unchecked based on mock data
      const educationLabel = screen.getByText('Education').closest('label')
      const educationCheckbox = educationLabel?.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement | null
      const languagesLabel = screen.getByText('Languages').closest('label')
      const languagesCheckbox = languagesLabel?.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement | null

      expect(educationCheckbox).not.toBeNull()
      expect(educationCheckbox).not.toBeChecked()
      expect(languagesCheckbox).not.toBeNull()
      expect(languagesCheckbox).not.toBeChecked()

      // Experience should be checked
      const experienceLabel = screen.getByText('Experience').closest('label')
      const experienceCheckbox = experienceLabel?.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement | null
      expect(experienceCheckbox).not.toBeNull()
      expect(experienceCheckbox).toBeChecked()
    })

    it('allows toggling section visibility', () => {
      render(<SiteConfigEditor />)

      // Find the Education checkbox and toggle it
      const educationLabel = screen.getByText('Education').closest('label')
      const educationCheckbox = educationLabel?.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement

      expect(educationCheckbox).not.toBeNull()
      expect(educationCheckbox).not.toBeChecked()

      fireEvent.click(educationCheckbox)

      expect(educationCheckbox).toBeChecked()
    })
  })

  describe('navigation links', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('displays existing nav links', () => {
      render(<SiteConfigEditor />)

      // GitHub appears multiple times (form + preview)
      const githubElements = screen.getAllByText('GitHub')
      expect(githubElements.length).toBeGreaterThan(0)
      expect(screen.getByText('https://github.com')).toBeInTheDocument()
    })

    it('allows removing nav links', () => {
      render(<SiteConfigEditor />)

      // Find remove button (X icon) for GitHub link
      const removeButtons = screen.getAllByRole('button').filter(btn => {
        const svg = btn.querySelector('svg')
        return (
          svg &&
          btn.closest('.flex.items-center.gap-2.px-3.py-2') &&
          btn.classList.contains('text-slate-400')
        )
      })

      // Click the remove button for the nav link
      expect(removeButtons.length).toBeGreaterThan(0)
      fireEvent.click(removeButtons[0]!)

      // GitHub should no longer appear as a nav link
      expect(screen.queryByText('https://github.com')).not.toBeInTheDocument()
    })

    it('validates new nav link before adding', () => {
      render(<SiteConfigEditor />)

      // Find add button (Plus icon)
      const addButton = screen.getAllByRole('button').find(btn => {
        return (
          btn.classList.contains('bg-slate-100') && btn.querySelector('svg')
        )
      })

      // Try to add empty link
      fireEvent.click(addButton!)

      // Should not add (validation fails) - GitHub should still be the only link
      const navLinkContainers = document.querySelectorAll(
        '.flex.items-center.gap-2.px-3.py-2.bg-white'
      )
      expect(navLinkContainers.length).toBeLessThanOrEqual(1)
    })
  })

  describe('form submission', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('disables save button when no changes', () => {
      render(<SiteConfigEditor />)

      const saveButton = screen.getByRole('button', { name: /Save Changes/i })
      expect(saveButton).toBeDisabled()
    })

    it('enables save button when changes are made', () => {
      render(<SiteConfigEditor />)

      // Make a change to branding
      const brandingInput = screen.getByDisplayValue('~/arnold.dev')
      fireEvent.change(brandingInput, { target: { value: '~/new-brand' } })

      const saveButton = screen.getByRole('button', { name: /Save Changes/i })
      expect(saveButton).not.toBeDisabled()
    })

    it('shows success toast on successful save', async () => {
      mockUpdateData.mockImplementation((data, options) => {
        options?.onSuccess?.()
      })

      render(<SiteConfigEditor />)

      // Make a change
      const brandingInput = screen.getByDisplayValue('~/arnold.dev')
      fireEvent.change(brandingInput, { target: { value: '~/new-brand' } })

      // Submit form
      const saveButton = screen.getByRole('button', { name: /Save Changes/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockUpdateData).toHaveBeenCalled()
        expect(mockToast.success).toHaveBeenCalledWith(
          'Site config updated successfully'
        )
      })
    })

    it('shows error toast on failed save', async () => {
      mockUpdateData.mockImplementation((data, options) => {
        options?.onError?.(new Error('Save failed'))
      })

      render(<SiteConfigEditor />)

      // Make a change
      const brandingInput = screen.getByDisplayValue('~/arnold.dev')
      fireEvent.change(brandingInput, { target: { value: '~/new-brand' } })

      // Submit form
      const saveButton = screen.getByRole('button', { name: /Save Changes/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Save failed')
      })
    })

    it('includes section visibility in saved data', async () => {
      mockUpdateData.mockImplementation((data, options) => {
        options?.onSuccess?.()
      })

      render(<SiteConfigEditor />)

      // Toggle Education visibility
      const educationLabel = screen.getByText('Education').closest('label')
      const educationCheckbox = educationLabel?.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement

      expect(educationCheckbox).not.toBeNull()
      fireEvent.click(educationCheckbox)

      // Submit form
      const saveButton = screen.getByRole('button', { name: /Save Changes/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockUpdateData).toHaveBeenCalled()
        // Check that the update includes section visibility
        expect(mockUpdateData.mock.calls.length).toBeGreaterThan(0)
        const updateCall = mockUpdateData.mock.calls[0]![0] as Record<
          string,
          unknown
        >
        expect(updateCall.siteConfig).toBeDefined()
        const siteConfig = updateCall.siteConfig as Record<string, unknown>
        expect(siteConfig.sectionVisibility).toBeDefined()
        const visibility = siteConfig.sectionVisibility as Record<
          string,
          boolean
        >
        expect(visibility.education).toBe(true)
      })
    })
  })

  describe('preview panel', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('renders header preview', () => {
      render(<SiteConfigEditor />)

      expect(screen.getByText('Header Preview')).toBeInTheDocument()
    })

    it('updates preview when branding changes', () => {
      render(<SiteConfigEditor />)

      // Change branding
      const brandingInput = screen.getByDisplayValue('~/arnold.dev')
      fireEvent.change(brandingInput, { target: { value: '~/new-brand' } })

      // Preview should update
      expect(screen.getByText('~/new-brand')).toBeInTheDocument()
    })

    it('renders SEO preview', () => {
      render(<SiteConfigEditor />)

      expect(screen.getByText('Search Result Preview')).toBeInTheDocument()
    })
  })
})
