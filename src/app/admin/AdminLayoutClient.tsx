'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  Menu,
  X,
  Home,
  User,
  Briefcase,
  Award,
  Code,
  GraduationCap,
  Languages,
  Trophy,
  BarChart3,
  Type,
  Palette,
  Settings,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { createQueryClient } from '@/lib/queryClient'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { AdminErrorFallback } from '@/components/admin'

interface AdminLayoutClientProps {
  children: React.ReactNode
  userEmail: string | null
}

/**
 * Navigation items for admin sidebar
 * Organized in logical sections: Content, Homepage, Site Settings
 */
const navItems = [
  // Dashboard
  { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: Home },

  // Content Sections
  {
    id: 'personal',
    label: 'Personal Info',
    href: '/admin/personal',
    icon: User,
  },
  {
    id: 'experience',
    label: 'Experience',
    href: '/admin/experience',
    icon: Briefcase,
  },
  { id: 'skills', label: 'Skills', href: '/admin/skills', icon: Code },
  {
    id: 'certifications',
    label: 'Certifications',
    href: '/admin/certifications',
    icon: Award,
  },
  {
    id: 'education',
    label: 'Education',
    href: '/admin/education',
    icon: GraduationCap,
  },
  {
    id: 'languages',
    label: 'Languages',
    href: '/admin/languages',
    icon: Languages,
  },
  {
    id: 'achievements',
    label: 'Achievements',
    href: '/admin/achievements',
    icon: Trophy,
  },

  // Homepage Customization
  {
    id: 'hero-stats',
    label: 'Hero Stats',
    href: '/admin/hero-stats',
    icon: BarChart3,
  },
  {
    id: 'section-titles',
    label: 'Section Titles',
    href: '/admin/section-titles',
    icon: Type,
  },

  // Site Settings
  { id: 'theme', label: 'Theme', href: '/admin/theme', icon: Palette },
  {
    id: 'site-config',
    label: 'Site Config',
    href: '/admin/site-config',
    icon: Settings,
  },
]

/**
 * Admin Layout Client Component
 *
 * Provides the admin shell with:
 * - Responsive sidebar navigation
 * - Header with user info and theme toggle
 * - React Query provider for data fetching
 * - Mobile-friendly hamburger menu
 */
export function AdminLayoutClient({
  children,
  userEmail,
}: AdminLayoutClientProps) {
  const [queryClient] = useState(() => createQueryClient())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev)
  }, [])

  // Close mobile menu when clicking a link
  const handleNavClick = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider position="top-right">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Header */}
          <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between h-full px-4">
              {/* Left side - Menu toggle and title */}
              <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
                  aria-label="Toggle mobile menu"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                {/* Desktop sidebar toggle */}
                <button
                  onClick={toggleSidebar}
                  className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Toggle sidebar"
                >
                  {sidebarOpen ? (
                    <ChevronLeft size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </button>

                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  CV Admin
                </h1>
              </div>

              {/* Right side - User info and actions */}
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  <span>View Site</span>
                  <ExternalLink size={14} />
                </Link>

                <ThemeSwitcher />

                {/* User info */}
                <div className="hidden sm:flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full bg-semantic-primary flex items-center justify-center text-white text-sm font-medium"
                    title={userEmail || 'Not authenticated'}
                  >
                    {userEmail?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  {userEmail && (
                    <a
                      href="/cdn-cgi/access/logout"
                      className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Sign out"
                    >
                      <LogOut size={16} />
                      <span className="hidden lg:inline">Sign out</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Mobile menu overlay */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={toggleMobileMenu}
              aria-hidden="true"
            />
          )}

          {/* Sidebar */}
          <aside
            className={`
            fixed top-16 bottom-0 z-40
            bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
            transition-all duration-300 ease-in-out
            ${mobileMenuOpen ? 'left-0' : '-left-64'}
            ${sidebarOpen ? 'md:left-0 md:w-64' : 'md:left-0 md:w-16'}
            w-64
          `}
          >
            <nav className="p-4 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    text-gray-700 dark:text-gray-300
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    transition-colors
                    ${!sidebarOpen && 'md:justify-center md:px-2'}
                  `}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    <span
                      className={`
                      text-sm font-medium
                      ${!sidebarOpen && 'md:hidden'}
                    `}
                    >
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </nav>

            {/* User info on mobile (bottom of sidebar) */}
            <div className="absolute bottom-4 left-4 right-4 sm:hidden space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-semantic-primary flex items-center justify-center text-white text-sm font-medium">
                  {userEmail?.[0]?.toUpperCase() ?? '?'}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300 truncate flex-1">
                  {userEmail || 'Not authenticated'}
                </span>
              </div>
              {userEmail && (
                <a
                  href="/cdn-cgi/access/logout"
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </a>
              )}
            </div>
          </aside>

          {/* Main content */}
          <main
            className={`
            pt-16 transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}
          `}
          >
            <div className="p-4 md:p-6 lg:p-8">
              <ErrorBoundary fallback={<AdminErrorFallback />}>
                {children}
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </ToastProvider>
    </QueryClientProvider>
  )
}
