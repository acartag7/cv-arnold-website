'use client'

import { CVData } from '@/types'
import { Timeline } from './experience'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Stack } from '@/components/ui/Stack'

interface ExperienceSectionProps {
  data: CVData
}

export default function ExperienceSection({ data }: ExperienceSectionProps) {
  return (
    <Section id="experience" spacing="lg" className="bg-[var(--surface)]">
      <Container size="xl" className="max-w-6xl">
        <Stack gap={12} align="stretch">
          <Stack gap={4} align="center" className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text)]">
              Professional Experience
            </h2>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl">
              Platform engineering leadership with focus on cost optimization,
              team development, and technical excellence
            </p>
          </Stack>

          <Timeline experiences={data.experience} variant="vertical" />
        </Stack>
      </Container>
    </Section>
  )
}
