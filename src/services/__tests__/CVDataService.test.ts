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
      getSection: vi.fn(),
      updateSection: vi.fn(),
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

    it('should throw CVDataNotFoundError when repository returns null', async () => {
      vi.mocked(mockRepository.getData).mockResolvedValue(null)

      await expect(service.getData()).rejects.toThrow(CVDataNotFoundError)
      await expect(service.getData()).rejects.toThrow('CV data not found')
    })

    it('should throw CVValidationError when data has invalid version format', async () => {
      const invalidData = { version: 'invalid' }
      vi.mocked(mockRepository.getData).mockResolvedValue(invalidData as CVData)

      await expect(service.getData()).rejects.toThrow(CVValidationError)
    })

    it('should wrap repository read errors in CVStorageError', async () => {
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

    it('should throw CVValidationError when version is not valid semver', async () => {
      const invalidData = { version: 'not-semver' }

      await expect(service.updateData(invalidData as CVData)).rejects.toThrow(
        CVValidationError
      )
      expect(mockRepository.updateData).not.toHaveBeenCalled()
    })

    it('should wrap repository write errors in CVStorageError', async () => {
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

  describe('getSection', () => {
    it('should return specific CV section', async () => {
      vi.mocked(mockRepository.getSection).mockResolvedValue(
        mockCVData.personalInfo
      )

      const result = await service.getSection('personalInfo')

      expect(result).toEqual(mockCVData.personalInfo)
      expect(mockRepository.getSection).toHaveBeenCalledWith('personalInfo')
    })

    it('should throw CVDataNotFoundError when section is null', async () => {
      vi.mocked(mockRepository.getSection).mockResolvedValue(null)

      await expect(service.getSection('personalInfo')).rejects.toThrow(
        CVDataNotFoundError
      )
    })

    it('should wrap repository errors in CVStorageError', async () => {
      vi.mocked(mockRepository.getSection).mockRejectedValue(
        new Error('Read error')
      )

      await expect(service.getSection('personalInfo')).rejects.toThrow(
        CVStorageError
      )
    })
  })

  describe('updateSection', () => {
    it('should validate and update CV section', async () => {
      vi.mocked(mockRepository.updateSection).mockResolvedValue(undefined)

      await service.updateSection('personalInfo', mockCVData.personalInfo)

      expect(mockRepository.updateSection).toHaveBeenCalledWith(
        'personalInfo',
        mockCVData.personalInfo
      )
    })

    it('should throw CVValidationError for invalid section data', async () => {
      const invalidPersonalInfo = { title: 'Senior Engineer' } // Missing required fields

      await expect(
        service.updateSection(
          'personalInfo',
          invalidPersonalInfo as typeof mockCVData.personalInfo
        )
      ).rejects.toThrow(CVValidationError)

      expect(mockRepository.updateSection).not.toHaveBeenCalled()
    })

    it('should wrap repository errors in CVStorageError', async () => {
      vi.mocked(mockRepository.updateSection).mockRejectedValue(
        new Error('Write error')
      )

      await expect(
        service.updateSection('personalInfo', mockCVData.personalInfo)
      ).rejects.toThrow(CVStorageError)
    })
  })

  describe('concurrent operations', () => {
    it('should handle concurrent getData calls safely', async () => {
      vi.mocked(mockRepository.getData).mockResolvedValue(mockCVData)

      const [result1, result2, result3] = await Promise.all([
        service.getData(),
        service.getData(),
        service.getData(),
      ])

      expect(result1).toEqual(mockCVData)
      expect(result2).toEqual(mockCVData)
      expect(result3).toEqual(mockCVData)
      expect(mockRepository.getData).toHaveBeenCalledTimes(3)
    })

    it('should handle concurrent updateData calls', async () => {
      vi.mocked(mockRepository.updateData).mockResolvedValue(undefined)

      const updates = [
        { ...mockCVData, version: '1.0.1' },
        { ...mockCVData, version: '1.0.2' },
        { ...mockCVData, version: '1.0.3' },
      ]

      await Promise.all(updates.map(data => service.updateData(data)))

      expect(mockRepository.updateData).toHaveBeenCalledTimes(3)
    })
  })

  describe('error handling', () => {
    it('should preserve CVValidationError when validation fails', async () => {
      const invalidData = { version: 'x' }
      vi.mocked(mockRepository.getData).mockResolvedValue(invalidData as CVData)

      await expect(service.getData()).rejects.toThrow(CVValidationError)
    })

    it('should convert non-Error exceptions to CVStorageError', async () => {
      vi.mocked(mockRepository.getData).mockRejectedValue('string error')

      await expect(service.getData()).rejects.toThrow(CVStorageError)
    })
  })
})
