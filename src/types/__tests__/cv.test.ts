import { describe, it, expect } from 'vitest'
import { isCVData } from '../cv'

describe('isCVData', () => {
  const validCVData = {
    version: '1.0.0',
    lastUpdated: '2024-01-01T00:00:00Z',
    personalInfo: {
      fullName: 'Test User',
      title: 'Developer',
      email: 'test@example.com',
      location: { city: 'City', country: 'Country', countryCode: 'CC' },
      social: {},
      summary: 'Summary',
      availability: { status: 'available' as const },
    },
    experience: [],
    skills: [],
    education: [],
    certifications: [],
    achievements: [],
    languages: [],
  }

  it('should return true for valid CVData with all required fields', () => {
    expect(isCVData(validCVData)).toBe(true)
  })

  it('should return true for CVData with optional CMS fields', () => {
    const dataWithOptionalFields = {
      ...validCVData,
      siteConfig: { branding: 'Test', version: 'v1' },
      heroStats: [
        { id: '1', value: '10+', label: 'Years', icon: 'terminal', order: 1 },
      ],
      themeConfig: {
        defaultTheme: 'dark',
        allowToggle: true,
        dark: {
          bg: '#000',
          surface: '#111',
          surfaceHover: '#222',
          border: '#333',
          text: '#fff',
          textMuted: '#aaa',
          textDim: '#666',
          accent: '#0f0',
          accentDim: 'rgba(0,255,0,0.1)',
        },
        light: {
          bg: '#fff',
          surface: '#fff',
          surfaceHover: '#f0f0f0',
          border: '#ddd',
          text: '#000',
          textMuted: '#666',
          textDim: '#999',
          accent: '#060',
          accentDim: 'rgba(0,102,0,0.1)',
        },
      },
    }
    expect(isCVData(dataWithOptionalFields)).toBe(true)
  })

  it('should return false for null', () => {
    expect(isCVData(null)).toBe(false)
  })

  it('should return false for undefined', () => {
    expect(isCVData(undefined)).toBe(false)
  })

  it('should return false for non-object types', () => {
    expect(isCVData('string')).toBe(false)
    expect(isCVData(123)).toBe(false)
    expect(isCVData(true)).toBe(false)
    expect(isCVData([])).toBe(false)
  })

  it('should return false for empty object', () => {
    expect(isCVData({})).toBe(false)
  })

  it('should return false when missing required fields', () => {
    const missingVersion = { ...validCVData }
    delete (missingVersion as Record<string, unknown>).version
    expect(isCVData(missingVersion)).toBe(false)

    const missingPersonalInfo = { ...validCVData }
    delete (missingPersonalInfo as Record<string, unknown>).personalInfo
    expect(isCVData(missingPersonalInfo)).toBe(false)

    const missingExperience = { ...validCVData }
    delete (missingExperience as Record<string, unknown>).experience
    expect(isCVData(missingExperience)).toBe(false)

    const missingSkills = { ...validCVData }
    delete (missingSkills as Record<string, unknown>).skills
    expect(isCVData(missingSkills)).toBe(false)

    const missingEducation = { ...validCVData }
    delete (missingEducation as Record<string, unknown>).education
    expect(isCVData(missingEducation)).toBe(false)

    const missingCertifications = { ...validCVData }
    delete (missingCertifications as Record<string, unknown>).certifications
    expect(isCVData(missingCertifications)).toBe(false)

    const missingAchievements = { ...validCVData }
    delete (missingAchievements as Record<string, unknown>).achievements
    expect(isCVData(missingAchievements)).toBe(false)

    const missingLanguages = { ...validCVData }
    delete (missingLanguages as Record<string, unknown>).languages
    expect(isCVData(missingLanguages)).toBe(false)
  })

  it('should return true even with extra unknown fields', () => {
    const dataWithExtra = {
      ...validCVData,
      unknownField: 'some value',
      anotherUnknown: { nested: true },
    }
    expect(isCVData(dataWithExtra)).toBe(true)
  })
})
