'use client'

import { motion } from 'framer-motion'
import {
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Github,
  Download,
  Zap,
  Users,
  Shield,
  Cpu,
} from 'lucide-react'
import { CVData } from '@/types'
import { formatPhoneNumber } from '@/lib/format-utils'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Grid } from '@/components/ui/Grid'
import { Stack } from '@/components/ui/Stack'
import { Flex } from '@/components/ui/Flex'

interface HeroSectionProps {
  data: CVData
}

export default function HeroSection({ data }: HeroSectionProps) {
  const { personalInfo, achievements } = data

  const handleDownloadPDF = () => {
    window.print()
  }

  const contactLinks = [
    {
      icon: MapPin,
      text: `${personalInfo.location.city}, ${personalInfo.location.country}`,
      href: null,
    },
    {
      icon: Mail,
      text: personalInfo.email,
      href: `mailto:${personalInfo.email}`,
    },
    ...(personalInfo.phone
      ? [
          {
            icon: Phone,
            text: formatPhoneNumber(personalInfo.phone),
            href: `tel:${personalInfo.phone}`,
          },
        ]
      : []),
    ...(personalInfo.social.linkedin
      ? [
          {
            icon: Linkedin,
            text: 'LinkedIn',
            href: personalInfo.social.linkedin,
          },
        ]
      : []),
    ...(personalInfo.social.github
      ? [
          {
            icon: Github,
            text: 'GitHub',
            href: personalInfo.social.github,
          },
        ]
      : []),
  ]

  return (
    <Section id="hero" spacing="md" className="pt-20 print:pt-0">
      <Container size="xl" className="max-w-6xl">
        <Grid cols={1} lgCols={5} gap={6} className="items-start">
          {/* Left Column - Info */}
          <Stack gap={6} className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-[var(--text)] mb-4">
                {personalInfo.fullName}
              </h1>
              <h2 className="text-xl lg:text-2xl text-[var(--primary)] font-semibold mb-6">
                {personalInfo.title}
              </h2>
              <p className="text-lg text-[var(--text-muted)] leading-relaxed">
                {personalInfo.summary}
              </p>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Stack gap={2}>
                {contactLinks.map((contact, index) => {
                  const IconComponent = contact.icon
                  const content = (
                    <Flex
                      align="center"
                      gap={3}
                      className="p-2.5 rounded-lg bg-[var(--surface)]/50 hover:bg-[var(--primary)] hover:text-white transition-all duration-200 group border border-[var(--color-border)]"
                    >
                      <IconComponent
                        size={18}
                        className="text-[var(--primary)] group-hover:text-white flex-shrink-0"
                      />
                      <span className="text-sm text-[var(--text)] group-hover:text-white font-medium">
                        {contact.text}
                      </span>
                    </Flex>
                  )

                  return contact.href ? (
                    <a
                      key={index}
                      href={contact.href}
                      target={
                        contact.href.startsWith('http') ? '_blank' : undefined
                      }
                      rel={
                        contact.href.startsWith('http')
                          ? 'noopener noreferrer'
                          : undefined
                      }
                      className="block"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={index}>{content}</div>
                  )
                })}
              </Stack>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Flex direction="col" gap={4} className="sm:flex-row">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-[var(--color-primary)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-all duration-200 font-semibold"
                >
                  <Download size={20} />
                  <span>Download CV</span>
                </button>
                <a
                  href="#contact"
                  className="flex items-center justify-center px-6 py-3 border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)] hover:text-[var(--color-text-inverse)] transition-all duration-200 font-semibold"
                >
                  Let&apos;s Connect
                </a>
              </Flex>
            </motion.div>
          </Stack>

          {/* Right Column - Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Stack gap={3}>
              {achievements.map((achievement, index) => {
                // Map achievement titles to appropriate icons
                const getAchievementIcon = (title: string) => {
                  if (
                    title.toLowerCase().includes('platform') ||
                    title.toLowerCase().includes('integration')
                  )
                    return Users
                  if (
                    title.toLowerCase().includes('monitoring') ||
                    title.toLowerCase().includes('cloud')
                  )
                    return Zap
                  if (
                    title.toLowerCase().includes('infrastructure') ||
                    title.toLowerCase().includes('code')
                  )
                    return Cpu
                  if (
                    title.toLowerCase().includes('security') ||
                    title.toLowerCase().includes('devsecops')
                  )
                    return Shield
                  return Zap // Default icon
                }

                const IconComponent = getAchievementIcon(achievement.title)

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    className="p-4 rounded-lg bg-[var(--surface)]/60 hover:bg-[var(--surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-all duration-300 group"
                  >
                    <Flex align="start" gap={3}>
                      <div className="p-1.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-200">
                        <IconComponent size={16} />
                      </div>
                      <Stack gap={1} className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--text)] text-xs group-hover:text-[var(--primary)] transition-colors">
                          {achievement.title}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] leading-tight">
                          {achievement.description}
                        </p>
                      </Stack>
                    </Flex>
                  </motion.div>
                )
              })}
            </Stack>
          </motion.div>
        </Grid>
      </Container>
    </Section>
  )
}
