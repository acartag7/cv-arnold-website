'use client'

import { motion } from 'framer-motion'
import {
  Terminal,
  GitBranch,
  Server,
  Shield,
  Cloud,
  Download,
  Mail,
  Award,
  Code,
  Cpu,
  Sun,
  Moon,
  Linkedin,
  Github,
  Users,
  Briefcase,
  Star,
  Trophy,
  GraduationCap,
  Globe,
  Medal,
  Container,
  Workflow,
  BarChart3,
  Radio,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { CVData, HeroStat } from '@/types'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { DEFAULT_PALETTES } from '@/styles/themes'

/**
 * CV Website - Client Component
 * Terminal-inspired, data-rich, developer-focused
 * With light/dark mode support
 *
 * All display values are CMS-editable via the Admin Portal
 */

interface CVPageClientProps {
  data: CVData
}

// Icon mapping for dynamic icon rendering
const iconMap = {
  terminal: Terminal,
  shield: Shield,
  cloud: Cloud,
  server: Server,
  code: Code,
  award: Award,
  users: Users,
  briefcase: Briefcase,
  star: Star,
  trophy: Trophy,
} as const

// Icon mapping for skill categories
const skillIconMap = {
  cloud: Cloud,
  container: Container,
  code: Code,
  workflow: Workflow,
  chart: BarChart3,
  stream: Radio,
  terminal: Terminal,
  shield: Lock,
} as const

// Map skill level to number of filled indicators (1-4 scale)
const skillLevelToNumber = (level: string): number => {
  switch (level) {
    case 'expert':
      return 4
    case 'advanced':
      return 3
    case 'intermediate':
      return 2
    case 'beginner':
      return 1
    default:
      return 2
  }
}

const TypewriterText = ({
  text,
  delay = 0,
  accentColor,
}: {
  text: string
  delay?: number
  accentColor: string
}) => {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let intervalRef: ReturnType<typeof setInterval> | null = null

    const timeout = setTimeout(() => {
      let i = 0
      intervalRef = setInterval(() => {
        if (i <= text.length) {
          setDisplayedText(text.slice(0, i))
          i++
        } else {
          if (intervalRef) clearInterval(intervalRef)
        }
      }, 40)
    }, delay)

    // Cleanup both timeout and interval on unmount
    return () => {
      clearTimeout(timeout)
      if (intervalRef) clearInterval(intervalRef)
    }
  }, [text, delay])

  return (
    <span>
      {displayedText}
      <span className="animate-pulse" style={{ color: accentColor }}>
        ▊
      </span>
    </span>
  )
}

// Navigation items with their section IDs
const NAV_ITEMS = [
  { label: 'About', sectionId: 'hero' },
  { label: 'Experience', sectionId: 'experience' },
  { label: 'Skills', sectionId: 'skills' },
  { label: 'Certifications', sectionId: 'certifications' },
  { label: 'Contact', sectionId: 'contact' },
] as const

