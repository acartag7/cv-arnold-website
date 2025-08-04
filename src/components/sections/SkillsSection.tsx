'use client'

import { motion } from 'framer-motion'
import { CVData } from '@/types'

interface SkillsSectionProps {
  data: CVData
}

const skillCategories = [
  {
    title: 'Cloud Platforms',
    skills: ['AWS', 'GCP', 'Azure'],
    color: 'bg-blue-500',
  },
  {
    title: 'Container Orchestration',
    skills: ['Kubernetes', 'OpenShift', 'EKS', 'GKE', 'TKG'],
    color: 'bg-purple-500',
  },
  {
    title: 'Infrastructure as Code',
    skills: ['Terraform', 'Ansible'],
    color: 'bg-green-500',
  },
  {
    title: 'CI/CD & Automation',
    skills: ['GitLab CI', 'Jenkins', 'GitHub Actions', 'ArgoCD', 'GitOps'],
    color: 'bg-orange-500',
  },
  {
    title: 'Monitoring & Observability',
    skills: ['Grafana', 'Prometheus', 'ELK Stack', 'Splunk', 'Fluentd'],
    color: 'bg-red-500',
  },
  {
    title: 'Event Streaming',
    skills: ['Kafka', 'Confluent Cloud'],
    color: 'bg-indigo-500',
  },
  {
    title: 'Programming & Scripting',
    skills: ['Shell Scripting', 'Python', 'Java'],
    color: 'bg-yellow-500',
  },
  {
    title: 'Security & DevSecOps',
    skills: ['Vault', 'Security Scanning', 'Vulnerability Assessment'],
    color: 'bg-pink-500',
  },
]

export default function SkillsSection({}: SkillsSectionProps) {
  return (
    <section id="skills" className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text)] mb-4">
            Skills & Expertise
          </h2>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Comprehensive technical skills spanning cloud platforms,
            infrastructure automation, and modern DevOps practices
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl bg-[var(--surface)]/60 hover:bg-[var(--surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                <h3 className="font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                  {category.title}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, skillIndex) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.1 + skillIndex * 0.05,
                    }}
                    viewport={{ once: true }}
                    className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-sm font-medium border border-[var(--primary)]/20 hover:bg-[var(--primary)]/20 transition-colors cursor-default"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Skills Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 p-6 rounded-xl bg-[var(--surface)]/30 border border-[var(--primary)]/10"
        >
          <h3 className="font-semibold text-[var(--text)] mb-4 text-center">
            Platform Engineering Expertise
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-[var(--primary)]">8+</div>
              <div className="text-sm text-[var(--text-muted)]">
                Years Experience
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-[var(--primary)]">
                Multi-Cloud
              </div>
              <div className="text-sm text-[var(--text-muted)]">
                Architecture
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-[var(--primary)]">
                IaC
              </div>
              <div className="text-sm text-[var(--text-muted)]">Frameworks</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-[var(--primary)]">
                GitOps
              </div>
              <div className="text-sm text-[var(--text-muted)]">Workflows</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
