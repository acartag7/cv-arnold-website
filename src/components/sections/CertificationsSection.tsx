'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Award, Star } from 'lucide-react'
import { CVData } from '@/types'

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
    <section id="certifications" className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text)] mb-4">
            Professional Certifications
          </h2>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Industry-recognized certifications demonstrating expertise in
            cloud-native technologies and platform engineering
          </p>
        </motion.div>

        {/* Kubestronaut Achievement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-12 p-6 rounded-xl bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 border border-[var(--primary)]/20"
        >
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="p-3 rounded-full bg-[var(--primary)] text-white">
              <Star size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-[var(--text)] mb-1">
                Kubestronaut Achievement
              </h3>
              <p className="text-[var(--text-muted)]">
                All 5 Kubernetes Certifications Completed
              </p>
            </div>
          </div>
        </motion.div>

        {/* Categories Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12"
        >
          {categories.map(category => (
            <div
              key={category.name}
              className="p-4 rounded-lg bg-[var(--surface)]/60 border border-[var(--color-border)] text-center"
            >
              <div
                className={`w-4 h-4 ${category.color} rounded-full mx-auto mb-2`}
              ></div>
              <div className="text-lg font-bold text-[var(--text)]">
                {category.count}
              </div>
              <div className="text-sm text-[var(--text-muted)]">
                {category.name}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Kubestronaut Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h3 className="text-xl font-semibold text-[var(--text)] mb-6 flex items-center space-x-2">
            <Award className="text-[var(--primary)]" size={20} />
            <span>Kubestronaut Certifications</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kubestronautCerts.map((cert, index) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-xl bg-[var(--surface)]/60 hover:bg-[var(--surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-all duration-300 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="text-[var(--primary)]" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[var(--text)] mb-1 text-sm group-hover:text-[var(--primary)] transition-colors">
                      {cert.name}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] mb-2">
                      {cert.issuer}
                    </p>
                    <div className="flex items-center justify-between">
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
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Other Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-semibold text-[var(--text)] mb-6">
            Additional Certifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherCerts.map((cert, index) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-xl bg-[var(--surface)]/60 hover:bg-[var(--surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-all duration-300 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="text-[var(--primary)]" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[var(--text)] mb-1 text-sm group-hover:text-[var(--primary)] transition-colors">
                      {cert.name}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] mb-2">
                      {cert.issuer}
                    </p>
                    <div className="flex items-center justify-between">
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
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Note about verification */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-[var(--text-muted)]">
            All certifications are current and can be verified through Credly
            badges. Click the external link icons to view verification details.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
