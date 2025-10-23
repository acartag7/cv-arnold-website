/**
 * Cache Service
 *
 * Provides intelligent caching with TTL, stale-while-revalidate pattern,
 * and offline support using IndexedDB.
 *
 * Features:
 * - TTL-based expiration
 * - Stale-while-revalidate for better UX
 * - IndexedDB for offline persistence
 * - Cache size management
 * - Cache warming
 * - Automatic cleanup
 *
 * @module services/CacheService
 */

import { createLogger } from '@/lib/logger'
import { withRetry } from '@/lib/retry'

const logger = createLogger('CacheService')

// ============================================================================
// Types
// ============================================================================

/**
 * Cache entry with metadata
 */
export interface CacheEntry<T = unknown> {
  /** Cached value */
  value: T
  /** Timestamp when cached (ms) */
  cachedAt: number
  /** TTL in milliseconds */
  ttl: number
  /** Stale TTL in milliseconds (for stale-while-revalidate) */
  staleTtl: number
  /** Size estimate in bytes */
  size: number
  /** Optional version for cache invalidation */
  version?: string
}

/**
 * Cache options
 */
export interface CacheOptions {
  /** Time-to-live in milliseconds (default: 5 minutes) */
  ttl?: number
  /** Stale time-to-live in milliseconds (default: 1 hour) */
  staleTtl?: number
  /** Enable IndexedDB persistence (default: true) */
  persist?: boolean
  /** Force cache refresh (default: false) */
  forceRefresh?: boolean
  /** Optional version for automatic invalidation on version mismatch */
  version?: string
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Total cache hits */
  hits: number
  /** Total cache misses */
  misses: number
  /** Total stale hits */
  staleHits: number
  /** Number of cached entries */
  entries: number
  /** Estimated cache size in bytes */
  sizeBytes: number
  /** Hit rate (0-1) */
  hitRate: number
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
const DEFAULT_STALE_TTL = 60 * 60 * 1000 // 1 hour
const MAX_CACHE_SIZE = 10 * 1024 * 1024 // 10 MB
const CLEANUP_INTERVAL = 60 * 1000 // 1 minute
const DB_NAME = 'cv-cache-db'
const DB_VERSION = 1
const STORE_NAME = 'cache-store'

// ============================================================================
// Cache Service Class
// ============================================================================

/**
 * Cache service for data caching with TTL and offline support
 *
 * @example
 * ```typescript
 * const cache = CacheService.getInstance()
 *
 * // Cache data
 * await cache.set('cv-data', cvData, { ttl: 10 * 60 * 1000 })
 *
 * // Get data
 * const data = await cache.get('cv-data', async () => {
 *   return await fetchCVData()
 * })
 * ```
 */
export class CacheService {
  private static instance: CacheService
  private cache: Map<string, CacheEntry>
  private db: IDBDatabase | null = null
  private stats: CacheStats
  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  private constructor() {
    this.cache = new Map()
    this.stats = {
      hits: 0,
      misses: 0,
      staleHits: 0,
      entries: 0,
      sizeBytes: 0,
      hitRate: 0,
    }

    // Initialize IndexedDB
    this.initializeDB().catch(error => {
      logger.error('Failed to initialize IndexedDB', { error })
    })

    // Start cleanup timer
    this.startCleanup()
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  // ==========================================================================
  // Public API
  // ==========================================================================

  /**
   * Get value from cache or execute fetcher
   *
   * Implements stale-while-revalidate pattern:
   * - Returns cached value if fresh
   * - Returns stale value and revalidates in background if stale but not expired
   * - Executes fetcher if expired or not cached
   *
   * @param key Cache key
   * @param fetcher Function to fetch fresh data
   * @param options Cache options
   * @returns Cached or fetched value
   */
  public async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { forceRefresh = false, version } = options

    // Force refresh bypasses cache
    if (forceRefresh) {
      logger.debug('Force refresh requested', { key })
      return await this.fetchAndCache(key, fetcher, options)
    }

    const entry = this.cache.get(key)

    // Cache miss
    if (!entry) {
      logger.debug('Cache miss', { key })
      this.stats.misses++
      this.updateHitRate()
      return await this.fetchAndCache(key, fetcher, options)
    }

    // Version mismatch - treat as cache miss
    if (version && entry.version !== version) {
      logger.debug('Cache version mismatch', {
        key,
        cached: entry.version,
        requested: version,
      })
      this.stats.misses++
      this.updateHitRate()
      return await this.fetchAndCache(key, fetcher, options)
    }

    const now = Date.now()
    const age = now - entry.cachedAt
    const isFresh = age < entry.ttl
    const isStale = age < entry.staleTtl

    // Fresh hit
    if (isFresh) {
      logger.debug('Cache hit (fresh)', { key, age })
      this.stats.hits++
      this.updateHitRate()
      return entry.value as T
    }

    // Stale hit - return stale value and revalidate in background
    if (isStale) {
      logger.debug('Cache hit (stale)', { key, age })
      this.stats.staleHits++
      this.updateHitRate()

      // Revalidate in background (fire and forget)
      this.fetchAndCache(key, fetcher, options).catch(error => {
        logger.error('Background revalidation failed', { key, error })
      })

      return entry.value as T
    }

    // Expired - fetch fresh data
    logger.debug('Cache expired', { key, age })
    this.stats.misses++
    this.updateHitRate()
    return await this.fetchAndCache(key, fetcher, options)
  }

