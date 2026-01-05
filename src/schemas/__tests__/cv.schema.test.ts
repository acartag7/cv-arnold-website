/**
 * Comprehensive tests for CV Zod schemas
 * Tests all validators, schemas, edge cases, and helper functions
 */

import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
  // Enums
  SkillLevelSchema,
  LanguageProficiencySchema,
  EmploymentTypeSchema,
  CertificationStatusSchema,
  AchievementCategorySchema,
  AvailabilityStatusSchema,
  // Schemas
  PersonalInfoSchema,
  ExperienceSchema,
  SkillSchema,
  CertificationSchema,
  LanguageSchema,
  CVDataSchema,
  DateRangeSchema,
  // Configuration Schemas
  ColorPaletteSchema,
  ThemeConfigSchema,
  SiteConfigSchema,
  HeroStatSchema,
  SectionTitlesSchema,
  FeaturedHighlightSchema,
  // Helper functions
  validateCVData,
  parseCVData,
  validateCVDataPartial,
} from '../cv.schema'

// ============================================================================
// Custom Validator Tests
// ============================================================================

describe('ISO 8601 Date Validation', () => {
  const ExampleSchema = z.object({ date: CVDataSchema.shape.lastUpdated })

  it('should accept valid date-only format (YYYY-MM-DD)', () => {
    expect(ExampleSchema.parse({ date: '2024-01-15' })).toEqual({
      date: '2024-01-15',
    })
  })

  it('should accept valid datetime format with milliseconds', () => {
    expect(ExampleSchema.parse({ date: '2024-01-15T10:30:00.000Z' })).toEqual({
      date: '2024-01-15T10:30:00.000Z',
    })
  })

  it('should reject invalid month (13)', () => {
    expect(() => ExampleSchema.parse({ date: '2024-13-15' })).toThrow()
  })

  it('should reject invalid day (32)', () => {
    expect(() => ExampleSchema.parse({ date: '2024-01-32' })).toThrow()
  })

  it('should reject invalid date like Feb 30', () => {
    expect(() => ExampleSchema.parse({ date: '2024-02-30' })).toThrow()
  })

  it('should accept leap year Feb 29', () => {
    expect(ExampleSchema.parse({ date: '2024-02-29' })).toEqual({
      date: '2024-02-29',
    })
  })

  it('should reject non-leap year Feb 29', () => {
    expect(() => ExampleSchema.parse({ date: '2023-02-29' })).toThrow()
  })

  it('should reject malformed format', () => {
    expect(() => ExampleSchema.parse({ date: '2024/01/15' })).toThrow()
    expect(() => ExampleSchema.parse({ date: '15-01-2024' })).toThrow()
  })
})

describe('URL Validation', () => {
  const ExampleSchema = z.object({ url: PersonalInfoSchema.shape.website })

  it('should accept valid https URL', () => {
    expect(ExampleSchema.parse({ url: 'https://example.com' })).toEqual({
      url: 'https://example.com',
    })
  })

  it('should accept valid http URL', () => {
    expect(ExampleSchema.parse({ url: 'http://example.com' })).toEqual({
      url: 'http://example.com',
    })
  })

  it('should accept URL with path and query params', () => {
    expect(
      ExampleSchema.parse({ url: 'https://example.com/path?foo=bar' })
    ).toBeDefined()
  })

  it('should reject ftp:// protocol', () => {
    expect(() => ExampleSchema.parse({ url: 'ftp://example.com' })).toThrow(
      /protocol/
    )
  })

  it('should reject URL without protocol', () => {
    expect(() => ExampleSchema.parse({ url: 'example.com' })).toThrow()
  })

  it('should accept optional URL as undefined', () => {
    expect(ExampleSchema.parse({})).toEqual({})
  })
})

