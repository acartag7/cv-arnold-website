/**
 * CV Data Service with Repository Pattern
 *
 * Main service class for CV data operations. Uses dependency injection
 * to decouple from specific storage implementations.
 *
 * @example
 * ```typescript
 * const repository = new JSONFileAdapter('./data/cv-data.json')
 * const service = new CVDataService(repository)
 * const data = await service.getData()
 * ```
 */

import type { CVData } from '@/types/cv'
import type { ICVRepository } from './storage/ICVRepository'
import { validateCVData, parseCVData } from '@/schemas/cv.schema'
import {
  PersonalInfoSchema,
  ExperienceSchema,
  SkillCategorySchema,
  EducationSchema,
  CertificationSchema,
  AchievementSchema,
  LanguageSchema,
} from '@/schemas/cv.schema'
import { z } from 'zod'
import {
  CVDataNotFoundError,
  CVValidationError,
  CVStorageError,
} from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { withRetry, isNetworkError } from '@/lib/retry'

const logger = createLogger('CVDataService')

/**
 * Schema mapping for section validation
 */
const sectionSchemas = {
  version: z.string(),
  lastUpdated: z.string(),
  personalInfo: PersonalInfoSchema,
  experience: z.array(ExperienceSchema),
  skills: z.array(SkillCategorySchema),
  education: z.array(EducationSchema),
  certifications: z.array(CertificationSchema),
  achievements: z.array(AchievementSchema),
  languages: z.array(LanguageSchema),
} as const

/**
 * Service class for CV data operations
 *
 * Implements business logic for CV data management with:
 * - Validation using Zod schemas
 * - Error handling with custom exceptions
 * - Logging for all operations
 * - Retry logic for network operations
 */
export class CVDataService {
  constructor(private readonly repository: ICVRepository) {
    logger.info('CVDataService initialized', {
      repository: repository.constructor.name,
    })
  }

  /**
   * Validate section data using appropriate schema
   */
  private validateSection<K extends keyof CVData>(
    section: K,
    data: CVData[K]
  ): CVData[K] {
    const schema = sectionSchemas[section as keyof typeof sectionSchemas]
    if (!schema) {
      throw new CVValidationError(
        `No validation schema found for section "${String(section)}"`
      )
    }

    const result = schema.safeParse(data)
    if (!result.success) {
      throw new CVValidationError(
        `Section "${String(section)}" validation failed`,
        result.error.format()
      )
    }

    return result.data as CVData[K]
  }

  /**
   * Get all CV data with validation
   *
   * @returns Promise resolving to validated CV data
   * @throws CVDataNotFoundError if data doesn't exist
   * @throws CVValidationError if data fails validation
   * @throws CVStorageError if storage operation fails
   */
  async getData(): Promise<CVData> {
    logger.debug('Fetching CV data')

    try {
      const data = await withRetry(() => this.repository.getData(), {
        maxAttempts: 3,
        initialDelay: 1000,
        isRetryable: isNetworkError,
        onRetry: (error, attempt) => {
          logger.warn('Retrying getData operation', { attempt, error })
        },
      })

      if (!data) {
        throw new CVDataNotFoundError()
      }

      // Validate data
      const validation = validateCVData(data)
      if (!validation.success) {
        throw new CVValidationError(
          validation.error?.message || 'CV data validation failed',
          validation.error?.details
        )
      }

      logger.info('CV data retrieved successfully')
      return validation.data as CVData
    } catch (error) {
      if (
        error instanceof CVDataNotFoundError ||
        error instanceof CVValidationError
      ) {
        throw error
      }
      logger.error('Failed to get CV data', error)
      throw new CVStorageError('Failed to retrieve CV data', 'read', error)
    }
  }

