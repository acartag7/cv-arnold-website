/**
 * Mock Data Service
 *
 * Generates realistic CV data for development and testing purposes.
 * All generated data passes Zod schema validation.
 *
 * Features:
 * - Singleton pattern for consistent data across application
 * - Seniority level variations (junior, mid, senior, principal)
 * - Edge case data for testing (long text, special characters, unicode)
 * - Seeded random generation for reproducibility
 *
 * @module services/MockDataService
 */

import { faker } from '@faker-js/faker'
import type {
  CVData,
  PersonalInfo,
  Experience,
  SkillCategory,
  Education,
  Certification,
  Achievement,
  Language,
  SkillLevel,
  LanguageProficiency,
  EmploymentType,
  CertificationStatus,
  AchievementCategory,
  AvailabilityStatus,
} from '@/schemas/cv.schema'
import { CVDataSchema } from '@/schemas/cv.schema'

/**
 * Seniority level for CV generation
 */
export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'principal'

/**
 * Options for mock CV generation
 */
export interface MockCVOptions {
  /** Seniority level (affects experience years, skills, etc.) */
  seniorityLevel?: SeniorityLevel
  /** Seed for reproducible random generation */
  seed?: number
  /** Include edge case data (long text, special characters) */
  includeEdgeCases?: boolean
}

/**
 * Seniority profile configuration
 */
interface SeniorityProfile {
  yearsOfExperience: { min: number; max: number }
  jobCount: { min: number; max: number }
  skillLevels: SkillLevel[]
  certificationCount: { min: number; max: number }
  achievementCount: { min: number; max: number }
  educationCount: { min: number; max: number }
}

/**
 * Mock Data Service
 *
 * Singleton service for generating realistic CV data
 */
export class MockDataService {
  private static instance: MockDataService