  /**
   * Set value in cache
   *
   * @param key Cache key
   * @param value Value to cache
   * @param options Cache options
   */
  public async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const {
      ttl = DEFAULT_TTL,
      staleTtl = DEFAULT_STALE_TTL,
      persist = true,
      version,
    } = options

    const size = this.estimateSize(value)

    const entry: CacheEntry<T> = {
      value,
      cachedAt: Date.now(),
      ttl,
      staleTtl,
      size,
      ...(version && { version }),
    }

    // Check cache size limit
    if (this.stats.sizeBytes + size > MAX_CACHE_SIZE) {
      logger.warn('Cache size limit exceeded, evicting oldest entries', {
        currentSize: this.stats.sizeBytes,
        newSize: size,
      })
      await this.evictOldest(size)
    }

    this.cache.set(key, entry)
    this.updateStats()

    // Persist to IndexedDB
    if (persist && this.db) {
      await this.persistToDB(key, entry).catch(error => {
        logger.error('Failed to persist to IndexedDB', { key, error })
      })
    }

    logger.debug('Value cached', { key, size, ttl, staleTtl })
  }

  /**
   * Delete value from cache
   *
   * @param key Cache key
   */
  public async delete(key: string): Promise<void> {
    this.cache.delete(key)
    this.updateStats()

    if (this.db) {
      await this.deleteFromDB(key).catch(error => {
        logger.error('Failed to delete from IndexedDB', { key, error })
      })
    }

    logger.debug('Cache entry deleted', { key })
  }

  /**
   * Check if a key exists in the cache (regardless of freshness)
   * Does not trigger fetchers or update statistics
   *
   * @param key - Cache key to check
   * @returns True if key exists in cache
   */
  public has(key: string): boolean {
    return this.cache.has(key)
  }

  /**
   * Check if a key exists in cache and is still fresh (not stale or expired)
   * Does not trigger fetchers or update statistics
   *
   * @param key - Cache key to check
   * @returns True if key exists and is fresh
   */
  public hasFresh(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) {
      return false
    }

