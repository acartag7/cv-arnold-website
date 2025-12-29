'use client'

import { CVData } from '@/types'
import { Timeline } from './experience'

interface ExperienceSectionProps {
  data: CVData
}

export default function ExperienceSection({ data }: ExperienceSectionProps) {
  return (
    <section id="experience" className="py-16 px-4 bg-[var(--surface)]">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text)] mb-4">
            Professional Experience
          </h2>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Platform engineering leadership with focus on cost optimization,
            team development, and technical excellence
          </p>
        </div>

        <Timeline experiences={data.experience} variant="vertical" />
      </div>
    </section>
  )
}