describe('Email Validation', () => {
  const ExampleSchema = z.object({ email: PersonalInfoSchema.shape.email })

  it('should accept valid email', () => {
    expect(ExampleSchema.parse({ email: 'test@example.com' })).toEqual({
      email: 'test@example.com',
    })
  })

  it('should reject email without @', () => {
    expect(() => ExampleSchema.parse({ email: 'testexample.com' })).toThrow()
  })

  it('should reject email without domain', () => {
    expect(() => ExampleSchema.parse({ email: 'test@' })).toThrow()
  })

  it('should reject email shorter than 5 characters', () => {
    expect(() => ExampleSchema.parse({ email: 'a@b' })).toThrow(/5 characters/)
  })

  it('should reject email longer than 255 characters', () => {
    const longEmail = 'a'.repeat(250) + '@b.com'
    expect(() => ExampleSchema.parse({ email: longEmail })).toThrow(/255/)
  })
})

describe('Country Code Validation', () => {
  const ExampleSchema = z.object({
    code: PersonalInfoSchema.shape.location.shape.countryCode,
  })

  it('should accept valid country code and transform to uppercase', () => {
    expect(ExampleSchema.parse({ code: 'us' })).toEqual({ code: 'US' })
    expect(ExampleSchema.parse({ code: 'Us' })).toEqual({ code: 'US' })
  })

  it('should reject country code not exactly 2 characters', () => {
    expect(() => ExampleSchema.parse({ code: 'USA' })).toThrow(/2 characters/)
    expect(() => ExampleSchema.parse({ code: 'U' })).toThrow(/2 characters/)
  })
})

describe('Language Code Validation', () => {
  const ExampleSchema = z.object({
    code: LanguageSchema.shape.code,
  })

  it('should accept valid language code and transform to lowercase', () => {
    expect(ExampleSchema.parse({ code: 'EN' })).toEqual({ code: 'en' })
    expect(ExampleSchema.parse({ code: 'En' })).toEqual({ code: 'en' })
  })

  it('should reject language code not exactly 2 characters', () => {
    expect(() => ExampleSchema.parse({ code: 'ENG' })).toThrow(/2 characters/)
    expect(() => ExampleSchema.parse({ code: 'E' })).toThrow(/2 characters/)
  })
})

describe('Phone Number Validation', () => {
  const ExampleSchema = z.object({ phone: PersonalInfoSchema.shape.phone })

  it('should accept valid E.164 format with +', () => {
    expect(ExampleSchema.parse({ phone: '+12025551234' })).toEqual({
      phone: '+12025551234',
    })
  })

  it('should accept valid E.164 format without +', () => {
    expect(ExampleSchema.parse({ phone: '12025551234' })).toEqual({
      phone: '12025551234',
    })
  })

  it('should reject phone starting with 0', () => {
    expect(() => ExampleSchema.parse({ phone: '0123456789' })).toThrow()
  })

  it('should reject phone with letters', () => {
    expect(() => ExampleSchema.parse({ phone: '+1-202-555-ABCD' })).toThrow()
  })

  it('should accept optional phone as undefined', () => {
    expect(ExampleSchema.parse({})).toEqual({})
  })
})

// ============================================================================
// Enum Schema Tests
// ============================================================================

