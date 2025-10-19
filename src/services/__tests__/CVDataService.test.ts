/**
 * Tests for CVDataService business logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CVDataService } from '../CVDataService'
import type { ICVRepository } from '../storage/ICVRepository'
import type { CVData } from '@/types/cv'
import {
  CVDataNotFoundError,
  CVValidationError,
  CVStorageError,
} from '@/lib/errors'

describe('CVDataService', () => {
  let mockRepository: ICVRepository
  let service: CVDataService

  const mockCVData: CVData = {
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
  }

  beforeEach(() => {
    mockRepository = {
      getData: vi.fn(),
      updateData: vi.fn(),
      exists: vi.fn(),
      delete: vi.fn(),
    }
    service = new CVDataService(mockRepository)
  })

  describe('getData', () => {
    it('should return validated CV data', async () => {
      vi.mocked(mockRepository.getData).mockResolvedValue(mockCVData)

      const result = await service.getData()

      expect(result).toEqual(mockCVData)
      expect(mockRepository.getData).toHaveBeenCalled()
    })

    it('should throw CVDataNotFoundError when data is null', async () => {
      vi.mocked(mockRepository.getData).mockResolvedValue(null)

      await expect(service.getData()).rejects.toThrow(CVDataNotFoundError)
      await expect(service.getData()).rejects.toThrow('CV data not found')
    })

    it('should throw CVValidationError for invalid data', async () => {
      const invalidData = { version: 'invalid' } as any
      vi.mocked(mockRepository.getData).mockResolvedValue(invalidData)

      await expect(service.getData()).rejects.toThrow(CVValidationError)
    })

    it('should wrap repository errors in CVStorageError', async () => {
      vi.mocked(mockRepository.getData).mockRejectedValue(
        new Error('Read error')
      )

      await expect(service.getData()).rejects.toThrow(CVStorageError)
    })
  })

  describe('updateData', () => {
    it('should validate and update CV data', async () => {
      vi.mocked(mockRepository.updateData).mockResolvedValue(undefined)

      await service.updateData(mockCVData)

      expect(mockRepository.updateData).toHaveBeenCalledWith(mockCVData)
    })

    it('should throw CVValidationError for invalid data', async () => {
      const invalidData = { version: 'not-semver' } as any

      await expect(service.updateData(invalidData)).rejects.toThrow(
        CVValidationError
      )
      expect(mockRepository.updateData).not.toHaveBeenCalled()
    })

    it('should wrap repository errors in CVStorageError', async () => {
      vi.mocked(mockRepository.updateData).mockRejectedValue(
        new Error('Write error')
      )

      await expect(service.updateData(mockCVData)).rejects.toThrow(
        CVStorageError
      )
    })
  })

  describe('validateData', () => {
    it('should return success for valid data', () => {
      const result = service.validateData(mockCVData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockCVData)
      expect(result.error).toBeUndefined()
    })

    it('should return error for invalid data', () => {
      const invalidData = { version: 'invalid' }

      const result = service.validateData(invalidData)

      expect(result.success).toBe(false)
      expect(result.data).toBeUndefined()
      expect(result.error).toBeDefined()
    })
  })

  describe('exists', () => {
    it('should return true when data exists', async () => {
      vi.mocked(mockRepository.exists).mockResolvedValue(true)

      const result = await service.exists()

      expect(result).toBe(true)
      expect(mockRepository.exists).toHaveBeenCalled()
    })

    it('should return false when data does not exist', async () => {
      vi.mocked(mockRepository.exists).mockResolvedValue(false)

      const result = await service.exists()

      expect(result).toBe(false)
    })

    it('should wrap repository errors in CVStorageError', async () => {
      vi.mocked(mockRepository.exists).mockRejectedValue(
        new Error('Check error')
      )

      await expect(service.exists()).rejects.toThrow(CVStorageError)
    })
  })

  describe('delete', () => {
    it('should delete CV data', async () => {
      vi.mocked(mockRepository.delete).mockResolvedValue(undefined)

      await service.delete()

      expect(mockRepository.delete).toHaveBeenCalled()
    })

    it('should wrap repository errors in CVStorageError', async () => {
      vi.mocked(mockRepository.delete).mockRejectedValue(
        new Error('Delete error')
      )

      await expect(service.delete()).rejects.toThrow(CVStorageError)
    })
  })

  describe('error handling', () => {
    it('should preserve CVValidationError', async () => {
      const invalidData = { version: 'x' } as any
      vi.mocked(mockRepository.getData).mockResolvedValue(invalidData)

      await expect(service.getData()).rejects.toThrow(CVValidationError)
    })

    it('should convert unknown errors to CVStorageError', async () => {
      vi.mocked(mockRepository.getData).mockRejectedValue('string error')

      await expect(service.getData()).rejects.toThrow(CVStorageError)
    })
  })
})