  /**
   * Update CV data with validation
   *
   * @param data - CV data to store
   * @throws CVValidationError if data fails validation
   * @throws CVStorageError if storage operation fails
   */
  async updateData(data: CVData): Promise<void> {
    logger.debug('Updating CV data')

    try {
      // Validate and parse data (throws on validation failure)
      const validatedData = parseCVData(data) as CVData

      await withRetry(() => this.repository.updateData(validatedData), {
        maxAttempts: 3,
        initialDelay: 1000,
        isRetryable: isNetworkError,
        onRetry: (error, attempt) => {
          logger.warn('Retrying updateData operation', { attempt, error })
        },
      })

      logger.info('CV data updated successfully')
    } catch (error) {
      if (error instanceof CVValidationError) {
        throw error
      }
      logger.error('Failed to update CV data', error)
      throw new CVStorageError('Failed to update CV data', 'write', error)
    }
  }

  /**
   * Validate CV data without storing
   *
   * @param data - Data to validate
   * @returns Validation result with success flag and errors if any
   */
  validateData(data: unknown): ReturnType<typeof validateCVData> {
    logger.debug('Validating CV data')
    const result = validateCVData(data)

    if (result.success) {
      logger.info('CV data validation passed')
    } else {
      logger.warn('CV data validation failed', {
        error: result.error,
      })
    }

    return result
  }

  /**
   * Get specific section of CV data
   *
   * @param section - Section key to retrieve
   * @returns Promise resolving to section data
   * @throws CVDataNotFoundError if section doesn't exist
   * @throws CVStorageError if storage operation fails
   */
  async getSection<K extends keyof CVData>(section: K): Promise<CVData[K]> {
    logger.debug('Fetching CV section', { section })

    try {
      const data = await withRetry(() => this.repository.getSection(section), {
        maxAttempts: 3,
        initialDelay: 1000,
        isRetryable: isNetworkError,
        onRetry: (error, attempt) => {
          logger.warn('Retrying getSection operation', {
            section,
            attempt,
            error,
          })
        },
      })

      if (data === null) {
        throw new CVDataNotFoundError(`Section "${section}" not found`)
      }

      logger.info('CV section retrieved successfully', { section })
      return data
    } catch (error) {
      if (error instanceof CVDataNotFoundError) {
        throw error
      }
      logger.error('Failed to get CV section', error, { section })
      throw new CVStorageError(
        `Failed to retrieve section "${section}"`,
        'read',
        error
      )
    }
  }

  /**
   * Update specific section of CV data with validation
   *
   * @param section - Section key to update
   * @param data - Section data to store
   * @throws CVValidationError if data fails validation
   * @throws CVStorageError if storage operation fails
   */
  async updateSection<K extends keyof CVData>(
    section: K,
    data: CVData[K]
  ): Promise<void> {
    logger.debug('Updating CV section', { section })

    try {
      // Validate section data before updating
      const validatedData = this.validateSection(section, data)

      await withRetry(
        () => this.repository.updateSection(section, validatedData),
        {
          maxAttempts: 3,
          initialDelay: 1000,
          isRetryable: isNetworkError,
          onRetry: (error, attempt) => {
            logger.warn('Retrying updateSection operation', {
              section,
              attempt,
              error,
            })
          },
        }
      )

      logger.info('CV section updated successfully', { section })
    } catch (error) {
      if (error instanceof CVValidationError) {
        throw error
      }
      logger.error('Failed to update CV section', error, { section })
      throw new CVStorageError(
        `Failed to update section "${section}"`,
        'write',
        error
      )
    }
  }

  /**
   * Check if CV data exists
   *
   * @returns Promise resolving to true if data exists
   */
  async exists(): Promise<boolean> {
    logger.debug('Checking if CV data exists')

    try {
      const result = await this.repository.exists()
      logger.debug('CV data existence check complete', { exists: result })
      return result
    } catch (error) {
      logger.error('Failed to check CV data existence', error)
      throw new CVStorageError('Failed to check data existence', 'read', error)
    }
  }

  /**
   * Delete all CV data (use with caution!)
   *
   * @throws CVStorageError if deletion fails
   */
  async delete(): Promise<void> {
    logger.warn('Deleting all CV data')

    try {
      await this.repository.delete()
      logger.info('CV data deleted successfully')
    } catch (error) {
      logger.error('Failed to delete CV data', error)
      throw new CVStorageError('Failed to delete CV data', 'delete', error)
    }
  }
}
