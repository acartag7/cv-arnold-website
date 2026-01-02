/**
 * Tests for HistoryService client-side API wrapper
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { HistoryService, HistoryAPIError } from '../HistoryService'

// Mock snapshot data
const mockSnapshotMetadata = {
  id: 'abc123',
  timestamp: '2025-01-15T10:00:00Z',
  description: 'Test snapshot',
  createdBy: 'test@example.com',
  size: 1024,
  version: '1.0.0',
}

const mockSnapshot = {
  ...mockSnapshotMetadata,
  data: {
    version: '1.0.0',
    personalInfo: { fullName: 'Test User' },
  },
}

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('HistoryService', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('list', () => {
    it('should list snapshots with default pagination', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            snapshots: [mockSnapshotMetadata],
            total: 1,
            limit: 20,
            offset: 0,
          },
        }),
      })

      const result = await HistoryService.list()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/cv/history',
        expect.any(Object)
      )
      expect(result.snapshots).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('should list snapshots with custom pagination', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            snapshots: [],
            total: 10,
            limit: 5,
            offset: 5,
          },
        }),
      })

      const result = await HistoryService.list({ limit: 5, offset: 5 })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/cv/history?limit=5&offset=5',
        expect.any(Object)
      )
      expect(result.limit).toBe(5)
      expect(result.offset).toBe(5)
    })

    it('should throw HistoryAPIError on HTTP error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      })

      await expect(HistoryService.list()).rejects.toThrow(HistoryAPIError)
    })
  })

  describe('get', () => {
    it('should get a specific snapshot', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockSnapshot }),
      })

      const result = await HistoryService.get('abc123')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/cv/history/abc123',
        expect.any(Object)
      )
      expect(result.id).toBe('abc123')
      expect(result.data).toBeDefined()
    })

    it('should throw on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Snapshot not found' }),
      })

      await expect(HistoryService.get('nonexistent')).rejects.toThrow(
        HistoryAPIError
      )
    })
  })

  describe('create', () => {
    it('should create a snapshot without description', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            message: 'Snapshot created',
            snapshot: mockSnapshotMetadata,
          },
        }),
      })

      const result = await HistoryService.create()

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/cv/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      expect(result.id).toBe('abc123')
    })

    it('should create a snapshot with description', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            message: 'Snapshot created',
            snapshot: { ...mockSnapshotMetadata, description: 'Before update' },
          },
        }),
      })

      const result = await HistoryService.create({
        description: 'Before update',
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/cv/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'Before update' }),
      })
      expect(result.description).toBe('Before update')
    })

    it('should throw on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal error' }),
      })

      await expect(HistoryService.create()).rejects.toThrow(HistoryAPIError)
    })
  })

  describe('delete', () => {
    it('should delete a snapshot', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { message: 'Deleted', id: 'abc123' },
        }),
      })

      await expect(HistoryService.delete('abc123')).resolves.toBeUndefined()

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/cv/history/abc123', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
    })

    it('should throw on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Snapshot not found' }),
      })

      await expect(HistoryService.delete('nonexistent')).rejects.toThrow(
        HistoryAPIError
      )
    })
  })
})

describe('HistoryAPIError', () => {
  it('should have correct properties', () => {
    const error = new HistoryAPIError('Test error', 500, 'TEST_CODE')

    expect(error.message).toBe('Test error')
    expect(error.status).toBe(500)
    expect(error.code).toBe('TEST_CODE')
    expect(error.name).toBe('HistoryAPIError')
  })

  it('should be instanceof Error', () => {
    const error = new HistoryAPIError('Test error', 500)

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(HistoryAPIError)
  })
})
