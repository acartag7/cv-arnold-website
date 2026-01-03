/**
 * Parameterized Tests for All Section Editors
 *
 * Validates that all editors follow the same UI patterns:
 * - Loading state with skeleton
 * - Error state with retry option
 * - Back to Dashboard navigation
 *
 * This avoids duplicating ~500 lines of tests per editor
 * while still ensuring pattern consistency.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

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

// Import mocked hook for control
import { useAdminData } from '@/hooks/useAdminData'
const mockedUseAdminData = vi.mocked(useAdminData)

// Import all editors
import { CertificationsEditor } from '../certifications/CertificationsEditor'
import { EducationEditor } from '../education/EducationEditor'
import { LanguagesEditor } from '../languages/LanguagesEditor'
import { AchievementsEditor } from '../achievements/AchievementsEditor'
import { HeroStatsEditor } from '../hero-stats/HeroStatsEditor'
import { SectionTitlesEditor } from '../section-titles/SectionTitlesEditor'
import { ThemeEditor } from '../theme/ThemeEditor'
import { SiteConfigEditor } from '../site-config/SiteConfigEditor'

// Editor configurations for parameterized testing
const editors = [
  { name: 'CertificationsEditor', Component: CertificationsEditor },
  { name: 'EducationEditor', Component: EducationEditor },
  { name: 'LanguagesEditor', Component: LanguagesEditor },
  { name: 'AchievementsEditor', Component: AchievementsEditor },
  { name: 'HeroStatsEditor', Component: HeroStatsEditor },
  { name: 'SectionTitlesEditor', Component: SectionTitlesEditor },
  { name: 'ThemeEditor', Component: ThemeEditor },
  { name: 'SiteConfigEditor', Component: SiteConfigEditor },
]

describe('Editor Pattern Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe.each(editors)('$name', ({ Component }) => {
    describe('loading state', () => {
      it('renders loading skeleton when data is loading', () => {
        mockedUseAdminData.mockReturnValue({
          data: undefined,
          isLoading: true,
          error: null,
          refetch: mockRefetch,
        } as unknown as ReturnType<typeof useAdminData>)

        render(<Component />)

        // All editors show skeleton with animate-pulse
        const skeleton = document.querySelector('.animate-pulse')
        expect(skeleton).toBeInTheDocument()
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

        render(<Component />)

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

        render(<Component />)

        fireEvent.click(screen.getByText('Try again'))
        expect(mockRefetch).toHaveBeenCalledTimes(1)
      })
    })

    describe('navigation', () => {
      it('renders back to dashboard link', () => {
        mockedUseAdminData.mockReturnValue({
          data: undefined,
          isLoading: false,
          error: new Error('Network error'),
          refetch: mockRefetch,
        } as unknown as ReturnType<typeof useAdminData>)

        render(<Component />)

        const backLink = screen.getByText('Back to Dashboard')
        expect(backLink).toBeInTheDocument()
        expect(backLink.closest('a')).toHaveAttribute('href', '/admin')
      })
    })
  })
})
