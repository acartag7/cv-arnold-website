/**
 * Tests for AdminLayoutClient
 *
 * Tests the admin layout including:
 * - Logout button visibility and behavior
 * - User display (initial with tooltip)
 * - Mobile sidebar logout
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AdminLayoutClient } from '../AdminLayoutClient'

// Mock dependencies
vi.mock('@tanstack/react-query', () => ({
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
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
  describe('Logout Button', () => {
    it('should render logout button when user is authenticated', () => {
      render(
        <AdminLayoutClient userEmail="test@example.com">
          <div>Content</div>
        </AdminLayoutClient>
      )

      // Find logout link by href (desktop version)
      const logoutLinks = screen.getAllByRole('link', { name: /sign out/i })
      expect(logoutLinks.length).toBeGreaterThan(0)

      // Verify correct Cloudflare Access logout URL
      const desktopLogout = logoutLinks[0]
      expect(desktopLogout).toHaveAttribute('href', '/cdn-cgi/access/logout')
    })

    it('should not render logout button when userEmail is null', () => {
      render(
        <AdminLayoutClient userEmail={null}>
          <div>Content</div>
        </AdminLayoutClient>
      )

      // No logout links should be present
      const logoutLinks = screen.queryAllByRole('link', { name: /sign out/i })
      expect(logoutLinks.length).toBe(0)
    })

    it('should render logout button in mobile sidebar', () => {
      render(
        <AdminLayoutClient userEmail="test@example.com">
          <div>Content</div>
        </AdminLayoutClient>
      )

      // Mobile logout button has full "Sign out" text
      const logoutButtons = screen.getAllByText('Sign out')
      expect(logoutButtons.length).toBeGreaterThan(0)

      // Verify it links to Cloudflare Access logout
      const mobileLogout = logoutButtons[0]!.closest('a')
      expect(mobileLogout).toHaveAttribute('href', '/cdn-cgi/access/logout')
    })

    it('should have correct Cloudflare Access logout URL', () => {
      render(
        <AdminLayoutClient userEmail="admin@example.com">
          <div>Content</div>
        </AdminLayoutClient>
      )

      const logoutLinks = document.querySelectorAll(
        'a[href="/cdn-cgi/access/logout"]'
      )
      // Should have both desktop and mobile logout links
      expect(logoutLinks.length).toBe(2)
    })
  })

  describe('User Display', () => {
    it('should show user initial with email tooltip', () => {
      render(
        <AdminLayoutClient userEmail="john.doe@example.com">
          <div>Content</div>
        </AdminLayoutClient>
      )

      // Find the avatar div with user initial
      const avatars = screen.getAllByText('J')
      expect(avatars.length).toBeGreaterThan(0)

      // Verify tooltip shows full email
      const avatarWithTooltip = avatars[0]!.closest('[title]')
      expect(avatarWithTooltip).toHaveAttribute('title', 'john.doe@example.com')
    })

    it('should show ? when userEmail is null', () => {
      render(
        <AdminLayoutClient userEmail={null}>
          <div>Content</div>
        </AdminLayoutClient>
      )

      // Find the fallback avatar
      const questionMarks = screen.getAllByText('?')
      expect(questionMarks.length).toBeGreaterThan(0)
    })

    it('should show uppercase initial', () => {
      render(
        <AdminLayoutClient userEmail="alice@example.com">
          <div>Content</div>
        </AdminLayoutClient>
      )

      // Should show uppercase 'A' not lowercase 'a'
      const avatars = screen.getAllByText('A')
      expect(avatars.length).toBeGreaterThan(0)

      // Verify uppercase avatar is in the document
      expect(avatars[0]).toBeInTheDocument()
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
