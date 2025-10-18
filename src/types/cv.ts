/**
 * CV Data Type Definitions
 *
 * Comprehensive TypeScript interfaces for Arnold Cartagena's CV website data layer.
 * These types ensure type safety across the application and serve as the
 * single source of truth for data structure.
 *
 * @module types/cv
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Proficiency levels for skills (aligned with industry standards)
 */
export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

/**
 * Language proficiency levels (CEFR-aligned)
 */
export enum LanguageProficiency {
  A1 = 'a1', // Beginner
  A2 = 'a2', // Elementary
  B1 = 'b1', // Intermediate
  B2 = 'b2', // Upper Intermediate
  C1 = 'c1', // Advanced
  C2 = 'c2', // Proficient
  NATIVE = 'native',
}

/**
 * Employment types
 */
export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  FREELANCE = 'freelance',
  INTERNSHIP = 'internship',
}

/**
 * Certification status
 */
export enum CertificationStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  IN_PROGRESS = 'in_progress',
}

/**
 * Achievement categories
 */
export enum AchievementCategory {
  AWARD = 'award',
  PUBLICATION = 'publication',
  SPEAKING = 'speaking',
  PROJECT = 'project',
  CONTRIBUTION = 'contribution',
  OTHER = 'other',
}

// ============================================================================
// Base Interfaces
// ============================================================================

/**
 * Personal contact information
 */
export interface PersonalInfo {
  /** Full name */
  fullName: string

  /** Professional title/headline */
  title: string

  /** Professional email address */
  email: string

  /** Phone number (optional, E.164 format recommended) */
  phone?: string

  /** Physical location (city, country) */
  location: {
    city: string
    country: string
    /** ISO 3166-1 alpha-2 country code */
    countryCode: string
  }

  /** Professional website URL */
  website?: string

  /** Social media and professional profiles */
  social: {
    linkedin?: string
    github?: string
    twitter?: string
    /** Additional custom social links */
    [key: string]: string | undefined
  }

  /** Professional summary/bio (markdown supported) */
  summary: string

  /** Profile image URL */
  profileImage?: string

  /** Availability status */
  availability: {
    status: 'available' | 'not_available' | 'open_to_opportunities'
    message?: string
  }
}

/**
 * Work experience entry
 */
export interface Experience {
  /** Unique identifier */
  id: string

  /** Company name */
  company: string

  /** Company website URL */
  companyUrl?: string

  /** Job title */
  position: string

  /** Employment type */
  type: EmploymentType

  /** Start date (ISO 8601) */
  startDate: string

  /** End date (ISO 8601), null if current */
  endDate: string | null

  /** Location of work */
  location: {
    city?: string
    country?: string
    /** Indicates if position is remote */
    remote: boolean
  }

  /** Job description (markdown supported) */
  description: string

  /** Key achievements and accomplishments */
  achievements: string[]

  /** Technologies and skills used */
  technologies: string[]

  /** Display order (lower numbers first) */
  order: number

  /** Whether to highlight this experience */
  featured?: boolean
}

/**
 * Skill entry
 */
export interface Skill {
  /** Skill name */
  name: string

  /** Proficiency level */
  level: SkillLevel

  /** Years of experience (optional) */
  yearsOfExperience?: number

  /** Last used date (ISO 8601) */
  lastUsed?: string

  /** Whether this is a featured/core skill */
  featured?: boolean
}

/**
 * Skill category grouping
 */
export interface SkillCategory {
  /** Category identifier */
  id: string

  /** Category name (e.g., "Frontend", "Backend", "DevOps") */
  name: string

  /** Category description */
  description?: string

  /** Skills in this category */
  skills: Skill[]

  /** Display order */
  order: number

  /** Icon identifier (for UI representation) */
  icon?: string
}

/**
 * Educational qualification
 */
export interface Education {
  /** Unique identifier */
  id: string

  /** Institution name */
  institution: string

  /** Institution website URL */
  institutionUrl?: string

  /** Degree/qualification name */
  degree: string

  /** Field of study */
  field: string

  /** Start date (ISO 8601) */
  startDate: string

  /** End date (ISO 8601), null if in progress */
  endDate: string | null

  /** Grade/GPA (optional) */
  grade?: string

  /** Location */
  location?: {
    city: string
    country: string
  }

  /** Description (markdown supported) */
  description?: string

  /** Relevant coursework or highlights */
  highlights?: string[]

  /** Display order */
  order: number
}

/**
 * Professional certification
 */
export interface Certification {
  /** Unique identifier */
  id: string

  /** Certification name */
  name: string

  /** Issuing organization */
  issuer: string

  /** Issuer website URL */
  issuerUrl?: string

  /** Issue date (ISO 8601) */
  issueDate: string

  /** Expiration date (ISO 8601), null if no expiration */
  expirationDate: string | null

  /** Certification status */
  status: CertificationStatus

  /** Credential ID */
  credentialId?: string

  /** Verification URL */
  credentialUrl?: string

  /** Description */
  description?: string

  /** Display order */
  order: number
}

/**
 * Professional achievement
 */
export interface Achievement {
  /** Unique identifier */
  id: string

  /** Achievement title */
  title: string

  /** Achievement category */
  category: AchievementCategory

  /** Date achieved (ISO 8601) */
  date: string

  /** Issuing organization */
  issuer?: string

  /** Description (markdown supported) */
  description: string

  /** Related URL (article, project, etc.) */
  url?: string

  /** Associated technologies/skills */
  technologies?: string[]

  /** Display order */
  order: number

  /** Whether to highlight this achievement */
  featured?: boolean
}

/**
 * Language proficiency
 */
export interface Language {
  /** Language name */
  name: string

  /** Language code (ISO 639-1) */
  code: string

  /** Proficiency level */
  proficiency: LanguageProficiency

  /** Native language indicator */
  native?: boolean
}

// ============================================================================
// Main CV Data Interface
// ============================================================================

/**
 * Complete CV data structure
 *
 * This is the root interface that encompasses all CV data.
 * All data should validate against this structure.
 */
export interface CVData {
  /** Schema version for migration support */
  version: string

  /** Last updated timestamp (ISO 8601) */
  lastUpdated: string

  /** Personal information */
  personalInfo: PersonalInfo

  /** Work experience */
  experience: Experience[]

  /** Skills organized by categories */
  skills: SkillCategory[]

  /** Educational background */
  education: Education[]

  /** Certifications */
  certifications: Certification[]

  /** Achievements and accolades */
  achievements: Achievement[]

  /** Languages */
  languages: Language[]

  /** Custom metadata */
  metadata?: {
    /** SEO keywords */
    keywords?: string[]
    /** Meta description */
    description?: string
    /** Custom fields */
    [key: string]: unknown
  }
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Partial update payload for CV data sections
 */
export type CVDataPartial = Partial<CVData>

/**
 * CV data without metadata and timestamps (for updates)
 */
export type CVDataInput = Omit<CVData, 'version' | 'lastUpdated' | 'metadata'>

/**
 * Type guard to check if data is valid CVData
 */
export function isCVData(data: unknown): data is CVData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'version' in data &&
    'personalInfo' in data &&
    'experience' in data &&
    'skills' in data &&
    'education' in data &&
    'certifications' in data &&
    'achievements' in data &&
    'languages' in data
  )
}

/**
 * Helper type for date range validation
 */
export interface DateRange {
  startDate: string
  endDate: string | null
}

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    field?: string
    details?: unknown
  }
}