describe('Enum Schemas', () => {
  describe('SkillLevelSchema', () => {
    it.each([
      ['beginner', true],
      ['intermediate', true],
      ['advanced', true],
      ['expert', true],
      ['master', false],
      ['novice', false],
    ])('should validate "%s" as %s', (level, isValid) => {
      if (isValid) {
        expect(SkillLevelSchema.parse(level)).toBe(level)
      } else {
        expect(() => SkillLevelSchema.parse(level)).toThrow()
      }
    })
  })

  describe('LanguageProficiencySchema', () => {
    it.each([
      ['native', true],
      ['c2', true],
      ['c1', true],
      ['b2', true],
      ['b1', true],
      ['a2', true],
      ['a1', true],
      ['d1', false],
      ['e1', false],
    ])('should validate "%s" as %s', (proficiency, isValid) => {
      if (isValid) {
        expect(LanguageProficiencySchema.parse(proficiency)).toBe(proficiency)
      } else {
        expect(() => LanguageProficiencySchema.parse(proficiency)).toThrow()
      }
    })
  })

  describe('EmploymentTypeSchema', () => {
    it.each([
      ['full_time', true],
      ['part_time', true],
      ['contract', true],
      ['freelance', true],
      ['internship', true],
      ['full-time', false],
      ['part-time', false],
    ])('should validate "%s" as %s', (type, isValid) => {
      if (isValid) {
        expect(EmploymentTypeSchema.parse(type)).toBe(type)
      } else {
        expect(() => EmploymentTypeSchema.parse(type)).toThrow()
      }
    })
  })

  describe('CertificationStatusSchema', () => {
    it.each([
      ['active', true],
      ['expired', true],
      ['pending', false],
      ['revoked', false],
    ])('should validate "%s" as %s', (status, isValid) => {
      if (isValid) {
        expect(CertificationStatusSchema.parse(status)).toBe(status)
      } else {
        expect(() => CertificationStatusSchema.parse(status)).toThrow()
      }
    })
  })

  describe('AchievementCategorySchema', () => {
    it.each([
      ['award', true],
      ['publication', true],
      ['project', true],
      ['contribution', true],
      ['bonus', false],
      ['prize', false],
    ])('should validate "%s" as %s', (category, isValid) => {
      if (isValid) {
        expect(AchievementCategorySchema.parse(category)).toBe(category)
      } else {
        expect(() => AchievementCategorySchema.parse(category)).toThrow()
      }
    })
  })

  describe('AvailabilityStatusSchema', () => {
    it.each([
      ['available', true],
      ['not_available', true],
      ['open_to_opportunities', true],
      ['maybe', false],
      ['unavailable', false],
    ])('should validate "%s" as %s', (status, isValid) => {
      if (isValid) {
        expect(AvailabilityStatusSchema.parse(status)).toBe(status)
      } else {
        expect(() => AvailabilityStatusSchema.parse(status)).toThrow()
      }
    })
  })
})

// ============================================================================
// Date Range Validation Tests
// ============================================================================

describe('Date Range Validation', () => {
  it('should accept valid date range (start before end)', () => {
    expect(
      DateRangeSchema.parse({
        startDate: '2020-01-01',
        endDate: '2024-01-01',
      })
    ).toBeDefined()
  })

  it('should accept same start and end date', () => {
    expect(
      DateRangeSchema.parse({
        startDate: '2024-01-01',
        endDate: '2024-01-01',
      })
    ).toBeDefined()
  })

  it('should accept null endDate (ongoing)', () => {
    expect(
      DateRangeSchema.parse({
        startDate: '2024-01-01',
        endDate: null,
      })
    ).toBeDefined()
  })

  it('should reject start date after end date', () => {
    expect(() =>
      DateRangeSchema.parse({
        startDate: '2024-01-01',
        endDate: '2020-01-01',
      })
    ).toThrow(/Start date must be before or equal to end date/)
  })
})

describe('Experience Date Range Validation', () => {
  const validExperience = {
    id: 'exp1',
    company: 'Test Company',
    position: 'Developer',
    type: 'full_time' as const,
    startDate: '2020-01-01',
    endDate: '2024-01-01',
    location: { city: 'SF', country: 'USA', remote: false },
    description: 'A great experience working here.',
    order: 0,
  }

  it('should accept valid experience with date range', () => {
    expect(ExperienceSchema.parse(validExperience)).toBeDefined()
  })

  it('should reject experience with invalid date range', () => {
    expect(() =>
      ExperienceSchema.parse({
        ...validExperience,
        startDate: '2024-01-01',
        endDate: '2020-01-01',
      })
    ).toThrow(/Start date must be before or equal/)
  })
})

// ============================================================================
// Schema Object Tests
// ============================================================================

describe('PersonalInfoSchema', () => {
  const validPersonalInfo = {
    fullName: 'John Doe',
    title: 'Software Engineer',
    email: 'john@example.com',
    location: {
      city: 'San Francisco',
      country: 'United States',
      countryCode: 'us',
    },
    social: {},
    summary: 'Experienced developer with 10+ years in tech.',
    availability: {
      status: 'available' as const,
    },
  }

  it('should accept valid personal info', () => {
    const result = PersonalInfoSchema.parse(validPersonalInfo)
    expect(result.location.countryCode).toBe('US') // Uppercase transformation
  })

  it('should reject fullName shorter than 2 characters', () => {
    expect(() =>
      PersonalInfoSchema.parse({ ...validPersonalInfo, fullName: 'J' })
    ).toThrow(/2 characters/)
  })

  it('should reject summary shorter than 10 characters', () => {
    expect(() =>
      PersonalInfoSchema.parse({ ...validPersonalInfo, summary: 'Short' })
    ).toThrow(/10 characters/)
  })
})

