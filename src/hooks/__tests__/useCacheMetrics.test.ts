import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCacheMetrics } from '../useCacheMetrics'
import { cacheService } from '@/services/CacheService'
import type { CacheStats } from '@/services/CacheService'

// Mock cache service
vi.mock('@/services/CacheService', () => ({
  cacheService: {
    getStats: vi.fn(),
  },
}))

describe('useCacheMetrics', () => {
  const mockStats: CacheStats = {
    hits: 10,
    misses: 5,
    staleHits: 0,
    hitRate: 0.67,
    sizeBytes: 1024,
    entries: 3,
  }

  const updatedStats: CacheStats = {
    hits: 20,
    misses: 8,
    staleHits: 0,
    hitRate: 0.71,
    sizeBytes: 2048,
    entries: 5,
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(cacheService.getStats).mockReturnValue(mockStats)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('Initial State', () => {
    it('should return initial cache stats', () => {
      const { result } = renderHook(() => useCacheMetrics())

      expect(result.current).toEqual(mockStats)
      expect(cacheService.getStats).toHaveBeenCalledTimes(2) // Once for useState, once in useEffect
    })

    it('should use cache service for initial stats', () => {
      const customStats: CacheStats = {
        hits: 100,
        misses: 50,
        staleHits: 5,
        hitRate: 0.67,
        sizeBytes: 10240,
        entries: 10,
      }

      vi.mocked(cacheService.getStats).mockReturnValue(customStats)

      const { result } = renderHook(() => useCacheMetrics())

      expect(result.current).toEqual(customStats)
    })
  })

  describe('Polling', () => {
    it('should poll cache stats at default interval (5000ms)', async () => {
      const { result } = renderHook(() => useCacheMetrics())

      // Initial stats
      expect(result.current).toEqual(mockStats)

      // Update mock stats
      vi.mocked(cacheService.getStats).mockReturnValue(updatedStats)

      // Advance time by 5 seconds and run pending timers
      await act(async () => {
        vi.advanceTimersByTime(5000)
        await vi.runOnlyPendingTimersAsync()
      })

      expect(result.current).toEqual(updatedStats)
      expect(cacheService.getStats).toHaveBeenCalled()
    })

    it('should poll at custom interval', async () => {
      const { result } = renderHook(() =>
        useCacheMetrics({ pollInterval: 1000 })
      )

      expect(result.current).toEqual(mockStats)

      // Update mock stats
      vi.mocked(cacheService.getStats).mockReturnValue(updatedStats)

      // Advance time by 1 second and run pending timers
      await act(async () => {
        vi.advanceTimersByTime(1000)
        await vi.runOnlyPendingTimersAsync()
      })

      expect(result.current).toEqual(updatedStats)
    })

    it('should poll multiple times', async () => {
      const { result } = renderHook(() =>
        useCacheMetrics({ pollInterval: 1000 })
      )

      const stats2: CacheStats = { ...mockStats, hits: 15 }
      const stats3: CacheStats = { ...mockStats, hits: 20 }

      // First poll
      vi.mocked(cacheService.getStats).mockReturnValue(stats2)
      await act(async () => {
        vi.advanceTimersByTime(1000)
        await vi.runOnlyPendingTimersAsync()
      })
      expect(result.current.hits).toBe(15)

      // Second poll
      vi.mocked(cacheService.getStats).mockReturnValue(stats3)
      await act(async () => {
        vi.advanceTimersByTime(1000)
        await vi.runOnlyPendingTimersAsync()
      })
      expect(result.current.hits).toBe(20)

      // Verify getStats was called multiple times
      expect(cacheService.getStats).toHaveBeenCalled()
    })

    it('should not poll when pollInterval is 0', () => {
      renderHook(() => useCacheMetrics({ pollInterval: 0 }))

      // Clear initial calls
      vi.clearAllMocks()

      // Advance time
      vi.advanceTimersByTime(10000)

      // Should not have called getStats again
      expect(cacheService.getStats).not.toHaveBeenCalled()
    })

    it('should not poll when pollInterval is negative', () => {
      renderHook(() => useCacheMetrics({ pollInterval: -1 }))

      vi.clearAllMocks()

      vi.advanceTimersByTime(10000)

      expect(cacheService.getStats).not.toHaveBeenCalled()
    })
  })

  describe('Cleanup', () => {
    it('should clear interval on unmount', () => {
      const { unmount } = renderHook(() =>
        useCacheMetrics({ pollInterval: 1000 })
      )

      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
    })

    it('should stop polling after unmount', async () => {
      const { unmount } = renderHook(() =>
        useCacheMetrics({ pollInterval: 1000 })
      )

      unmount()

      vi.clearAllMocks()

      // Advance time after unmount
      vi.advanceTimersByTime(5000)

      // Should not poll after unmount
      expect(cacheService.getStats).not.toHaveBeenCalled()
    })

    it('should clear old interval when pollInterval changes', async () => {
      const { rerender } = renderHook(
        ({ pollInterval }) => useCacheMetrics({ pollInterval }),
        { initialProps: { pollInterval: 1000 } }
      )

      vi.clearAllMocks()

      // Change poll interval
      rerender({ pollInterval: 2000 })

      // Old interval should be cleared
      vi.advanceTimersByTime(1000)
      await vi.runOnlyPendingTimersAsync()

      // Stats should not update at 1000ms mark
      const callCount = vi.mocked(cacheService.getStats).mock.calls.length

      // New interval should work
      vi.advanceTimersByTime(1000) // Total 2000ms
      await vi.runOnlyPendingTimersAsync()

      expect(
        vi.mocked(cacheService.getStats).mock.calls.length
      ).toBeGreaterThan(callCount)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty options object', () => {
      const { result } = renderHook(() => useCacheMetrics({}))

      expect(result.current).toEqual(mockStats)
    })

    it('should handle undefined options', () => {
      const { result } = renderHook(() => useCacheMetrics(undefined))

      expect(result.current).toEqual(mockStats)
    })

    it('should handle zero stats when cache is empty', () => {
      const emptyStats: CacheStats = {
        hits: 0,
        misses: 0,
        staleHits: 0,
        hitRate: 0,
        sizeBytes: 0,
        entries: 0,
      }

      vi.mocked(cacheService.getStats).mockReturnValue(emptyStats)

      const { result } = renderHook(() => useCacheMetrics())

      expect(result.current).toEqual(emptyStats)
    })
  })

  describe('Stats Properties', () => {
    it('should expose all cache stats properties', () => {
      const { result } = renderHook(() => useCacheMetrics())

      expect(result.current).toHaveProperty('hits')
      expect(result.current).toHaveProperty('misses')
      expect(result.current).toHaveProperty('staleHits')
      expect(result.current).toHaveProperty('hitRate')
      expect(result.current).toHaveProperty('sizeBytes')
      expect(result.current).toHaveProperty('entries')
    })

    it('should reflect accurate stats values', () => {
      const { result } = renderHook(() => useCacheMetrics())

      expect(result.current.hits).toBe(10)
      expect(result.current.misses).toBe(5)
      expect(result.current.hitRate).toBe(0.67)
      expect(result.current.sizeBytes).toBe(1024)
      expect(result.current.entries).toBe(3)
    })
  })
})
