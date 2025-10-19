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
  it('should validate SkillLevelSchema', () => {
    expect(SkillLevelSchema.parse('beginner')).toBe('beginner')
    expect(SkillLevelSchema.parse('expert')).toBe('expert')
    expect(() => SkillLevelSchema.parse('master')).toThrow()
  })

  it('should validate LanguageProficiencySchema', () => {
    expect(LanguageProficiencySchema.parse('native')).toBe('native')
    expect(LanguageProficiencySchema.parse('c2')).toBe('c2')
    expect(() => LanguageProficiencySchema.parse('d1')).toThrow()
  })

  it('should validate EmploymentTypeSchema', () => {
    expect(EmploymentTypeSchema.parse('full_time')).toBe('full_time')
    expect(() => EmploymentTypeSchema.parse('full-time')).toThrow()
  })

  it('should validate CertificationStatusSchema', () => {
    expect(CertificationStatusSchema.parse('active')).toBe('active')
    expect(() => CertificationStatusSchema.parse('pending')).toThrow()
  })

  it('should validate AchievementCategorySchema', () => {
    expect(AchievementCategorySchema.parse('award')).toBe('award')
    expect(() => AchievementCategorySchema.parse('bonus')).toThrow()
  })

  it('should validate AvailabilityStatusSchema', () => {
    expect(AvailabilityStatusSchema.parse('available')).toBe('available')
    expect(() => AvailabilityStatusSchema.parse('maybe')).toThrow()
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
