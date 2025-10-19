/**
 * CV Data Zod Schemas
 *
 * Runtime validation schemas using Zod that mirror the TypeScript interfaces
 * from src/types/cv.ts. These schemas provide runtime type safety and validation
 * with detailed error messages for better developer experience.
 *
 * @module schemas/cv
 */

import { z } from 'zod'

// ============================================================================
// Custom Validators
// ============================================================================

/**
 * ISO 8601 date string validator
 */
const iso8601DateSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)?$/,
    'Must be a valid ISO 8601 date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)'
  )

/**
 * URL validator with common protocols
 */
const urlSchema = z
  .string()
  .url('Must be a valid URL')
  .refine(
    url => {
      try {
        const parsed = new URL(url)
        return ['http:', 'https:'].includes(parsed.protocol)
      } catch {
        return false
      }
    },
    { message: 'URL must use http:// or https:// protocol' }
  )

/**
 * Email validator
 */
const emailSchema = z
  .string()
  .email('Must be a valid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must not exceed 255 characters')

/**
 * ISO 3166-1 alpha-2 country code validator
 * NOTE: Automatically transforms input to uppercase (e.g., 'us' → 'US')
 * This normalization ensures consistent data formatting.
 */
const countryCodeSchema = z
  .string()
  .length(2, 'Country code must be exactly 2 characters (ISO 3166-1 alpha-2)')
  .toUpperCase()

/**
 * ISO 639-1 language code validator
 * NOTE: Automatically transforms input to lowercase (e.g., 'EN' → 'en')
 * This normalization ensures consistent data formatting.
 */
const languageCodeSchema = z
  .string()
  .length(2, 'Language code must be exactly 2 characters (ISO 639-1)')
  .toLowerCase()

/**
 * E.164 phone number format (optional)
 */
const phoneSchema = z
  .string()
  .regex(
    /^\+?[1-9]\d{1,14}$/,
    'Must be a valid phone number (E.164 format recommended)'
  )
  .optional()

// ============================================================================
// Enums
// ============================================================================

/**
 * Proficiency levels for skills (aligned with industry standards)
 */
export const SkillLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
])

/**
 * Language proficiency levels (CEFR-aligned)
 */
export const LanguageProficiencySchema = z.enum([
  'a1',
  'a2',
  'b1',
  'b2',
  'c1',
  'c2',
  'native',
])

/**
 * Employment types
 */
export const EmploymentTypeSchema = z.enum([
  'full_time',
  'part_time',
  'contract',
  'freelance',
  'internship',
])

/**
 * Certification status
 */
export const CertificationStatusSchema = z.enum([
  'active',
  'expired',
  'in_progress',
])

/**
 * Achievement categories
 */
export const AchievementCategorySchema = z.enum([
  'award',
  'publication',
  'speaking',
  'project',
  'contribution',
  'other',
])

/**
 * Availability status
 */
export const AvailabilityStatusSchema = z.enum([
  'available',
  'not_available',
  'open_to_opportunities',
])

// ============================================================================
// Base Schemas
// ============================================================================

/**
 * Personal contact information schema
 */
export const PersonalInfoSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),

  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must not exceed 100 characters'),

  email: emailSchema,

  phone: phoneSchema,

  location: z.object({
    city: z
      .string()
      .min(2, 'City must be at least 2 characters')
      .max(100, 'City must not exceed 100 characters'),
    country: z
      .string()
      .min(2, 'Country must be at least 2 characters')
      .max(100, 'Country must not exceed 100 characters'),
    countryCode: countryCodeSchema,
  }),

  website: urlSchema.optional(),

  social: z
    .object({
      linkedin: urlSchema.optional(),
      github: urlSchema.optional(),
      twitter: urlSchema.optional(),
    })
    .catchall(z.string().url().optional()),

  summary: z
    .string()
    .min(10, 'Summary must be at least 10 characters')
    .max(5000, 'Summary must not exceed 5000 characters'),

  profileImage: urlSchema.optional(),

  availability: z.object({
    status: AvailabilityStatusSchema,
    message: z
      .string()
      .max(500, 'Availability message must not exceed 500 characters')
      .optional(),
  }),
})

/**
 * Work experience entry schema
 */
export const ExperienceSchema = z
  .object({
    id: z.string().min(1, 'Experience ID is required'),

    company: z
      .string()
      .min(1, 'Company name is required')
      .max(200, 'Company name must not exceed 200 characters'),

    companyUrl: urlSchema.optional(),

    position: z
      .string()
      .min(1, 'Position is required')
      .max(200, 'Position must not exceed 200 characters'),

    type: EmploymentTypeSchema,

    startDate: iso8601DateSchema,

    endDate: iso8601DateSchema.nullable(),

    location: z.object({
      city: z
        .string()
        .max(100, 'City must not exceed 100 characters')
        .optional(),
      country: z
        .string()
        .max(100, 'Country must not exceed 100 characters')
        .optional(),
      remote: z.boolean(),
    }),

    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(5000, 'Description must not exceed 5000 characters'),

    achievements: z
      .array(z.string().min(5, 'Achievement must be at least 5 characters'))
      .default([]),

    technologies: z
      .array(z.string().min(1, 'Technology name must not be empty'))
      .default([]),

    order: z.number().int().min(0, 'Order must be a non-negative integer'),

    featured: z.boolean().optional(),
  })
  .refine(
    data => {
      if (!data.endDate) return true
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)
      return start <= end
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    }
  )