describe('SkillSchema', () => {
  const validSkill = {
    name: 'TypeScript',
    level: 'expert' as const,
  }

  it('should accept valid skill', () => {
    expect(SkillSchema.parse(validSkill)).toBeDefined()
  })

  it('should reject yearsOfExperience > 100', () => {
    expect(() =>
      SkillSchema.parse({ ...validSkill, yearsOfExperience: 150 })
    ).toThrow(/100/)
  })

  it('should reject negative yearsOfExperience', () => {
    expect(() =>
      SkillSchema.parse({ ...validSkill, yearsOfExperience: -5 })
    ).toThrow(/non-negative/)
  })
})

describe('LanguageSchema', () => {
  const validLanguage = {
    name: 'English',
    code: 'EN',
    proficiency: 'native' as const,
  }

  it('should accept valid language and transform code to lowercase', () => {
    const result = LanguageSchema.parse(validLanguage)
    expect(result.code).toBe('en')
  })

  it('should reject invalid proficiency level', () => {
    expect(() =>
      LanguageSchema.parse({ ...validLanguage, proficiency: 'fluent' })
    ).toThrow()
  })
})

describe('CertificationSchema', () => {
  const validCertification = {
    id: 'cert1',
    name: 'AWS Solutions Architect',
    issuer: 'Amazon Web Services',
    issueDate: '2020-01-01',
    expirationDate: '2023-01-01',
    status: 'expired' as const,
    order: 0,
  }

  it('should accept valid certification', () => {
    expect(CertificationSchema.parse(validCertification)).toBeDefined()
  })

  it('should reject certification with issue date after expiration', () => {
    expect(() =>
      CertificationSchema.parse({
        ...validCertification,
        issueDate: '2023-01-01',
        expirationDate: '2020-01-01',
      })
    ).toThrow(/Issue date must be before or equal/)
  })
})

// ============================================================================
// Main CVData Schema Tests
// ============================================================================

describe('CVDataSchema', () => {
  const minimalValidCV = {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    personalInfo: {
      fullName: 'John Doe',
      title: 'Developer',
      email: 'john@example.com',
      location: {
        city: 'SF',
        country: 'USA',
        countryCode: 'us',
      },
      social: {},
      summary: 'A passionate developer.',
      availability: { status: 'available' as const },
    },
  }

  it('should accept minimal valid CV data', () => {
    expect(CVDataSchema.parse(minimalValidCV)).toBeDefined()
  })

  it('should reject invalid semantic version', () => {
    expect(() =>
      CVDataSchema.parse({ ...minimalValidCV, version: '1.0' })
    ).toThrow(/semantic versioning/)
  })

  it('should apply defaults for optional arrays', () => {
    const result = CVDataSchema.parse(minimalValidCV)
    expect(result.experience).toEqual([])
    expect(result.skills).toEqual([])
    expect(result.education).toEqual([])
  })
})

// ============================================================================
// Helper Function Tests
// ============================================================================

describe('validateCVData', () => {
  it('should return success for valid data', () => {
    const validData = {
      version: '1.0.0',
      lastUpdated: '2024-01-15',
      personalInfo: {
        fullName: 'John Doe',
        title: 'Developer',
        email: 'john@example.com',
        location: { city: 'SF', country: 'USA', countryCode: 'us' },
        social: {},
        summary: 'A passionate developer.',
        availability: { status: 'available' },
      },
    }

    const result = validateCVData(validData)
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(result.error).toBeUndefined()
  })

  it('should return error for invalid data', () => {
    const invalidData = { version: 'invalid' }

    const result = validateCVData(invalidData)
    expect(result.success).toBe(false)
    expect(result.data).toBeUndefined()
    expect(result.error).toBeDefined()
    expect(result.error?.message).toContain('validation failed')
  })
})

