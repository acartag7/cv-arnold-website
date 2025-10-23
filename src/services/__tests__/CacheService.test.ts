/**
 * CacheService Tests
 *
 * Tests for caching service including:
 * - TTL-based expiration
 * - Stale-while-revalidate pattern
 * - IndexedDB persistence
 * - Cache statistics
 * - Cache size management
 * - Cache warming
 * - Automatic cleanup
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock withRetry before importing CacheService
vi.mock('@/lib/retry', () => ({
  withRetry: vi.fn(fn => fn()),
}))

// Import after mocks are set up
import { CacheService } from '../CacheService'

// ============================================================================
// Tests
// ============================================================================

describe('CacheService', () => {
  let cache: CacheService

  beforeEach(async () => {
    // Create fresh instance for each test
    cache = CacheService.getInstance()
    // Clear cache entries and reset stats for clean test environment
    await cache.clear()
    cache.resetStats() // Reset historical metrics for isolated test runs
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    cache.destroy()
    vi.useRealTimers()
  })

  // ==========================================================================
  // Singleton Pattern
  // ==========================================================================

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = CacheService.getInstance()
      const instance2 = CacheService.getInstance()

      expect(instance1).toBe(instance2)
    })
  })

  // ==========================================================================
  // Basic Caching
  // ==========================================================================

  describe('Basic Caching', () => {
    it('should cache and retrieve values', async () => {
      const testData = { id: 1, name: 'Test' }

      await cache.set('test-key', testData)
      const result = await cache.get('test-key', async () => testData)

      expect(result).toEqual(testData)
    })

    it('should call fetcher on cache miss', async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })

      const result = await cache.get('missing-key', fetcher)

      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ data: 'test' })
    })

    it('should not call fetcher on cache hit', async () => {
      const testData = { data: 'test' }
      const fetcher = vi.fn().mockResolvedValue(testData)

      await cache.set('test-key', testData)
      await cache.get('test-key', fetcher)

      expect(fetcher).not.toHaveBeenCalled()
    })

    it('should delete cached values', async () => {
      await cache.set('test-key', { data: 'test' })
      await cache.delete('test-key')

      const fetcher = vi.fn().mockResolvedValue({ data: 'new' })
      await cache.get('test-key', fetcher)

      expect(fetcher).toHaveBeenCalled()
    })

    it('should clear all cached values', async () => {
      await cache.set('key1', { data: 1 })
      await cache.set('key2', { data: 2 })
      await cache.clear()

      const fetcher1 = vi.fn().mockResolvedValue({ data: 1 })
      const fetcher2 = vi.fn().mockResolvedValue({ data: 2 })

      await cache.get('key1', fetcher1)
      await cache.get('key2', fetcher2)

      expect(fetcher1).toHaveBeenCalled()
      expect(fetcher2).toHaveBeenCalled()
    })
  })

  // ==========================================================================
  // TTL Expiration
  // ==========================================================================

  describe('TTL Expiration', () => {
    it('should expire after TTL', async () => {
      const testData = { data: 'test' }
      const fetcher = vi.fn().mockResolvedValue(testData)

      await cache.set('test-key', testData, { ttl: 5000 })

      // Before TTL
      await cache.get('test-key', fetcher)
      expect(fetcher).not.toHaveBeenCalled()

      // After TTL
      vi.advanceTimersByTime(6000)
      await cache.get('test-key', fetcher)
      expect(fetcher).toHaveBeenCalled()
    })

    it('should use custom TTL values', async () => {
      const testData = { data: 'test' }

      await cache.set('short-ttl', testData, { ttl: 1000 })
      await cache.set('long-ttl', testData, { ttl: 10000 })

      vi.advanceTimersByTime(2000)

      const shortFetcher = vi.fn().mockResolvedValue(testData)
      const longFetcher = vi.fn().mockResolvedValue(testData)

      await cache.get('short-ttl', shortFetcher)
      await cache.get('long-ttl', longFetcher)

      expect(shortFetcher).toHaveBeenCalled()
      expect(longFetcher).not.toHaveBeenCalled()
    })
  })

  // ==========================================================================
  // Stale-While-Revalidate
  // ==========================================================================

  describe('Stale-While-Revalidate', () => {
    it('should return stale value and revalidate in background', async () => {
      const staleData = { data: 'stale' }
      const freshData = { data: 'fresh' }
      const fetcher = vi.fn().mockResolvedValue(freshData)

      // Set with short TTL but longer stale TTL
      await cache.set('test-key', staleData, {
        ttl: 1000,
        staleTtl: 5000,
      })

      // Advance past TTL but before staleTtl
      vi.advanceTimersByTime(2000)

      // Should return stale value
      const result = await cache.get('test-key', fetcher)
      expect(result).toEqual(staleData)

      // Fetcher should be called in background
      await vi.runAllTimersAsync()
      expect(fetcher).toHaveBeenCalled()
    })

    it('should fetch fresh data after staleTtl expires', async () => {
      const staleData = { data: 'stale' }
      const freshData = { data: 'fresh' }
      const fetcher = vi.fn().mockResolvedValue(freshData)

      await cache.set('test-key', staleData, {
        ttl: 1000,
        staleTtl: 5000,
      })

      // Advance past staleTtl
      vi.advanceTimersByTime(6000)

      const result = await cache.get('test-key', fetcher)
      expect(result).toEqual(freshData)
      expect(fetcher).toHaveBeenCalled()
    })
  })

  // ==========================================================================
  // Force Refresh
  // ==========================================================================

  describe('Force Refresh', () => {
    it('should bypass cache when forceRefresh is true', async () => {
      const cachedData = { data: 'cached' }
      const freshData = { data: 'fresh' }
      const fetcher = vi.fn().mockResolvedValue(freshData)

      await cache.set('test-key', cachedData)

      const result = await cache.get('test-key', fetcher, {
        forceRefresh: true,
      })

      expect(result).toEqual(freshData)
      expect(fetcher).toHaveBeenCalled()
    })
  })

  // ==========================================================================
  // Cache Versioning
  // ==========================================================================

  describe('Cache Versioning', () => {
    it('should treat version mismatch as cache miss', async () => {
      const v1Data = { data: 'version 1' }
      const v2Data = { data: 'version 2' }
      const fetcher = vi.fn().mockResolvedValue(v2Data)

      // Cache with version 1
      await cache.set('test-key', v1Data, { version: '1.0.0' })

      // Request with version 2 - should fetch fresh
      const result = await cache.get('test-key', fetcher, { version: '2.0.0' })

      expect(result).toEqual(v2Data)
      expect(fetcher).toHaveBeenCalledTimes(1)
    })

    it('should use cached value when versions match', async () => {
      const testData = { data: 'test' }
      const fetcher = vi.fn().mockResolvedValue({ data: 'new' })

      await cache.set('test-key', testData, { version: '1.0.0' })

      const result = await cache.get('test-key', fetcher, { version: '1.0.0' })

      expect(result).toEqual(testData)
      expect(fetcher).not.toHaveBeenCalled()
    })

    it('should work without version (backward compatible)', async () => {
      const testData = { data: 'test' }
      const fetcher = vi.fn().mockResolvedValue(testData)

      await cache.set('test-key', testData)

      const result = await cache.get('test-key', fetcher)

      expect(result).toEqual(testData)
      expect(fetcher).not.toHaveBeenCalled()
    })

    it('should invalidate cache when requesting version for unversioned entry', async () => {
      const oldData = { data: 'old' }
      const newData = { data: 'new' }
      const fetcher = vi.fn().mockResolvedValue(newData)

      // Cache without version
      await cache.set('test-key', oldData)

      // Request with version - should fetch fresh
      const result = await cache.get('test-key', fetcher, { version: '1.0.0' })

      expect(result).toEqual(newData)
      expect(fetcher).toHaveBeenCalledTimes(1)
    })
  })

  // ==========================================================================
  // Cache Statistics
  // ==========================================================================

  describe('Cache Statistics', () => {
    it('should track cache hits and misses', async () => {
      const testData = { data: 'test' }
      const fetcher = vi.fn().mockResolvedValue(testData)

      // Cache miss
      await cache.get('key1', fetcher)

      // Cache hit
      await cache.set('key2', testData)
      await cache.get('key2', fetcher)

      const stats = cache.getStats()
      expect(stats.misses).toBe(1)
      expect(stats.hits).toBe(1)
    })

    it('should track stale hits separately', async () => {
      const testData = { data: 'test' }
      const fetcher = vi.fn().mockResolvedValue(testData)

      await cache.set('test-key', testData, {
        ttl: 1000,
        staleTtl: 5000,
      })

      // Advance to stale state
      vi.advanceTimersByTime(2000)

      await cache.get('test-key', fetcher)

      const stats = cache.getStats()
      expect(stats.staleHits).toBe(1)
    })

    it('should calculate hit rate', async () => {
      const testData = { data: 'test' }
      const fetcher = vi.fn().mockResolvedValue(testData)

      // 1 miss
      await cache.get('key1', fetcher)

      // 2 hits
      await cache.set('key2', testData)
      await cache.get('key2', fetcher)
      await cache.get('key2', fetcher)

      const stats = cache.getStats()
      expect(stats.hitRate).toBe(2 / 3)
    })

    it('should track number of entries', async () => {
      await cache.set('key1', { data: 1 })
      await cache.set('key2', { data: 2 })
      await cache.set('key3', { data: 3 })

      const stats = cache.getStats()
      expect(stats.entries).toBe(3)
    })

    it('should track cache size in bytes', async () => {
      await cache.set('small', { x: 1 })
      await cache.set('large', { x: 1, y: 2, z: { a: 1, b: 2, c: 3 } })

      const stats = cache.getStats()
      expect(stats.sizeBytes).toBeGreaterThan(0)
    })
  })

  // ==========================================================================
  // Cache Warming
  // ==========================================================================

  describe('Cache Warming', () => {
    it('should warm cache with multiple entries', async () => {
      await cache.warm([
        ['key1', { data: 1 }],
        ['key2', { data: 2 }],
        ['key3', { data: 3 }],
      ])

      const stats = cache.getStats()
      expect(stats.entries).toBe(3)
    })

    it('should apply options when warming', async () => {
      await cache.warm([['key1', { data: 1 }, { ttl: 1000 }]])

      const fetcher = vi.fn().mockResolvedValue({ data: 1 })

      // Before TTL
      await cache.get('key1', fetcher)
      expect(fetcher).not.toHaveBeenCalled()

      // After TTL
      vi.advanceTimersByTime(2000)
      await cache.get('key1', fetcher)
      expect(fetcher).toHaveBeenCalled()
    })
  })

  // ==========================================================================
  // Automatic Cleanup
  // ==========================================================================

  describe('Automatic Cleanup', () => {
    it('should remove expired entries during cleanup', async () => {
      await cache.set(
        'key1',
        { data: 1 },
        {
          ttl: 1000,
          staleTtl: 2000,
        }
      )

      await cache.set(
        'key2',
        { data: 2 },
        {
          ttl: 5000,
          staleTtl: 10000,
        }
      )

      // Advance past key1 staleTtl
      vi.advanceTimersByTime(3000)

      cache.cleanup()

      const stats = cache.getStats()
      expect(stats.entries).toBe(1)
    })
  })

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  describe('Error Handling', () => {
    it('should throw error when fetcher fails', async () => {
      const fetcher = vi.fn().mockRejectedValue(new Error('Fetch failed'))

      await expect(cache.get('test-key', fetcher)).rejects.toThrow(
        'Fetch failed'
      )
    })

    it('should call fetcher through retry mechanism', async () => {
      const testData = { data: 'test' }
      const fetcher = vi.fn().mockResolvedValue(testData)

      const result = await cache.get('test-key', fetcher)

      expect(result).toEqual(testData)
      expect(fetcher).toHaveBeenCalled()
    })
  })

  // ==========================================================================
  // Cache Size Management
  // ==========================================================================

  describe('Cache Size Management', () => {
    it('should estimate value sizes', async () => {
      const smallValue = { x: 1 }
      const largeValue = {
        data: 'a'.repeat(1000),
        nested: { more: 'data'.repeat(100) },
      }

      await cache.set('small', smallValue)
      await cache.set('large', largeValue)

      const stats = cache.getStats()
      expect(stats.sizeBytes).toBeGreaterThan(0)
    })

    it('should evict oldest entries when exceeding 10MB limit', async () => {
      // Create entries that will exceed the 10MB limit
      // Each entry will be ~2MB of data
      const largeString = 'x'.repeat(2 * 1024 * 1024) // 2MB string

      // Add 6 entries of 2MB each (12MB total, exceeding 10MB limit)
      for (let i = 0; i < 6; i++) {
        await cache.set(
          `large-${i}`,
          { data: largeString },
          {
            ttl: 60000,
          }
        )
      }

      const stats = cache.getStats()

      // Cache size should be under or around 10MB due to eviction
      const tenMB = 10 * 1024 * 1024
      expect(stats.sizeBytes).toBeLessThanOrEqual(tenMB * 1.1) // Allow 10% tolerance for entry overhead

      // First entries should have been evicted (oldest first)
      const firstEntry = await cache.get('large-0', async () => ({
        data: 'refetched',
      }))
      expect(firstEntry.data).toBe('refetched') // Had to refetch, was evicted

      // Latest entries should still be in cache
      const lastEntry = await cache.get('large-5', async () => ({
        data: 'should-not-call',
      }))
      expect(lastEntry.data).toBe(largeString) // Still in cache
    })
  })
})
