/**
 * Tests for AdminLayoutClient
 *
 * Tests the admin layout including:
 * - User menu dropdown with logout
 * - User avatar display with initials
 * - Mobile sidebar logout
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AdminLayoutClient } from '../AdminLayoutClient'

// Mock dependencies
vi.mock('@tanstack/react-query', () => ({
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  // Mock useQuery for SidebarNav visibility checks
  useQuery: () => ({
    data: undefined,
    isLoading: false,
    error: null,
  }),
}))

vi.mock('@/lib/queryClient', () => ({
  createQueryClient: vi.fn(() => ({})),
}))

vi.mock('@/components/ui/ThemeSwitcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher">Theme</div>,
}))

vi.mock('@/components/ui/ToastProvider', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock('@/components/common/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock('@/components/admin', () => ({
  AdminErrorFallback: () => <div>Error</div>,
}))

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('AdminLayoutClient', () => {
  describe('User Menu Dropdown', () => {
    it('should render user avatar button with initials', () => {
      render(
        <AdminLayoutClient userEmail="john.doe@example.com">
          <div>Content</div>
        </AdminLayoutClient>
      )

      // Find the avatar button with user initials (JD for john.doe)
      const avatarButton = screen.getByRole('button', { name: /user menu/i })
      expect(avatarButton).toBeInTheDocument()
      expect(avatarButton).toHaveTextContent('JD')
    })

    it('should show dropdown with email and logout when clicked', () => {
      render(
        <AdminLayoutClient userEmail="test@example.com">
          <div>Content</div>
        </AdminLayoutClient>
      )

      // Click the avatar button to open dropdown
      const avatarButton = screen.getByRole('button', { name: /user menu/i })
      fireEvent.click(avatarButton)

      // Dropdown should show "Signed in as" label
      expect(screen.getByText('Signed in as')).toBeInTheDocument()

      // Email may appear in multiple places (dropdown and mobile sidebar)
      const emailElements = screen.getAllByText('test@example.com')
      expect(emailElements.length).toBeGreaterThan(0)

      // Dropdown should show logout link
      const logoutLink = screen.getByRole('menuitem', { name: /sign out/i })
      expect(logoutLink).toHaveAttribute('href', '/cdn-cgi/access/logout')
    })

    it('should close dropdown when clicking outside', () => {
      render(
        <AdminLayoutClient userEmail="test@example.com">
          <div data-testid="outside">Content</div>
        </AdminLayoutClient>
      )

      // Open dropdown
      const avatarButton = screen.getByRole('button', { name: /user menu/i })
      fireEvent.click(avatarButton)
      expect(screen.getByText('Signed in as')).toBeInTheDocument()

      // Click outside
      fireEvent.mouseDown(screen.getByTestId('outside'))

      // Dropdown should be closed - "Signed in as" should not be visible
      expect(screen.queryByText('Signed in as')).not.toBeInTheDocument()
    })

    it('should not render logout in dropdown when userEmail is null', () => {
      render(
        <AdminLayoutClient userEmail={null}>
          <div>Content</div>
        </AdminLayoutClient>
      )

      // Click the avatar button
      const avatarButton = screen.getByRole('button', { name: /user menu/i })
      fireEvent.click(avatarButton)

      // Should show "Not authenticated" (may appear in multiple places)
      const notAuthElements = screen.getAllByText('Not authenticated')
      expect(notAuthElements.length).toBeGreaterThan(0)

      // No logout link should be present in the dropdown menu
      expect(
        screen.queryByRole('menuitem', { name: /sign out/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('User Initials', () => {
    it('should show two-letter initials for dot-separated email', () => {
      render(
        <AdminLayoutClient userEmail="john.doe@example.com">
          <div>Content</div>
        </AdminLayoutClient>
      )

      // john.doe should produce "JD"
      const avatarButton = screen.getByRole('button', { name: /user menu/i })
      expect(avatarButton).toHaveTextContent('JD')
    })

    it('should show two-letter initials for simple email', () => {
      render(
        <AdminLayoutClient userEmail="alice@example.com">
          <div>Content</div>
        </AdminLayoutClient>
      )

      // alice should produce "AL"
      const avatarButton = screen.getByRole('button', { name: /user menu/i })
      expect(avatarButton).toHaveTextContent('AL')
    })

    it('should show ? when userEmail is null', () => {
      render(
        <AdminLayoutClient userEmail={null}>
          <div>Content</div>
        </AdminLayoutClient>
      )

      const avatarButton = screen.getByRole('button', { name: /user menu/i })
      expect(avatarButton).toHaveTextContent('?')
    })

    it('should handle underscore-separated email', () => {
      render(
        <AdminLayoutClient userEmail="first_last@example.com">
          <div>Content</div>
        </AdminLayoutClient>
      )

      // first_last should produce "FL"
      const avatarButton = screen.getByRole('button', { name: /user menu/i })
      expect(avatarButton).toHaveTextContent('FL')
    })
  })

  describe('Mobile Sidebar', () => {
    it('should render logout button in mobile sidebar', () => {
      render(
        <AdminLayoutClient userEmail="test@example.com">
          <div>Content</div>
        </AdminLayoutClient>
      )

      // Mobile logout is rendered in sidebar (always visible but hidden via CSS)
      const logoutLinks = document.querySelectorAll(
        'a[href="/cdn-cgi/access/logout"]'
      )
      // Should have mobile sidebar logout (dropdown logout only shows when open)
      expect(logoutLinks.length).toBeGreaterThan(0)
    })
  })

  describe('Header Elements', () => {
    it('should render CV Admin title', () => {
      render(
        <AdminLayoutClient userEmail="test@example.com">
          <div>Content</div>
        </AdminLayoutClient>
      )

      expect(screen.getByText('CV Admin')).toBeInTheDocument()
    })

    it('should render View Site link', () => {
      render(
        <AdminLayoutClient userEmail="test@example.com">
          <div>Content</div>
        </AdminLayoutClient>
      )

      const viewSiteLink = screen.getByText('View Site').closest('a')
      expect(viewSiteLink).toHaveAttribute('href', '/')
    })

    it('should render theme switcher', () => {
      render(
        <AdminLayoutClient userEmail="test@example.com">
          <div>Content</div>
        </AdminLayoutClient>
      )

      expect(screen.getByTestId('theme-switcher')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should render sidebar navigation items', () => {
      render(
        <AdminLayoutClient userEmail="test@example.com">
          <div>Content</div>
        </AdminLayoutClient>
      )

      // Check for key navigation items
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Personal Info')).toBeInTheDocument()
      expect(screen.getByText('Experience')).toBeInTheDocument()
      expect(screen.getByText('Skills')).toBeInTheDocument()
      // "Theme" appears in both nav and ThemeSwitcher, so use getAllByText
      expect(screen.getAllByText('Theme').length).toBeGreaterThan(0)
      expect(screen.getByText('Site Config')).toBeInTheDocument()
    })

    it('should render navigation links with correct hrefs', () => {
      render(
        <AdminLayoutClient userEmail="test@example.com">
          <div>Content</div>
        </AdminLayoutClient>
      )

      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveAttribute('href', '/admin')

      // Use getAllByText since "Theme" appears in both nav and ThemeSwitcher
      const themeLinks = screen.getAllByText('Theme')
      const themeNavLink = themeLinks.find(el => el.closest('a'))?.closest('a')
      expect(themeNavLink).toHaveAttribute('href', '/admin/theme')
    })
  })

  describe('Content Rendering', () => {
    it('should render children in main content area', () => {
      render(
        <AdminLayoutClient userEmail="test@example.com">
          <div data-testid="child-content">Test Content</div>
        </AdminLayoutClient>
      )

      expect(screen.getByTestId('child-content')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })
})
