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

    it('should return downloadable JSON by default', async () => {
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

    it('should return downloadable JSON when format=json', async () => {
      env.CV_DATA._setData('cv:data:v1', validCVData)

      const request = new Request(
        'https://api.example.com/api/v1/cv/export?format=json',
        { method: 'GET' }
      )
      const response = await handleExportCV(request, env)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/json')
      expect(response.headers.get('Content-Disposition')).toContain('.json')

      const text = await response.text()
      const data = JSON.parse(text)
      expect(data.version).toBe('1.0.0')
    })

    it('should return downloadable YAML when format=yaml', async () => {
      env.CV_DATA._setData('cv:data:v1', validCVData)

      const request = new Request(
        'https://api.example.com/api/v1/cv/export?format=yaml',
        { method: 'GET' }
      )
      const response = await handleExportCV(request, env)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/x-yaml')
      expect(response.headers.get('Content-Disposition')).toContain('.yaml')

      const text = await response.text()
      expect(text).toContain('version:')
      expect(text).toContain('personalInfo:')
    })

    it('should return 400 for invalid format parameter', async () => {
      env.CV_DATA._setData('cv:data:v1', validCVData)

      const request = new Request(
        'https://api.example.com/api/v1/cv/export?format=xml',
        { method: 'GET' }
      )
      const response = await handleExportCV(request, env)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error.message).toContain('Invalid format')
      expect(body.error.message).toContain('json, yaml')
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

    it('should import valid JSON CV data', async () => {
      const request = createRequest('POST', validCVData)
      const response = await handleImportCV(request, env)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.message).toContain('imported successfully')
      expect(body.data.format).toBe('json')
    })

    it('should import valid YAML CV data', async () => {
      const yamlContent = `
version: "1.0.0"
lastUpdated: "2025-01-15"
personalInfo:
  fullName: "Test User"
  title: "Software Engineer"
  email: "test@example.com"
  location:
    city: "San Francisco"
    country: "United States"
    countryCode: "US"
  social: {}
  summary: "Experienced software engineer with 10+ years in the industry."
  availability:
    status: "open_to_opportunities"
experience: []
skills: []
education: []
certifications: []
achievements: []
languages: []
`
      const request = new Request('https://api.example.com/api/v1/cv/import', {
        method: 'POST',
        body: yamlContent,
        headers: { 'Content-Type': 'application/x-yaml' },
      })
      const response = await handleImportCV(request, env)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.message).toContain('imported successfully')
      expect(body.data.format).toBe('yaml')
    })

    it('should support text/yaml Content-Type', async () => {
      const yamlContent = `
version: "1.0.0"
lastUpdated: "2025-01-15"
personalInfo:
  fullName: "YAML User"
  title: "Developer"
  email: "yaml@example.com"
  location:
    city: "New York"
    country: "United States"
    countryCode: "US"
  social: {}
  summary: "A developer."
  availability:
    status: "open_to_opportunities"
experience: []
skills: []
education: []
certifications: []
achievements: []
languages: []
`
      const request = new Request('https://api.example.com/api/v1/cv/import', {
        method: 'POST',
        body: yamlContent,
        headers: { 'Content-Type': 'text/yaml' },
      })
      const response = await handleImportCV(request, env)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.data.format).toBe('yaml')
    })

    it('should import YAML with application/yaml Content-Type', async () => {
      const yamlBody = `
version: "1.0.0"
lastUpdated: "2025-01-15"
personalInfo:
  fullName: "YAML User"
  title: "Developer"
  email: "yaml@example.com"
  location:
    city: "New York"
    country: "United States"
    countryCode: "US"
  social: {}
  summary: "A developer."
  availability:
    status: "open_to_opportunities"
experience: []
skills: []
education: []
certifications: []
achievements: []
languages: []
`
      const request = new Request('https://api.example.com/api/v1/cv/import', {
        method: 'POST',
        body: yamlBody,
        headers: { 'Content-Type': 'application/yaml' },
      })
      const response = await handleImportCV(request, env)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.data.format).toBe('yaml')
    })

    it('should handle Content-Type with charset parameter', async () => {
      const request = new Request('https://api.example.com/api/v1/cv/import', {
        method: 'POST',
        body: JSON.stringify(validCVData),
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      })
      const response = await handleImportCV(request, env)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.data.format).toBe('json')
    })

    it('should return 400 for unsupported Content-Type', async () => {
      const request = new Request('https://api.example.com/api/v1/cv/import', {
        method: 'POST',
        body: '<xml>data</xml>',
        headers: { 'Content-Type': 'application/xml' },
      })
      const response = await handleImportCV(request, env)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error.message).toContain('Unsupported Content-Type')
    })

    it('should return 400 when no Content-Type provided', async () => {
      const request = new Request('https://api.example.com/api/v1/cv/import', {
        method: 'POST',
        body: JSON.stringify(validCVData),
      })
      const response = await handleImportCV(request, env)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error.message).toContain('Unsupported Content-Type')
    })

    it('should return 400 for invalid YAML syntax', async () => {
      const request = new Request('https://api.example.com/api/v1/cv/import', {
        method: 'POST',
        body: 'invalid: yaml: syntax: [unclosed',
        headers: { 'Content-Type': 'application/x-yaml' },
      })
      const response = await handleImportCV(request, env)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error.message).toContain('Invalid YAML')
    })

    it('should support preview mode without saving', async () => {
      const request = new Request(
        'https://api.example.com/api/v1/cv/import?preview=true',
        {
          method: 'POST',
          body: JSON.stringify(validCVData),
          headers: { 'Content-Type': 'application/json' },
        }
      )
      const response = await handleImportCV(request, env)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.preview).toBe(true)
      expect(body.data.message).toContain('preview mode')
      expect(body.data.sections).toBeDefined()
      expect(body.data.sections.personalInfo).toBe(true)
      // Verify data was NOT saved
      expect(env.CV_DATA.put).not.toHaveBeenCalled()
    })

    it('should reject payloads exceeding size limit', async () => {
      // Create a payload larger than 1MB
      const largePayload = JSON.stringify({
        ...validCVData,
        // Add padding to exceed 1MB
        _padding: 'x'.repeat(1024 * 1024 + 1000),
      })

      const request = new Request('https://api.example.com/api/v1/cv/import', {
        method: 'POST',
        body: largePayload,
        headers: { 'Content-Type': 'application/json' },
      })
      const response = await handleImportCV(request, env)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error.message).toContain('too large')
      expect(body.error.message).toContain('Maximum size: 1024KB')
    })

    it('should preserve data through YAML round-trip', async () => {
      // First, set up some data
      env.CV_DATA._setData('cv:data:v1', validCVData)

      // Export as YAML
      const exportReq = new Request(
        'https://api.example.com/api/v1/cv/export?format=yaml',
        { method: 'GET' }
      )
      const exportRes = await handleExportCV(exportReq, env)
      expect(exportRes.status).toBe(200)
      const yamlContent = await exportRes.text()

      // Clear the data
      env.CV_DATA._store.clear()

      // Import back from YAML
      const importReq = new Request(
        'https://api.example.com/api/v1/cv/import',
        {
          method: 'POST',
          body: yamlContent,
          headers: { 'Content-Type': 'application/x-yaml' },
        }
      )
      const importRes = await handleImportCV(importReq, env)
      expect(importRes.status).toBe(200)

      // Verify data was stored
      expect(env.CV_DATA.put).toHaveBeenCalled()
    })

    it('should return section counts in preview mode', async () => {
      const dataWithContent = {
        ...validCVData,
        experience: [
          {
            id: 'exp1',
            company: 'Test Company',
            position: 'Developer',
            type: 'full_time' as const,
            startDate: '2020-01-01',
            endDate: '2024-01-01',
            location: { city: 'SF', country: 'USA', remote: false },
            description: 'A great experience working here.',
            order: 0,
          },
        ],
        skills: [
          {
            id: 'cat1',
            name: 'Programming',
            order: 0,
            skills: [{ name: 'TypeScript', level: 'expert' }],
          },
          {
            id: 'cat2',
            name: 'Frontend',
            order: 1,
            skills: [{ name: 'React', level: 'advanced' }],
          },
        ],
      }

      const request = new Request(
        'https://api.example.com/api/v1/cv/import?preview=true',
        {
          method: 'POST',
          body: JSON.stringify(dataWithContent),
          headers: { 'Content-Type': 'application/json' },
        }
      )
      const response = await handleImportCV(request, env)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.data.sections.experience).toBe(1)
      expect(body.data.sections.skills).toBe(2)
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
