/**
 * CVPageClient Tests
 *
 * Tests for the public-facing CV page including:
 * - Section visibility based on siteConfig
 * - Expandable experience cards
 * - Theme switching
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CVPageClient } from '../CVPageClient'
import type { CVData, Experience, SectionVisibility } from '@/types/cv'
import {
  EmploymentType,
  SkillLevel,
  CertificationStatus,
  LanguageProficiency,
  AchievementCategory,
} from '@/types/cv'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
    section: ({ children, ...props }: { children: React.ReactNode }) => (
      <section {...props}>{children}</section>
    ),
    span: ({ children, ...props }: { children: React.ReactNode }) => (
      <span {...props}>{children}</span>
    ),
    button: ({ children, ...props }: { children: React.ReactNode }) => (
      <button {...props}>{children}</button>
    ),
    li: ({ children, ...props }: { children: React.ReactNode }) => (
      <li {...props}>{children}</li>
    ),
    p: ({ children, ...props }: { children: React.ReactNode }) => (
      <p {...props}>{children}</p>
    ),
    h1: ({ children, ...props }: { children: React.ReactNode }) => (
      <h1 {...props}>{children}</h1>
    ),
    h2: ({ children, ...props }: { children: React.ReactNode }) => (
      <h2 {...props}>{children}</h2>
    ),
    h3: ({ children, ...props }: { children: React.ReactNode }) => (
      <h3 {...props}>{children}</h3>
    ),
    a: ({ children, ...props }: { children: React.ReactNode }) => (
      <a {...props}>{children}</a>
    ),
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    img: (props: React.ComponentProps<'img'>) => <img {...props} />,
    ul: ({ children, ...props }: { children: React.ReactNode }) => (
      <ul {...props}>{children}</ul>
    ),
    input: (props: React.ComponentProps<'input'>) => <input {...props} />,
    textarea: (props: React.ComponentProps<'textarea'>) => (
      <textarea {...props} />
    ),
    form: ({ children, ...props }: { children: React.ReactNode }) => (
      <form {...props}>{children}</form>
    ),
    svg: ({ children, ...props }: { children: React.ReactNode }) => (
      <svg {...props}>{children}</svg>
    ),
    path: (props: React.ComponentProps<'path'>) => <path {...props} />,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

// Mock IntersectionObserver
const mockObserve = vi.fn()
const mockUnobserve = vi.fn()
const mockDisconnect = vi.fn()

beforeEach(() => {
  window.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
    root: null,
    rootMargin: '',
    thresholds: [],
  }))

  // Mock matchMedia
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

afterEach(() => {
  vi.clearAllMocks()
})

// Experience with long description (more than 3 sentences) and achievements
const mockExperienceWithDetails: Experience = {
  id: 'exp-1',
  company: 'Acme Corp',
  companyUrl: 'https://acme.com',
  position: 'Senior Developer',
  type: EmploymentType.FULL_TIME,
  startDate: '2022-01-01',
  endDate: null, // Current role
  location: { city: 'San Francisco', country: 'USA', remote: false },
  description:
    'Led development of microservices architecture. Improved system performance by 40%. Implemented CI/CD pipelines. Mentored junior developers. Conducted code reviews.',
  achievements: [
    'Reduced deployment time by 80%',
    'Increased test coverage to 95%',
  ],
  technologies: ['React', 'TypeScript', 'Node.js', 'AWS'],
  order: 0,
  featured: true,
}

// Experience with short description (less than 3 sentences, no achievements)
const mockExperienceShort: Experience = {
  id: 'exp-2',
  company: 'Small Startup',
  companyUrl: 'https://startup.io',
  position: 'Junior Developer',
  type: EmploymentType.FULL_TIME,
  startDate: '2020-01-01',
  endDate: '2021-12-31',
  location: { city: 'Remote', country: 'USA', remote: true },
  description: 'Built web applications. Fixed bugs.',
  achievements: [],
  technologies: ['JavaScript'],
  order: 1,
  featured: false,
}

// Complete mock CV data
const createMockCVData = (
  overrides: Partial<CVData> = {},
  sectionVisibility: Partial<SectionVisibility> = {}
): CVData => ({
  version: '1.0.0',
  lastUpdated: '2024-01-01T00:00:00Z',
  personalInfo: {
    fullName: 'John Doe',
    title: 'Platform Engineer',
    email: 'john@example.com',
    location: { city: 'NYC', country: 'USA', countryCode: 'US' },
    summary:
      'Experienced platform engineer with expertise in cloud infrastructure.',
    social: {
      github: 'https://github.com/johndoe',
      linkedin: 'https://linkedin.com/in/johndoe',
    },
    availability: { status: 'available' },
  },
  experience: [mockExperienceWithDetails, mockExperienceShort],
  skills: [
    {
      id: 'cat-1',
      name: 'Frontend',
      skills: [
        { name: 'React', level: SkillLevel.EXPERT, yearsOfExperience: 5 },
        {
          name: 'TypeScript',
          level: SkillLevel.ADVANCED,
          yearsOfExperience: 4,
        },
      ],
      order: 0,
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Solutions Architect',
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
      institution: 'MIT',
      degree: 'Bachelor',
      field: 'Computer Science',
      startDate: '2015-09-01',
      endDate: '2019-05-15',
      order: 0,
    },
  ],
  languages: [
    {
      name: 'English',
      code: 'en',
      proficiency: LanguageProficiency.NATIVE,
      native: true,
    },
    { name: 'Spanish', code: 'es', proficiency: LanguageProficiency.B2 },
  ],
  achievements: [
    {
      id: 'ach-1',
      title: 'Open Source Contribution',
      category: AchievementCategory.CONTRIBUTION,
      date: '2023-06-01',
      description: 'Contributed to major open source project',
      order: 0,
    },
  ],
  heroStats: [
    {
      id: 'stat-1',
      label: 'Years Experience',
      value: '8+',
      icon: 'terminal',
      order: 0,
    },
    {
      id: 'stat-2',
      label: 'Certifications',
      value: '9',
      icon: 'shield',
      order: 1,
    },
  ],
  sectionTitles: {
    heroPath: '~/platform-engineer',
    experience: 'experience.log',
    skills: 'skills.json',
    certifications: 'certifications.yaml',
    contact: './send_message.sh',
  },
  themeConfig: {
    defaultTheme: 'dark',
    allowToggle: true,
    dark: {
      bg: '#0a0a0a',
      surface: '#141414',
      surfaceHover: '#1f1f1f',
      border: '#2a2a2a',
      text: '#e5e5e5',
      textMuted: '#a3a3a3',
      textDim: '#737373',
      accent: '#22c55e',
      accentDim: '#14532d',
    },
    light: {
      bg: '#fafafa',
      surface: '#ffffff',
      surfaceHover: '#f5f5f5',
      border: '#e5e5e5',
      text: '#171717',
      textMuted: '#525252',
      textDim: '#a3a3a3',
      accent: '#16a34a',
      accentDim: '#dcfce7',
    },
  },
  siteConfig: {
    branding: '~/john.dev',
    version: 'v2024.12',
    footerText: '© {{year}} All rights reserved.',
    sectionVisibility: {
      hero: true,
      experience: true,
      skills: true,
      certifications: true,
      education: true,
      languages: true,
      achievements: true,
      contact: true,
      ...sectionVisibility,
    },
  },
  ...overrides,
})

describe('CVPageClient', () => {
  describe('expandable experience cards', () => {
    it('renders experience section with expand button for long descriptions', () => {
      const data = createMockCVData()
      render(<CVPageClient data={data} />)

      // Find the experience section
      const experienceSection = document.getElementById('experience')
      expect(experienceSection).toBeInTheDocument()

      // Should show "More" button for experience with long description
      const moreButtons = screen.getAllByRole('button', { name: /show more/i })
      expect(moreButtons.length).toBeGreaterThan(0)
    })

    it('starts with experience cards collapsed', () => {
      const data = createMockCVData()
      render(<CVPageClient data={data} />)

      // Find expand button
      const moreButton = screen.getAllByRole('button', {
        name: /show more/i,
      })[0]

      // Should have aria-expanded=false
      expect(moreButton).toHaveAttribute('aria-expanded', 'false')

      // Should show "More" text
      expect(screen.getByText('More')).toBeInTheDocument()
    })

    it('expands card when clicking More button', () => {
      const data = createMockCVData()
      render(<CVPageClient data={data} />)

      // Find and click expand button
      const moreButtons = screen.getAllByRole('button', { name: /show more/i })
      expect(moreButtons.length).toBeGreaterThan(0)
      const moreButton = moreButtons[0]!
      fireEvent.click(moreButton)

      // Button should now show "Less" and aria-expanded=true
      expect(moreButton).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByText('Less')).toBeInTheDocument()
    })

    it('shows achievements section when expanded', () => {
      const data = createMockCVData()
      render(<CVPageClient data={data} />)

      // Achievements should not be visible initially
      expect(screen.queryByText('Key Achievements')).not.toBeInTheDocument()

      // Click expand button
      const moreButtons = screen.getAllByRole('button', { name: /show more/i })
      const moreButton = moreButtons[0]!
      fireEvent.click(moreButton)

      // Achievements should now be visible
      expect(screen.getByText('Key Achievements')).toBeInTheDocument()
      expect(
        screen.getByText('Reduced deployment time by 80%')
      ).toBeInTheDocument()
    })

    it('shows technologies section when expanded', () => {
      const data = createMockCVData()
      render(<CVPageClient data={data} />)

      // Technologies header should not be visible initially
      expect(screen.queryByText('Technologies')).not.toBeInTheDocument()

      // Click expand button
      const moreButtons = screen.getAllByRole('button', { name: /show more/i })
      const moreButton = moreButtons[0]!
      fireEvent.click(moreButton)

      // Technologies should now be visible
      expect(screen.getByText('Technologies')).toBeInTheDocument()
    })

    it('collapses card when clicking Less button', () => {
      const data = createMockCVData()
      render(<CVPageClient data={data} />)

      // Expand first
      const buttons = screen.getAllByRole('button', { name: /show more/i })
      const button = buttons[0]!
      fireEvent.click(button)

      // Verify expanded
      expect(screen.getByText('Key Achievements')).toBeInTheDocument()

      // Click to collapse
      fireEvent.click(button)

      // Should be collapsed again
      expect(button).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText('Key Achievements')).not.toBeInTheDocument()
    })

    it('does not show expand button for short descriptions without achievements', () => {
      // Create data with only the short experience
      const data = createMockCVData({
        experience: [mockExperienceShort],
      })
      render(<CVPageClient data={data} />)

      // Should not have any More buttons
      const moreButtons = screen.queryAllByRole('button', {
        name: /show more/i,
      })
      expect(moreButtons.length).toBe(0)
    })

    it('shows preview bullets (max 3) when collapsed', () => {
      const data = createMockCVData()
      render(<CVPageClient data={data} />)

      // Should show first 3 bullets
      expect(
        screen.getByText(/Led development of microservices architecture/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Improved system performance by 40%/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Implemented CI\/CD pipelines/)
      ).toBeInTheDocument()

      // Should NOT show 4th and 5th bullets when collapsed
      expect(
        screen.queryByText(/Mentored junior developers/)
      ).not.toBeInTheDocument()
    })

    it('shows all bullets when expanded', () => {
      const data = createMockCVData()
      render(<CVPageClient data={data} />)

      // Expand
      const moreButtons = screen.getAllByRole('button', { name: /show more/i })
      const moreButton = moreButtons[0]!
      fireEvent.click(moreButton)

      // Should show all bullets including 4th and 5th
      expect(screen.getByText(/Mentored junior developers/)).toBeInTheDocument()
      expect(screen.getByText(/Conducted code reviews/)).toBeInTheDocument()
    })
  })

  describe('section visibility', () => {
    it('hides experience section when sectionVisibility.experience is false', () => {
      const data = createMockCVData({}, { experience: false })
      render(<CVPageClient data={data} />)

      const experienceSection = document.getElementById('experience')
      expect(experienceSection).not.toBeInTheDocument()
    })

    it('hides skills section when sectionVisibility.skills is false', () => {
      const data = createMockCVData({}, { skills: false })
      render(<CVPageClient data={data} />)

      const skillsSection = document.getElementById('skills')
      expect(skillsSection).not.toBeInTheDocument()
    })

    it('hides certifications section when sectionVisibility.certifications is false', () => {
      const data = createMockCVData({}, { certifications: false })
      render(<CVPageClient data={data} />)

      const certificationsSection = document.getElementById('certifications')
      expect(certificationsSection).not.toBeInTheDocument()
    })

    it('hides education section when sectionVisibility.education is false', () => {
      const data = createMockCVData({}, { education: false })
      render(<CVPageClient data={data} />)

      // Education section won't have an ID, check by content
      expect(screen.queryByText('MIT')).not.toBeInTheDocument()
    })

    it('hides languages section when sectionVisibility.languages is false', () => {
      const data = createMockCVData({}, { languages: false })
      render(<CVPageClient data={data} />)

      // Check that language items are not rendered
      expect(screen.queryByText('Spanish')).not.toBeInTheDocument()
    })

    it('hides achievements section when sectionVisibility.achievements is false', () => {
      const data = createMockCVData({}, { achievements: false })
      render(<CVPageClient data={data} />)

      // Check that achievement items are not rendered
      expect(
        screen.queryByText('Open Source Contribution')
      ).not.toBeInTheDocument()
    })

    it('hides contact section when sectionVisibility.contact is false', () => {
      const data = createMockCVData({}, { contact: false })
      render(<CVPageClient data={data} />)

      const contactSection = document.getElementById('contact')
      expect(contactSection).not.toBeInTheDocument()
    })

    it('shows all sections by default when sectionVisibility is not set', () => {
      const data = createMockCVData()
      // Remove sectionVisibility to test default behavior
      delete data.siteConfig?.sectionVisibility

      render(<CVPageClient data={data} />)

      // All sections should be visible
      expect(document.getElementById('experience')).toBeInTheDocument()
      expect(document.getElementById('skills')).toBeInTheDocument()
      expect(document.getElementById('certifications')).toBeInTheDocument()
      expect(document.getElementById('contact')).toBeInTheDocument()
    })
  })

  describe('theme toggle', () => {
    it('shows theme toggle button when allowToggle is true', () => {
      const data = createMockCVData()
      render(<CVPageClient data={data} />)

      // Find toggle button by aria-label pattern (Switch to light/dark mode)
      const toggleButton = screen.getByRole('button', {
        name: /switch to (light|dark) mode/i,
      })
      expect(toggleButton).toBeInTheDocument()
    })

    it('hides theme toggle button when allowToggle is false', () => {
      const data = createMockCVData()
      data.themeConfig!.allowToggle = false
      render(<CVPageClient data={data} />)

      // Theme toggle should not be present
      const toggleButton = screen.queryByRole('button', {
        name: /switch to (light|dark) mode/i,
      })
      expect(toggleButton).not.toBeInTheDocument()
    })

    it('switches theme when toggle is clicked', () => {
      const data = createMockCVData()
      render(<CVPageClient data={data} />)

      // Initial state is dark mode (matchMedia returns dark), so button says "Switch to light mode"
      const toggleButton = screen.getByRole('button', {
        name: /switch to light mode/i,
      })
      expect(toggleButton).toBeInTheDocument()

      // Click to toggle
      fireEvent.click(toggleButton)

      // After clicking, theme changes to light mode, so button should now say "Switch to dark mode"
      expect(
        screen.getByRole('button', { name: /switch to dark mode/i })
      ).toBeInTheDocument()
    })
  })
})