describe('parseCVData', () => {
  it('should return data for valid input', () => {
    const validData = {
      version: '1.0.0',
      lastUpdated: '2024-01-15',
      personalInfo: {
        fullName: 'John Doe',
        title: 'Developer',
        email: 'john@example.com',
        location: { city: 'SF', country: 'USA', countryCode: 'us' },
        social: {},
        summary: 'A passionate developer.',
        availability: { status: 'available' },
      },
    }

    const result = parseCVData(validData)
    expect(result).toBeDefined()
    expect(result.version).toBe('1.0.0')
  })

  it('should throw ZodError for invalid input', () => {
    expect(() => parseCVData({ version: 'invalid' })).toThrow(z.ZodError)
  })
})

describe('validateCVDataPartial', () => {
  it('should accept partial CV data', () => {
    const partialData = { version: '2.0.0' }

    const result = validateCVDataPartial(partialData)
    expect(result.success).toBe(true)
    expect(result.data?.version).toBe('2.0.0')
  })

  it('should reject invalid partial data', () => {
    const invalidPartial = { version: 'not-semver' }

    const result = validateCVDataPartial(invalidPartial)
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})

// ============================================================================
// Configuration Schema Tests
// ============================================================================

describe('CSS Color Validation', () => {
  const TestSchema = z.object({ color: ColorPaletteSchema.shape.bg })

  it.each([
    ['#fff', true],
    ['#ffffff', true],
    ['#FFFFFF', true],
    ['#ffffffaa', true],
    ['rgb(255, 255, 255)', true],
    ['rgba(255, 255, 255, 0.5)', true],
    ['hsl(0, 0%, 100%)', true],
    ['hsla(0, 0%, 100%, 0.5)', true],
    ['var(--my-color)', true],
    ['white', true],
    ['transparent', true],
    ['not-a-color', false],
    ['#gg0000', false],
    ['rgb()', false],
  ])('should validate CSS color "%s" as %s', (color, isValid) => {
    if (isValid) {
      expect(() => TestSchema.parse({ color })).not.toThrow()
    } else {
      expect(() => TestSchema.parse({ color })).toThrow(/Invalid CSS color/)
    }
  })
})

describe('ColorPaletteSchema', () => {
  const validPalette = {
    bg: '#1a1a2e',
    surface: '#16213e',
    surfaceHover: '#1f3a5f',
    border: '#0f3460',
    text: '#e4e4e7',
    textMuted: '#a1a1aa',
    textDim: '#71717a',
    accent: '#00ff88',
    accentDim: '#00cc6a',
  }

  it('should accept valid color palette', () => {
    expect(ColorPaletteSchema.parse(validPalette)).toBeDefined()
  })

  it('should reject palette with missing fields', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { bg, ...incomplete } = validPalette
    expect(() => ColorPaletteSchema.parse(incomplete)).toThrow()
  })

  it('should reject palette with invalid color values', () => {
    expect(() =>
      ColorPaletteSchema.parse({ ...validPalette, bg: 'not-a-color' })
    ).toThrow(/Invalid CSS color/)
  })

  it('should accept CSS variables in palette', () => {
    expect(
      ColorPaletteSchema.parse({
        ...validPalette,
        bg: 'var(--background)',
        accent: 'var(--accent-color)',
      })
    ).toBeDefined()
  })
})

describe('ThemeConfigSchema', () => {
  const validPalette = {
    bg: '#1a1a2e',
    surface: '#16213e',
    surfaceHover: '#1f3a5f',
    border: '#0f3460',
    text: '#e4e4e7',
    textMuted: '#a1a1aa',
    textDim: '#71717a',
    accent: '#00ff88',
    accentDim: '#00cc6a',
  }

  const validThemeConfig = {
    defaultTheme: 'dark' as const,
    allowToggle: true,
    dark: validPalette,
    light: { ...validPalette, bg: '#ffffff', text: '#1a1a2e' },
  }

  it('should accept valid theme config', () => {
    expect(ThemeConfigSchema.parse(validThemeConfig)).toBeDefined()
  })

  it('should accept theme config with activePreset', () => {
    expect(
      ThemeConfigSchema.parse({ ...validThemeConfig, activePreset: 'green' })
    ).toBeDefined()
    expect(
      ThemeConfigSchema.parse({ ...validThemeConfig, activePreset: 'custom' })
    ).toBeDefined()
  })

  it.each([['dark'], ['light'], ['system']])(
    'should accept defaultTheme "%s"',
    theme => {
      expect(
        ThemeConfigSchema.parse({
          ...validThemeConfig,
          defaultTheme: theme,
        })
      ).toBeDefined()
    }
  )

  it('should reject invalid defaultTheme', () => {
    expect(() =>
      ThemeConfigSchema.parse({ ...validThemeConfig, defaultTheme: 'auto' })
    ).toThrow()
  })

  it('should accept any string for activePreset (references preset key)', () => {
    // activePreset is a string that references a key in the presets object
    expect(
      ThemeConfigSchema.parse({ ...validThemeConfig, activePreset: 'red' })
    ).toBeDefined()
    expect(
      ThemeConfigSchema.parse({
        ...validThemeConfig,
        activePreset: 'my-custom-theme',
      })
    ).toBeDefined()
  })

  it('should accept theme config without palettes (uses presets instead)', () => {
    // dark/light palettes are optional when using presets
    const minimalConfig = {
      defaultTheme: 'dark' as const,
      allowToggle: true,
    }
    expect(ThemeConfigSchema.parse(minimalConfig)).toBeDefined()
  })

  it('should accept theme config with presets', () => {
    const configWithPresets = {
      defaultTheme: 'dark' as const,
      allowToggle: true,
      activePreset: 'terminal',
      presets: {
        terminal: {
          id: 'terminal',
          name: 'Terminal',
          dark: validPalette,
          light: { ...validPalette, bg: '#ffffff', text: '#1a1a2e' },
        },
      },
    }
    expect(ThemeConfigSchema.parse(configWithPresets)).toBeDefined()
  })
})

describe('SiteConfigSchema', () => {
  const validSiteConfig = {
    branding: 'My CV',
    version: '1.0.0',
  }

  it('should accept minimal valid site config', () => {
    expect(SiteConfigSchema.parse(validSiteConfig)).toBeDefined()
  })

  it('should accept site config with all optional fields', () => {
    const fullConfig = {
      ...validSiteConfig,
      navLinks: [
        { label: 'Home', href: '/' },
        { label: 'GitHub', href: 'https://github.com', external: true },
      ],
      footerText: '© 2024 My Name',
      seo: {
        title: 'My CV',
        description: 'Professional CV',
        keywords: ['developer', 'engineer'],
        ogImage: 'https://example.com/og.png',
      },
    }
    expect(SiteConfigSchema.parse(fullConfig)).toBeDefined()
  })

  it('should reject branding exceeding 100 characters', () => {
    expect(() =>
      SiteConfigSchema.parse({
        ...validSiteConfig,
        branding: 'x'.repeat(101),
      })
    ).toThrow(/100/)
  })

  it('should reject version exceeding 50 characters', () => {
    expect(() =>
      SiteConfigSchema.parse({
        ...validSiteConfig,
        version: 'x'.repeat(51),
      })
    ).toThrow(/50/)
  })

  it('should reject footerText exceeding 500 characters', () => {
    expect(() =>
      SiteConfigSchema.parse({
        ...validSiteConfig,
        footerText: 'x'.repeat(501),
      })
    ).toThrow(/500/)
  })
})

describe('HeroStatSchema', () => {
  const validHeroStat = {
    id: 'stat-1',
    value: '10+',
    label: 'Years Experience',
    icon: 'terminal' as const,
    order: 0,
  }

  it('should accept valid hero stat', () => {
    expect(HeroStatSchema.parse(validHeroStat)).toBeDefined()
  })

  it.each([
    'terminal',
    'shield',
    'cloud',
    'server',
    'code',
    'award',
    'users',
    'briefcase',
    'star',
    'trophy',
  ])('should accept icon "%s"', icon => {
    expect(HeroStatSchema.parse({ ...validHeroStat, icon })).toBeDefined()
  })

  it('should reject invalid icon', () => {
    expect(() =>
      HeroStatSchema.parse({ ...validHeroStat, icon: 'rocket' })
    ).toThrow()
  })

  it('should reject value exceeding 50 characters', () => {
    expect(() =>
      HeroStatSchema.parse({ ...validHeroStat, value: 'x'.repeat(51) })
    ).toThrow(/50/)
  })

  it('should reject label exceeding 100 characters', () => {
    expect(() =>
      HeroStatSchema.parse({ ...validHeroStat, label: 'x'.repeat(101) })
    ).toThrow(/100/)
  })

  it('should reject negative order', () => {
    expect(() =>
      HeroStatSchema.parse({ ...validHeroStat, order: -1 })
    ).toThrow()
  })

  it('should reject non-integer order', () => {
    expect(() =>
      HeroStatSchema.parse({ ...validHeroStat, order: 1.5 })
    ).toThrow()
  })
})

describe('SectionTitlesSchema', () => {
  const validSectionTitles = {
    heroPath: 'My Journey',
    experience: 'Experience',
    skills: 'Skills',
    certifications: 'Certifications',
    contact: 'Contact',
  }

  it('should accept minimal valid section titles', () => {
    expect(SectionTitlesSchema.parse(validSectionTitles)).toBeDefined()
  })

  it('should accept section titles with all optional fields', () => {
    const fullTitles = {
      ...validSectionTitles,
      languages: 'Languages',
      education: 'Education',
      achievements: 'Achievements',
    }
    expect(SectionTitlesSchema.parse(fullTitles)).toBeDefined()
  })

  it('should reject title exceeding 100 characters', () => {
    expect(() =>
      SectionTitlesSchema.parse({
        ...validSectionTitles,
        heroPath: 'x'.repeat(101),
      })
    ).toThrow(/100/)
  })

  it('should reject missing required fields', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { heroPath, ...incomplete } = validSectionTitles
    expect(() => SectionTitlesSchema.parse(incomplete)).toThrow()
  })
})

