'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import HeroSection from '@/components/sections/HeroSection'
import ExperienceSection from '@/components/sections/ExperienceSection'
import SkillsSection from '@/components/sections/SkillsSection'
import CertificationsSection from '@/components/sections/CertificationsSection'
import ContactSection from '@/components/sections/ContactSection'
import { CVData } from '@/types'
import cvData from '@/data/cv-data.json'

export default function HomePage() {
  const [data] = useState<CVData>(cvData as CVData)

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

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
