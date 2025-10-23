/**
 * useCacheMetrics Hook
 *
 * Custom React hook for monitoring cache performance metrics in real-time.
 * Useful for production observability, debugging, and performance optimization.
 *
 * @module hooks/useCacheMetrics
 */

import { useState, useEffect } from 'react'
import { cacheService } from '@/services/CacheService'
import type { CacheStats } from '@/services/CacheService'

export interface UseCacheMetricsOptions {
  /**
   * Polling interval in milliseconds (default: 5000ms / 5 seconds)
   * Set to 0 to disable automatic polling
   */
  pollInterval?: number
}

/**
 * Hook for monitoring cache performance metrics
 *
 * @param options - Configuration options for polling behavior
 * @returns Current cache statistics
 *
 * @example
 * ```tsx
 * function CacheMonitor() {
 *   const metrics = useCacheMetrics({ pollInterval: 3000 })
 *
 *   return (
 *     <div>
 *       <p>Hit Rate: {(metrics.hitRate * 100).toFixed(2)}%</p>
 *       <p>Total Hits: {metrics.hits}</p>
 *       <p>Total Misses: {metrics.misses}</p>
 *       <p>Cache Size: {(metrics.sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useCacheMetrics(
  options: UseCacheMetricsOptions = {}
): CacheStats {
  const { pollInterval = 5000 } = options

  const [stats, setStats] = useState<CacheStats>(() => cacheService.getStats())

  useEffect(() => {
    // Get initial stats
    setStats(cacheService.getStats())

    // Set up polling if interval > 0
    if (pollInterval > 0) {
      const interval = setInterval(() => {
        setStats(cacheService.getStats())
      }, pollInterval)

      return () => clearInterval(interval)
    }

    return undefined
  }, [pollInterval])

  return stats
}