/**
 * Skill entry schema
 */
export const SkillSchema = z.object({
  name: z
    .string()
    .min(1, 'Skill name is required')
    .max(100, 'Skill name must not exceed 100 characters'),

  level: SkillLevelSchema,

  yearsOfExperience: z
    .number()
    .int()
    .min(0, 'Years of experience must be non-negative')
    .max(100, 'Years of experience must not exceed 100')
    .optional(),

  lastUsed: iso8601DateSchema.optional(),

  featured: z.boolean().optional(),
})

/**
 * Skill category grouping schema
 */
export const SkillCategorySchema = z.object({
  id: z.string().min(1, 'Category ID is required'),

  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must not exceed 100 characters'),

  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),

  skills: z
    .array(SkillSchema)
    .min(1, 'Category must contain at least one skill'),

  order: z.number().int().min(0, 'Order must be a non-negative integer'),

  icon: z
    .string()
    .max(50, 'Icon identifier must not exceed 50 characters')
    .optional(),
})

/**
 * Educational qualification schema
 */
export const EducationSchema = z
  .object({
    id: z.string().min(1, 'Education ID is required'),

    institution: z
      .string()
      .min(1, 'Institution name is required')
      .max(200, 'Institution name must not exceed 200 characters'),

    institutionUrl: urlSchema.optional(),

    degree: z
      .string()
      .min(1, 'Degree is required')
      .max(200, 'Degree must not exceed 200 characters'),

    field: z
      .string()
      .min(1, 'Field of study is required')
      .max(200, 'Field must not exceed 200 characters'),

    startDate: iso8601DateSchema,

    endDate: iso8601DateSchema.nullable(),

    grade: z.string().max(50, 'Grade must not exceed 50 characters').optional(),

    location: z
      .object({
        city: z.string().max(100, 'City must not exceed 100 characters'),
        country: z.string().max(100, 'Country must not exceed 100 characters'),
      })
      .optional(),

    description: z
      .string()
      .max(2000, 'Description must not exceed 2000 characters')
      .optional(),

    highlights: z
      .array(z.string().min(5, 'Highlight must be at least 5 characters'))
      .optional(),

    order: z.number().int().min(0, 'Order must be a non-negative integer'),
  })
  .refine(
    data => {
      if (!data.endDate) return true
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)
      return start <= end
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    }
  )

/**
 * Professional certification schema
 */
export const CertificationSchema = z
  .object({
    id: z.string().min(1, 'Certification ID is required'),

    name: z
      .string()
      .min(1, 'Certification name is required')
      .max(200, 'Certification name must not exceed 200 characters'),

    issuer: z
      .string()
      .min(1, 'Issuer is required')
      .max(200, 'Issuer must not exceed 200 characters'),

    issuerUrl: urlSchema.optional(),

    issueDate: iso8601DateSchema,

    expirationDate: iso8601DateSchema.nullable(),

    status: CertificationStatusSchema,

    credentialId: z
      .string()
      .max(200, 'Credential ID must not exceed 200 characters')
      .optional(),

    credentialUrl: urlSchema.optional(),

    description: z
      .string()
      .max(1000, 'Description must not exceed 1000 characters')
      .optional(),

    order: z.number().int().min(0, 'Order must be a non-negative integer'),
  })
  .refine(
    data => {
      if (!data.expirationDate) return true
      const issue = new Date(data.issueDate)
      const expiration = new Date(data.expirationDate)
      return issue <= expiration
    },
    {
      message: 'Issue date must be before or equal to expiration date',
      path: ['expirationDate'],
    }
  )

/**
 * Professional achievement schema
 */
export const AchievementSchema = z.object({
  id: z.string().min(1, 'Achievement ID is required'),

  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),

  category: AchievementCategorySchema,

  date: iso8601DateSchema,

  issuer: z
    .string()
    .max(200, 'Issuer must not exceed 200 characters')
    .optional(),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters'),

  url: urlSchema.optional(),

  technologies: z
    .array(z.string().min(1, 'Technology name must not be empty'))
    .optional(),

  order: z.number().int().min(0, 'Order must be a non-negative integer'),

  featured: z.boolean().optional(),
})

/**
 * Language proficiency schema
 */
export const LanguageSchema = z.object({
  name: z
    .string()
    .min(2, 'Language name must be at least 2 characters')
    .max(100, 'Language name must not exceed 100 characters'),

  code: languageCodeSchema,

  proficiency: LanguageProficiencySchema,

  native: z.boolean().optional(),
})

