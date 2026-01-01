'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Award, Star } from 'lucide-react'
import { CVData } from '@/types'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Grid } from '@/components/ui/Grid'
import { Stack } from '@/components/ui/Stack'
import { Flex } from '@/components/ui/Flex'

interface CertificationsSectionProps {
  data: CVData
}

const certifications = [
  {
    name: 'CKA: Certified Kubernetes Administrator',
    issuer: 'The Linux Foundation',
    status: 'Current',
    category: 'Kubernetes',
    level: 'Professional',
    logo: '/api/placeholder/60/60',
    credlyUrl: '#', // Will be replaced with actual URL
    isKubestronaut: true,
  },
  {
    name: 'CKAD: Certified Kubernetes Application Developer',
    issuer: 'The Linux Foundation',
    status: 'Current',
    category: 'Kubernetes',
    level: 'Professional',
    logo: '/api/placeholder/60/60',
    credlyUrl: '#',
    isKubestronaut: true,
  },
  {
    name: 'CKS: Certified Kubernetes Security Specialist',
    issuer: 'The Linux Foundation',
    status: 'Current',
    category: 'Kubernetes',
    level: 'Professional',
    logo: '/api/placeholder/60/60',
    credlyUrl: '#',
    isKubestronaut: true,
  },
  {
    name: 'KCNA: Kubernetes and Cloud Native Associate',
    issuer: 'The Linux Foundation',
    status: 'Current',
    category: 'Kubernetes',
    level: 'Associate',
    logo: '/api/placeholder/60/60',
    credlyUrl: '#',
    isKubestronaut: true,
  },
  {
    name: 'KCSA: Kubernetes and Cloud Native Security Associate',
    issuer: 'The Linux Foundation',
    status: 'Current',
    category: 'Kubernetes',
    level: 'Associate',
    logo: '/api/placeholder/60/60',
    credlyUrl: '#',
    isKubestronaut: true,
  },
  {
    name: 'HashiCorp Certified Terraform Associate',
    issuer: 'HashiCorp',
    status: 'Current',
    category: 'Infrastructure',
    level: 'Associate',
    logo: '/api/placeholder/60/60',
    credlyUrl: '#',
    isKubestronaut: false,
  },
  {
    name: 'GitOps Certified for Argo',
    issuer: 'Codefresh',
    status: 'Current',
    category: 'GitOps',
    level: 'Professional',
    logo: '/api/placeholder/60/60',
    credlyUrl: '#',
    isKubestronaut: false,
  },
  {
    name: 'Jenkins Level 1: Administration',
    issuer: 'CloudBees, Inc.',
    status: 'Current',
    category: 'CI/CD',
    level: 'Professional',
    logo: '/api/placeholder/60/60',
    credlyUrl: '#',
    isKubestronaut: false,
  },
  {
    name: 'Microsoft Certified: Azure Fundamentals',
    issuer: 'Microsoft',
    status: 'Current',
    category: 'Cloud',
    level: 'Fundamentals',
    logo: '/api/placeholder/60/60',
    credlyUrl: '#',
    isKubestronaut: false,
  },
]

const categories = [
  { name: 'Kubernetes', color: 'bg-blue-500', count: 5 },
  { name: 'Infrastructure', color: 'bg-green-500', count: 1 },
  { name: 'GitOps', color: 'bg-purple-500', count: 1 },
  { name: 'CI/CD', color: 'bg-orange-500', count: 1 },
  { name: 'Cloud', color: 'bg-cyan-500', count: 1 },
]

export default function CertificationsSection({}: CertificationsSectionProps) {
  const kubestronautCerts = certifications.filter(cert => cert.isKubestronaut)
  const otherCerts = certifications.filter(cert => !cert.isKubestronaut)

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
                Professional Certifications
              </h2>
              <p className="text-lg text-[var(--text-muted)] max-w-2xl">
                Industry-recognized certifications demonstrating expertise in
                cloud-native technologies and platform engineering
              </p>
            </Stack>
          </motion.div>

          {/* Kubestronaut Achievement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="p-6 rounded-xl bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 border border-[var(--primary)]/20"
          >
            <Flex align="center" justify="center" gap={4}>
              <div className="p-3 rounded-full bg-[var(--primary)] text-white">
                <Star size={24} />
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

          {/* Categories Overview */}
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

          {/* Kubestronaut Certifications */}
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
                  Kubestronaut Certifications
                </h3>
              </Flex>
              <Grid cols={1} mdCols={2} lgCols={3} gap={6}>
                {kubestronautCerts.map((cert, index) => (
                  <motion.div
                    key={cert.name}
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
                        <p className="text-xs text-[var(--text-muted)]">
                          {cert.issuer}
                        </p>
                        <Flex align="center" justify="between">
                          <span className="text-xs px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full">
                            {cert.level}
                          </span>
                          <a
                            href={cert.credlyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--primary)] hover:text-[var(--secondary)] transition-colors"
                            aria-label="View certification"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </Flex>
                      </Stack>
                    </Flex>
                  </motion.div>
                ))}
              </Grid>
            </Stack>
          </motion.div>

          {/* Other Certifications */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Stack gap={6}>
              <h3 className="text-xl font-semibold text-[var(--text)]">
                Additional Certifications
              </h3>
              <Grid cols={1} mdCols={2} lgCols={3} gap={6}>
                {otherCerts.map((cert, index) => (
                  <motion.div
                    key={cert.name}
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
                        <p className="text-xs text-[var(--text-muted)]">
                          {cert.issuer}
                        </p>
                        <Flex align="center" justify="between">
                          <span className="text-xs px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full">
                            {cert.level}
                          </span>
                          <a
                            href={cert.credlyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--primary)] hover:text-[var(--secondary)] transition-colors"
                            aria-label="View certification"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </Flex>
                      </Stack>
                    </Flex>
                  </motion.div>
                ))}
              </Grid>
            </Stack>
          </motion.div>

          {/* Note about verification */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-sm text-[var(--text-muted)]">
              All certifications are current and can be verified through Credly
              badges. Click the external link icons to view verification
              details.
            </p>
          </motion.div>
        </Stack>
      </Container>
    </Section>
  )
}
