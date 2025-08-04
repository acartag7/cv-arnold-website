'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import HeroSection from '@/components/sections/HeroSection'
import ExperienceSection from '@/components/sections/ExperienceSection'
import SkillsSection from '@/components/sections/SkillsSection'
import CertificationsSection from '@/components/sections/CertificationsSection'
import ContactSection from '@/components/sections/ContactSection'
import { Show } from '@/components/responsive'
import { CVData } from '@/types'
import cvData from '@/data/cv-data.json'

export default function HomePage() {
  const [data] = useState<CVData>(cvData as CVData)

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      {/* Responsive System Test Indicator */}
      <Show above="lg">
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-mono z-50">
          ✅ Desktop View (lg+)
        </div>
      </Show>

      <main>
        <HeroSection data={data} />
        <ExperienceSection data={data} />
        <SkillsSection data={data} />
        <CertificationsSection data={data} />
        <ContactSection data={data} />
      </main>
    </div>
  )
}
