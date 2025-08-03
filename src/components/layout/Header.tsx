'use client';

import { useState } from 'react';
import { Menu, X, Download, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onThemeChange: (theme: string) => void;
  currentTheme: string;
}

export default function Header({ onThemeChange, currentTheme }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const themes = [
    { id: 'theme-1', name: 'Professional Teal', color: 'bg-cyan-600' },
    { id: 'theme-2', name: 'Modern Blue', color: 'bg-blue-600' },
    { id: 'theme-3', name: 'Tech Dark', color: 'bg-emerald-600' },
  ];

  const navItems = [
    { href: '#hero', label: 'About' },
    { href: '#experience', label: 'Experience' },
    { href: '#skills', label: 'Skills' },
    { href: '#certifications', label: 'Certifications' },
    { href: '#contact', label: 'Contact' },
  ];

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/95 border-b border-[var(--surface)] backdrop-blur-sm no-print">
      <div className="container mx-auto px-4 lg:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-lg lg:text-xl font-bold text-[var(--primary)] flex-shrink-0"
          >
            Arnold Cartagena
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 xl:space-x-8 flex-1 justify-center max-w-2xl mx-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors duration-200 whitespace-nowrap text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--primary)] hover:text-white transition-all duration-200"
                aria-label="Change theme"
              >
                <Palette size={20} />
              </button>

              <AnimatePresence>
                {isThemeMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-12 bg-[var(--background)] border border-[var(--surface)] rounded-lg shadow-lg p-2 min-w-48"
                  >
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          onThemeChange(theme.id);
                          setIsThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-[var(--surface)] transition-colors ${
                          currentTheme === theme.id ? 'bg-[var(--surface)]' : ''
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full ${theme.color}`} />
                        <span className="text-sm">{theme.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* PDF Download */}
            <button
              onClick={handleDownloadPDF}
              className="hidden md:flex items-center space-x-1 lg:space-x-2 px-3 lg:px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--secondary)] transition-all duration-200 text-sm font-medium"
            >
              <Download size={16} />
              <span className="hidden lg:inline">Download CV</span>
              <span className="lg:hidden">CV</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--primary)] hover:text-white transition-all duration-200"
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
              className="lg:hidden mt-4 py-4 border-t border-[var(--surface)]"
            >
              <div className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors duration-200 py-2 text-sm font-medium"
                  >
                    {item.label}
                  </a>
                ))}
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center space-x-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--secondary)] transition-all duration-200 mt-4 text-sm font-medium"
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
  );
}