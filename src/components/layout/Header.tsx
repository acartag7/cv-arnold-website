'use client'

import { useState } from 'react'
import { Menu, X, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeSwitcher } from '@/components/ui'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { href: '#hero', label: 'About' },
    { href: '#experience', label: 'Experience' },
    { href: '#skills', label: 'Skills' },
    { href: '#certifications', label: 'Certifications' },
    { href: '#contact', label: 'Contact' },
  ]

  const handleDownloadPDF = () => {
    window.print()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-background)]/95 border-b border-[var(--color-border)] backdrop-blur-sm no-print">
      <div className="container mx-auto px-4 lg:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Name */}
          <motion.a
            href="#hero"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-lg lg:text-xl font-bold text-[var(--color-primary)] flex-shrink-0 hover:text-[var(--color-primary-hover)] transition-colors duration-200 cursor-pointer"
          >
            Arnold Cartagena
          </motion.a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 xl:space-x-8 flex-1 justify-center max-w-2xl mx-4">
            {navItems.map(item => (
              <a
                key={item.href}
                href={item.href}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors duration-200 whitespace-nowrap text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
            {/* Theme Switcher */}
            <ThemeSwitcher className="hidden sm:flex" />

            {/* PDF Download */}
            <button
              onClick={handleDownloadPDF}
              className="hidden md:flex items-center space-x-1 lg:space-x-2 px-3 lg:px-4 py-2 bg-[var(--color-primary)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-all duration-200 text-sm font-medium"
            >
              <Download size={16} />
              <span className="hidden lg:inline">Download CV</span>
              <span className="lg:hidden">CV</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-primary)] hover:text-[var(--color-text-inverse)] transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 py-4 border-t border-[var(--color-border)]"
            >
              <div className="flex flex-col space-y-3">
                {navItems.map(item => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors duration-200 py-2 text-sm font-medium"
                  >
                    {item.label}
                  </a>
                ))}

                {/* Mobile Theme Switcher */}
                <div className="py-2">
                  <ThemeSwitcher showLabels={true} />
                </div>

                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center space-x-2 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-all duration-200 mt-4 text-sm font-medium"
                >
                  <Download size={16} />
                  <span>Download CV</span>
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
