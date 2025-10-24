'use client'

import React, { useState, useRef } from 'react'
import { Menu, X, Download, Command } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeSwitcher } from '@/components/ui'
import {
  useScrollDirection,
  useSmoothScroll,
  useActiveSection,
  useBodyScrollLock,
  useFocusTrap,
  useKeyboardShortcut,
} from '@/hooks'
import { cn } from '@/utils/cn'

const NAV_ITEMS = [
  { href: '#hero', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#certifications', label: 'Certifications' },
  { href: '#contact', label: 'Contact' },
] as const

const SECTION_IDS = NAV_ITEMS.map(item => item.href.replace('#', ''))

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Scroll behavior
  const { scrollDirection, isScrolled } = useScrollDirection({
    threshold: 50,
    debounce: 100,
  })
  const scrollTo = useSmoothScroll({ offset: 80 })
  const activeSection = useActiveSection({
    sectionIds: SECTION_IDS,
    rootMargin: '-80px 0px -80% 0px',
  })

  // Lock body scroll when mobile menu is open
  useBodyScrollLock(isMenuOpen)

  // Focus trap for mobile menu
  useFocusTrap(mobileMenuRef, isMenuOpen)

  // Keyboard shortcuts
  useKeyboardShortcut(() => setIsCommandPaletteOpen(true), {
    key: 'k',
    ctrlKey: true,
  })

  useKeyboardShortcut(() => setIsMenuOpen(false), {
    key: 'Escape',
    enabled: isMenuOpen,
  })

  useKeyboardShortcut(() => setIsCommandPaletteOpen(false), {
    key: 'Escape',
    enabled: isCommandPaletteOpen,
  })

  // Touch gesture handlers for mobile menu
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0]?.clientX ?? 0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0]?.clientX ?? 0)
  }

  const handleTouchEnd = () => {
    // Swipe right to close (threshold: 50px)
    if (touchStart - touchEnd > 50) {
      setIsMenuOpen(false)
    }
  }

  const handleNavClick = (href: string) => {
    const sectionId = href.replace('#', '')
    scrollTo(sectionId)
    setIsMenuOpen(false)
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  // Determine if header should be hidden
  const shouldHideHeader =
    scrollDirection === 'down' && isScrolled && !isMenuOpen

  return (
    <>
      {/* Skip Navigation Link (a11y) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--color-primary)] focus:text-[var(--color-text-inverse)] focus:rounded-lg focus:font-medium"
      >
        Skip to main content
      </a>

      <motion.header
        initial={false}
        animate={{
          y: shouldHideHeader ? '-100%' : '0%',
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'bg-[var(--color-background)]/95 backdrop-blur-md',
          'border-b border-[var(--color-border)]',
          'transition-shadow duration-200',
          'no-print',
          isScrolled && 'shadow-sm'
        )}
        role="banner"
      >
        <div className="container mx-auto px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Name */}
            <motion.a
              href="#hero"
              onClick={e => {
                e.preventDefault()
                scrollTo('hero')
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-lg lg:text-xl font-bold text-[var(--color-primary)] flex-shrink-0 hover:text-[var(--color-primary-hover)] transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)] rounded-lg px-2 py-1 -ml-2"
              aria-label="Arnold Cartagena - Home"
            >
              Arnold Cartagena
            </motion.a>

            {/* Desktop Navigation */}
            <nav
              className="hidden md:flex items-center space-x-4 xl:space-x-8 flex-1 justify-center max-w-2xl mx-4"
              aria-label="Main navigation"
              role="navigation"
            >
              {NAV_ITEMS.map(item => {
                const sectionId = item.href.replace('#', '')
                const isActive = activeSection === sectionId

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={e => {
                      e.preventDefault()
                      handleNavClick(item.href)
                    }}
                    className={cn(
                      'relative text-sm font-medium whitespace-nowrap',
                      'transition-colors duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)] rounded-lg px-3 py-2',
                      isActive
                        ? 'text-[var(--color-primary)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeSection"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--color-primary)]"
                        initial={false}
                        transition={{
                          type: 'spring',
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </a>
                )
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
              {/* Command Palette Trigger */}
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="hidden lg:flex items-center space-x-2 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-all duration-200 border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)]"
                aria-label="Open command palette (Ctrl+K)"
              >
                <Command size={14} />
                <span className="text-xs">⌘K</span>
              </button>

              {/* Theme Switcher */}
              <ThemeSwitcher className="hidden sm:flex" />

              {/* PDF Download */}
              <button
                onClick={handleDownloadPDF}
                className="hidden md:flex items-center space-x-1 lg:space-x-2 px-3 lg:px-4 py-2 bg-[var(--color-primary)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)]"
                aria-label="Download CV as PDF"
              >
                <Download size={16} />
                <span className="hidden lg:inline">Download CV</span>
                <span className="lg:hidden">CV</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-primary)] hover:text-[var(--color-text-inverse)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)]"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.nav
                ref={mobileMenuRef}
                id="mobile-menu"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="lg:hidden mt-4 py-4 border-t border-[var(--color-border)]"
                aria-label="Mobile navigation"
                role="navigation"
              >
                <div className="flex flex-col space-y-3">
                  {NAV_ITEMS.map(item => {
                    const sectionId = item.href.replace('#', '')
                    const isActive = activeSection === sectionId

                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={e => {
                          e.preventDefault()
                          handleNavClick(item.href)
                        }}
                        className={cn(
                          'py-2 text-sm font-medium transition-colors duration-200',
                          'focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)] rounded-lg px-3 -mx-3',
                          isActive
                            ? 'text-[var(--color-primary)] bg-[var(--color-surface)]'
                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-hover)]'
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.label}
                      </a>
                    )
                  })}

                  {/* Mobile Theme Switcher */}
                  <div className="py-2 border-t border-[var(--color-border)] mt-2 pt-4">
                    <ThemeSwitcher showLabels={true} />
                  </div>

                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center space-x-2 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-all duration-200 mt-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)]"
                    aria-label="Download CV as PDF"
                  >
                    <Download size={16} />
                    <span>Download CV</span>
                  </button>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>

        {/* Command Palette Trigger Indicator */}
        {isCommandPaletteOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            aria-hidden="true"
          />
        )}
      </motion.header>

      {/* Command Palette (will be implemented separately) */}
      {isCommandPaletteOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center pt-20 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <div
            className="bg-[var(--color-surface)] rounded-lg shadow-2xl max-w-2xl w-full p-4 border border-[var(--color-border)]"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-center text-[var(--color-text-muted)]">
              Command palette coming soon...
            </p>
            <button
              onClick={() => setIsCommandPaletteOpen(false)}
              className="mt-4 w-full px-4 py-2 bg-[var(--color-primary)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-all duration-200"
            >
              Close (Esc)
            </button>
          </div>
        </div>
      )}
    </>
  )
}
