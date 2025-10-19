/**
 * Tests for JSONFileAdapter storage implementation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { JSONFileAdapter } from '../JSONFileAdapter'
import type { CVData } from '@/types/cv'
import fs from 'fs/promises'

// Mock fs module
vi.mock('fs/promises')

// Mock retry module to avoid actual delays in tests
vi.mock('@/lib/retry', () => ({
  withRetry: vi.fn(async fn => fn()),
  isNetworkError: vi.fn(() => false),
}))

describe('JSONFileAdapter', () => {
  let adapter: JSONFileAdapter
  const testFilePath = '/test/cv-data.json'

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
    adapter = new JSONFileAdapter(testFilePath)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getData', () => {
    it('should read and parse JSON file successfully', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockCVData))

      const result = await adapter.getData()

      expect(result).toEqual(mockCVData)
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('cv-data.json'),
        'utf-8'
      )
    })

    it('should return null when file does not exist', async () => {
      const notFoundError = new Error('File not found') as NodeJS.ErrnoException
      notFoundError.code = 'ENOENT'
      vi.mocked(fs.readFile).mockRejectedValue(notFoundError)

      const result = await adapter.getData()

      expect(result).toBeNull()
    })
  })

  describe('updateData', () => {
    it('should write data to file successfully', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await adapter.updateData(mockCVData)

      expect(fs.mkdir).toHaveBeenCalled()
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('cv-data.json'),
        expect.any(String),
        'utf-8'
      )
    })

    it('should format JSON with 2-space indentation', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await adapter.updateData(mockCVData)

      const writeCall = vi.mocked(fs.writeFile).mock.calls[0]
      if (writeCall) {
        const jsonString = writeCall[1] as string
        expect(jsonString).toContain('  ') // Has indentation
        expect(JSON.parse(jsonString)).toEqual(mockCVData) // Valid JSON
      }
    })
  })

  describe('exists', () => {
    it('should return true when file exists', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined)

      const result = await adapter.exists()

      expect(result).toBe(true)
    })

    it('should return false when file does not exist', async () => {
      const notFoundError = new Error('File not found') as NodeJS.ErrnoException
      notFoundError.code = 'ENOENT'
      vi.mocked(fs.access).mockRejectedValue(notFoundError)

      const result = await adapter.exists()

      expect(result).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete file successfully', async () => {
      vi.mocked(fs.unlink).mockResolvedValue(undefined)

      await adapter.delete()

      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('cv-data.json')
      )
    })

    it('should not throw error if file does not exist', async () => {
      const notFoundError = new Error('File not found') as NodeJS.ErrnoException
      notFoundError.code = 'ENOENT'
      vi.mocked(fs.unlink).mockRejectedValue(notFoundError)

      await expect(adapter.delete()).resolves.toBeUndefined()
    })

    it('should throw CVStorageError for other delete errors', async () => {
      const permissionError = new Error('Permission denied')
      vi.mocked(fs.unlink).mockRejectedValue(permissionError)

      await expect(adapter.delete()).rejects.toThrow('Failed to delete file')
    })
  })

  describe('getSection', () => {
    it('should return specific section when data exists', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockCVData))

      const result = await adapter.getSection('personalInfo')

      expect(result).toEqual(mockCVData.personalInfo)
    })

    it('should return null when data file does not exist', async () => {
      const notFoundError = new Error('File not found') as NodeJS.ErrnoException
      notFoundError.code = 'ENOENT'
      vi.mocked(fs.readFile).mockRejectedValue(notFoundError)

      const result = await adapter.getSection('personalInfo')

      expect(result).toBeNull()
    })

    it('should return null for missing section property', async () => {
      const dataWithoutSkills = { ...mockCVData }
      delete (dataWithoutSkills as Partial<CVData>).skills
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify(dataWithoutSkills)
      )

      const result = await adapter.getSection('skills')

      expect(result).toBeNull()
    })
  })

  describe('updateSection', () => {
    it('should update specific section successfully', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockCVData))
      vi.mocked(fs.mkdir).mockResolvedValue(undefined)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      vi.mocked(fs.rename).mockResolvedValue(undefined)

      const updatedPersonalInfo = {
        ...mockCVData.personalInfo,
        title: 'Senior Test Engineer',
      }

      await adapter.updateSection('personalInfo', updatedPersonalInfo)

      expect(fs.writeFile).toHaveBeenCalled()
      expect(fs.rename).toHaveBeenCalled()
    })

    it('should throw CVStorageError when data does not exist', async () => {
      const notFoundError = new Error('File not found') as NodeJS.ErrnoException
      notFoundError.code = 'ENOENT'
      vi.mocked(fs.readFile).mockRejectedValue(notFoundError)

      await expect(
        adapter.updateSection('personalInfo', mockCVData.personalInfo)
      ).rejects.toThrow('Cannot update section: CV data does not exist')
    })
  })

  describe('error handling', () => {
    it('should throw CVStorageError for read errors', async () => {
      const readError = new Error('Read permission denied')
      vi.mocked(fs.readFile).mockRejectedValue(readError)

      await expect(adapter.getData()).rejects.toThrow('Failed to read file')
    })

    it('should throw CVStorageError for write errors', async () => {
      const writeError = new Error('Write permission denied')
      vi.mocked(fs.mkdir).mockResolvedValue(undefined)
      vi.mocked(fs.writeFile).mockRejectedValue(writeError)

      await expect(adapter.updateData(mockCVData)).rejects.toThrow(
        'Failed to write file'
      )
    })
  })
})
