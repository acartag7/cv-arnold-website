/**
 * CV Handler Tests
 *
 * Tests for CV data endpoint handlers.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  handleGetCV,
  handlePostCV,
  handleExportCV,
  handleImportCV,
  handleGetSection,
  type CVHandlerEnv,
} from '../api/handlers/cv'

// Valid CV data for testing
const validCVData = {
  version: '1.0.0',
  lastUpdated: '2025-01-15',
  personalInfo: {
    fullName: 'Test User',
    title: 'Software Engineer',
    email: 'test@example.com',
    location: {
      city: 'San Francisco',
      country: 'United States',
      countryCode: 'US',
    },
    social: {},
    summary: 'Experienced software engineer with 10+ years in the industry.',
    availability: {
      status: 'open_to_opportunities',
    },
  },
  experience: [],
  skills: [],
  education: [],
  certifications: [],
  achievements: [],
  languages: [],
}

// Mock KV namespace
function createMockKV() {
  const store = new Map<string, string>()
  return {
    get: vi.fn(async (key: string, type?: string) => {
      const value = store.get(key)
      if (!value) return null
      if (type === 'json') {
        try {
          return JSON.parse(value)
        } catch {
          return null
        }
      }
      return value
    }),
    put: vi.fn(async (key: string, value: string | ArrayBuffer) => {
      if (typeof value === 'string') {
        store.set(key, value)
      } else {
        store.set(key, JSON.stringify(value))
      }
    }),
    delete: vi.fn(async (key: string) => {
      store.delete(key)
    }),
    list: vi.fn(async () => ({ keys: [], list_complete: true })),
    _store: store,
    _setData: (key: string, data: unknown) => {
      store.set(
        key,
        JSON.stringify({
          data,
          compressed: false,
          timestamp: new Date().toISOString(),
        })
      )
    },
  }
}

function createMockEnv(): CVHandlerEnv & {
  CV_DATA: ReturnType<typeof createMockKV>
} {
  return {
    CV_DATA: createMockKV() as unknown as ReturnType<typeof createMockKV>,
  }
}

function createRequest(method: string, body?: unknown): Request {
  const init: RequestInit = { method }
  if (body) {
    init.body = JSON.stringify(body)
    init.headers = { 'Content-Type': 'application/json' }
  }
  return new Request('https://api.example.com/api/v1/cv', init)
}

describe('CV Handlers', () => {
  let env: ReturnType<typeof createMockEnv>

  beforeEach(() => {
    env = createMockEnv()
    vi.clearAllMocks()
  })

  describe('handleGetCV', () => {
    it('should return 404 when no data exists', async () => {
      const request = createRequest('GET')
      const response = await handleGetCV(request, env)
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.success).toBe(false)
      expect(body.error.message).toContain('not found')
    })

    it('should return CV data when exists', async () => {
      // Store data in mock KV
      env.CV_DATA._setData('cv:data:v1', validCVData)

      const request = createRequest('GET')
      const response = await handleGetCV(request, env)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.personalInfo.fullName).toBe('Test User')
    })

    it('should include cache headers', async () => {
      env.CV_DATA._setData('cv:data:v1', validCVData)

      const request = createRequest('GET')
      const response = await handleGetCV(request, env)

      expect(response.headers.get('Cache-Control')).toContain('public')
    })
  })

  describe('handlePostCV', () => {
    it('should return 400 for invalid JSON', async () => {
      const request = new Request('https://api.example.com/api/v1/cv', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      })
      const response = await handlePostCV(request, env)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error.code).toBe('INVALID_REQUEST')
    })

    it('should return 422 for invalid CV data', async () => {
      const request = createRequest('POST', {
        version: '1.0.0',
        // Missing required fields
      })
      const response = await handlePostCV(request, env)
      const body = await response.json()

      expect(response.status).toBe(422)
      expect(body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should store valid CV data', async () => {
      const request = createRequest('POST', validCVData)
      const response = await handlePostCV(request, env)
      const body = await response.json()

      expect(response.status).toBe(201)
      expect(body.success).toBe(true)
      expect(env.CV_DATA.put).toHaveBeenCalled()
    })
  })

  describe('handleExportCV', () => {
    it('should return 404 when no data exists', async () => {
      const request = createRequest('GET')
      const response = await handleExportCV(request, env)
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.error.message).toContain('not found')
    })

    it('should return downloadable JSON', async () => {
      env.CV_DATA._setData('cv:data:v1', validCVData)

      const request = createRequest('GET')
      const response = await handleExportCV(request, env)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/json')
      expect(response.headers.get('Content-Disposition')).toContain(
        'attachment'
      )
      expect(response.headers.get('Content-Disposition')).toContain('.json')
    })
  })

  describe('handleImportCV', () => {
    it('should return 400 for invalid JSON', async () => {
      const request = new Request('https://api.example.com/api/v1/cv/import', {
        method: 'POST',
        body: 'not json',
        headers: { 'Content-Type': 'application/json' },
      })
      const response = await handleImportCV(request, env)

      expect(response.status).toBe(400)
    })

    it('should return 422 for invalid CV data', async () => {
      const request = createRequest('POST', { invalid: 'data' })
      const response = await handleImportCV(request, env)
      const body = (await response.json()) as { error: { code: string } }

      expect(response.status).toBe(422)
      expect(body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should import valid CV data', async () => {
      const request = createRequest('POST', validCVData)
      const response = await handleImportCV(request, env)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.message).toContain('imported successfully')
    })
  })

  describe('handleGetSection', () => {
    it('should return 400 for invalid section name', async () => {
      const request = createRequest('GET')
      const response = await handleGetSection(request, env, 'invalidSection')
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error.message).toContain('Invalid section')
    })

    it('should return 404 when section data not found', async () => {
      const request = createRequest('GET')
      const response = await handleGetSection(request, env, 'experience')
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.error.message).toContain('not found')
    })

    it('should return section data when exists', async () => {
      // Store section data
      env.CV_DATA._setData('cv:section:experience:v1', validCVData.experience)

      const request = createRequest('GET')
      const response = await handleGetSection(request, env, 'experience')
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
    })

    it('should validate valid section names', async () => {
      const validSections = [
        'personalInfo',
        'experience',
        'skills',
        'education',
        'certifications',
        'achievements',
        'languages',
        'metadata',
      ]

      for (const section of validSections) {
        const request = createRequest('GET')
        const response = await handleGetSection(request, env, section)
        // Should not be 400 (bad request) for valid section names
        expect(response.status).not.toBe(400)
      }
    })
  })
})
