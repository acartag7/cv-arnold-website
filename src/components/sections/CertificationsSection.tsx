'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Award } from 'lucide-react'
import Image from 'next/image'
import { CVData, Certification } from '@/types'

// Official Kubestronaut badge from CNCF artwork repository
// https://github.com/cncf/artwork/tree/main/other/kubestronaut
const KUBESTRONAUT_LOGO_URL =
  'https://raw.githubusercontent.com/cncf/artwork/main/other/kubestronaut/icon/color/kubestronaut-icon-color.svg'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Grid } from '@/components/ui/Grid'
import { Stack } from '@/components/ui/Stack'
import { Flex } from '@/components/ui/Flex'
import { useMemo } from 'react'

interface CertificationsSectionProps {
  data: CVData
}

// Kubestronaut certification name patterns (all 5 required for Kubestronaut status)
const KUBESTRONAUT_CERTS = [
  'CKA', // Certified Kubernetes Administrator
  'CKAD', // Certified Kubernetes Application Developer
  'CKS', // Certified Kubernetes Security Specialist
  'KCNA', // Kubernetes and Cloud Native Associate
  'KCSA', // Kubernetes and Cloud Native Security Associate
]

// Category color mapping based on certification name/issuer
function getCategoryInfo(cert: Certification): {
  category: string
  color: string
} {
  const name = cert.name.toLowerCase()
  const issuer = cert.issuer.toLowerCase()

  if (
    name.includes('kubernetes') ||
    name.includes('cka') ||
    name.includes('ckad') ||
    name.includes('cks') ||
    name.includes('kcna') ||
    name.includes('kcsa')
  ) {
    return { category: 'Kubernetes', color: 'bg-blue-500' }
  }
  if (name.includes('terraform') || name.includes('infrastructure')) {
    return { category: 'Infrastructure', color: 'bg-green-500' }
  }
  if (name.includes('gitops') || name.includes('argo')) {
    return { category: 'GitOps', color: 'bg-purple-500' }
  }
  if (name.includes('jenkins') || name.includes('ci/cd')) {
    return { category: 'CI/CD', color: 'bg-orange-500' }
  }
  if (
    name.includes('azure') ||
    name.includes('aws') ||
    name.includes('gcp') ||
    name.includes('cloud') ||
    issuer.includes('microsoft') ||
    issuer.includes('amazon') ||
    issuer.includes('google')
  ) {
    return { category: 'Cloud', color: 'bg-cyan-500' }
  }
  if (name.includes('security') && !name.includes('kubernetes')) {
    return { category: 'Security', color: 'bg-red-500' }
  }

  return { category: 'Other', color: 'bg-slate-500' }
}

// Check if a certification is one of the Kubestronaut certifications
function isKubestronautCert(cert: Certification): boolean {
  const name = cert.name.toUpperCase()
  return KUBESTRONAUT_CERTS.some(pattern => name.includes(pattern))
}

// Get certification level based on name
function getCertLevel(cert: Certification): string {
  const name = cert.name.toLowerCase()
  if (name.includes('associate') || name.includes('fundamentals')) {
    return 'Associate'
  }
  if (name.includes('professional') || name.includes('expert')) {
    return 'Professional'
  }
  if (name.includes('specialist')) {
    return 'Specialist'
  }
  return 'Professional' // Default
}