describe('FeaturedHighlightSchema', () => {
  const validHighlight = {
    id: 'highlight-1',
    title: 'AWS Solutions Architect',
    subtitle: 'Professional certification',
    icon: 'award' as const,
    section: 'certifications' as const,
    enabled: true,
  }

  it('should accept valid featured highlight', () => {
    expect(FeaturedHighlightSchema.parse(validHighlight)).toBeDefined()
  })

  it.each(['award', 'shield', 'star', 'trophy'])(
    'should accept icon "%s"',
    icon => {
      expect(
        FeaturedHighlightSchema.parse({ ...validHighlight, icon })
      ).toBeDefined()
    }
  )

  it.each(['certifications', 'achievements', 'experience'])(
    'should accept section "%s"',
    section => {
      expect(
        FeaturedHighlightSchema.parse({ ...validHighlight, section })
      ).toBeDefined()
    }
  )

  it('should reject invalid icon', () => {
    expect(() =>
      FeaturedHighlightSchema.parse({ ...validHighlight, icon: 'medal' })
    ).toThrow()
  })

  it('should reject invalid section', () => {
    expect(() =>
      FeaturedHighlightSchema.parse({ ...validHighlight, section: 'projects' })
    ).toThrow()
  })

  it('should reject title exceeding 100 characters', () => {
    expect(() =>
      FeaturedHighlightSchema.parse({
        ...validHighlight,
        title: 'x'.repeat(101),
      })
    ).toThrow(/100/)
  })

  it('should reject subtitle exceeding 200 characters', () => {
    expect(() =>
      FeaturedHighlightSchema.parse({
        ...validHighlight,
        subtitle: 'x'.repeat(201),
      })
    ).toThrow(/200/)
  })

  it('should require enabled to be boolean', () => {
    expect(() =>
      FeaturedHighlightSchema.parse({ ...validHighlight, enabled: 'true' })
    ).toThrow()
  })
})

