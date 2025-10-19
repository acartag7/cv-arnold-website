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
            value: personalInfo.phone,
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
    <section id="contact" className="py-16 px-4 bg-[var(--surface)]">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text)] mb-4">
            Let&apos;s Connect
          </h2>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Ready to discuss platform engineering opportunities, cloud
            architecture, or technical collaboration
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-xl font-semibold text-[var(--text)] mb-6">
                Get In Touch
              </h3>
              <div className="space-y-4">
                {contactMethods.map((contact, index) => {
                  const IconComponent = contact.icon
                  const content = (
                    <div className="flex items-center space-x-4 p-4 rounded-xl bg-[var(--background)]/60 hover:bg-[var(--background)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-all duration-300 group">
                      <div className="p-3 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-200">
                        <IconComponent size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[var(--text)] mb-1">
                          {contact.label}
                        </h4>
                        <p className="text-sm text-[var(--text-muted)] mb-1">
                          {contact.value}
                        </p>
                        <p className="text-xs text-[var(--primary)]">
                          {contact.description}
                        </p>
                      </div>
                    </div>
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
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[var(--text)] mb-6">
                Social & Professional
              </h3>
              <div className="space-y-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-4 p-4 rounded-xl bg-[var(--background)]/60 hover:bg-[var(--background)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-all duration-300 group"
                    >
                      <div className="p-3 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-200">
                        <IconComponent size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[var(--text)] mb-1">
                          {social.label}
                        </h4>
                        <p className="text-sm text-[var(--text-muted)] mb-1">
                          {social.value}
                        </p>
                        <p className="text-xs text-[var(--primary)]">
                          {social.description}
                        </p>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="p-8 rounded-xl bg-[var(--background)]/60 border border-[var(--color-border)]">
              <h3 className="text-xl font-semibold text-[var(--text)] mb-4">
                Ready to Collaborate?
              </h3>
              <p className="text-[var(--text-muted)] mb-6 leading-relaxed">
                I&apos;m always open to discussing new opportunities, technical
                challenges, or sharing insights about platform engineering and
                cloud architecture.
              </p>

              <div className="space-y-4">
                <a
                  href={`mailto:${personalInfo.email}?subject=Professional Inquiry&body=Hi Arnold,%0A%0AI'd like to discuss...`}
                  className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-[var(--color-primary)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-all duration-200 font-semibold"
                >
                  <Send size={18} />
                  <span>Send Message</span>
                </a>

                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center justify-center space-x-2 w-full px-6 py-3 border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)] hover:text-[var(--color-text-inverse)] transition-all duration-200 font-semibold"
                >
                  <Download size={18} />
                  <span>Download CV</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-xl bg-[var(--background)]/60 border border-[var(--color-border)] text-center">
                <div className="text-2xl font-bold text-[var(--primary)] mb-1">
                  8+
                </div>
                <div className="text-sm text-[var(--text-muted)]">
                  Years Experience
                </div>
              </div>
              <div className="p-6 rounded-xl bg-[var(--background)]/60 border border-[var(--color-border)] text-center">
                <div className="text-2xl font-bold text-[var(--primary)] mb-1">
                  9
                </div>
                <div className="text-sm text-[var(--text-muted)]">
                  Certifications
                </div>
              </div>
            </div>

            {/* Availability Status */}
            <div className="p-6 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-[var(--text)]">
                  Available for Opportunities
                </span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                Open to platform engineering roles, consulting projects, and
                technical collaborations
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
