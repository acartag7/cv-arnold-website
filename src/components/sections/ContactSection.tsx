'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  MessageSquare,
  Calendar,
} from 'lucide-react'
import { CVData } from '@/types'
import { formatPhoneNumber } from '@/lib/format-utils'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Stack } from '@/components/ui/Stack'
import { Flex } from '@/components/ui/Flex'
import { ContactForm, CalEmbed } from '@/components/contact'

interface ContactSectionProps {
  data: CVData
  /** Cloudflare Turnstile site key for spam protection */
  turnstileSiteKey?: string
  /** Cal.com username for scheduling */
  calLink?: string
}

type ContactTab = 'message' | 'schedule'

/**
 * Contact Section with Form and Calendar Tabs
 *
 * Features:
 * - Contact info chips (email, phone, location)
 * - Social links
 * - Tabbed interface: Send Message | Book a Call
 * - Terminal aesthetic for form and calendar
 */
export default function ContactSection({
  data,
  turnstileSiteKey,
  calLink,
}: ContactSectionProps) {
  const { personalInfo } = data
  const [activeTab, setActiveTab] = useState<ContactTab>('message')

  // Only show tabs/form if we have the required keys
  const showContactForm = Boolean(turnstileSiteKey)
  const showCalendar = Boolean(calLink)
  const showTabs = showContactForm || showCalendar

  const contactMethods = [
    {
      icon: Mail,
      label: 'Email',
      value: personalInfo.email,
      href: `mailto:${personalInfo.email}`,
    },
    ...(personalInfo.phone
      ? [
          {
            icon: Phone,
            label: 'Phone',
            value: formatPhoneNumber(personalInfo.phone),
            href: `tel:${personalInfo.phone}`,
          },
        ]
      : []),
    {
      icon: MapPin,
      label: 'Location',
      value: `${personalInfo.location.city}, ${personalInfo.location.country}`,
      href: null,
    },
  ]

  const socialLinks = [
    ...(personalInfo.social.linkedin
      ? [
          {
            icon: Linkedin,
            label: 'LinkedIn',
            href: personalInfo.social.linkedin,
          },
        ]
      : []),
    ...(personalInfo.social.github
      ? [
          {
            icon: Github,
            label: 'GitHub',
            href: personalInfo.social.github,
          },
        ]
      : []),
  ]

  const tabs = [
    ...(showContactForm
      ? [{ id: 'message' as const, label: 'Send Message', icon: MessageSquare }]
      : []),
    ...(showCalendar
      ? [{ id: 'schedule' as const, label: 'Book a Call', icon: Calendar }]
      : []),
  ]

  return (
    <Section id="contact" spacing="md" className="bg-[var(--surface)]">
      <Container size="xl" className="max-w-4xl">
        <Stack gap={8} align="center" className="text-center">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Stack gap={2} align="center">
              <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text)]">
                Let&apos;s Connect
              </h2>
              <p className="text-[var(--text-muted)] max-w-md">
                Ready for your next platform engineering challenge? Reach out.
              </p>
            </Stack>
          </motion.div>

          {/* Contact Methods - Chip style matching Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Flex wrap justify="center" gap={2}>
              {contactMethods.map((contact, index) => {
                const IconComponent = contact.icon
                const content = (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--background)] border border-[var(--color-border)] text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                    <IconComponent
                      size={16}
                      className="text-[var(--primary)]"
                    />
                    <span className="font-medium">{contact.value}</span>
                  </span>
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
                  >
                    {content}
                  </a>
                ) : (
                  <div key={index}>{content}</div>
                )
              })}
            </Flex>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Flex justify="center" gap={3}>
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-[var(--background)] border border-[var(--color-border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors"
                    aria-label={social.label}
                  >
                    <IconComponent size={20} />
                  </a>
                )
              })}
            </Flex>
          </motion.div>

          {/* Tabbed Interface for Form/Calendar */}
          {showTabs && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="w-full max-w-xl"
            >
              {/* Tab Buttons */}
              {tabs.length > 1 && (
                <div className="flex justify-center mb-6">
                  <div className="inline-flex rounded-lg bg-[var(--background)] border border-[var(--color-border)] p-1">
                    {tabs.map(tab => {
                      const TabIcon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === tab.id
                              ? 'bg-[var(--primary)] text-white'
                              : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                          }`}
                        >
                          <TabIcon size={16} />
                          {tab.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Tab Content */}
              <div className="text-left">
                {activeTab === 'message' &&
                  showContactForm &&
                  turnstileSiteKey && (
                    <ContactForm turnstileSiteKey={turnstileSiteKey} />
                  )}
                {activeTab === 'schedule' && showCalendar && calLink && (
                  <CalEmbed calLink={calLink} />
                )}
              </div>
            </motion.div>
          )}

          {/* Fallback CTA when no tabs available */}
          {!showTabs && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <a
                href={`mailto:${personalInfo.email}?subject=Professional Inquiry&body=Hi Arnold,%0A%0AI'd like to discuss...`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-hover)] transition-all font-semibold"
              >
                <Mail size={18} />
                Send a Message
              </a>
            </motion.div>
          )}
        </Stack>
      </Container>
    </Section>
  )
}
