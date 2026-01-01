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
} from 'lucide-react'
import { CVData, HeroStat } from '@/types'
import cvData from '@/data/cv-data.json'
import { useState, useEffect, useMemo } from 'react'

/**
 * CV Website - Dashboard/Technical Design
 * Terminal-inspired, data-rich, developer-focused
 * With light/dark mode support
 *
 * All display values are CMS-editable via cv-data.json
 */

const data = cvData as CVData

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

// Default palettes (fallback if CMS config is missing) - Green theme
const defaultPalettes = {
  dark: {
    bg: '#0A0A0F',
    surface: '#12121A',
    surfaceHover: '#1A1A24',
    border: '#1E1E2E',
    text: '#FFFFFF',
    textMuted: '#B4B4BC',
    textDim: '#6B7280',
    accent: '#00FF94',
    accentDim: 'rgba(0, 255, 148, 0.15)',
    scanlines: 'rgba(255, 255, 255, 0.03)',
  },
  light: {
    bg: '#F8FAFB',
    surface: '#FFFFFF',
    surfaceHover: '#F1F5F9',
    border: '#E2E8F0',
    text: '#0F172A',
    textMuted: '#64748B',
    textDim: '#CBD5E1',
    accent: '#059669',
    accentDim: 'rgba(5, 150, 105, 0.1)',
    scanlines: 'rgba(0, 0, 0, 0.02)',
  },
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
    const timeout = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        if (i <= text.length) {
          setDisplayedText(text.slice(0, i))
          i++
        } else {
          clearInterval(interval)
        }
      }, 40)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timeout)
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

export default function HomePage() {
  const {
    personalInfo,
    experience,
    skills,
    certifications,
    siteConfig,
    heroStats,
    sectionTitles,
    featuredHighlights,
    themeConfig,
  } = data

  // Theme state with CMS-configurable default
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  // Build theme colors from CMS config with fallback to defaults
  const colors = useMemo(() => {
    const cmsColors = themeConfig?.[theme]
    const defaults = defaultPalettes[theme]

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
          <div
            className="flex items-center gap-4 text-xs"
            style={{ color: colors.textMuted }}
          >
            {/* Theme toggle */}
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

          <div className="space-y-6">
            {experience.slice(0, 4).map((exp, index) => (
              <motion.div
                key={exp.id}
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
                      {exp.position}
                    </h3>
                    <p className="text-sm" style={{ color: colors.accent }}>
                      {exp.company}
                    </p>
                  </div>
                  <div
                    className="text-xs px-3 py-1 rounded"
                    style={{
                      background: colors.accentDim,
                      color: colors.accent,
                    }}
                  >
                    {new Date(exp.startDate).getFullYear()} -{' '}
                    {exp.endDate
                      ? new Date(exp.endDate).getFullYear()
                      : 'Present'}
                  </div>
                </div>
                <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
                  {exp.description.split('.').slice(0, 2).join('.')}.
                </p>
                <div className="flex flex-wrap gap-2">
                  {exp.technologies.slice(0, 6).map(tech => (
                    <span
                      key={tech}
                      className="text-xs px-2 py-1 rounded"
                      style={{ background: colors.bg, color: colors.textMuted }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SKILLS ==================== */}
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
            {skills.map((category, catIndex) => (
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
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Cpu size={16} style={{ color: colors.accent }} />
                  {category.name}
                </h3>
                <div className="space-y-3">
                  {category.skills.map(skill => (
                    <div
                      key={skill.name}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{skill.name}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(level => (
                          <div
                            key={level}
                            className="w-3 h-3 rounded-sm transition-colors duration-300"
                            style={{
                              background:
                                level <=
                                (skill.level === 'expert'
                                  ? 5
                                  : skill.level === 'advanced'
                                    ? 4
                                    : 3)
                                  ? colors.accent
                                  : colors.border,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CERTIFICATIONS ==================== */}
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
                <div className="text-xs mb-2" style={{ color: colors.accent }}>
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

      {/* ==================== CONTACT ==================== */}
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
                <span style={{ color: colors.accent }}>$</span> echo &quot;Ready
                to collaborate?&quot;
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

      {/* Footer */}
      <footer
        className="py-8 px-6 lg:px-12 text-center transition-colors duration-300"
        style={{ borderTop: `1px solid ${colors.border}` }}
      >
        <p className="text-xs" style={{ color: colors.textMuted }}>
          {footerText}
        </p>
      </footer>
    </div>
  )
}
