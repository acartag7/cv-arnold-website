# Current/Original Design - Implementation Guide

This design direction uses modular section components with CSS variables for theming.

## Design Characteristics

- **Style**: Clean, professional, component-based
- **Theme**: CSS variables with light/dark mode support
- **Layout**: Centered hero with contact chips, section-based structure
- **Components**: Modular sections (Hero, Experience, Skills, Certifications, Contact)

## File Structure

The current design uses these key files:

```
src/
├── app/page.tsx                    # Main page composition
├── components/
│   ├── layout/
│   │   ├── Header.tsx              # Navigation header
│   │   └── Footer.tsx              # Site footer
│   └── sections/
│       ├── HeroSection.tsx         # Hero with contact chips
│       ├── ExperienceSection.tsx   # Work experience
│       ├── SkillsSection.tsx       # Skills grid
│       ├── CertificationsSection.tsx # Certifications
│       └── ContactSection.tsx      # Contact section
└── styles/tokens.css               # CSS variables
```

## To Restore This Design

1. Replace `src/app/page.tsx` with this content:

```tsx
'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
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

      <main id="main-content">
        <HeroSection data={data} />
        <ExperienceSection data={data} />
        <SkillsSection data={data} />
        <CertificationsSection data={data} />
        <ContactSection data={data} />
      </main>

      <Footer
        name={data.personalInfo.fullName}
        title={data.personalInfo.title}
        socialLinks={data.personalInfo.social}
        email={data.personalInfo.email}
      />
    </div>
  )
}
```

2. Ensure CSS variables are set in `tokens.css`:

```css
:root {
  --background: #ffffff;
  --surface: #f8fafc;
  --text: #0f172a;
  --text-muted: #64748b;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --color-border: #e2e8f0;
}

[data-theme='dark'] {
  --background: #0f172a;
  --surface: #1e293b;
  --text: #f8fafc;
  --text-muted: #94a3b8;
  --primary: #60a5fa;
  --primary-hover: #3b82f6;
  --color-border: #334155;
}
```

## Key Features

- Modular section components
- CSS variables for easy theming
- Responsive grid layouts
- Framer Motion animations
- Accessible with proper semantic HTML
- Print-friendly styles

## Best For

- Traditional CV/resume format
- Professional/corporate roles
- ATS-friendly structure
- Easy content updates via section components
