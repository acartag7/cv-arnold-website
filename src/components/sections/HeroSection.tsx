'use client'

import { motion } from 'framer-motion'
import {
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Github,
  Download,
  ChevronRight,
} from 'lucide-react'
import { CVData } from '@/types'
import { formatPhoneNumber } from '@/lib/format-utils'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Stack } from '@/components/ui/Stack'
import { Flex } from '@/components/ui/Flex'

interface HeroSectionProps {
  data: CVData
}

/**
 * Hero Section - Option A: Centered Hero
 * Clean centered layout with contact info as chips
 * Achievements displayed as horizontal grid
 */
export default function HeroSection({ data }: HeroSectionProps) {
  const { personalInfo, achievements } = data

  const handleDownloadPDF = () => {
    window.print()
  }

  return (
    <Section id="hero" spacing="lg" className="pt-24 print:pt-0">
      <Container size="xl" className="max-w-4xl">
        <Stack gap={8} align="center" className="text-center">
          {/* Main Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Stack gap={4} align="center">
              <h1 className="text-4xl lg:text-6xl font-bold text-[var(--text)]">
                {personalInfo.fullName}
              </h1>

              <h2 className="text-xl lg:text-2xl text-[var(--primary)] font-semibold">
                {personalInfo.title}
              </h2>

              <p className="text-lg text-[var(--text-muted)] max-w-2xl leading-relaxed">
                {personalInfo.summary}
              </p>
            </Stack>
          </motion.div>

          {/* Contact Chips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Flex wrap justify="center" gap={2}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--color-border)] text-sm">
                <MapPin size={14} className="text-[var(--primary)]" />
                {personalInfo.location.city}, {personalInfo.location.country}
              </span>

              <a
                href={`mailto:${personalInfo.email}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--color-border)] text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
              >
                <Mail size={14} className="text-[var(--primary)]" />
                {personalInfo.email}
              </a>

              {personalInfo.phone && (
                <a
                  href={`tel:${personalInfo.phone}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--color-border)] text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                >
                  <Phone size={14} className="text-[var(--primary)]" />
                  {formatPhoneNumber(personalInfo.phone)}
                </a>
              )}

              {personalInfo.social.linkedin && (
                <a
                  href={personalInfo.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--color-border)] text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                >
                  <Linkedin size={14} className="text-[var(--primary)]" />
                  LinkedIn
                </a>
              )}

              {personalInfo.social.github && (
                <a
                  href={personalInfo.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--color-border)] text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                >
                  <Github size={14} className="text-[var(--primary)]" />
                  GitHub
                </a>
              )}
            </Flex>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Flex gap={4} className="flex-col sm:flex-row">
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-all font-semibold"
              >
                <Download size={18} />
                Download CV
              </button>
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[var(--primary)] text-[var(--primary)] rounded-lg hover:bg-[var(--primary)] hover:text-white transition-all font-semibold"
              >
                Let&apos;s Connect
                <ChevronRight size={18} />
              </a>
            </Flex>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full pt-6 border-t border-[var(--color-border)]"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="p-4 rounded-lg bg-[var(--surface)]/50 border border-[var(--color-border)] text-left"
                >
                  <p className="font-semibold text-sm text-[var(--text)] mb-1">
                    {achievement.title}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {achievement.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Stack>
      </Container>
    </Section>
  )
}