// ============================================================================
// Main CV Data Schema
// ============================================================================

/**
 * Complete CV data structure schema
 *
 * This is the root schema that encompasses all CV data.
 * All data should validate against this structure at runtime.
 */
export const CVDataSchema = z.object({
  version: z
    .string()
    .regex(
      /^\d+\.\d+\.\d+$/,
      'Version must follow semantic versioning (e.g., 1.0.0)'
    ),

  lastUpdated: iso8601DateSchema,

  personalInfo: PersonalInfoSchema,

  experience: z.array(ExperienceSchema).default([]),

  skills: z.array(SkillCategorySchema).default([]),

  education: z.array(EducationSchema).default([]),

  certifications: z.array(CertificationSchema).default([]),

  achievements: z.array(AchievementSchema).default([]),

  languages: z.array(LanguageSchema).default([]),

  metadata: z
    .object({
      keywords: z.array(z.string()).optional(),
      description: z
        .string()
        .max(500, 'Meta description must not exceed 500 characters')
        .optional(),
    })
    .catchall(z.unknown())
    .optional(),
})

// ============================================================================
// Utility Schemas
// ============================================================================

/**
 * Partial update payload schema
 */
export const CVDataPartialSchema = CVDataSchema.partial()

/**
 * CV data input schema (without version, lastUpdated, metadata)
 */
export const CVDataInputSchema = CVDataSchema.omit({
  version: true,
  lastUpdated: true,
  metadata: true,
})

/**
 * Date range schema with validation
 */
export const DateRangeSchema = z
  .object({
    startDate: iso8601DateSchema,
    endDate: iso8601DateSchema.nullable(),
  })
  .refine(
    data => {
      if (!data.endDate) return true
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)
      return start <= end
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    }
  )

/**
 * Validation result schema
 */
export const ValidationResultSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        message: z.string(),
        field: z.string().optional(),
        details: z.unknown().optional(),
      })
      .optional(),
  })

// ============================================================================
// Type Inference from Schemas
// ============================================================================

/**
 * Inferred types from Zod schemas (alternative to importing from types/cv.ts)
 * These can be used when you want runtime-validated types
 */
export type SkillLevel = z.infer<typeof SkillLevelSchema>
export type LanguageProficiency = z.infer<typeof LanguageProficiencySchema>
export type EmploymentType = z.infer<typeof EmploymentTypeSchema>
export type CertificationStatus = z.infer<typeof CertificationStatusSchema>
export type AchievementCategory = z.infer<typeof AchievementCategorySchema>
export type AvailabilityStatus = z.infer<typeof AvailabilityStatusSchema>

export type PersonalInfo = z.infer<typeof PersonalInfoSchema>
export type Experience = z.infer<typeof ExperienceSchema>
export type Skill = z.infer<typeof SkillSchema>
export type SkillCategory = z.infer<typeof SkillCategorySchema>
export type Education = z.infer<typeof EducationSchema>
export type Certification = z.infer<typeof CertificationSchema>
export type Achievement = z.infer<typeof AchievementSchema>
export type Language = z.infer<typeof LanguageSchema>
export type CVData = z.infer<typeof CVDataSchema>
export type CVDataPartial = z.infer<typeof CVDataPartialSchema>
export type CVDataInput = z.infer<typeof CVDataInputSchema>
export type DateRange = z.infer<typeof DateRangeSchema>

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validates CV data and returns a typed result
 *
 * @param data - The data to validate
 * @returns Validation result with typed data or error
 *
 * @example
 * ```typescript
 * const result = validateCVData(unknownData)
 * if (result.success) {
 *   console.log(result.data) // Typed as CVData
 * } else {
 *   console.error(result.error)
 * }
 * ```
 */
export function validateCVData(data: unknown): {
  success: boolean
  data?: CVData
  error?: { message: string; details?: unknown }
} {
  const result = CVDataSchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return {
    success: false,
    error: {
      message: 'CV data validation failed',
      details: result.error.format(),
    },
  }
}

/**
 * Validates and throws on error (useful for parsing trusted data)
 *
 * @param data - The data to parse
 * @returns Typed CV data
 * @throws {z.ZodError} If validation fails
 *
 * @example
 * ```typescript
 * try {
 *   const cvData = parseCVData(jsonData)
 *   // cvData is typed as CVData
 * } catch (error) {
 *   if (error instanceof z.ZodError) {
 *     console.error('Validation failed:', error.format())
 *   }
 * }
 * ```
 */
export function parseCVData(data: unknown): CVData {
  return CVDataSchema.parse(data)
}

/**
 * Validates partial CV data updates
 *
 * @param data - The partial data to validate
 * @returns Validation result with typed partial data or error
 */
export function validateCVDataPartial(data: unknown): {
  success: boolean
  data?: CVDataPartial
  error?: { message: string; details?: unknown }
} {
  const result = CVDataPartialSchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return {
    success: false,
    error: {
      message: 'Partial CV data validation failed',
      details: result.error.format(),
    },
  }
}
