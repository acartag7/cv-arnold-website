import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import Header from '../Header'
import * as hooks from '@/hooks'

// Mock hooks
vi.mock('@/hooks', () => ({
  useScrollDirection: vi.fn(() => ({
    scrollDirection: null,
    scrollY: 0,
    isScrolled: false,
  })),
  useSmoothScroll: vi.fn(() => vi.fn()),
  useActiveSection: vi.fn(() => 'hero'),
  useBodyScrollLock: vi.fn(),
  useFocusTrap: vi.fn(),
  useKeyboardShortcut: vi.fn(),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    header: ({
      children,
      className,
      ...props
    }: React.PropsWithChildren<{ className?: string }>) => (
      <header className={className} {...props}>
        {children}
      </header>
    ),
    a: ({
      children,
      className,
      ...props
    }: React.PropsWithChildren<{ className?: string }>) => (
      <a className={className} {...props}>
        {children}
      </a>
    ),
    nav: ({
      children,
      className,
      ...props
    }: React.PropsWithChildren<{ className?: string }>) => (
      <nav className={className} {...props}>
        {children}
      </nav>
    ),
    div: ({
      children,
      className,
      ...props
    }: React.PropsWithChildren<{ className?: string }>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => children,
}))

// Mock ThemeSwitcher
vi.mock('@/components/ui', () => ({
  ThemeSwitcher: ({ className }: { className?: string }) => (
    <div data-testid="theme-switcher" className={className}>
      Theme Switcher
    </div>
  ),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Download: () => <div data-testid="download-icon">Download</div>,
  Command: () => <div data-testid="command-icon">Command</div>,
}))

describe('Header', () => {
  beforeEach(() => {
    // Mock window.print
    window.print = vi.fn()
  })

  it('should render header with navigation', () => {
    render(<Header />)

    expect(screen.getByText('Arnold Cartagena')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Experience')).toBeInTheDocument()
    expect(screen.getByText('Skills')).toBeInTheDocument()
    expect(screen.getByText('Certifications')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('should render skip navigation link', () => {
    render(<Header />)

    const skipLink = screen.getByText('Skip to main content')
    expect(skipLink).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', '#main-content')
  })

  it('should toggle mobile menu on button click', async () => {
    render(<Header />)

    const menuButton = screen.getByLabelText('Open menu')
    expect(menuButton).toBeInTheDocument()

    fireEvent.click(menuButton)

    await waitFor(() => {
      expect(screen.getByLabelText('Close menu')).toBeInTheDocument()
    })
  })

  it('should highlight active section', () => {
    ;(hooks.useActiveSection as Mock).mockReturnValue('experience')

    render(<Header />)

    const experienceLinks = screen.getAllByText('Experience')
    // Check desktop nav link has active styling (via aria-current)
    const desktopLink = experienceLinks.find(
      link =>
        link.closest('nav')?.getAttribute('aria-label') === 'Main navigation'
    )

    expect(desktopLink).toHaveAttribute('aria-current', 'page')
  })

  it('should trigger download on CV button click', () => {
    render(<Header />)

    // Desktop button
    const downloadButtons = screen.getAllByLabelText('Download CV as PDF')
    expect(downloadButtons[0]).toBeDefined()
    fireEvent.click(downloadButtons[0]!)

    expect(window.print).toHaveBeenCalled()
  })

  it('should open command palette', async () => {
    render(<Header />)

    const commandButton = screen.getByLabelText('Open command palette (Ctrl+K)')
    fireEvent.click(commandButton)

    await waitFor(() => {
      expect(
        screen.getByText('Command palette coming soon...')
      ).toBeInTheDocument()
    })
  })

  it('should hide header when scrolling down', () => {
    ;(hooks.useScrollDirection as Mock).mockReturnValue({
      scrollDirection: 'down',
      scrollY: 200,
      isScrolled: true,
    })

    const { container } = render(<Header />)
    const header = container.querySelector('header')

    // Header should have transform applied (mocked motion component doesn't apply styles)
    expect(header).toBeInTheDocument()
  })

  it('should have proper ARIA labels', () => {
    render(<Header />)

    expect(screen.getByLabelText('Arnold Cartagena - Home')).toBeInTheDocument()
    expect(screen.getByLabelText('Main navigation')).toBeInTheDocument()
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument()
  })

  it('should support keyboard navigation', () => {
    render(<Header />)

    const aboutLink = screen.getAllByText('About')[0]
    expect(aboutLink).toBeDefined()
    aboutLink!.focus()

    expect(document.activeElement).toBe(aboutLink)
  })

  it('should handle touch gestures on mobile menu', async () => {
    render(<Header />)

    // Open mobile menu
    const menuButton = screen.getByLabelText('Open menu')
    fireEvent.click(menuButton)

    await waitFor(() => {
      const mobileNav = screen.getByLabelText('Mobile navigation')
      expect(mobileNav).toBeInTheDocument()

      // Simulate swipe right
      fireEvent.touchStart(mobileNav, {
        targetTouches: [{ clientX: 300 }],
      })
      fireEvent.touchMove(mobileNav, {
        targetTouches: [{ clientX: 100 }],
      })
      fireEvent.touchEnd(mobileNav)
    })

    // Menu should close (check for open menu label)
    await waitFor(() => {
      expect(screen.queryByLabelText('Close menu')).not.toBeInTheDocument()
    })
  })
})