describe('CVDataSchema with configuration fields', () => {
  const minimalValidCV = {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    personalInfo: {
      fullName: 'John Doe',
      title: 'Developer',
      email: 'john@example.com',
      location: {
        city: 'SF',
        country: 'USA',
        countryCode: 'us',
      },
      social: {},
      summary: 'A passionate developer.',
      availability: { status: 'available' as const },
    },
  }

  const validPalette = {
    bg: '#1a1a2e',
    surface: '#16213e',
    surfaceHover: '#1f3a5f',
    border: '#0f3460',
    text: '#e4e4e7',
    textMuted: '#a1a1aa',
    textDim: '#71717a',
    accent: '#00ff88',
    accentDim: '#00cc6a',
  }

  it('should accept CV with themeConfig', () => {
    const cvWithTheme = {
      ...minimalValidCV,
      themeConfig: {
        defaultTheme: 'dark' as const,
        allowToggle: true,
        dark: validPalette,
        light: validPalette,
      },
    }
    const result = CVDataSchema.parse(cvWithTheme)
    expect(result.themeConfig).toBeDefined()
    expect(result.themeConfig?.defaultTheme).toBe('dark')
  })

  it('should accept CV with siteConfig', () => {
    const cvWithSite = {
      ...minimalValidCV,
      siteConfig: {
        branding: 'My CV',
        version: '1.0.0',
      },
    }
    const result = CVDataSchema.parse(cvWithSite)
    expect(result.siteConfig).toBeDefined()
    expect(result.siteConfig?.branding).toBe('My CV')
  })

  it('should accept CV with heroStats array', () => {
    const cvWithStats = {
      ...minimalValidCV,
      heroStats: [
        {
          id: 'stat-1',
          value: '10+',
          label: 'Years',
          icon: 'terminal' as const,
          order: 0,
        },
      ],
    }
    const result = CVDataSchema.parse(cvWithStats)
    expect(result.heroStats).toHaveLength(1)
  })

  it('should accept CV with sectionTitles', () => {
    const cvWithTitles = {
      ...minimalValidCV,
      sectionTitles: {
        heroPath: 'Journey',
        experience: 'Work',
        skills: 'Tech Stack',
        certifications: 'Certs',
        contact: 'Get in Touch',
      },
    }
    const result = CVDataSchema.parse(cvWithTitles)
    expect(result.sectionTitles).toBeDefined()
  })

  it('should accept CV with featuredHighlights array', () => {
    const cvWithHighlights = {
      ...minimalValidCV,
      featuredHighlights: [
        {
          id: 'hl-1',
          title: 'Featured',
          subtitle: 'Subtitle',
          icon: 'star' as const,
          section: 'achievements' as const,
          enabled: true,
        },
      ],
    }
    const result = CVDataSchema.parse(cvWithHighlights)
    expect(result.featuredHighlights).toHaveLength(1)
  })

  it('should preserve all config fields (regression test for Zod stripping)', () => {
    const fullCV = {
      ...minimalValidCV,
      themeConfig: {
        defaultTheme: 'dark' as const,
        allowToggle: true,
        activePreset: 'green' as const,
        dark: validPalette,
        light: validPalette,
      },
      siteConfig: {
        branding: 'My CV',
        version: '1.0.0',
        footerText: '© 2024',
      },
      heroStats: [
        {
          id: 's1',
          value: '10+',
          label: 'Years',
          icon: 'terminal' as const,
          order: 0,
        },
      ],
      sectionTitles: {
        heroPath: 'Journey',
        experience: 'Work',
        skills: 'Skills',
        certifications: 'Certs',
        languages: 'Languages',
        education: 'Education',
        achievements: 'Achievements',
        contact: 'Contact',
      },
      featuredHighlights: [
        {
          id: 'h1',
          title: 'AWS Pro',
          subtitle: 'Certification',
          icon: 'award' as const,
          section: 'certifications' as const,
          enabled: true,
        },
      ],
    }

    const result = CVDataSchema.parse(fullCV)

    // All config fields should be preserved
    expect(result.themeConfig).toBeDefined()
    expect(result.themeConfig?.activePreset).toBe('green')
    expect(result.siteConfig).toBeDefined()
    expect(result.siteConfig?.footerText).toBe('© 2024')
    expect(result.heroStats).toHaveLength(1)
    expect(result.sectionTitles?.languages).toBe('Languages')
    expect(result.sectionTitles?.education).toBe('Education')
    expect(result.sectionTitles?.achievements).toBe('Achievements')
    expect(result.featuredHighlights).toHaveLength(1)
  })
})
