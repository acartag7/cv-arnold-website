'use client'

import { Linkedin, Github, Mail, Heart } from 'lucide-react'
import { cn } from '@/utils/cn'

const NAV_ITEMS = [
  { href: '#hero', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#certifications', label: 'Certifications' },
  { href: '#contact', label: 'Contact' },
] as const

interface FooterProps {
  socialLinks?: {
    linkedin?: string
    github?: string
  }
  email?: string
  className?: string
}

export default function Footer({ socialLinks, email, className }: FooterProps) {
  const currentYear = new Date().getFullYear()

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault()
    const targetId = href.replace('#', '')
    const element = document.getElementById(targetId)
    if (element) {
      const offset = 80 // Header height
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - offset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  return (
    <footer
      className={cn(
        'bg-[var(--surface)] border-t border-[var(--color-border)]',
        'py-8 px-4 no-print',
        className
      )}
      role="contentinfo"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <a
              href="#hero"
              onClick={e => handleNavClick(e, '#hero')}
              className="text-lg font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors duration-200"
            >
              Arnold Cartagena
            </a>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Platform Engineer & Cloud Architect
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer navigation">
            <h3 className="text-sm font-semibold text-[var(--text)] mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {NAV_ITEMS.map(item => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={e => handleNavClick(e, item.href)}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)] mb-3">
              Connect
            </h3>
            <div className="flex space-x-3">
              {socialLinks?.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[var(--background)]/60 text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all duration-200"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin size={18} />
                </a>
              )}
              {socialLinks?.github && (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[var(--background)]/60 text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all duration-200"
                  aria-label="GitHub Profile"
                >
                  <Github size={18} />
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="p-2 rounded-lg bg-[var(--background)]/60 text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all duration-200"
                  aria-label="Send Email"
                >
                  <Mail size={18} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[var(--color-border)]">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[var(--text-muted)]">
              &copy; {currentYear} Arnold Cartagena. All rights reserved.
            </p>
            <p className="text-sm text-[var(--text-muted)] flex items-center gap-1">
              Built with <Heart size={14} className="text-red-500" /> using
              Next.js & Cloudflare
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
