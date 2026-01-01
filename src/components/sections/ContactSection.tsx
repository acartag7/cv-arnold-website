'use client'

import { motion } from 'framer-motion'
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Download,
  Send,
} from 'lucide-react'
import { CVData } from '@/types'
import { formatPhoneNumber } from '@/lib/format-utils'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Grid } from '@/components/ui/Grid'
import { Stack } from '@/components/ui/Stack'
import { Flex } from '@/components/ui/Flex'

interface ContactSectionProps {
  data: CVData
}

export default function ContactSection({ data }: ContactSectionProps) {
  const { personalInfo } = data

  const handleDownloadPDF = () => {
    window.print()
  }

  const contactMethods = [
    {
      icon: Mail,
      label: 'Email',
      value: personalInfo.email,
      href: `mailto:${personalInfo.email}`,
      description: 'Send me an email',
    },
    ...(personalInfo.phone
      ? [
          {
            icon: Phone,
            label: 'Phone',
            value: formatPhoneNumber(personalInfo.phone),
            href: `tel:${personalInfo.phone}`,
            description: 'Give me a call',
          },
        ]
      : []),
    {
      icon: MapPin,
      label: 'Location',
      value: `${personalInfo.location.city}, ${personalInfo.location.country}`,
      href: null,
      description: 'Based in Switzerland',
    },
  ]

  const socialLinks = [
    ...(personalInfo.social.linkedin
      ? [
          {
            icon: Linkedin,
            label: 'LinkedIn',
            value: 'LinkedIn Profile',
            href: personalInfo.social.linkedin,
            description: 'Connect professionally',
          },
        ]
      : []),
    ...(personalInfo.social.github
      ? [
          {
            icon: Github,
            label: 'GitHub',
            value: 'GitHub Profile',
            href: personalInfo.social.github,
            description: 'View my code',
          },
        ]
      : []),
  ]

  return (
    <Section id="contact" spacing="md" className="bg-[var(--surface)]">
      <Container size="xl" className="max-w-6xl">
        <Stack gap={6}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Stack gap={4} align="center" className="text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text)]">
                Let&apos;s Connect
              </h2>
              <p className="text-lg text-[var(--text-muted)] max-w-2xl">
                Ready to discuss platform engineering opportunities, cloud
                architecture, or technical collaboration
              </p>
            </Stack>
          </motion.div>

          {/* Two-column contact layout in unified container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--background)]/40 overflow-hidden"
          >
            <Grid cols={1} lgCols={2} gap={0}>
              {/* Left Column - Contact Information */}
              <div className="p-6 lg:p-8 lg:border-r border-[var(--color-border)]">
                <Stack gap={6}>
                  <Stack gap={4}>
                    <h3 className="text-lg font-semibold text-[var(--text)]">
                      Get In Touch
                    </h3>
                    <Stack gap={3}>
                      {contactMethods.map((contact, index) => {
                        const IconComponent = contact.icon
                        const content = (
                          <Flex
                            align="center"
                            gap={3}
                            className="p-3 rounded-lg hover:bg-[var(--surface)] transition-all duration-200 group"
                          >
                            <div className="p-2 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-200">
                              <IconComponent size={18} />
                            </div>
                            <Stack gap={0} className="flex-1 min-w-0">
                              <span className="font-medium text-[var(--text)] text-sm">
                                {contact.label}
                              </span>
                              <span className="text-sm text-[var(--text-muted)]">
                                {contact.value}
                              </span>
                            </Stack>
                          </Flex>
                        )

                        return contact.href ? (
                          <a
                            key={index}
                            href={contact.href}
                            target={
                              contact.href.startsWith('http')
                                ? '_blank'
                                : undefined
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
                  </Stack>

                  <div className="border-t border-[var(--color-border)] pt-6">
                    <Stack gap={4}>
                      <h3 className="text-lg font-semibold text-[var(--text)]">
                        Social & Professional
                      </h3>
                      <Flex gap={3}>
                        {socialLinks.map((social, index) => {
                          const IconComponent = social.icon
                          return (
                            <a
                              key={index}
                              href={social.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 rounded-lg bg-[var(--surface)] hover:bg-[var(--primary)] text-[var(--primary)] hover:text-white border border-[var(--color-border)] hover:border-[var(--primary)] transition-all duration-200"
                              aria-label={social.label}
                            >
                              <IconComponent size={20} />
                            </a>
                          )
                        })}
                      </Flex>
                    </Stack>
                  </div>
                </Stack>
              </div>

              {/* Right Column - CTA */}
              <div className="p-6 lg:p-8 bg-[var(--surface)]/30">
                <Stack gap={6}>
                  <Stack gap={3}>
                    <h3 className="text-lg font-semibold text-[var(--text)]">
                      Ready to Collaborate?
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                      I&apos;m always open to discussing new opportunities,
                      technical challenges, or sharing insights about platform
                      engineering.
                    </p>
                  </Stack>

                  <Stack gap={3}>
                    <a
                      href={`mailto:${personalInfo.email}?subject=Professional Inquiry&body=Hi Arnold,%0A%0AI'd like to discuss...`}
                      className="flex items-center justify-center space-x-2 w-full px-5 py-2.5 bg-[var(--color-primary)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-all duration-200 font-semibold text-sm"
                    >
                      <Send size={16} />
                      <span>Send Message</span>
                    </a>

                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center justify-center space-x-2 w-full px-5 py-2.5 border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)] hover:text-[var(--color-text-inverse)] transition-all duration-200 font-semibold text-sm"
                    >
                      <Download size={16} />
                      <span>Download CV</span>
                    </button>
                  </Stack>

                  {/* Quick Stats */}
                  <Grid cols={2} gap={3}>
                    <Stack
                      gap={0}
                      align="center"
                      className="p-4 rounded-lg bg-[var(--background)]/60 text-center"
                    >
                      <div className="text-xl font-bold text-[var(--primary)]">
                        8+
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        Years Experience
                      </div>
                    </Stack>
                    <Stack
                      gap={0}
                      align="center"
                      className="p-4 rounded-lg bg-[var(--background)]/60 text-center"
                    >
                      <div className="text-xl font-bold text-[var(--primary)]">
                        9
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        Certifications
                      </div>
                    </Stack>
                  </Grid>

                  {/* Availability Status */}
                  <Flex
                    align="center"
                    gap={2}
                    className="p-3 rounded-lg bg-[var(--primary)]/10"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-[var(--text)]">
                      Available for Opportunities
                    </span>
                  </Flex>
                </Stack>
              </div>
            </Grid>
          </motion.div>
        </Stack>
      </Container>
    </Section>
  )
}