export default function CertificationsSection({
  data,
}: CertificationsSectionProps) {
  const sectionTitles = data.sectionTitles

  // Memoize certifications array to avoid useMemo dependency warnings
  const certifications = useMemo(
    () => data.certifications || [],
    [data.certifications]
  )

  // Sort certifications by order
  const sortedCerts = useMemo(() => {
    return [...certifications].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [certifications])

  // Separate Kubestronaut and other certifications
  const kubestronautCerts = useMemo(
    () => sortedCerts.filter(isKubestronautCert),
    [sortedCerts]
  )
  const otherCerts = useMemo(
    () => sortedCerts.filter(cert => !isKubestronautCert(cert)),
    [sortedCerts]
  )

  // Check if user has achieved Kubestronaut status (all 5 K8s certs)
  const hasKubestronautStatus = useMemo(() => {
    const certNames = sortedCerts.map(c => c.name.toUpperCase())
    return KUBESTRONAUT_CERTS.every(pattern =>
      certNames.some(name => name.includes(pattern))
    )
  }, [sortedCerts])

  // Generate categories dynamically
  const categories = useMemo(() => {
    const categoryMap = new Map<string, { color: string; count: number }>()

    sortedCerts.forEach(cert => {
      const { category, color } = getCategoryInfo(cert)
      const existing = categoryMap.get(category)
      if (existing) {
        existing.count++
      } else {
        categoryMap.set(category, { color, count: 1 })
      }
    })

    return Array.from(categoryMap.entries()).map(
      ([name, { color, count }]) => ({
        name,
        color,
        count,
      })
    )
  }, [sortedCerts])

  // If no certifications, don't render the section
  if (certifications.length === 0) {
    return null
  }

  return (
    <Section id="certifications" spacing="lg">
      <Container size="xl" className="max-w-6xl">
        <Stack gap={12}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Stack gap={4} align="center" className="text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text)]">
                {sectionTitles?.certifications || 'Professional Certifications'}
              </h2>
              <p className="text-lg text-[var(--text-muted)] max-w-2xl">
                Industry-recognized certifications demonstrating expertise in
                cloud-native technologies and platform engineering
              </p>
            </Stack>
          </motion.div>

          {/* Kubestronaut Achievement - only show if all 5 K8s certs are present */}
          {hasKubestronautStatus && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 border border-[var(--primary)]/20"
            >
              <Flex align="center" justify="center" gap={4}>
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={KUBESTRONAUT_LOGO_URL}
                    alt="Kubestronaut Badge"
                    fill
                    className="object-contain"
                    unoptimized // SVG from external URL
                  />
                </div>
                <Stack gap={1} align="center" className="text-center">
                  <h3 className="text-xl font-bold text-[var(--text)]">
                    Kubestronaut Achievement
                  </h3>
                  <p className="text-[var(--text-muted)]">
                    All 5 Kubernetes Certifications Completed
                  </p>
                </Stack>
              </Flex>
            </motion.div>
          )}

          {/* Categories Overview */}
          {categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Grid cols={2} mdCols={5} gap={4}>
                {categories.map(category => (
                  <Stack
                    key={category.name}
                    gap={2}
                    align="center"
                    className="p-4 rounded-lg bg-[var(--surface)]/60 border border-[var(--color-border)] text-center"
                  >
                    <div
                      className={`w-4 h-4 ${category.color} rounded-full`}
                    ></div>
                    <div className="text-lg font-bold text-[var(--text)]">
                      {category.count}
                    </div>
                    <div className="text-sm text-[var(--text-muted)]">
                      {category.name}
                    </div>
                  </Stack>
                ))}
              </Grid>
            </motion.div>
          )}

          {/* Kubestronaut Certifications */}
          {kubestronautCerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Stack gap={6}>
                <Flex align="center" gap={2}>
                  <Award className="text-[var(--primary)]" size={20} />
                  <h3 className="text-xl font-semibold text-[var(--text)]">
                    Kubernetes Certifications
                  </h3>
                </Flex>
                <Grid cols={1} mdCols={2} lgCols={3} gap={6}>
                  {kubestronautCerts.map((cert, index) => (
                    <CertificationCard
                      key={cert.id}
                      cert={cert}
                      index={index}
                    />
                  ))}
                </Grid>
              </Stack>
            </motion.div>
          )}

          {/* Other Certifications */}
          {otherCerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Stack gap={6}>
                <h3 className="text-xl font-semibold text-[var(--text)]">
                  {kubestronautCerts.length > 0
                    ? 'Additional Certifications'
                    : 'Certifications'}
                </h3>
                <Grid cols={1} mdCols={2} lgCols={3} gap={6}>
                  {otherCerts.map((cert, index) => (
                    <CertificationCard
                      key={cert.id}
                      cert={cert}
                      index={index}
                    />
                  ))}
                </Grid>
              </Stack>
            </motion.div>
          )}

          {/* Note about verification */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-sm text-[var(--text-muted)]">
              All certifications are current and can be verified through their
              respective credential platforms. Click the external link icons to
              view verification details.
            </p>
          </motion.div>
        </Stack>
      </Container>
    </Section>
  )
}

// Separate component for certification card to reduce repetition
function CertificationCard({
  cert,
  index,
}: {
  cert: Certification
  index: number
}) {
  const level = getCertLevel(cert)
  const hasCredentialUrl =
    cert.credentialUrl &&
    cert.credentialUrl !== '#' &&
    cert.credentialUrl !== ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="p-6 rounded-xl bg-[var(--surface)]/60 hover:bg-[var(--surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-all duration-300 group"
    >
      <Flex align="start" gap={4}>
        <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Award className="text-[var(--primary)]" size={20} />
        </div>
        <Stack gap={2} className="flex-1 min-w-0">
          <h4 className="font-semibold text-[var(--text)] text-sm group-hover:text-[var(--primary)] transition-colors">
            {cert.name}
          </h4>
          <p className="text-xs text-[var(--text-muted)]">{cert.issuer}</p>
          <Flex align="center" justify="between">
            <span className="text-xs px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full">
              {level}
            </span>
            {hasCredentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] hover:text-[var(--secondary)] transition-colors"
                aria-label={`View ${cert.name} certification`}
              >
                <ExternalLink size={14} />
              </a>
            )}
          </Flex>
        </Stack>
      </Flex>
    </motion.div>
  )
}
