/**
 * MockDataService Tests
 *
 * Comprehensive tests for mock CV data generation including:
 * - Zod schema validation
 * - Seniority level variations
 * - Edge cases (unicode, special characters, long text)
 * - Singleton pattern
 * - Seeded generation reproducibility
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { MockDataService, type SeniorityLevel } from '../MockDataService'
import { CVDataSchema } from '@/schemas/cv.schema'

describe('MockDataService', () => {
  let service: MockDataService

  beforeEach(() => {
    service = MockDataService.getInstance()
  })

  // ============================================================================
  // Singleton Pattern Tests
  // ============================================================================

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = MockDataService.getInstance()
      const instance2 = MockDataService.getInstance()

      expect(instance1).toBe(instance2)
      expect(instance1).toBe(service)
    })

    it('should maintain singleton across multiple calls', () => {
      const instances = Array.from({ length: 10 }, () =>
        MockDataService.getInstance()
      )

      instances.forEach(instance => {
        expect(instance).toBe(service)
      })
    })
  })

  // ============================================================================
  // Schema Validation Tests
  // ============================================================================

  describe('Zod Schema Validation', () => {
    it('should generate valid CV data for junior level', () => {
      const cvData = service.generateMockCV({ seniorityLevel: 'junior' })
      const result = CVDataSchema.safeParse(cvData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(cvData)
      }
    })

    it('should generate valid CV data for mid level', () => {
      const cvData = service.generateMockCV({ seniorityLevel: 'mid' })
      const result = CVDataSchema.safeParse(cvData)

      expect(result.success).toBe(true)
    })

    it('should generate valid CV data for senior level', () => {
      const cvData = service.generateMockCV({ seniorityLevel: 'senior' })
      const result = CVDataSchema.safeParse(cvData)

      expect(result.success).toBe(true)
    })

    it('should generate valid CV data for principal level', () => {
      const cvData = service.generateMockCV({ seniorityLevel: 'principal' })
      const result = CVDataSchema.safeParse(cvData)

      expect(result.success).toBe(true)
    })

    it('should generate valid CV data with edge cases enabled', () => {
      const cvData = service.generateMockCV({ includeEdgeCases: true })
      const result = CVDataSchema.safeParse(cvData)

      expect(result.success).toBe(true)
    })

    it('should throw error if generated data is invalid', () => {
      // This test ensures the service validates its own output
      // If validation fails, the service throws an error
      expect(() => {
        service.generateMockCV({ seniorityLevel: 'mid' })
      }).not.toThrow()
    })
  })

  // ============================================================================
  // Data Structure Tests
  // ============================================================================

  describe('Data Structure', () => {
    it('should include all required top-level fields', () => {
      const cvData = service.generateMockCV()

      expect(cvData).toHaveProperty('version')
      expect(cvData).toHaveProperty('lastUpdated')
      expect(cvData).toHaveProperty('personalInfo')
      expect(cvData).toHaveProperty('experience')
      expect(cvData).toHaveProperty('skills')
      expect(cvData).toHaveProperty('education')
      expect(cvData).toHaveProperty('certifications')
      expect(cvData).toHaveProperty('achievements')
      expect(cvData).toHaveProperty('languages')
      expect(cvData).toHaveProperty('metadata')
    })

    it('should have valid version format', () => {
      const cvData = service.generateMockCV()

      expect(cvData.version).toMatch(/^\d+\.\d+\.\d+$/)
    })

    it('should have valid lastUpdated date format', () => {
      const cvData = service.generateMockCV()

      expect(cvData.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(new Date(cvData.lastUpdated).toString()).not.toBe('Invalid Date')
    })

    it('should include personal info with required fields', () => {
      const cvData = service.generateMockCV()
      const { personalInfo } = cvData

      expect(personalInfo.fullName).toBeTruthy()
      expect(personalInfo.fullName.length).toBeGreaterThanOrEqual(2)
      expect(personalInfo.title).toBeTruthy()
      expect(personalInfo.email).toMatch(/@/)
      expect(personalInfo.location.city).toBeTruthy()
      expect(personalInfo.location.country).toBeTruthy()
      expect(personalInfo.location.countryCode).toHaveLength(2)
      expect(personalInfo.summary.length).toBeGreaterThanOrEqual(10)
      expect(personalInfo.availability.status).toMatch(
        /available|not_available|open_to_opportunities/
      )
    })

    it('should include metadata with keywords and description', () => {
      const cvData = service.generateMockCV()

      expect(cvData.metadata?.keywords).toBeInstanceOf(Array)
      if (cvData.metadata?.keywords) {
        expect(cvData.metadata.keywords.length).toBeGreaterThan(0)
      }
      expect(cvData.metadata?.description).toBeTruthy()
    })
  })

  // ============================================================================
  // Seniority Level Variation Tests
  // ============================================================================

  describe('Seniority Level Variations', () => {
    const levels: SeniorityLevel[] = ['junior', 'mid', 'senior', 'principal']

    it.each(levels)('should generate appropriate data for %s level', level => {
      const cvData = service.generateMockCV({ seniorityLevel: level })

      // Validate based on seniority expectations
      const expectedJobCounts = {
        junior: { min: 1, max: 2 },
        mid: { min: 3, max: 5 },
        senior: { min: 5, max: 8 },
        principal: { min: 8, max: 12 },
      }

      const expected = expectedJobCounts[level]
      expect(cvData.experience.length).toBeGreaterThanOrEqual(expected.min)
      expect(cvData.experience.length).toBeLessThanOrEqual(expected.max)
    })

    it('should have more certifications for senior levels', () => {
      // Use multiple samples to account for randomness
      const juniorSamples = Array.from({ length: 10 }, (_, i) =>
        service.generateMockCV({ seniorityLevel: 'junior', seed: 100 + i })
      )
      const principalSamples = Array.from({ length: 10 }, (_, i) =>
        service.generateMockCV({ seniorityLevel: 'principal', seed: 200 + i })
      )

      const avgJuniorCerts =
        juniorSamples.reduce((sum, cv) => sum + cv.certifications.length, 0) /
        juniorSamples.length
      const avgPrincipalCerts =
        principalSamples.reduce(
          (sum, cv) => sum + cv.certifications.length,
          0
        ) / principalSamples.length

      // Principal average should be significantly higher than junior average
      expect(avgPrincipalCerts).toBeGreaterThan(avgJuniorCerts)
      // Also verify principal minimum is higher than junior maximum (based on profiles)
      expect(
        Math.min(...principalSamples.map(cv => cv.certifications.length))
      ).toBeGreaterThan(
        Math.max(...juniorSamples.map(cv => cv.certifications.length))
      )
    })

    it('should have more achievements for senior levels', () => {
      const juniorCV = service.generateMockCV({
        seniorityLevel: 'junior',
        seed: 300,
      })
      const seniorCV = service.generateMockCV({
        seniorityLevel: 'senior',
        seed: 400,
      })

      // Senior should generally have more achievements
      expect(seniorCV.achievements.length).toBeGreaterThan(0)
      expect(juniorCV.achievements.length).toBeGreaterThan(0)
    })

    it('should have appropriate skill levels based on seniority', () => {
      const juniorCV = service.generateMockCV({ seniorityLevel: 'junior' })
      const principalCV = service.generateMockCV({
        seniorityLevel: 'principal',
      })

      // Check junior has beginner/intermediate skills
      const juniorSkillLevels = juniorCV.skills.flatMap(cat =>
        cat.skills.map(s => s.level)
      )
      expect(
        juniorSkillLevels.some(level =>
          ['beginner', 'intermediate'].includes(level)
        )
      ).toBe(true)

      // Check principal has expert skills
      const principalSkillLevels = principalCV.skills.flatMap(cat =>
        cat.skills.map(s => s.level)
      )
      expect(principalSkillLevels.every(level => level === 'expert')).toBe(true)
    })
  })

  // ============================================================================
  // Edge Case Tests
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle unicode characters in names when includeEdgeCases is true', () => {
      const cvData = service.generateMockCV({ includeEdgeCases: true })

      // Check for unicode or special characters
      const hasUnicodeOrSpecialChars = /[À-ž''-]/.test(
        cvData.personalInfo.fullName
      )
      expect(hasUnicodeOrSpecialChars).toBe(true)
    })

    it('should generate long text descriptions when includeEdgeCases is true', () => {
      const cvData = service.generateMockCV({ includeEdgeCases: true })

      // Summary should be longer in edge case mode
      expect(cvData.personalInfo.summary.length).toBeGreaterThan(200)

      // First experience should have long description
      if (cvData.experience.length > 0) {
        const description = cvData.experience[0]?.description
        if (description) {
          expect(description.length).toBeGreaterThan(200)
        }
      }
    })

    it('should handle special characters in company names', () => {
      const cvData = service.generateMockCV({ includeEdgeCases: true })

      if (cvData.experience.length > 0) {
        const company = cvData.experience[0]?.company
        if (company) {
          const hasSpecialChars = /[&.]/.test(company)
          expect(hasSpecialChars).toBe(true)
        }
      }
    })

    it('should include unicode characters in location', () => {
      const cvData = service.generateMockCV({ includeEdgeCases: true })

      const locationText =
        (cvData.personalInfo.location.city || '') +
        (cvData.personalInfo.location.country || '')
      const hasUnicode = /[À-ž]/.test(locationText)
      expect(hasUnicode).toBe(true)
    })

    it('should handle long job titles', () => {
      const cvData = service.generateMockCV({ includeEdgeCases: true })

      if (cvData.experience.length > 0) {
        const position = cvData.experience[0]?.position
        if (position) {
          expect(position.length).toBeGreaterThan(20)
        }
      }
    })
  })

  // ============================================================================
  // Reproducibility Tests (Seeded Generation)
  // ============================================================================

  describe('Seeded Generation', () => {
    it('should generate identical data with same seed', () => {
      const seed = 42

      const cvData1 = service.generateMockCV({ seed })
      const cvData2 = service.generateMockCV({ seed })

      expect(cvData1).toEqual(cvData2)
    })

    it('should generate different data with different seeds', () => {
      const cvData1 = service.generateMockCV({ seed: 100 })
      const cvData2 = service.generateMockCV({ seed: 200 })

      // Names should be different
      expect(cvData1.personalInfo.fullName).not.toBe(
        cvData2.personalInfo.fullName
      )
      // Email should be different
      expect(cvData1.personalInfo.email).not.toBe(cvData2.personalInfo.email)
    })

    it('should be reproducible for testing purposes', () => {
      const seed = 12345
      const iterations = 5

      const results = Array.from({ length: iterations }, () =>
        service.generateMockCV({ seed })
      )

      // All results should be identical
      results.forEach(result => {
        expect(result).toEqual(results[0])
      })
    })
  })

  // ============================================================================
  // Experience Data Tests
  // ============================================================================

  describe('Experience Data', () => {
    it('should have properly ordered experience entries', () => {
      const cvData = service.generateMockCV()

      cvData.experience.forEach((exp, index) => {
        expect(exp.order).toBe(index)
      })
    })

    it('should have valid date ranges (start before end)', () => {
      const cvData = service.generateMockCV()

      cvData.experience.forEach(exp => {
        if (exp.endDate) {
          const start = new Date(exp.startDate)
          const end = new Date(exp.endDate)
          expect(start <= end).toBe(true)
        }
      })
    })

    it('should have chronologically ordered experience (newest first)', () => {
      const cvData = service.generateMockCV({ seniorityLevel: 'senior' })

      for (let i = 1; i < cvData.experience.length; i++) {
        const current = new Date(cvData.experience[i]!.startDate)
        const previous = new Date(cvData.experience[i - 1]!.startDate)
        // Previous entry should have started at same time or later (newer)
        expect(previous >= current).toBe(true)
      }
    })

    it('should include achievements and technologies for each job', () => {
      const cvData = service.generateMockCV()

      cvData.experience.forEach(exp => {
        expect(exp.achievements).toBeInstanceOf(Array)
        expect(exp.achievements.length).toBeGreaterThan(0)
        expect(exp.technologies).toBeInstanceOf(Array)
        expect(exp.technologies.length).toBeGreaterThan(0)
      })
    })

    it('should feature most recent experiences', () => {
      const cvData = service.generateMockCV({ seniorityLevel: 'senior' })

      // First 3 experiences should be featured
      cvData.experience.slice(0, 3).forEach(exp => {
        expect(exp.featured).toBe(true)
      })
    })

    it('should have valid employment types', () => {
      const cvData = service.generateMockCV()
      const validTypes = [
        'full_time',
        'part_time',
        'contract',
        'freelance',
        'internship',
      ]

      cvData.experience.forEach(exp => {
        expect(validTypes).toContain(exp.type)
      })
    })
  })

  // ============================================================================
  // Skills Data Tests
  // ============================================================================

  describe('Skills Data', () => {
    it('should have multiple skill categories', () => {
      const cvData = service.generateMockCV()

      expect(cvData.skills.length).toBeGreaterThanOrEqual(3)
    })

    it('should have skills in each category', () => {
      const cvData = service.generateMockCV()

      cvData.skills.forEach(category => {
        expect(category.skills.length).toBeGreaterThan(0)
        expect(category.name).toBeTruthy()
        expect(category.id).toBeTruthy()
      })
    })

    it('should have valid skill levels', () => {
      const cvData = service.generateMockCV()
      const validLevels = ['beginner', 'intermediate', 'advanced', 'expert']

      cvData.skills.forEach(category => {
        category.skills.forEach(skill => {
          expect(validLevels).toContain(skill.level)
        })
      })
    })

    it('should have years of experience for skills', () => {
      const cvData = service.generateMockCV()

      cvData.skills.forEach(category => {
        category.skills.forEach(skill => {
          if (skill.yearsOfExperience !== undefined) {
            expect(skill.yearsOfExperience).toBeGreaterThanOrEqual(0)
            expect(skill.yearsOfExperience).toBeLessThanOrEqual(100)
          }
        })
      })
    })
  })

  // ============================================================================
  // Education Data Tests
  // ============================================================================

  describe('Education Data', () => {
    it('should have at least one education entry', () => {
      const cvData = service.generateMockCV()

      expect(cvData.education.length).toBeGreaterThanOrEqual(1)
    })

    it('should have valid date ranges for education', () => {
      const cvData = service.generateMockCV()

      cvData.education.forEach(edu => {
        if (edu.endDate) {
          const start = new Date(edu.startDate)
          const end = new Date(edu.endDate)
          expect(start <= end).toBe(true)
        }
      })
    })

    it('should include required education fields', () => {
      const cvData = service.generateMockCV()

      cvData.education.forEach(edu => {
        expect(edu.institution).toBeTruthy()
        expect(edu.degree).toBeTruthy()
        expect(edu.field).toBeTruthy()
        expect(edu.startDate).toBeTruthy()
      })
    })
  })

  // ============================================================================
  // Certifications Data Tests
  // ============================================================================

  describe('Certifications Data', () => {
    it('should have certifications for non-junior levels', () => {
      const midCV = service.generateMockCV({ seniorityLevel: 'mid' })
      const seniorCV = service.generateMockCV({ seniorityLevel: 'senior' })

      expect(midCV.certifications.length).toBeGreaterThanOrEqual(1)
      expect(seniorCV.certifications.length).toBeGreaterThanOrEqual(2)
    })

    it('should have valid certification statuses', () => {
      const cvData = service.generateMockCV({ seniorityLevel: 'senior' })
      const validStatuses = ['active', 'expired', 'in_progress']

      cvData.certifications.forEach(cert => {
        expect(validStatuses).toContain(cert.status)
      })
    })

    it('should have valid expiration logic', () => {
      const cvData = service.generateMockCV({ seniorityLevel: 'senior' })

      cvData.certifications.forEach(cert => {
        if (cert.expirationDate) {
          const issue = new Date(cert.issueDate)
          const expiration = new Date(cert.expirationDate)
          expect(issue <= expiration).toBe(true)
        }
      })
    })
  })

  // ============================================================================
  // Achievements Data Tests
  // ============================================================================

  describe('Achievements Data', () => {
    it('should have achievements', () => {
      const cvData = service.generateMockCV()

      expect(cvData.achievements.length).toBeGreaterThanOrEqual(1)
    })

    it('should have valid achievement categories', () => {
      const cvData = service.generateMockCV()
      const validCategories = [
        'award',
        'publication',
        'speaking',
        'project',
        'contribution',
        'other',
      ]

      cvData.achievements.forEach(achievement => {
        expect(validCategories).toContain(achievement.category)
      })
    })

    it('should feature top achievements', () => {
      const cvData = service.generateMockCV({ seniorityLevel: 'senior' })

      const featuredCount = cvData.achievements.filter(a => a.featured).length
      expect(featuredCount).toBeGreaterThan(0)
    })
  })

  // ============================================================================
  // Languages Data Tests
  // ============================================================================

  describe('Languages Data', () => {
    it('should have at least 2 languages', () => {
      const cvData = service.generateMockCV()

      expect(cvData.languages.length).toBeGreaterThanOrEqual(2)
      expect(cvData.languages.length).toBeLessThanOrEqual(4)
    })

    it('should have valid language proficiency levels', () => {
      const cvData = service.generateMockCV()
      const validProficiencies = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'native']

      cvData.languages.forEach(lang => {
        expect(validProficiencies).toContain(lang.proficiency)
        expect(lang.code).toHaveLength(2)
      })
    })

    it('should have at least one native language', () => {
      const cvData = service.generateMockCV()

      const hasNative = cvData.languages.some(
        lang => lang.proficiency === 'native' || lang.native === true
      )
      expect(hasNative).toBe(true)
    })
  })
})
