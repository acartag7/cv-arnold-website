/**
 * Test Data Factories
 *
 * Provides reusable factory functions for creating test data across test suites.
 * This reduces duplication and provides a single source of truth for test fixtures.
 */

import { vi } from 'vitest'
import type { CVData } from '@/types/cv'
import type { ICVRepository } from '@/services/storage/ICVRepository'

/**
 * Create mock CV data with optional overrides
 *
 * @example
 * const data = createMockCVData({ version: '2.0.0' })
 */
export const createMockCVData = (overrides?: Partial<CVData>): CVData => ({
  version: '1.0.0',
  lastUpdated: '2024-01-15',
  personalInfo: {
    fullName: 'Test User',
    title: 'Test Engineer',
    email: 'test@example.com',
    location: {
      city: 'Test City',
      country: 'Test Country',
      countryCode: 'TC',
    },
    social: {},
    summary: 'A test user summary for testing purposes.',
    availability: {
      status: 'available',
    },
  },
  experience: [],
  skills: [],
  education: [],
  certifications: [],
  achievements: [],
  languages: [],
  ...overrides,
})

/**
 * Create a mock repository with all methods stubbed
 *
 * @example
 * const mockRepo = createMockRepository()
 * mockRepo.getData.mockResolvedValue(mockData)
 */
export const createMockRepository = (): ICVRepository => ({
  getData: vi.fn(),
  updateData: vi.fn(),
  getSection: vi.fn(),
  updateSection: vi.fn(),
  exists: vi.fn(),
  delete: vi.fn(),
})

/**
 * Create mock personal info with optional overrides
 */
export const createMockPersonalInfo = (
  overrides?: Partial<CVData['personalInfo']>
): CVData['personalInfo'] => ({
  fullName: 'Test User',
  title: 'Test Engineer',
  email: 'test@example.com',
  location: {
    city: 'Test City',
    country: 'Test Country',
    countryCode: 'TC',
  },
  social: {},
  summary: 'A test user summary for testing purposes.',
  availability: {
    status: 'available',
  },
  ...overrides,
})
