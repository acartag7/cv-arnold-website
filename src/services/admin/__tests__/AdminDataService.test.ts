/**
 * Tests for AdminDataService client-side API wrapper
 *
 * Note: AdminDataService routes all requests through /api/proxy/* which
 * adds Cloudflare Access service token headers server-side.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AdminDataService, AdminAPIError } from '../AdminDataService'

// Proxy base URL - all admin API calls go through this server-side proxy
const PROXY_BASE = '/api/proxy'

// Mock CV data for testing
const mockCVData = {
  version: '1.0.0',
  lastUpdated: '2025-01-15',
  personalInfo: {
    fullName: 'Test User',
    title: 'Software Engineer',
    email: 'test@example.com',
    location: { city: 'SF', country: 'US', countryCode: 'US' },
    social: {},
    summary: 'Test summary',
    availability: { status: 'open_to_opportunities' as const },
  },
  experience: [],
  skills: [],
  education: [],
  certifications: [],
  achievements: [],
  languages: [],
}

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('AdminDataService', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getData', () => {
    it('should fetch CV data successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCVData, success: true }),
      })

      const result = await AdminDataService.getData()

      expect(mockFetch).toHaveBeenCalledWith(
        `${PROXY_BASE}/api/v1/cv`,
        expect.any(Object)
      )
      expect(result).toEqual(mockCVData)
    })

    it('should throw AdminAPIError on HTTP error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          error: { message: 'Not found', code: 'NOT_FOUND' },
          success: false,
        }),
      })

      await expect(AdminDataService.getData()).rejects.toThrow(AdminAPIError)
    })

    it('should wrap JSON parse error in AdminAPIError', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('JSON parse error')
        },
      })

      // JSON parse errors are wrapped in AdminAPIError for consistent handling
      try {
        await AdminDataService.getData()
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(AdminAPIError)
        expect((error as AdminAPIError).message).toBe(
          'Failed to parse API response'
        )
        expect((error as AdminAPIError).status).toBe(500)
        expect((error as AdminAPIError).code).toBe('PARSE_ERROR')
      }
    })
  })

  describe('getSection', () => {
    it('should fetch a specific section', async () => {
      const mockExperience = [{ company: 'Test Corp' }]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockExperience, success: true }),
      })

      const result = await AdminDataService.getSection('experience')

      expect(mockFetch).toHaveBeenCalledWith(
        `${PROXY_BASE}/api/v1/cv/sections/experience`,
        expect.any(Object)
      )
      expect(result).toEqual(mockExperience)
    })
  })

  describe('updateData', () => {
    it('should update CV data successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null, success: true }),
      })

      await AdminDataService.updateData(mockCVData)

      expect(mockFetch).toHaveBeenCalledWith(`${PROXY_BASE}/api/v1/cv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCVData),
      })
    })

    it('should throw on validation error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: { message: 'Validation failed', code: 'VALIDATION_ERROR' },
          success: false,
        }),
      })

      await expect(AdminDataService.updateData(mockCVData)).rejects.toThrow(
        AdminAPIError
      )
    })
  })

  describe('exportData', () => {
    it('should export data as JSON', async () => {
      const mockBlob = new Blob(['{}'], { type: 'application/json' })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      })

      const result = await AdminDataService.exportData('json')

      expect(mockFetch).toHaveBeenCalledWith(
        `${PROXY_BASE}/api/v1/cv/export?format=json`
      )
      expect(result).toEqual(mockBlob)
    })

    it('should export data as YAML', async () => {
      const mockBlob = new Blob(['version: 1.0.0'], {
        type: 'application/x-yaml',
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      })

      const result = await AdminDataService.exportData('yaml')

      expect(mockFetch).toHaveBeenCalledWith(
        `${PROXY_BASE}/api/v1/cv/export?format=yaml`
      )
      expect(result).toEqual(mockBlob)
    })
  })

  describe('importData', () => {
    it('should import JSON file', async () => {
      const file = new File([JSON.stringify(mockCVData)], 'cv.json', {
        type: 'application/json',
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { message: 'Imported', format: 'json', version: '1.0.0' },
          success: true,
        }),
      })

      const result = await AdminDataService.importData(file)

      expect(mockFetch).toHaveBeenCalledWith(`${PROXY_BASE}/api/v1/cv/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
      })
      expect(result.message).toBe('Imported')
    })

    it('should import YAML file', async () => {
      const file = new File(['version: 1.0.0'], 'cv.yaml', {
        type: 'application/x-yaml',
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { message: 'Imported', format: 'yaml', version: '1.0.0' },
          success: true,
        }),
      })

      const result = await AdminDataService.importData(file)

      expect(result.format).toBe('yaml')
    })
  })

  describe('previewImport', () => {
    it('should preview import without saving', async () => {
      const file = new File([JSON.stringify(mockCVData)], 'cv.json', {
        type: 'application/json',
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            message: 'Validation successful (preview mode)',
            preview: true,
            format: 'json',
            version: '1.0.0',
            sections: {
              personalInfo: true,
              experience: 0,
              skills: 0,
            },
          },
          success: true,
        }),
      })

      const result = await AdminDataService.previewImport(file)

      expect(mockFetch).toHaveBeenCalledWith(
        `${PROXY_BASE}/api/v1/cv/import?preview=true`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String),
        }
      )
      expect(result.preview).toBe(true)
    })
  })
})

describe('AdminAPIError', () => {
  it('should have correct properties', () => {
    const error = new AdminAPIError('Test error', 500, 'TEST_CODE')

    expect(error.message).toBe('Test error')
    expect(error.status).toBe(500)
    expect(error.code).toBe('TEST_CODE')
    expect(error.name).toBe('AdminAPIError')
  })

  it('should be instanceof Error', () => {
    const error = new AdminAPIError('Test error', 500)

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AdminAPIError)
  })
})
