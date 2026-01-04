/**
 * Tests for KVStorageAdapter
 *
 * Covers:
 * - Basic CRUD operations
 * - Compression/decompression
 * - Versioning support
 * - Error handling
 * - Metadata tracking
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { KVStorageAdapter } from '../KVStorageAdapter'
import type { KVNamespace } from '../KVConfig'
import type { CVData } from '@/types/cv'
import { CVStorageError } from '@/lib/errors'

// Mock CV data for testing
const mockCVData: CVData = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  personalInfo: {
    fullName: 'Test User',
    title: 'Software Engineer',
    email: 'test@example.com',
    phone: '+1234567890',
    location: {
      city: 'Test City',
      country: 'Test Country',
      countryCode: 'TC',
    },
    social: {
      linkedin: 'https://linkedin.com/in/testuser',
      github: 'https://github.com/testuser',
    },
    summary: 'Test summary',
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

describe('KVStorageAdapter', () => {
  let adapter: KVStorageAdapter
  let mockNamespace: KVNamespace
  let kvStore: Map<string, string | ArrayBuffer>

  beforeEach(() => {
    // Reset store
    kvStore = new Map()

    // Mock KV namespace
    // IMPORTANT: The adapter now uses BINARY-FIRST approach (always reads as arrayBuffer)
    mockNamespace = {
      get: vi.fn(async (key: string, type?: string) => {
        const value = kvStore.get(key)
        if (!value) return null

        if (type === 'json') {
          // Still need this for metadata reads
          if (typeof value === 'string') {
            return JSON.parse(value)
          }
          return null
        }
        if (type === 'arrayBuffer') {
          // Convert string data to ArrayBuffer for binary-first reads
          if (typeof value === 'string') {
            const encoder = new TextEncoder()
            return encoder.encode(value).buffer
          }
          // Already an ArrayBuffer (compressed)
          return value as ArrayBuffer
        }
        return value as string
      }),
      put: vi.fn(async (key: string, value: string | ArrayBuffer) => {
        kvStore.set(key, value)
      }),
      delete: vi.fn(async (key: string) => {
        kvStore.delete(key)
      }),
      list: vi.fn(async (options?: { prefix?: string; limit?: number }) => {
        const keys = Array.from(kvStore.keys())
          .filter(k => !options?.prefix || k.startsWith(options.prefix))
          .slice(0, options?.limit || 1000)
          .map(name => ({ name }))

        return {
          keys,
          list_complete: true,
        }
      }),
    } as unknown as KVNamespace

    // Create adapter with mocked namespace
    adapter = new KVStorageAdapter({
      namespace: mockNamespace,
      keyPrefix: 'cv',
      version: 'v1',
      enableCompression: false, // Disable for basic tests
    })
  })

  describe('getData', () => {
    it('should retrieve CV data from KV', async () => {
      // Arrange: Store mock data
      const wrapped = {
        data: mockCVData,
        compressed: false,
        timestamp: new Date().toISOString(),
      }
      kvStore.set('cv:data:v1', JSON.stringify(wrapped))

      // Act
      const result = await adapter.getData()

      // Assert
      expect(result).toEqual(mockCVData)
      // Binary-first approach: always reads as arrayBuffer
      expect(mockNamespace.get).toHaveBeenCalledWith(
        'cv:data:v1',
        'arrayBuffer'
      )
    })

    it('should return null when no data exists', async () => {
      // Act
      const result = await adapter.getData()

      // Assert
      expect(result).toBeNull()
    })

    it('should handle legacy data format (unwrapped)', async () => {
      // Arrange: Store data in legacy format (direct CV data)
      kvStore.set('cv:data:v1', JSON.stringify(mockCVData))

      // Act
      const result = await adapter.getData()

      // Assert
      expect(result).toEqual(mockCVData)
    })

    it('should throw CVStorageError on failure', async () => {
      // Arrange: Mock error
      vi.mocked(mockNamespace.get).mockRejectedValue(
        new Error('KV unavailable')
      )

      // Act & Assert
      await expect(adapter.getData()).rejects.toThrow(CVStorageError)
      await expect(adapter.getData()).rejects.toThrow(
        'Failed to retrieve CV data from KV'
      )
    })
  })

  describe('updateData', () => {
    it('should store CV data in KV with metadata', async () => {
      // Act
      await adapter.updateData(mockCVData)

      // Assert
      expect(mockNamespace.put).toHaveBeenCalled()
      const storedData = kvStore.get('cv:data:v1')
      expect(storedData).toBeDefined()

      const parsed = JSON.parse(storedData as string)
      expect(parsed).toMatchObject({
        data: mockCVData,
        compressed: false,
        timestamp: expect.any(String),
      })
    })

    it('should update metadata after storing data', async () => {
      // Act
      await adapter.updateData(mockCVData)

      // Assert
      const metadata = kvStore.get('cv:metadata')
      expect(metadata).toBeDefined()

      const parsed = JSON.parse(metadata as string)
      expect(parsed).toMatchObject({
        lastUpdated: expect.any(String),
        version: 'v1',
      })
    })

    it('should throw CVStorageError on failure', async () => {
      // Arrange: Mock error
      vi.mocked(mockNamespace.put).mockRejectedValueOnce(
        new Error('KV write failed')
      )

      // Act & Assert
      await expect(adapter.updateData(mockCVData)).rejects.toThrow(
        CVStorageError
      )
    })
  })

  describe('getSection', () => {
    it('should retrieve specific section from KV', async () => {
      // Arrange: Store section data
      const wrapped = {
        data: mockCVData.personalInfo,
        compressed: false,
        timestamp: new Date().toISOString(),
      }
      kvStore.set('cv:section:personalInfo:v1', JSON.stringify(wrapped))

      // Act
      const result = await adapter.getSection('personalInfo')

      // Assert
      expect(result).toEqual(mockCVData.personalInfo)
      // Binary-first approach: always reads as arrayBuffer
      expect(mockNamespace.get).toHaveBeenCalledWith(
        'cv:section:personalInfo:v1',
        'arrayBuffer'
      )
    })

    it('should return null when section does not exist', async () => {
      // Act
      const result = await adapter.getSection('experience')

      // Assert
      expect(result).toBeNull()
    })

    it('should throw CVStorageError on failure', async () => {
      // Arrange: Mock error
      vi.mocked(mockNamespace.get).mockRejectedValueOnce(
        new Error('KV unavailable')
      )

      // Act & Assert
      await expect(adapter.getSection('personalInfo')).rejects.toThrow(
        CVStorageError
      )
    })
  })

  describe('updateSection', () => {
    it('should store section data in KV with metadata', async () => {
      // Act
      await adapter.updateSection('personalInfo', mockCVData.personalInfo)

      // Assert
      const storedData = kvStore.get('cv:section:personalInfo:v1')
      expect(storedData).toBeDefined()

      const parsed = JSON.parse(storedData as string)
      expect(parsed).toMatchObject({
        data: mockCVData.personalInfo,
        compressed: false,
        timestamp: expect.any(String),
      })
    })

    it('should throw CVStorageError on failure', async () => {
      // Arrange: Mock error
      vi.mocked(mockNamespace.put).mockRejectedValueOnce(
        new Error('KV write failed')
      )

      // Act & Assert
      await expect(
        adapter.updateSection('personalInfo', mockCVData.personalInfo)
      ).rejects.toThrow(CVStorageError)
    })
  })

  describe('exists', () => {
    it('should return true when CV data exists', async () => {
      // Arrange: Store data
      const wrapped = {
        data: mockCVData,
        compressed: false,
        timestamp: new Date().toISOString(),
      }
      kvStore.set('cv:data:v1', JSON.stringify(wrapped))

      // Act
      const result = await adapter.exists()

      // Assert
      expect(result).toBe(true)
    })

    it('should return false when CV data does not exist', async () => {
      // Act
      const result = await adapter.exists()

      // Assert
      expect(result).toBe(false)
    })

    it('should return false on error instead of throwing', async () => {
      // Arrange: Mock error
      vi.mocked(mockNamespace.get).mockRejectedValueOnce(
        new Error('KV unavailable')
      )

      // Act
      const result = await adapter.exists()

      // Assert
      expect(result).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete main data and metadata', async () => {
      // Arrange: Store data
      kvStore.set('cv:data:v1', JSON.stringify(mockCVData))
      kvStore.set('cv:metadata', JSON.stringify({ version: 'v1' }))

      // Act
      await adapter.delete()

      // Assert
      expect(mockNamespace.delete).toHaveBeenCalledWith('cv:data:v1')
      expect(mockNamespace.delete).toHaveBeenCalledWith('cv:metadata')
      expect(kvStore.has('cv:data:v1')).toBe(false)
      expect(kvStore.has('cv:metadata')).toBe(false)
    })

    it('should delete all section keys', async () => {
      // Arrange: Store sections
      kvStore.set('cv:section:personalInfo:v1', JSON.stringify({}))
      kvStore.set('cv:section:experience:v1', JSON.stringify({}))
      kvStore.set('cv:section:education:v1', JSON.stringify({}))

      // Act
      await adapter.delete()

      // Assert
      expect(mockNamespace.list).toHaveBeenCalledWith({
        prefix: 'cv:section:',
        limit: 1000,
      })
      expect(kvStore.size).toBe(0)
    })

    it('should throw CVStorageError on failure', async () => {
      // Arrange: Mock error
      vi.mocked(mockNamespace.delete).mockRejectedValueOnce(
        new Error('KV delete failed')
      )

      // Act & Assert
      await expect(adapter.delete()).rejects.toThrow(CVStorageError)
    })
  })

  describe('compression', () => {
    beforeEach(() => {
      // Enable compression for these tests
      adapter = new KVStorageAdapter({
        namespace: mockNamespace,
        keyPrefix: 'cv',
        version: 'v1',
        enableCompression: true,
        compressionThreshold: 100, // Low threshold for testing
      })
    })

    it('should compress large data when enabled', async () => {
      // Arrange: Create large data (>100 bytes when serialized)
      const largeData: CVData = {
        ...mockCVData,
        personalInfo: {
          ...mockCVData.personalInfo,
          summary: 'A'.repeat(200), // Make it large
        },
      }

      // Act
      await adapter.updateData(largeData)

      // Assert
      const storedValue = kvStore.get('cv:data:v1')
      expect(storedValue).toBeInstanceOf(ArrayBuffer)
    })

    it('should not compress small data', async () => {
      // Arrange: Small data
      const smallData: CVData = {
        ...mockCVData,
        personalInfo: {
          ...mockCVData.personalInfo,
          summary: 'Short',
        },
      }

      // Recreate adapter with higher threshold
      adapter = new KVStorageAdapter({
        namespace: mockNamespace,
        keyPrefix: 'cv',
        version: 'v1',
        enableCompression: true,
        compressionThreshold: 10000, // High threshold
      })

      // Act
      await adapter.updateData(smallData)

      // Assert
      const storedValue = kvStore.get('cv:data:v1')
      expect(typeof storedValue).toBe('string')
    })

    it('should read compressed data correctly (round-trip)', async () => {
      // Arrange: Create large data that will be compressed
      const largeData: CVData = {
        ...mockCVData,
        personalInfo: {
          ...mockCVData.personalInfo,
          summary: 'A'.repeat(500), // Large enough to trigger compression
        },
      }

      // Act: Write data (will be compressed)
      await adapter.updateData(largeData)

      // Verify it was compressed (stored as ArrayBuffer)
      const storedValue = kvStore.get('cv:data:v1')
      expect(storedValue).toBeInstanceOf(ArrayBuffer)

      // Act: Read data back (should decompress correctly)
      const result = await adapter.getData()

      // Assert: Data should match original
      expect(result).toEqual(largeData)
    })

    it('should handle gzip magic number detection correctly', async () => {
      // Arrange: Create compressed data with gzip magic number
      const largeData: CVData = {
        ...mockCVData,
        personalInfo: {
          ...mockCVData.personalInfo,
          summary: 'B'.repeat(500),
        },
      }

      // Write and read
      await adapter.updateData(largeData)
      const result = await adapter.getData()

      // The data should be read correctly despite being compressed
      expect(result?.personalInfo?.summary).toBe('B'.repeat(500))
    })
  })

  describe('getMetadata', () => {
    it('should retrieve metadata from KV', async () => {
      // Arrange: Store metadata
      const metadata = {
        lastUpdated: new Date().toISOString(),
        version: 'v1',
      }
      kvStore.set('cv:metadata', JSON.stringify(metadata))

      // Act
      const result = await adapter.getMetadata()

      // Assert
      expect(result).toEqual(metadata)
    })

    it('should return null when no metadata exists', async () => {
      // Act
      const result = await adapter.getMetadata()

      // Assert
      expect(result).toBeNull()
    })

    it('should return null on error instead of throwing', async () => {
      // Arrange: Mock error
      vi.mocked(mockNamespace.get).mockRejectedValueOnce(
        new Error('KV unavailable')
      )

      // Act
      const result = await adapter.getMetadata()

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('versioning', () => {
    it('should use version in all keys', async () => {
      // Act
      await adapter.updateData(mockCVData)
      await adapter.updateSection('personalInfo', mockCVData.personalInfo)

      // Assert
      expect(kvStore.has('cv:data:v1')).toBe(true)
      expect(kvStore.has('cv:section:personalInfo:v1')).toBe(true)
      expect(kvStore.has('cv:metadata')).toBe(true)
    })

    it('should support custom version prefix', async () => {
      // Arrange: Create adapter with different version
      const v2Adapter = new KVStorageAdapter({
        namespace: mockNamespace,
        keyPrefix: 'cv',
        version: 'v2',
        enableCompression: false,
      })

      // Act
      await v2Adapter.updateData(mockCVData)

      // Assert
      expect(kvStore.has('cv:data:v2')).toBe(true)
      expect(kvStore.has('cv:data:v1')).toBe(false)
    })

    it('should support custom key prefix', async () => {
      // Arrange: Create adapter with custom prefix
      const customAdapter = new KVStorageAdapter({
        namespace: mockNamespace,
        keyPrefix: 'custom',
        version: 'v1',
        enableCompression: false,
      })

      // Act
      await customAdapter.updateData(mockCVData)

      // Assert
      expect(kvStore.has('custom:data:v1')).toBe(true)
      expect(kvStore.has('cv:data:v1')).toBe(false)
    })
  })
})
