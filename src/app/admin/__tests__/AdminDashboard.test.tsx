/**
 * Tests for AdminDashboard Component
 *
 * Tests the admin dashboard including:
 * - Loading and error states
 * - Section overview cards with dynamic counts
 * - Quick actions (export, view site, refresh)
 * - Data version display
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AdminDashboard } from '../AdminDashboard'
import {
  SkillLevel,
  CertificationStatus,
  EmploymentType,
  LanguageProficiency,
  AchievementCategory,
  type CVData,
} from '@/types/cv'

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
const mockExportData = vi.fn()

vi.mock('@/hooks/useAdminData', () => ({
  useAdminData: vi.fn(),
  useExportData: () => ({
    mutate: mockExportData,
    isPending: false,
  }),
}))

// Import the mocked hook for control
import { useAdminData } from '@/hooks/useAdminData'
const mockedUseAdminData = vi.mocked(useAdminData)

// Sample test data
const mockCVData: CVData = {
  version: '2.0.0',
  lastUpdated: '2024-06-15T00:00:00Z',
  personalInfo: {
    fullName: 'John Doe',
    title: 'Software Engineer',
    email: 'john@example.com',
    location: { city: 'NYC', country: 'USA', countryCode: 'US' },
    summary: 'A developer',
    social: {},
    availability: { status: 'available' },
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Company A',
      position: 'Developer',
      type: EmploymentType.FULL_TIME,
      startDate: '2020-01-01',
      endDate: '2021-12-31',
      location: { remote: false },
      description: '',
      achievements: [],
      technologies: [],
      order: 0,
    },
    {
      id: 'exp-2',
      company: 'Company B',
      position: 'Senior Dev',
      type: EmploymentType.FULL_TIME,
      startDate: '2022-01-01',
      endDate: null,
      location: { remote: true },
      description: '',
      achievements: [],
      technologies: [],
      order: 1,
    },
  ],
  skills: [
    {
      id: 'cat-1',
      name: 'Frontend',
      skills: [
        { name: 'React', level: SkillLevel.EXPERT },
        { name: 'TypeScript', level: SkillLevel.ADVANCED },
        { name: 'CSS', level: SkillLevel.ADVANCED },
      ],
      order: 0,
    },
    {
      id: 'cat-2',
      name: 'Backend',
      skills: [
        { name: 'Node.js', level: SkillLevel.ADVANCED },
        { name: 'Python', level: SkillLevel.INTERMEDIATE },
      ],
      order: 1,
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS',
      issuer: 'Amazon',
      issueDate: '2023-01-01',
      expirationDate: null,
      status: CertificationStatus.ACTIVE,
      order: 0,
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University',
      degree: 'BS',
      field: 'CS',
      startDate: '2015-09-01',
      endDate: '2019-05-15',
      order: 0,
    },
    {
      id: 'edu-2',
      institution: 'College',
      degree: 'AA',
      field: 'IT',
      startDate: '2013-09-01',
      endDate: '2015-05-15',
      order: 1,
    },
  ],
  languages: [
    { name: 'English', proficiency: LanguageProficiency.NATIVE, code: 'en' },
    { name: 'Spanish', proficiency: LanguageProficiency.B1, code: 'es' },
    { name: 'French', proficiency: LanguageProficiency.A1, code: 'fr' },
  ],
  achievements: [
    {
      id: 'ach-1',
      title: 'Best Developer',
      category: AchievementCategory.AWARD,
      date: '2023-06-15',
      description: '',
      order: 0,
    },
    {
      id: 'ach-2',
      title: 'Innovation Award',
      category: AchievementCategory.AWARD,
      date: '2022-12-01',
      description: '',
      order: 1,
    },
  ],
  heroStats: [
    {
      id: 'stat-1',
      value: '10+',
      label: 'Years Experience',
      icon: 'terminal',
      order: 0,
    },
    {
      id: 'stat-2',
      value: '50+',
      label: 'Projects',
      icon: 'briefcase',
      order: 1,
    },
    {
      id: 'stat-3',
      value: '100%',
      label: 'Client Satisfaction',
      icon: 'star',
      order: 2,
    },
  ],
  sectionTitles: {
    heroPath: '~/dev/portfolio',
    experience: 'Work Experience',
    skills: 'Technical Skills',
    certifications: 'Certifications',
    contact: 'Get in Touch',
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

describe('AdminDashboard', () => {
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
        isRefetching: false,
      } as unknown as ReturnType<typeof useAdminData>)

      render(<AdminDashboard />)

      // Should show animated pulse skeleton
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('error state', () => {
    it('renders error message when fetch fails', () => {
      mockedUseAdminData.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
        refetch: mockRefetch,
        isRefetching: false,
      } as unknown as ReturnType<typeof useAdminData>)

      render(<AdminDashboard />)

      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument()
    })

    it('calls refetch when try again is clicked', () => {
      mockedUseAdminData.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: mockRefetch,
        isRefetching: false,
      } as unknown as ReturnType<typeof useAdminData>)

      render(<AdminDashboard />)

      fireEvent.click(screen.getByText('Try again'))
      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('dashboard rendering', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('renders dashboard title and subtitle', () => {
      render(<AdminDashboard />)

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Manage your CV content')).toBeInTheDocument()
    })

    it('renders all content section cards', () => {
      render(<AdminDashboard />)

      expect(screen.getByText('Personal Info')).toBeInTheDocument()
      expect(screen.getByText('Experience')).toBeInTheDocument()
      expect(screen.getByText('Skills')).toBeInTheDocument()
      expect(screen.getByText('Certifications')).toBeInTheDocument()
      expect(screen.getByText('Education')).toBeInTheDocument()
      expect(screen.getByText('Languages')).toBeInTheDocument()
      expect(screen.getByText('Achievements')).toBeInTheDocument()
    })

    it('renders homepage customization section cards', () => {
      render(<AdminDashboard />)

      expect(screen.getByText('Hero Stats')).toBeInTheDocument()
      expect(screen.getByText('Section Titles')).toBeInTheDocument()
    })

    it('renders site settings section cards', () => {
      render(<AdminDashboard />)

      expect(screen.getByText('Theme')).toBeInTheDocument()
      expect(screen.getByText('Site Config')).toBeInTheDocument()
    })

    it('renders section headings', () => {
      render(<AdminDashboard />)

      expect(screen.getByText('Content Sections')).toBeInTheDocument()
      expect(screen.getByText('Homepage Customization')).toBeInTheDocument()
      expect(screen.getByText('Site Settings')).toBeInTheDocument()
    })

    it('renders data version', () => {
      render(<AdminDashboard />)

      expect(screen.getByText('Data version: 2.0.0')).toBeInTheDocument()
    })
  })

  describe('dynamic counts', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('shows correct experience count', () => {
      render(<AdminDashboard />)

      // Experience card should show 2 (we have 2 experience items)
      const experienceCard = screen.getByText('Experience').closest('a')
      expect(experienceCard).toHaveTextContent('2')
    })

    it('calculates total skills count across categories', () => {
      render(<AdminDashboard />)

      // Skills card should show 5 (3 frontend + 2 backend)
      const skillsCard = screen.getByText('Skills').closest('a')
      expect(skillsCard).toHaveTextContent('5')
    })

    it('shows correct certifications count', () => {
      render(<AdminDashboard />)

      const certCard = screen.getByText('Certifications').closest('a')
      expect(certCard).toHaveTextContent('1')
    })

    it('shows correct education count', () => {
      render(<AdminDashboard />)

      const eduCard = screen.getByText('Education').closest('a')
      expect(eduCard).toHaveTextContent('2')
    })

    it('shows correct languages count', () => {
      render(<AdminDashboard />)

      const langCard = screen.getByText('Languages').closest('a')
      expect(langCard).toHaveTextContent('3')
    })

    it('shows correct achievements count', () => {
      render(<AdminDashboard />)

      const achCard = screen.getByText('Achievements').closest('a')
      expect(achCard).toHaveTextContent('2')
    })

    it('shows correct hero stats count', () => {
      render(<AdminDashboard />)

      const statsCard = screen.getByText('Hero Stats').closest('a')
      expect(statsCard).toHaveTextContent('3')
    })

    it('counts non-empty section titles', () => {
      render(<AdminDashboard />)

      // We have 5 non-empty section titles
      const titlesCard = screen.getByText('Section Titles').closest('a')
      expect(titlesCard).toHaveTextContent('5')
    })

    it('counts configured theme modes', () => {
      render(<AdminDashboard />)

      // Both light and dark are configured = 2
      const themeCard = screen.getByText('Theme').closest('a')
      expect(themeCard).toHaveTextContent('2')
    })
  })

  describe('dynamic counts with partial data', () => {
    it('shows 0 for missing sections', () => {
      const partialData: CVData = {
        ...mockCVData,
        experience: [],
        skills: [],
        certifications: [],
        education: [],
        languages: [],
        achievements: [],
        heroStats: [],
        sectionTitles: {
          heroPath: '',
          experience: '',
          skills: '',
          certifications: '',
          contact: '',
        },
      }

      mockedUseAdminData.mockReturnValue({
        data: partialData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as unknown as ReturnType<typeof useAdminData>)

      render(<AdminDashboard />)

      // Should show 0 for empty arrays
      const expCard = screen.getByText('Experience').closest('a')
      expect(expCard).toHaveTextContent('0')
    })

    it('counts theme modes correctly when only dark is configured', () => {
      const darkOnlyData: CVData = {
        ...mockCVData,
        themeConfig: {
          defaultTheme: 'dark',
          allowToggle: false,
          dark: mockCVData.themeConfig?.dark ?? {
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
        },
      }

      mockedUseAdminData.mockReturnValue({
        data: darkOnlyData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as unknown as ReturnType<typeof useAdminData>)

      render(<AdminDashboard />)

      const themeCard = screen.getByText('Theme').closest('a')
      expect(themeCard).toHaveTextContent('1')
    })
  })

  describe('quick actions', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('renders quick actions section', () => {
      render(<AdminDashboard />)

      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    })

    it('renders export JSON button', () => {
      render(<AdminDashboard />)

      expect(screen.getByText('Export JSON')).toBeInTheDocument()
    })

    it('renders view site link', () => {
      render(<AdminDashboard />)

      const viewSiteLink = screen.getByText('View Site')
      expect(viewSiteLink.closest('a')).toHaveAttribute('href', '/')
    })

    it('renders refresh button', () => {
      render(<AdminDashboard />)

      expect(screen.getByText('Refresh')).toBeInTheDocument()
    })

    it('calls refetch when refresh is clicked', () => {
      render(<AdminDashboard />)

      fireEvent.click(screen.getByText('Refresh'))
      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })

    it('shows refreshing text when refetching', () => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: true,
      } as unknown as ReturnType<typeof useAdminData>)

      render(<AdminDashboard />)

      expect(screen.getByText('Refreshing...')).toBeInTheDocument()
    })
  })

  describe('navigation links', () => {
    beforeEach(() => {
      mockedUseAdminData.mockReturnValue({
        data: mockCVData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as unknown as ReturnType<typeof useAdminData>)
    })

    it('links to correct admin pages', () => {
      render(<AdminDashboard />)

      // Check some key links
      expect(screen.getByText('Personal Info').closest('a')).toHaveAttribute(
        'href',
        '/admin/personal'
      )
      expect(screen.getByText('Experience').closest('a')).toHaveAttribute(
        'href',
        '/admin/experience'
      )
      expect(screen.getByText('Skills').closest('a')).toHaveAttribute(
        'href',
        '/admin/skills'
      )
      expect(screen.getByText('Theme').closest('a')).toHaveAttribute(
        'href',
        '/admin/theme'
      )
    })
  })
})
