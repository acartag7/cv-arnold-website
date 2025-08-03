'use client'

import { motion } from 'framer-motion'
import { Calendar, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { CVData } from '@/types'

interface ExperienceSectionProps {
  data: CVData
}

export default function ExperienceSection({ data }: ExperienceSectionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <section id="experience" className="py-16 px-4 bg-[var(--surface)]">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text)] mb-4">
            Professional Experience
          </h2>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Platform engineering leadership with focus on cost optimization,
            team development, and technical excellence
          </p>
        </motion.div>

        <div className="space-y-8">
          {data.experience.map((exp, index) => {
            const isExpanded = expandedItems.has(exp.id)

            return (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[var(--background)] rounded-xl p-6 lg:p-8 shadow-sm hover:shadow-md transition-all duration-300 print-break-inside-avoid"
              >
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-xl lg:text-2xl font-bold text-[var(--text)] mb-2">
                      {exp.position}
                    </h3>
                    <h4 className="text-lg text-[var(--primary)] font-semibold mb-3">
                      {exp.company}
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-[var(--text-muted)]">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} />
                        <span>
                          {exp.startDate} – {exp.endDate}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin size={16} />
                        <span>{exp.location}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleExpanded(exp.id)}
                    className="mt-4 lg:mt-0 flex items-center space-x-2 px-4 py-2 bg-[var(--surface)] hover:bg-[var(--primary)] hover:text-white rounded-lg transition-all duration-200 no-print"
                  >
                    <span className="text-sm">
                      {isExpanded ? 'Show Less' : 'Show More'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </div>

                {/* Key Achievements - Always Visible */}
                <div className="mb-6">
                  <h5 className="font-semibold text-[var(--text)] mb-3">
                    Key Achievements
                  </h5>
                  <div className="grid gap-3">
                    {exp.achievements
                      .slice(0, isExpanded ? undefined : 3)
                      .map((achievement, achIndex) => (
                        <div
                          key={achIndex}
                          className="flex items-start space-x-3"
                        >
                          <div className="w-2 h-2 bg-[var(--primary)] rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-[var(--text-muted)] leading-relaxed">
                            {achievement}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Expanded Content */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: isExpanded ? 'auto' : 0,
                    opacity: isExpanded ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-6 pt-6 border-t border-[var(--surface)]">
                    {/* Responsibilities */}
                    <div>
                      <h5 className="font-semibold text-[var(--text)] mb-3">
                        Core Responsibilities
                      </h5>
                      <div className="grid gap-3">
                        {exp.responsibilities.map(
                          (responsibility, respIndex) => (
                            <div
                              key={respIndex}
                              className="flex items-start space-x-3"
                            >
                              <div className="w-2 h-2 bg-[var(--accent)] rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-[var(--text-muted)] leading-relaxed">
                                {responsibility}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Technologies */}
                    <div>
                      <h5 className="font-semibold text-[var(--text)] mb-3">
                        Technologies & Tools
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-3 py-1 bg-[var(--surface)] text-[var(--text)] rounded-full text-sm border border-[var(--primary)]/20"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
