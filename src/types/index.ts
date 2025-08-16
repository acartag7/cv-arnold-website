export interface PersonalInfo {
  name: string
  title: string
  email: string
  phone: string
  location: string
  linkedin: string
  github?: string
}

export interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  location: string
  responsibilities: string[]
  achievements: string[]
  technologies: string[]
}

export interface Skill {
  name: string
  category: string
  proficiency: number // 1-10
}

export interface Certification {
  name: string
  issuer: string
  date: string
  credentialId?: string
  verificationUrl?: string
  badge?: string
}

export interface Achievement {
  title: string
  description: string
  impact: string
  icon: string
}

export interface CVData {
  personalInfo: PersonalInfo
  summary: string
  experience: Experience[]
  skills: Skill[]
  certifications: Certification[]
  achievements: Achievement[]
  education: {
    institution: string
    degree: string
    period: string
  }[]
  languages: {
    language: string
    proficiency: string
  }[]
}

// Design token system types
export * from './design-tokens'

// Responsive system types
export * from './responsive'

// Typography system types
export * from './typography'