  private seniorityProfiles: Record<SeniorityLevel, SeniorityProfile> = {
    junior: {
      yearsOfExperience: { min: 1, max: 3 },
      jobCount: { min: 1, max: 2 },
      skillLevels: ['beginner', 'intermediate'],
      certificationCount: { min: 0, max: 2 },
      achievementCount: { min: 1, max: 3 },
      educationCount: { min: 1, max: 1 },
    },
    mid: {
      yearsOfExperience: { min: 4, max: 7 },
      jobCount: { min: 3, max: 5 },
      skillLevels: ['intermediate', 'advanced'],
      certificationCount: { min: 1, max: 4 },
      achievementCount: { min: 3, max: 6 },
      educationCount: { min: 1, max: 2 },
    },
    senior: {
      yearsOfExperience: { min: 8, max: 15 },
      jobCount: { min: 5, max: 8 },
      skillLevels: ['advanced', 'expert'],
      certificationCount: { min: 2, max: 6 },
      achievementCount: { min: 5, max: 10 },
      educationCount: { min: 1, max: 2 },
    },
    principal: {
      yearsOfExperience: { min: 15, max: 25 },
      jobCount: { min: 8, max: 12 },
      skillLevels: ['expert'],
      certificationCount: { min: 4, max: 8 },
      achievementCount: { min: 8, max: 15 },
      educationCount: { min: 1, max: 3 },
    },
  }

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService()
    }
    return MockDataService.instance
  }

  /**
   * Generate a complete mock CV
   *
   * @param options - Generation options
   * @returns Complete CV data that passes Zod validation
   *
   * @example
   * ```typescript
   * const mockService = MockDataService.getInstance()
   * const juniorCV = mockService.generateMockCV({ seniorityLevel: 'junior' })
   * const reproducibleCV = mockService.generateMockCV({ seed: 12345 })
   * ```
   */
  public generateMockCV(options: MockCVOptions = {}): CVData {
    const { seniorityLevel = 'mid', seed, includeEdgeCases = false } = options

    // Set seed for reproducible generation
    if (seed !== undefined) {
      faker.seed(seed)
    }

    const profile = this.seniorityProfiles[seniorityLevel]
    const currentDate = new Date()

    const cvData: CVData = {
      version: '1.0.0',
      lastUpdated: currentDate.toISOString().split('T')[0] as string,
      personalInfo: this.generatePersonalInfo(includeEdgeCases),
      experience: this.generateExperience(
        profile,
        currentDate,
        includeEdgeCases
      ),
      skills: this.generateSkills(profile),
      education: this.generateEducation(profile, currentDate),
      certifications: this.generateCertifications(profile, currentDate),
      achievements: this.generateAchievements(profile, currentDate),
      languages: this.generateLanguages(),
      metadata: {
        keywords: this.generateKeywords(),
        description: faker.lorem.sentence({ min: 10, max: 20 }),
      },
    }

    // Validate generated data
    const validationResult = CVDataSchema.safeParse(cvData)
    if (!validationResult.success) {
      throw new Error(
        `Generated mock data failed validation: ${JSON.stringify(validationResult.error.format())}`
      )
    }

    return validationResult.data
  }

  /**
   * Generate personal information
   */
  private generatePersonalInfo(includeEdgeCases: boolean): PersonalInfo {
    const firstName = includeEdgeCases
      ? 'François-René' // Unicode and special chars
      : faker.person.firstName()

    const lastName = includeEdgeCases
      ? "O'Connor-Müller" // Apostrophe and umlaut
      : faker.person.lastName()

    const city = includeEdgeCases
      ? 'São Paulo' // Unicode character
      : faker.location.city()

    const country = includeEdgeCases
      ? "Côte d'Ivoire" // Unicode and apostrophe
      : faker.location.country()

    const summary = includeEdgeCases
      ? faker.lorem.paragraphs(5, '\n\n') // Long text (edge case)
      : faker.lorem.paragraph({ min: 3, max: 5 })

    return {
      fullName: `${firstName} ${lastName}`,
      title: faker.person.jobTitle(),
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      phone: `+${faker.number.int({ min: 1, max: 9 })}${faker.string.numeric(11)}`,
      location: {
        city,
        country,
        countryCode: faker.location.countryCode('alpha-2') as string,
      },
      website:
        faker.helpers.maybe(() => faker.internet.url(), { probability: 0.7 }) ||
        undefined,
      social: {
        linkedin:
          faker.helpers.maybe(
            () =>
              `https://linkedin.com/in/${faker.internet.username().toLowerCase()}`,
            { probability: 0.9 }
          ) || undefined,
        github:
          faker.helpers.maybe(
            () =>
              `https://github.com/${faker.internet.username().toLowerCase()}`,
            { probability: 0.8 }
          ) || undefined,
        twitter:
          faker.helpers.maybe(
            () =>
              `https://twitter.com/${faker.internet.username().toLowerCase()}`,
            { probability: 0.5 }
          ) || undefined,
      },
      summary,
      profileImage:
        faker.helpers.maybe(() => faker.image.avatar(), { probability: 0.8 }) ||
        undefined,
      availability: {
        status: faker.helpers.arrayElement([
          'available',
          'not_available',
          'open_to_opportunities',
        ] as AvailabilityStatus[]),
        message:
          faker.helpers.maybe(() => faker.lorem.sentence(), {
            probability: 0.6,
          }) || undefined,
      },
    }
  }

  /**
   * Generate work experience entries
   */
  private generateExperience(
    profile: SeniorityProfile,
    currentDate: Date,
    includeEdgeCases: boolean
  ): Experience[] {
    const count = faker.number.int(profile.jobCount)
    const experiences: Experience[] = []

    let endDate = currentDate

    for (let i = 0; i < count; i++) {
      const isCurrent =
        i === 0 && faker.helpers.maybe(() => true, { probability: 0.7 })
      const yearsInRole = faker.number.int({ min: 1, max: 4 })

      const startDate = new Date(endDate)
      startDate.setFullYear(startDate.getFullYear() - yearsInRole)

      const company =
        includeEdgeCases && i === 0
          ? 'Société Générale & Co.' // Special characters
          : faker.company.name()

      const position =
        includeEdgeCases && i === 0
          ? 'Senior Software Engineer / Technical Lead' // Long title
          : faker.person.jobTitle()

      const description =
        includeEdgeCases && i === 0
          ? faker.lorem.paragraphs(4, '\n\n') // Long description (edge case)
          : faker.lorem.paragraph({ min: 2, max: 4 })

      experiences.push({
        id: faker.string.uuid(),
        company,
        companyUrl:
          faker.helpers.maybe(() => faker.internet.url(), {
            probability: 0.7,
          }) || undefined,
        position,
        type: faker.helpers.arrayElement([
          'full_time',
          'part_time',
          'contract',
          'freelance',
        ] as EmploymentType[]),
        startDate: startDate.toISOString().split('T')[0] as string,
        endDate: isCurrent
          ? null
          : (endDate.toISOString().split('T')[0] as string),
        location: {
          city:
            faker.helpers.maybe(() => faker.location.city(), {
              probability: 0.8,
            }) || undefined,
          country:
            faker.helpers.maybe(() => faker.location.country(), {
              probability: 0.8,
            }) || undefined,
          remote: faker.datatype.boolean(),
        },
        description,
        achievements: Array.from(
          { length: faker.number.int({ min: 2, max: 6 }) },
          () => faker.lorem.sentence({ min: 8, max: 15 })
        ),
        technologies: Array.from(
          { length: faker.number.int({ min: 3, max: 10 }) },
          () =>
            faker.helpers.arrayElement([
              'TypeScript',
              'React',
              'Node.js',
              'Python',
              'AWS',
              'Docker',
              'PostgreSQL',
              'GraphQL',
              'Next.js',
              'Kubernetes',
            ])
        ),
        order: i,
        featured: i < 3,
      })

      // Set next job's end date (with possible gap)
      if (!isCurrent) {
        endDate = new Date(startDate)
        if (faker.helpers.maybe(() => true, { probability: 0.3 })) {
          // Add employment gap
          endDate.setMonth(
            endDate.getMonth() - faker.number.int({ min: 1, max: 6 })
          )
        }
      }
    }

    return experiences
  }

  /**
   * Generate skill categories
   */
  private generateSkills(profile: SeniorityProfile): SkillCategory[] {
    const categories = [
      {
        name: 'Programming Languages',
        icon: 'code',
        skills: ['TypeScript', 'JavaScript', 'Python', 'Java', 'Go'],
      },
      {
        name: 'Frontend Development',
        icon: 'desktop',
        skills: ['React', 'Next.js', 'Vue.js', 'HTML/CSS', 'Tailwind CSS'],
      },
      {
        name: 'Backend Development',
        icon: 'server',
        skills: ['Node.js', 'Express', 'PostgreSQL', 'GraphQL', 'REST APIs'],
      },
      {
        name: 'DevOps & Cloud',
        icon: 'cloud',
        skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
      },
    ]

    return categories.map((category, index) => ({
      id: faker.string.uuid(),
      name: category.name,
      description: faker.lorem.sentence(),
      skills: category.skills.map(skillName => ({
        name: skillName,
        level: faker.helpers.arrayElement(profile.skillLevels),
        yearsOfExperience: faker.number.int({
          min: Math.max(1, profile.yearsOfExperience.min - 2),
          max: profile.yearsOfExperience.max,
        }),
        lastUsed:
          faker.helpers.maybe(
            () => faker.date.recent({ days: 365 }).toISOString().split('T')[0],
            { probability: 0.7 }
          ) || undefined,
        featured: faker.datatype.boolean(),
      })),
      order: index,
      icon: category.icon,
    }))
  }

  /**
   * Generate education entries
   */
  private generateEducation(
    profile: SeniorityProfile,
    currentDate: Date
  ): Education[] {
    const count = faker.number.int(profile.educationCount)
    const educations: Education[] = []

    let endDate = new Date(currentDate)
    endDate.setFullYear(endDate.getFullYear() - profile.yearsOfExperience.min)

    for (let i = 0; i < count; i++) {
      const yearsDuration = i === 0 ? 4 : faker.number.int({ min: 2, max: 4 })
      const startDate = new Date(endDate)
      startDate.setFullYear(startDate.getFullYear() - yearsDuration)

      const degrees =
        i === 0
          ? [
              'Bachelor of Science',
              'Bachelor of Arts',
              'Bachelor of Engineering',
            ]
          : ['Master of Science', 'MBA', 'Ph.D.']

      educations.push({
        id: faker.string.uuid(),
        institution: faker.company.name() + ' University',
        institutionUrl:
          faker.helpers.maybe(() => faker.internet.url(), {
            probability: 0.8,
          }) || undefined,
        degree: faker.helpers.arrayElement(degrees),
        field: faker.helpers.arrayElement([
          'Computer Science',
          'Software Engineering',
          'Information Technology',
          'Data Science',
        ]),
        startDate: startDate.toISOString().split('T')[0] as string,
        endDate: endDate.toISOString().split('T')[0] as string,
        grade:
          faker.helpers.maybe(
            () =>
              faker.helpers.arrayElement([
                '3.8 GPA',
                'First Class Honours',
                'Distinction',
              ]),
            { probability: 0.6 }
          ) || undefined,
        location: {
          city: faker.location.city(),
          country: faker.location.country(),
        },
        description:
          faker.helpers.maybe(() => faker.lorem.paragraph(), {
            probability: 0.5,
          }) || undefined,
        highlights:
          faker.helpers.maybe(
            () =>
              Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () =>
                faker.lorem.sentence({ min: 5, max: 10 })
              ),
            { probability: 0.6 }
          ) || undefined,
        order: i,
      })

      endDate = new Date(startDate)
      endDate.setFullYear(endDate.getFullYear() - 1)
    }

    return educations
  }

  /**
   * Generate certifications
   */
  private generateCertifications(
    profile: SeniorityProfile,
    currentDate: Date
  ): Certification[] {
    const count = faker.number.int(profile.certificationCount)
    const certifications: Certification[] = []

    const certNames = [
      'AWS Certified Solutions Architect',
      'Google Cloud Professional',
      'Certified Kubernetes Administrator',
      'Microsoft Azure Developer',
      'Professional Scrum Master',
      'CISSP Security Certification',
    ]

    for (let i = 0; i < count; i++) {
      const issueDate = faker.date.past({ years: 3 })
      const hasExpiration = faker.datatype.boolean()
      const expirationDate = hasExpiration
        ? new Date(issueDate.getTime() + 365 * 3 * 24 * 60 * 60 * 1000) // 3 years
        : null

      const status: CertificationStatus = !hasExpiration
        ? 'active'
        : expirationDate && expirationDate > currentDate
          ? 'active'
          : 'expired'

      certifications.push({
        id: faker.string.uuid(),
        name: faker.helpers.arrayElement(certNames),
        issuer: faker.company.name(),
        issuerUrl: faker.internet.url(),
        issueDate: issueDate.toISOString().split('T')[0] as string,
        expirationDate: expirationDate?.toISOString().split('T')[0] || null,
        status,
        credentialId:
          faker.helpers.maybe(
            () => faker.string.alphanumeric(12).toUpperCase(),
            {
              probability: 0.8,
            }
          ) || undefined,
        credentialUrl:
          faker.helpers.maybe(() => faker.internet.url(), {
            probability: 0.7,
          }) || undefined,
        description:
          faker.helpers.maybe(() => faker.lorem.paragraph(), {
            probability: 0.6,
          }) || undefined,
        order: i,
      })
    }

    return certifications
  }

  /**
   * Generate achievements
   */
  private generateAchievements(
    profile: SeniorityProfile,
    currentDate: Date
  ): Achievement[] {
    const count = faker.number.int(profile.achievementCount)
    const achievements: Achievement[] = []

    const categories: AchievementCategory[] = [
      'award',
      'publication',
      'speaking',
      'project',
      'contribution',
    ]

    for (let i = 0; i < count; i++) {
      const date = faker.date.past({ years: 5 })

      achievements.push({
        id: faker.string.uuid(),
        title: faker.lorem.sentence({ min: 3, max: 8 }),
        category: faker.helpers.arrayElement(categories),
        date: date.toISOString().split('T')[0] as string,
        issuer:
          faker.helpers.maybe(() => faker.company.name(), {
            probability: 0.6,
          }) || undefined,
        description: faker.lorem.paragraph({ min: 2, max: 4 }),
        url:
          faker.helpers.maybe(() => faker.internet.url(), {
            probability: 0.5,
          }) || undefined,
        technologies:
          faker.helpers.maybe(
            () =>
              Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () =>
                faker.helpers.arrayElement([
                  'React',
                  'TypeScript',
                  'AWS',
                  'Docker',
                  'GraphQL',
                ])
              ),
            { probability: 0.7 }
          ) || undefined,
        order: i,
        featured: i < 5,
      })
    }

    return achievements
  }

  /**
   * Generate languages
   */
  private generateLanguages(): Language[] {
    // Native language (always included)
    const nativeLanguage: Language = {
      name: 'English',
      code: 'en',
      proficiency: 'native' as LanguageProficiency,
      native: true,
    }

    const additionalLanguages = [
      { name: 'Spanish', code: 'es', proficiency: 'c1' as LanguageProficiency },
      { name: 'French', code: 'fr', proficiency: 'b2' as LanguageProficiency },
      { name: 'German', code: 'de', proficiency: 'b1' as LanguageProficiency },
      { name: 'Chinese', code: 'zh', proficiency: 'a2' as LanguageProficiency },
    ]

    const additionalCount = faker.number.int({ min: 1, max: 3 })
    const selectedAdditional = faker.helpers.arrayElements(
      additionalLanguages,
      additionalCount
    )

    return [nativeLanguage, ...selectedAdditional]
  }

  /**
   * Generate SEO keywords
   */
  private generateKeywords(): string[] {
    return [
      'Software Engineer',
      'Full Stack Developer',
      'TypeScript',
      'React',
      'Node.js',
      'AWS',
      'Cloud Architecture',
      'DevOps',
    ]
  }
}

/**
 * Export singleton instance for convenience
 */
export const mockDataService = MockDataService.getInstance()