export function CVPageClient({ data }: CVPageClientProps) {
  const {
    personalInfo,
    experience,
    skills,
    certifications,
    languages,
    education,
    achievements,
    siteConfig,
    heroStats,
    sectionTitles,
    featuredHighlights,
    themeConfig,
  } = data

  // Theme state with CMS-configurable default
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  // Active section state for navigation highlighting
  const [activeSection, setActiveSection] = useState<string>('hero')

  // Track which experience cards are expanded (by ID)
  const [expandedExperiences, setExpandedExperiences] = useState<Set<string>>(
    new Set()
  )

  // Toggle experience card expansion
  const toggleExperience = useCallback((id: string) => {
    setExpandedExperiences(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Build theme colors from CMS config with fallback to defaults
  // Uses themeConfig.activePreset (set by admin in CMS) - no visitor selection
  const colors = useMemo(() => {
    const defaults = DEFAULT_PALETTES[theme]
    const presets = themeConfig?.presets
    const activePreset = themeConfig?.activePreset

    // Get colors from active preset if available
    const presetColors =
      presets && activePreset && activePreset in presets
        ? presets[activePreset]?.[theme]
        : undefined

    // Fall back to themeConfig.dark/light for backwards compatibility
    const cmsColors = presetColors || themeConfig?.[theme]

    return {
      bg: cmsColors?.bg || defaults.bg,
      surface: cmsColors?.surface || defaults.surface,
      surfaceHover: cmsColors?.surfaceHover || defaults.surfaceHover,
      border: cmsColors?.border || defaults.border,
      text: cmsColors?.text || defaults.text,
      textMuted: cmsColors?.textMuted || defaults.textMuted,
      textDim: cmsColors?.textDim || defaults.textDim,
      accent: cmsColors?.accent || defaults.accent,
      accentDim: cmsColors?.accentDim || defaults.accentDim,
      scanlines: defaults.scanlines, // Fixed per theme
    }
  }, [theme, themeConfig])

  // Detect system preference on mount
  useEffect(() => {
    const defaultTheme = themeConfig?.defaultTheme || 'system'

    if (defaultTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setTheme(mediaQuery.matches ? 'dark' : 'light')

      const handler = (e: MediaQueryListEvent) =>
        setTheme(e.matches ? 'dark' : 'light')
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      setTheme(defaultTheme)
      return undefined
    }
  }, [themeConfig?.defaultTheme])

  // Handle bottom of page edge case for contact section (memoized for cleanup)
  const handleScroll = useCallback(() => {
    const scrollBottom = window.scrollY + window.innerHeight
    const docHeight = document.documentElement.scrollHeight
    // If within 100px of bottom, activate contact section
    if (docHeight - scrollBottom < 100) {
      setActiveSection('contact')
    }
  }, [])

  // Track active section for navigation highlighting
  useEffect(() => {
    const sectionIds = NAV_ITEMS.map(item => item.sectionId)

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        threshold: 0.3,
        rootMargin: '-80px 0px -50% 0px', // Account for fixed nav height
      }
    )

    sectionIds.forEach(id => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  const showThemeToggle = themeConfig?.allowToggle !== false

  // Get stats from data or use defaults
  const stats = useMemo(() => {
    if (heroStats && heroStats.length > 0) {
      return heroStats
        .sort((a, b) => a.order - b.order)
        .map((stat: HeroStat) => ({
          ...stat,
          IconComponent: iconMap[stat.icon as keyof typeof iconMap] || Terminal,
        }))
    }
    // Fallback defaults
    return [
      {
        id: 'years',
        label: 'Years Experience',
        value: '8+',
        icon: 'terminal',
        IconComponent: Terminal,
      },
      {
        id: 'certs',
        label: 'Certifications',
        value: '9',
        icon: 'shield',
        IconComponent: Shield,
      },
      {
        id: 'clouds',
        label: 'Cloud Platforms',
        value: '3',
        icon: 'cloud',
        IconComponent: Cloud,
      },
      {
        id: 'k8s',
        label: 'K8s Clusters',
        value: '50+',
        icon: 'server',
        IconComponent: Server,
      },
    ]
  }, [heroStats])

  // Get section titles from data or use defaults
  const titles = {
    heroPath: sectionTitles?.heroPath || '~/platform-engineer',
    experience: sectionTitles?.experience || 'experience.log',
    skills: sectionTitles?.skills || 'skills.json',
    certifications: sectionTitles?.certifications || 'certifications.yaml',
    languages: sectionTitles?.languages || 'languages.config',
    education: sectionTitles?.education || 'education.log',
    achievements: sectionTitles?.achievements || 'achievements.yaml',
    contact: sectionTitles?.contact || './send_message.sh',
  }

  // Get site config values
  const branding = siteConfig?.branding || '~/arnold.dev'
  const version = siteConfig?.version || 'v2024.12'
  const footerText = (
    siteConfig?.footerText ||
    '© {{year}} Arnold Cartagena · Built with Next.js'
  ).replace('{{year}}', new Date().getFullYear().toString())

  // Get featured highlight for certifications section
  const certHighlight = featuredHighlights?.find(
    h => h.section === 'certifications' && h.enabled
  )
  const HighlightIcon = certHighlight
    ? iconMap[certHighlight.icon as keyof typeof iconMap] || Award
    : Award

  return (
    <div
      className="min-h-screen font-mono transition-colors duration-300"
      style={{ background: colors.bg, color: colors.text }}
    >
      {/* Scanlines */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${colors.scanlines} 2px, ${colors.scanlines} 4px)`,
        }}
      />

      {/* Grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02] z-0"
        style={{
          backgroundImage: `linear-gradient(${colors.accent}20 1px, transparent 1px), linear-gradient(90deg, ${colors.accent}20 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-4 transition-colors duration-300"
        style={{
          background: `${colors.bg}ee`,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <a
            href="#"
            className="text-sm font-semibold transition-colors"
            style={{ color: colors.accent }}
          >
            {branding}
          </a>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map(item => {
              const isActive = activeSection === item.sectionId
              return (
                <a
                  key={item.label}
                  href={`#${item.sectionId}`}
                  className="relative text-sm transition-colors py-1"
                  style={{ color: isActive ? colors.accent : colors.textMuted }}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeSection"
                      className="absolute -bottom-1 left-0 right-0 h-0.5"
                      style={{ background: colors.accent }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </a>
              )
            })}
          </div>

          <div
            className="flex items-center gap-4 text-xs"
            style={{ color: colors.textMuted }}
          >
            {/* Theme toggle - preset is controlled by admin in CMS */}
            {showThemeToggle && (
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded transition-colors hover:opacity-80"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                <span className="hidden sm:inline">
                  {theme === 'dark' ? 'light' : 'dark'}_mode
                </span>
              </button>
            )}
            <span className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: colors.accent }}
              />
              <span style={{ color: colors.accent }}>ONLINE</span>
            </span>
            <span style={{ color: colors.textDim }}>|</span>
            <span>{version}</span>
          </div>
        </div>
      </nav>

      {/* ==================== HERO ==================== */}
      <section
        id="hero"
        className="relative pt-24 lg:pt-32 pb-16 lg:pb-24 px-6 lg:px-12"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Main content */}
            <div className="lg:col-span-8">
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className="flex items-center gap-2 text-sm mb-4"
                  style={{ color: colors.textMuted }}
                >
                  <GitBranch size={14} style={{ color: colors.accent }} />
                  <span>{titles.heroPath}</span>
                </div>
                <h1
                  className="text-4xl lg:text-6xl font-bold tracking-tight mb-4"
                  style={{
                    fontFamily:
                      "var(--font-jetbrains), 'JetBrains Mono', monospace",
                  }}
                >
                  <TypewriterText
                    text={personalInfo.fullName}
                    delay={300}
                    accentColor={colors.accent}
                  />
                </h1>
                <div className="text-lg" style={{ color: colors.accent }}>
                  <span style={{ color: colors.textMuted }}>$ </span>
                  {personalInfo.title}
                </div>
              </motion.div>

              {/* README card */}
              <motion.div
                className="p-6 rounded-lg mb-8 transition-colors duration-300"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div
                  className="flex items-center gap-2 text-xs mb-4"
                  style={{ color: colors.textMuted }}
                >
                  <span style={{ color: colors.accent }}>{'/**'}</span>
                  {' README.md'}
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: colors.textMuted }}
                >
                  {personalInfo.summary}
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {stats.map(stat => (
                  <div
                    key={stat.id}
                    className="p-4 rounded-lg group hover:border-opacity-50 transition-all duration-300"
                    style={{
                      background: colors.surface,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <stat.IconComponent
                      size={16}
                      className="mb-3"
                      style={{ color: colors.accent }}
                    />
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div
                      className="text-xs"
                      style={{ color: colors.textMuted }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <motion.div
                className="p-6 rounded-lg mb-6 transition-colors duration-300"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div
                  className="text-xs mb-4"
                  style={{ color: colors.textMuted }}
                >
                  <span style={{ color: colors.accent }}>&gt;</span>{' '}
                  quick_actions
                </div>
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-sm font-semibold mb-4 transition-colors"
                  style={{
                    background: colors.accent,
                    color: theme === 'dark' ? colors.bg : '#FFFFFF',
                  }}
                >
                  <Download size={16} />
                  download_cv.pdf
                </button>
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-sm transition-colors"
                  style={{
                    border: `1px solid ${colors.border}`,
                    color: colors.textMuted,
                  }}
                >
                  send_message()
                </a>
              </motion.div>

              <motion.div
                className="p-6 rounded-lg transition-colors duration-300"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div
                  className="text-xs mb-4"
                  style={{ color: colors.textMuted }}
                >
                  <span style={{ color: colors.accent }}>&gt;</span>{' '}
                  social_links
                </div>
                <div className="space-y-3 text-sm">
                  {personalInfo.social.linkedin && (
                    <a
                      href={personalInfo.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                      style={{ color: colors.textMuted }}
                    >
                      <Linkedin size={14} style={{ color: colors.accent }} />
                      linkedin/arnold-cartagena
                    </a>
                  )}
                  {personalInfo.social.github && (
                    <a
                      href={personalInfo.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                      style={{ color: colors.textMuted }}
                    >
                      <Github size={14} style={{ color: colors.accent }} />
                      github/acartag7
                    </a>
                  )}
                  <a
                    href={`mailto:${personalInfo.email}`}
                    className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                    style={{ color: colors.textMuted }}
                  >
                    <Mail size={14} style={{ color: colors.accent }} />
                    {personalInfo.email}
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== EXPERIENCE ==================== */}
      {siteConfig?.sectionVisibility?.experience !== false && (
        <section id="experience" className="py-24 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="flex items-center gap-3 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Terminal size={20} style={{ color: colors.accent }} />
              <h2 className="text-2xl font-bold">{titles.experience}</h2>
            </motion.div>

            {/* Timeline container */}
            <div className="relative">
              {/* Timeline vertical line */}
              <div
                className="absolute left-3 top-0 bottom-0 w-0.5 hidden md:block"
                style={{ background: colors.border }}
              />

              {experience.map((exp, index) => {
                const isCurrentRole = !exp.endDate
                return (
                  <motion.div
                    key={exp.id}
                    className="relative md:pl-12 pb-8 last:pb-0"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-0 w-6 h-6 rounded-full border-4 hidden md:flex items-center justify-center ${isCurrentRole ? 'animate-pulse' : ''}`}
                      style={{
                        background: isCurrentRole
                          ? colors.accent
                          : colors.surface,
                        borderColor: colors.bg,
                        boxShadow: `0 0 0 2px ${isCurrentRole ? colors.accent : colors.border}`,
                      }}
                    >
                      {isCurrentRole && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: colors.bg }}
                        />
                      )}
                    </div>

                    {/* Date badge - shown above card on timeline */}
                    <div
                      className="text-xs mb-3 flex items-center gap-2"
                      style={{ color: colors.textMuted }}
                    >
                      <span className="font-mono">
                        {new Date(exp.startDate).getFullYear()} -{' '}
                        {exp.endDate
                          ? new Date(exp.endDate).getFullYear()
                          : 'Present'}
                      </span>
                      {isCurrentRole && (
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            background: colors.accentDim,
                            color: colors.accent,
                          }}
                        >
                          Current
                        </span>
                      )}
                    </div>

                    {/* Experience card - Expandable */}
                    {(() => {
                      const isExpanded = expandedExperiences.has(exp.id)
                      const bullets = exp.description
                        .split(/(?<=\.)\s+/)
                        .filter(sentence => sentence.trim().length > 0)
                      const previewBullets = bullets.slice(0, 3)
                      const hasMoreBullets = bullets.length > 3
                      const hasAchievements =
                        exp.achievements && exp.achievements.length > 0

                      return (
                        <div
                          className="rounded-lg transition-all duration-300 overflow-hidden"
                          style={{
                            background: colors.surface,
                            border: `1px solid ${isCurrentRole ? colors.accent + '40' : colors.border}`,
                          }}
                        >
                          {/* Card Header - Always visible */}
                          <div className="p-6 pb-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-1">
                                  {exp.position}
                                </h3>
                                <p
                                  className="text-sm"
                                  style={{ color: colors.accent }}
                                >
                                  {exp.company}
                                </p>
                              </div>
                              {/* Expand/Collapse button */}
                              {(hasMoreBullets || hasAchievements) && (
                                <button
                                  onClick={() => toggleExperience(exp.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                  style={{
                                    background: colors.bg,
                                    color: colors.textMuted,
                                  }}
                                  aria-expanded={isExpanded}
                                  aria-label={
                                    isExpanded ? 'Show less' : 'Show more'
                                  }
                                >
                                  {isExpanded ? (
                                    <>
                                      <span>Less</span>
                                      <ChevronUp size={14} />
                                    </>
                                  ) : (
                                    <>
                                      <span>More</span>
                                      <ChevronDown size={14} />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Preview bullets (always shown) */}
                          <div className="px-6 pb-4">
                            <ul
                              className="text-sm space-y-2 list-none font-sans"
                              style={{ color: colors.textMuted }}
                            >
                              {(isExpanded ? bullets : previewBullets).map(
                                (sentence, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2"
                                  >
                                    <span
                                      className="flex-shrink-0 leading-relaxed"
                                      style={{ color: colors.accent }}
                                    >
                                      ▸
                                    </span>
                                    <span className="leading-relaxed">
                                      {sentence.trim().replace(/\.$/, '')}
                                    </span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>

                          {/* Expanded content */}
                          {isExpanded && (
                            <div className="px-6 pb-6 space-y-4">
                              {/* Key Achievements */}
                              {hasAchievements && (
                                <div
                                  className="pt-4"
                                  style={{
                                    borderTop: `1px solid ${colors.border}`,
                                  }}
                                >
                                  <h4
                                    className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
                                    style={{ color: colors.accent }}
                                  >
                                    <Trophy size={14} />
                                    Key Achievements
                                  </h4>
                                  <ul
                                    className="text-sm space-y-2 list-none font-sans"
                                    style={{ color: colors.textMuted }}
                                  >
                                    {exp.achievements.map((achievement, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2"
                                      >
                                        <span
                                          className="flex-shrink-0 leading-relaxed"
                                          style={{ color: colors.accent }}
                                        >
                                          ★
                                        </span>
                                        <span className="leading-relaxed">
                                          {achievement}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Technologies */}
                              {exp.technologies.length > 0 && (
                                <div
                                  className="pt-4"
                                  style={{
                                    borderTop: `1px solid ${colors.border}`,
                                  }}
                                >
                                  <h4
                                    className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
                                    style={{ color: colors.textMuted }}
                                  >
                                    <Code size={14} />
                                    Technologies
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {exp.technologies.map(tech => (
                                      <span
                                        key={tech}
                                        className="text-xs px-2 py-1 rounded"
                                        style={{
                                          background: colors.bg,
                                          color: colors.textMuted,
                                        }}
                                      >
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Collapsed footer - show tech tags inline */}
                          {!isExpanded && exp.technologies.length > 0 && (
                            <div className="px-6 pb-4">
                              <div className="flex flex-wrap gap-1.5">
                                {exp.technologies.slice(0, 6).map(tech => (
                                  <span
                                    key={tech}
                                    className="text-xs px-2 py-0.5 rounded"
                                    style={{
                                      background: colors.bg,
                                      color: colors.textDim,
                                    }}
                                  >
                                    {tech}
                                  </span>
                                ))}
                                {exp.technologies.length > 6 && (
                                  <span
                                    className="text-xs px-2 py-0.5"
                                    style={{ color: colors.textDim }}
                                  >
                                    +{exp.technologies.length - 6} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ==================== SKILLS ==================== */}
      {siteConfig?.sectionVisibility?.skills !== false && (
        <section
          id="skills"
          className="py-24 px-6 lg:px-12 transition-colors duration-300"
          style={{ background: colors.surface }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="flex items-center gap-3 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Code size={20} style={{ color: colors.accent }} />
              <h2 className="text-2xl font-bold">{titles.skills}</h2>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6">
              {[...skills]
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((category, catIndex) => {
                  // Get the appropriate icon for this category
                  const CategoryIcon =
                    skillIconMap[category.icon as keyof typeof skillIconMap] ||
                    Cpu

                  return (
                    <motion.div
                      key={category.id}
                      className="p-6 rounded-lg transition-colors duration-300"
                      style={{
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: catIndex * 0.1 }}
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <CategoryIcon
                            size={16}
                            style={{ color: colors.accent }}
                          />
                          {category.name}
                        </h3>
                        {category.description && (
                          <p
                            className="text-xs mt-1"
                            style={{ color: colors.textMuted }}
                          >
                            {category.description}
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        {category.skills.map(skill => {
                          const filledCount = skillLevelToNumber(skill.level)
                          return (
                            <div
                              key={skill.name}
                              className="flex items-center justify-between"
                            >
                              <span
                                className="text-sm flex items-center gap-2"
                                style={{
                                  color: skill.featured
                                    ? colors.text
                                    : colors.textMuted,
                                }}
                              >
                                {skill.name}
                                {skill.featured && (
                                  <Star
                                    size={12}
                                    style={{ color: colors.accent }}
                                    fill={colors.accent}
                                  />
                                )}
                              </span>
                              <div className="flex items-center gap-2">
                                {skill.yearsOfExperience && (
                                  <span
                                    className="text-xs"
                                    style={{ color: colors.textDim }}
                                  >
                                    {skill.yearsOfExperience}y
                                  </span>
                                )}
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4].map(level => (
                                    <div
                                      key={level}
                                      className="w-2.5 h-2.5 rounded-sm transition-colors duration-300"
                                      style={{
                                        background:
                                          level <= filledCount
                                            ? colors.accent
                                            : colors.border,
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )
                })}
            </div>
          </div>
        </section>
      )}

      {/* ==================== CERTIFICATIONS ==================== */}
      {siteConfig?.sectionVisibility?.certifications !== false && (
        <section id="certifications" className="py-24 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="flex items-center gap-3 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Shield size={20} style={{ color: colors.accent }} />
              <h2 className="text-2xl font-bold">{titles.certifications}</h2>
            </motion.div>

            {/* Featured Highlight (e.g., Kubestronaut) */}
            {certHighlight && (
              <motion.div
                className="p-6 rounded-lg mb-8 transition-colors duration-300"
                style={{
                  background: colors.accentDim,
                  border: `1px solid ${colors.accent}40`,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-4">
                  <HighlightIcon size={32} style={{ color: colors.accent }} />
                  <div>
                    <h3
                      className="text-xl font-bold"
                      style={{ color: colors.accent }}
                    >
                      {certHighlight.title}
                    </h3>
                    <p className="text-sm" style={{ color: colors.textMuted }}>
                      {certHighlight.subtitle}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid lg:grid-cols-3 gap-4">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert.id}
                  className="p-4 rounded-lg transition-colors duration-300"
                  style={{
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    className="text-xs mb-2"
                    style={{ color: colors.accent }}
                  >
                    [{String(index + 1).padStart(2, '0')}]
                  </div>
                  <h4 className="text-sm font-semibold mb-1">
                    {cert.name.split(':')[0]}
                  </h4>
                  <p className="text-xs" style={{ color: colors.textMuted }}>
                    {cert.issuer}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== LANGUAGES ==================== */}
      {siteConfig?.sectionVisibility?.languages !== false &&
        languages &&
        languages.length > 0 && (
          <section
            id="languages"
            className="py-24 px-6 lg:px-12 transition-colors duration-300"
            style={{ background: colors.surface }}
          >
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="flex items-center gap-3 mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Globe size={20} style={{ color: colors.accent }} />
                <h2 className="text-2xl font-bold">{titles.languages}</h2>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {languages.map((lang, index) => {
                  // CEFR level to percentage mapping
                  const levelMap: Record<string, number> = {
                    native: 100,
                    c2: 95,
                    c1: 85,
                    b2: 70,
                    b1: 55,
                    a2: 40,
                    a1: 25,
                  }
                  const percentage = levelMap[lang.proficiency] || 50
                  const levelLabel = lang.native
                    ? 'Native'
                    : lang.proficiency.toUpperCase()

                  return (
                    <motion.div
                      key={lang.code}
                      className="p-4 rounded-lg transition-colors duration-300"
                      style={{
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold">{lang.name}</span>
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            background: lang.native
                              ? colors.accent
                              : colors.accentDim,
                            color: lang.native
                              ? theme === 'dark'
                                ? colors.bg
                                : '#FFFFFF'
                              : colors.accent,
                          }}
                        >
                          {levelLabel}
                        </span>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ background: colors.border }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: colors.accent }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${percentage}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

      {/* ==================== EDUCATION ==================== */}
      {siteConfig?.sectionVisibility?.education !== false &&
        education &&
        education.length > 0 && (
          <section id="education" className="py-24 px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="flex items-center gap-3 mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <GraduationCap size={20} style={{ color: colors.accent }} />
                <h2 className="text-2xl font-bold">{titles.education}</h2>
              </motion.div>

              <div className="space-y-6">
                {education.map((edu, index) => (
                  <motion.div
                    key={edu.id}
                    className="p-6 rounded-lg hover:border-opacity-50 transition-all duration-300"
                    style={{
                      background: colors.surface,
                      border: `1px solid ${colors.border}`,
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          {edu.degree} in {edu.field}
                        </h3>
                        <p className="text-sm" style={{ color: colors.accent }}>
                          {edu.institution}
                        </p>
                        {edu.location && (
                          <p
                            className="text-xs mt-1"
                            style={{ color: colors.textMuted }}
                          >
                            📍 {edu.location.city}, {edu.location.country}
                          </p>
                        )}
                      </div>
                      <div
                        className="text-xs px-3 py-1 rounded"
                        style={{
                          background: colors.accentDim,
                          color: colors.accent,
                        }}
                      >
                        {new Date(edu.startDate).getFullYear()} -{' '}
                        {edu.endDate
                          ? new Date(edu.endDate).getFullYear()
                          : 'Present'}
                      </div>
                    </div>
                    {edu.description && (
                      <p
                        className="text-sm mb-4"
                        style={{ color: colors.textMuted }}
                      >
                        {edu.description}
                      </p>
                    )}
                    {edu.grade && (
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs"
                          style={{ color: colors.textMuted }}
                        >
                          Grade:
                        </span>
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{ background: colors.bg, color: colors.text }}
                        >
                          {edu.grade}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

      {/* ==================== ACHIEVEMENTS ==================== */}
      {siteConfig?.sectionVisibility?.achievements !== false &&
        achievements &&
        achievements.length > 0 && (
          <section
            id="achievements"
            className="py-24 px-6 lg:px-12 transition-colors duration-300"
            style={{ background: colors.surface }}
          >
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="flex items-center gap-3 mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Medal size={20} style={{ color: colors.accent }} />
                <h2 className="text-2xl font-bold">{titles.achievements}</h2>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => {
                  // Category icon mapping
                  const categoryIcons: Record<string, typeof Trophy> = {
                    award: Trophy,
                    publication: Code,
                    speaking: Users,
                    project: Terminal,
                    contribution: GitBranch,
                  }
                  const CategoryIcon =
                    categoryIcons[achievement.category] || Award

                  return (
                    <motion.div
                      key={achievement.id}
                      className="p-4 rounded-lg transition-colors duration-300"
                      style={{
                        background: colors.bg,
                        border: `1px solid ${achievement.featured ? colors.accent : colors.border}`,
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <CategoryIcon
                          size={16}
                          className="mt-1 flex-shrink-0"
                          style={{ color: colors.accent }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold mb-1">
                            {achievement.title}
                          </h4>
                          {achievement.issuer && (
                            <p
                              className="text-xs"
                              style={{ color: colors.textMuted }}
                            >
                              {achievement.issuer}
                            </p>
                          )}
                        </div>
                      </div>
                      {achievement.description && (
                        <p
                          className="text-xs mb-3"
                          style={{ color: colors.textMuted }}
                        >
                          {achievement.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs px-2 py-1 rounded capitalize"
                          style={{
                            background: colors.accentDim,
                            color: colors.accent,
                          }}
                        >
                          {achievement.category}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: colors.textDim }}
                        >
                          {new Date(achievement.date).getFullYear()}
                        </span>
                      </div>
                      {achievement.url && (
                        <a
                          href={achievement.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block mt-3 text-xs hover:underline"
                          style={{ color: colors.accent }}
                        >
                          View details →
                        </a>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

      {/* ==================== CONTACT ==================== */}
      {siteConfig?.sectionVisibility?.contact !== false && (
        <section
          id="contact"
          className="py-24 px-6 lg:px-12 transition-colors duration-300"
          style={{ background: colors.surface }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Terminal window */}
            <motion.div
              className="rounded-lg overflow-hidden transition-colors duration-300"
              style={{ border: `1px solid ${colors.border}` }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div
                className="flex items-center gap-2 px-4 py-3 transition-colors duration-300"
                style={{
                  background: colors.bg,
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: '#FF5F56' }}
                  />
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: '#FFBD2E' }}
                  />
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: '#27C93F' }}
                  />
                </div>
                <span
                  className="text-xs ml-2"
                  style={{ color: colors.textMuted }}
                >
                  contact.sh
                </span>
              </div>
              <div
                className="p-8 text-center transition-colors duration-300"
                style={{ background: colors.bg }}
              >
                <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
                  <span style={{ color: colors.accent }}>$</span> echo
                  &quot;Ready to collaborate?&quot;
                </p>
                <h2
                  className="text-3xl font-bold mb-8"
                  style={{ color: colors.accent }}
                >
                  {titles.contact}
                </h2>
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-semibold transition-colors"
                  style={{
                    background: colors.accent,
                    color: theme === 'dark' ? colors.bg : '#FFFFFF',
                  }}
                >
                  <Mail size={16} />
                  {personalInfo.email}
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer
        className="py-12 px-6 lg:px-12"
        style={{ borderTop: `1px solid ${colors.border}` }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand Column */}
            <div>
              <a
                href="#hero"
                className="text-lg font-bold font-mono"
                style={{ color: colors.accent }}
              >
                {personalInfo.fullName}
              </a>
              <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>
                {personalInfo.title}
              </p>
              <p className="mt-4 text-xs" style={{ color: colors.textDim }}>
                Platform Engineer specializing in Kubernetes, cloud automation,
                and scalable CI/CD solutions.
              </p>
            </div>

            {/* Quick Links Column */}
            <nav>
              <h3
                className="text-sm font-semibold mb-4 font-mono"
                style={{ color: colors.text }}
              >
                ~/quick_links
              </h3>
              <ul className="space-y-2">
                {[
                  'About',
                  'Experience',
                  'Skills',
                  'Certifications',
                  'Contact',
                ].map(item => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase() === 'about' ? 'hero' : item.toLowerCase()}`}
                      className="text-sm hover:opacity-80 transition-opacity"
                      style={{ color: colors.textMuted }}
                    >
                      → {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Connect Column */}
            <div>
              <h3
                className="text-sm font-semibold mb-4 font-mono"
                style={{ color: colors.text }}
              >
                ./connect.sh
              </h3>
              <div className="flex gap-3 mb-4">
                {personalInfo.social.linkedin && (
                  <a
                    href={personalInfo.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                    style={{
                      background: colors.surface,
                      border: `1px solid ${colors.border}`,
                    }}
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={18} style={{ color: colors.textMuted }} />
                  </a>
                )}
                {personalInfo.social.github && (
                  <a
                    href={personalInfo.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                    style={{
                      background: colors.surface,
                      border: `1px solid ${colors.border}`,
                    }}
                    aria-label="GitHub"
                  >
                    <Github size={18} style={{ color: colors.textMuted }} />
                  </a>
                )}
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                  style={{
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                  }}
                  aria-label="Email"
                >
                  <Mail size={18} style={{ color: colors.textMuted }} />
                </a>
              </div>
              <p className="text-xs" style={{ color: colors.textDim }}>
                {personalInfo.email}
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4"
            style={{ borderTop: `1px solid ${colors.border}` }}
          >
            <p className="text-xs" style={{ color: colors.textMuted }}>
              {footerText}
            </p>
            <p className="text-xs font-mono" style={{ color: colors.textDim }}>
              {version}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
