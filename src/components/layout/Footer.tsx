'use client'

import { Linkedin, Github, Mail, Heart } from 'lucide-react'
import { cn } from '@/utils/cn'
import { sanitizeUrl, sanitizeEmail } from '@/lib/format-utils'
import { HEADER_HEIGHT } from '@/constants/layout'

const NAV_ITEMS = [
  { href: '#hero', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#certifications', label: 'Certifications' },
  { href: '#contact', label: 'Contact' },
] as const

interface FooterProps {
  /** Full name to display in footer branding */
  name: string
  /** Professional title/tagline */
  title: string
  socialLinks?: {
    linkedin?: string
    github?: string
  }
  email?: string
  className?: string
}

export default function Footer({
  name,
  title,
  socialLinks,
  email,
  className,
}: FooterProps) {
  const currentYear = new Date().getFullYear()

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault()
    const targetId = href.replace('#', '')
    const element = document.getElementById(targetId)
    if (element) {
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - HEADER_HEIGHT
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
              className="text-lg font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 rounded"
            >
              {name}
            </a>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{title}</p>
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
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 rounded"
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
              {(() => {
                const linkedinUrl = sanitizeUrl(socialLinks?.linkedin)
                return linkedinUrl ? (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[var(--background)]/60 text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
                    aria-label="LinkedIn Profile"
                  >
                    <Linkedin size={18} />
                  </a>
                ) : null
              })()}
              {(() => {
                const githubUrl = sanitizeUrl(socialLinks?.github)
                return githubUrl ? (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[var(--background)]/60 text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
                    aria-label="GitHub Profile"
                  >
                    <Github size={18} />
                  </a>
                ) : null
              })()}
              {(() => {
                const safeEmail = sanitizeEmail(email)
                return safeEmail ? (
                  <a
                    href={`mailto:${safeEmail}`}
                    className="p-2 rounded-lg bg-[var(--background)]/60 text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
                    aria-label="Send Email"
                  >
                    <Mail size={18} />
                  </a>
                ) : null
              })()}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[var(--color-border)]">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[var(--text-muted)]">
              &copy; {currentYear} {name}. All rights reserved.
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
