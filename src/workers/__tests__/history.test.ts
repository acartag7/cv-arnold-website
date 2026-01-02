/**
 * History Handler Tests
 *
 * Tests for history/snapshot endpoint handlers.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  handleListHistory,
  handleGetSnapshot,
  handleCreateSnapshot,
  handleDeleteSnapshot,
} from '../api/handlers/history'

// Valid CV data for snapshots
const validCVData = {
  version: '1.0.0',
  lastUpdated: '2025-01-15',
  personalInfo: {
    fullName: 'Test User',
    title: 'Software Engineer',
    email: 'test@example.com',
    location: { city: 'SF', country: 'US', countryCode: 'US' },
    social: {},
    summary: 'Test summary',
    availability: { status: 'open_to_opportunities' },
  },
  experience: [],
  skills: [],
  education: [],
  certifications: [],
  achievements: [],
  languages: [],
}

// Mock KV store interface for testing
interface MockKVStore {
  get: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  list: ReturnType<typeof vi.fn>
  _store: Map<string, string>
  _setData: (key: string, data: unknown) => void
}

// Mock KV namespace
function createMockKV(): MockKVStore {
  const store = new Map<string, string>()
  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value)
    }),
    delete: vi.fn(async (key: string) => {
      store.delete(key)
    }),
    list: vi.fn(async () => ({ keys: [], list_complete: true })),
    _store: store,
    _setData: (key: string, data: unknown) => {
      store.set(key, JSON.stringify(data))
    },
  }
}

interface MockEnv {
  CV_DATA: MockKVStore
}

function createMockEnv(): MockEnv {
  return {
    CV_DATA: createMockKV(),
  }
}

function createRequest(
  method: string,
  body?: unknown,
  headers?: Record<string, string>
): Request {
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  }
  if (body) {
    init.body = JSON.stringify(body)
  }
  return new Request('https://api.example.com/api/v1/cv/history', init)
}

describe('History Handlers', () => {
  let env: ReturnType<typeof createMockEnv>

  beforeEach(() => {
    env = createMockEnv()
    vi.clearAllMocks()
  })

  describe('handleListHistory', () => {
    it('should return empty list when no snapshots exist', async () => {
      const request = createRequest('GET')
      const response = await handleListHistory(request, env)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.snapshots).toEqual([])
      expect(data.data.total).toBe(0)
    })

    it('should return snapshots sorted by timestamp descending', async () => {
      const snapshots = [
        {
          id: 'snap1',
          timestamp: '2025-01-10T00:00:00Z',
          description: 'First',
          createdBy: null,
          size: 100,
          version: '1.0.0',
        },
        {
          id: 'snap2',
          timestamp: '2025-01-15T00:00:00Z',
          description: 'Second',
          createdBy: null,
          size: 100,
          version: '1.0.0',
        },
      ]
      env.CV_DATA._setData('cv:history:index', snapshots)

      const request = createRequest('GET')
      const response = await handleListHistory(request, env)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.snapshots).toHaveLength(2)
      expect(data.data.snapshots[0].id).toBe('snap2') // Newest first
      expect(data.data.snapshots[1].id).toBe('snap1')
    })

    it('should respect limit and offset parameters', async () => {
      const snapshots = Array.from({ length: 10 }, (_, i) => ({
        id: `snap${i}`,
        timestamp: new Date(2025, 0, 15 - i).toISOString(),
        description: `Snapshot ${i}`,
        createdBy: null,
        size: 100,
        version: '1.0.0',
      }))
      env.CV_DATA._setData('cv:history:index', snapshots)

      const request = new Request(
        'https://api.example.com/api/v1/cv/history?limit=3&offset=2',
        { method: 'GET' }
      )
      const response = await handleListHistory(request, env)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.snapshots).toHaveLength(3)
      expect(data.data.limit).toBe(3)
      expect(data.data.offset).toBe(2)
      expect(data.data.total).toBe(10)
    })
  })

  describe('handleGetSnapshot', () => {
    it('should return snapshot by ID', async () => {
      const snapshot = {
        id: 'snap1',
        timestamp: '2025-01-15T00:00:00Z',
        description: 'Test',
        createdBy: 'test@example.com',
        size: 100,
        version: '1.0.0',
        data: validCVData,
      }
      env.CV_DATA._setData('cv:history:snap:snap1', snapshot)

      const request = createRequest('GET')
      const response = await handleGetSnapshot(request, env, 'snap1')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.id).toBe('snap1')
      expect(data.data.data.version).toBe('1.0.0')
    })

    it('should return 404 for non-existent snapshot', async () => {
      const request = createRequest('GET')
      const response = await handleGetSnapshot(request, env, 'nonexistent')
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.message).toContain('not found')
    })

    it('should return 400 for empty ID', async () => {
      const request = createRequest('GET')
      const response = await handleGetSnapshot(request, env, '')
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.message).toContain('required')
    })
  })

  describe('handleCreateSnapshot', () => {
    it('should create snapshot of current CV data', async () => {
      env.CV_DATA._setData('cv:data', validCVData)

      const request = createRequest(
        'POST',
        { description: 'Test snapshot' },
        { 'Cf-Access-Authenticated-User-Email': 'user@example.com' }
      )
      const response = await handleCreateSnapshot(request, env)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.data.message).toBe('Snapshot created successfully')
      expect(data.data.snapshot.description).toBe('Test snapshot')
      expect(data.data.snapshot.createdBy).toBe('user@example.com')
      expect(data.data.snapshot.version).toBe('1.0.0')
    })

    it('should create snapshot with default description', async () => {
      env.CV_DATA._setData('cv:data', validCVData)

      const request = createRequest('POST')
      const response = await handleCreateSnapshot(request, env)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.data.snapshot.description).toBe('Manual snapshot')
    })

    it('should return 404 when no CV data exists', async () => {
      const request = createRequest('POST')
      const response = await handleCreateSnapshot(request, env)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.message).toContain('No CV data found')
    })

    it('should update history index', async () => {
      env.CV_DATA._setData('cv:data', validCVData)
      env.CV_DATA._setData('cv:history:index', [])

      const request = createRequest('POST', { description: 'First' })
      await handleCreateSnapshot(request, env)

      const indexRaw = env.CV_DATA._store.get('cv:history:index')
      expect(indexRaw).toBeDefined()
      const index = JSON.parse(indexRaw!)
      expect(index).toHaveLength(1)
    })

    it('should enforce retention limit', async () => {
      env.CV_DATA._setData('cv:data', validCVData)

      // Create 50 existing snapshots (at the limit)
      const existingSnapshots = Array.from({ length: 50 }, (_, i) => ({
        id: `old-snap-${i}`,
        timestamp: new Date(2024, 0, i + 1).toISOString(),
        description: `Old snapshot ${i}`,
        createdBy: null,
        size: 100,
        version: '1.0.0',
      }))
      env.CV_DATA._setData('cv:history:index', existingSnapshots)

      // Store the oldest snapshot data
      env.CV_DATA._setData('cv:history:snap:old-snap-0', {
        ...existingSnapshots[0],
        data: validCVData,
      })

      const request = createRequest('POST', { description: 'New snapshot' })
      await handleCreateSnapshot(request, env)

      const indexRaw = env.CV_DATA._store.get('cv:history:index')
      const index = JSON.parse(indexRaw!)
      expect(index).toHaveLength(50) // Still at limit
      expect(index[0].description).toBe('New snapshot') // New one at front
    })
  })

  describe('handleDeleteSnapshot', () => {
    it('should delete snapshot', async () => {
      const snapshot = {
        id: 'snap1',
        timestamp: '2025-01-15T00:00:00Z',
        description: 'Test',
        createdBy: null,
        size: 100,
        version: '1.0.0',
        data: validCVData,
      }
      env.CV_DATA._setData('cv:history:snap:snap1', snapshot)
      env.CV_DATA._setData('cv:history:index', [
        {
          id: 'snap1',
          timestamp: '2025-01-15T00:00:00Z',
          description: 'Test',
          createdBy: null,
          size: 100,
          version: '1.0.0',
        },
      ])

      const request = createRequest('DELETE')
      const response = await handleDeleteSnapshot(request, env, 'snap1')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.message).toBe('Snapshot deleted successfully')
      expect(data.data.id).toBe('snap1')
    })

    it('should return 404 for non-existent snapshot', async () => {
      const request = createRequest('DELETE')
      const response = await handleDeleteSnapshot(request, env, 'nonexistent')
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.message).toContain('not found')
    })

    it('should return 400 for empty ID', async () => {
      const request = createRequest('DELETE')
      const response = await handleDeleteSnapshot(request, env, '')
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.message).toContain('required')
    })

    it('should update history index after deletion', async () => {
      const snapshot = {
        id: 'snap1',
        timestamp: '2025-01-15T00:00:00Z',
        description: 'Test',
        createdBy: null,
        size: 100,
        version: '1.0.0',
        data: validCVData,
      }
      env.CV_DATA._setData('cv:history:snap:snap1', snapshot)
      env.CV_DATA._setData('cv:history:index', [
        {
          id: 'snap1',
          timestamp: '2025-01-15T00:00:00Z',
          description: 'Test',
          createdBy: null,
          size: 100,
          version: '1.0.0',
        },
        {
          id: 'snap2',
          timestamp: '2025-01-14T00:00:00Z',
          description: 'Other',
          createdBy: null,
          size: 100,
          version: '1.0.0',
        },
      ])

      const request = createRequest('DELETE')
      await handleDeleteSnapshot(request, env, 'snap1')

      const indexRaw = env.CV_DATA._store.get('cv:history:index')
      const index = JSON.parse(indexRaw!)
      expect(index).toHaveLength(1)
      expect(index[0].id).toBe('snap2')
    })
  })
})