    const now = Date.now()
    return now - entry.cachedAt < entry.ttl
  }

  /**
   * Clear all cache entries
   * Preserves historical metrics (hits, misses, staleHits) for monitoring
   * Only resets entry count and size
   */
  public async clear(): Promise<void> {
    this.cache.clear()

    // Only reset entry-specific stats, preserve historical hit/miss metrics
    this.stats.entries = 0
    this.stats.sizeBytes = 0

    this.updateStats()

    if (this.db) {
      await this.clearDB().catch(error => {
        logger.error('Failed to clear IndexedDB', { error })
      })
    }

    logger.info('Cache cleared')
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * Warm cache with initial data
   *
   * @param entries Array of [key, value, options] tuples
   */
  public async warm(
    entries: Array<[string, unknown, CacheOptions?]>
  ): Promise<void> {
    logger.info('Warming cache', { count: entries.length })

    await Promise.all(
      entries.map(([key, value, options]) => this.set(key, value, options))
    )

    logger.info('Cache warmed', { count: entries.length })
  }

  /**
   * Cleanup expired entries
   */
  public cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.cachedAt
      if (age > entry.staleTtl) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      logger.info('Cleaned up expired entries', { cleaned })
      this.updateStats()
    }
  }

  /**
   * Destroy cache service
   */
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }

    if (this.db) {
      this.db.close()
      this.db = null
    }

    this.cache.clear()
    logger.info('Cache service destroyed')
  }

  /**
   * Reset all cache statistics (for testing purposes)
   * Unlike clear(), this resets historical metrics (hits, misses, staleHits)
   * @internal
   */
  public resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      staleHits: 0,
      entries: 0,
      sizeBytes: 0,
      hitRate: 0,
    }
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  /**
   * Fetch data and cache it
   */
  private async fetchAndCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<T> {
    try {
      const value = await withRetry(fetcher, {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 5000,
        backoffMultiplier: 2, // Exponential backoff
      })

      await this.set(key, value, options)
      return value
    } catch (error) {
      logger.error('Failed to fetch and cache', { key, error })
      throw error
    }
  }

  /**
   * Initialize IndexedDB
   */
  private async initializeDB(): Promise<void> {
    // Skip IndexedDB if not available (e.g., in test environment)
    if (typeof indexedDB === 'undefined') {
      logger.warn('IndexedDB not available, persistence disabled')
      return
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        logger.info('IndexedDB initialized')
        this.loadFromDB().catch(error => {
          logger.error('Failed to load from IndexedDB', { error })
        })
        resolve()
      }

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      }
    })
  }

  /**
   * Persist entry to IndexedDB
   */
  private async persistToDB(key: string, entry: CacheEntry): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(entry, key)

      request.onsuccess = () => resolve()
      request.onerror = () =>
        reject(new Error('Failed to persist to IndexedDB'))
    })
  }

  /**
   * Delete entry from IndexedDB
   */
  private async deleteFromDB(key: string): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () =>
        reject(new Error('Failed to delete from IndexedDB'))
    })
  }

  /**
   * Clear IndexedDB
   */
  private async clearDB(): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to clear IndexedDB'))
    })
  }

  /**
   * Load cache from IndexedDB
   */
  private async loadFromDB(): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.openCursor()

      request.onsuccess = event => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          this.cache.set(cursor.key as string, cursor.value as CacheEntry)
          cursor.continue()
        } else {
          this.updateStats()
          logger.info('Loaded cache from IndexedDB', {
            entries: this.cache.size,
          })
          resolve()
        }
      }

      request.onerror = () => reject(new Error('Failed to load from IndexedDB'))
    })
  }

  /**
   * Evict oldest entries to make room
   */
  private async evictOldest(requiredSize: number): Promise<void> {
    const entries = Array.from(this.cache.entries())
    entries.sort(([, a], [, b]) => a.cachedAt - b.cachedAt)

    let freedSize = 0
    const toDelete: string[] = []

    for (const [key, entry] of entries) {
      toDelete.push(key)
      freedSize += entry.size
      if (freedSize >= requiredSize) {
        break
      }
    }

    for (const key of toDelete) {
      await this.delete(key)
    }

    logger.info('Evicted oldest entries', { count: toDelete.length, freedSize })
  }

  /**
   * Estimate size of value in bytes
   */
  private estimateSize(value: unknown): number {
    try {
      return JSON.stringify(value).length * 2 // UTF-16 encoding
    } catch {
      return 0
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    this.stats.entries = this.cache.size
    this.stats.sizeBytes = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.size,
      0
    )
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0
  }

  /**
   * Start cleanup timer
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, CLEANUP_INTERVAL)
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance()
