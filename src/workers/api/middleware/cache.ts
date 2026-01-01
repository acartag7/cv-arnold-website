/**
 * Response Caching Middleware for Cloudflare Workers
 *
 * Uses Cloudflare's Cache API to cache responses at the edge,
 * reducing latency and KV reads for frequently accessed data.
 *
 * ## Caching Strategy
 *
 * **Cache-Aside Pattern with Automatic Invalidation:**
 * 1. Check cache for existing response
 * 2. If cache hit, return cached response
 * 3. If cache miss, fetch from origin (KV), cache result, return
 * 4. On write operations (POST/PUT), invalidate related cache keys
 *
 * **Why Cache API over KV caching?**
 * - Cache API is optimized for HTTP responses
 * - Automatic edge distribution (no replication delay)
 * - Built-in TTL and cache control semantics
 * - Lower latency than KV reads (~1ms vs ~50ms)
 *
 * ## Cache Invalidation
 *
 * This is the critical part that ensures you never see stale data:
 * - `invalidateCache()` is called automatically in handlers after writes
 * - Purges all related cache keys (full CV + sections)
 * - No manual intervention required - it's built into the write handlers
 *
 * @module workers/api/middleware/cache
 */

/**
 * Cache configuration options
 */
export interface CacheConfig {
  /**
   * Cache TTL in seconds
   * @default 300 (5 minutes)
   */
  ttlSeconds: number

  /**
   * Stale-while-revalidate window in seconds
   * Allows serving stale content while fetching fresh data in background
   * @default 60 (1 minute)
   */
  staleWhileRevalidateSeconds: number

  /**
   * Cache key prefix
   * @default 'cv-api'
   */
  keyPrefix: string

  /**
   * Whether caching is enabled
   * @default true
   */
  enabled: boolean
}

/**
 * Default cache configuration
 *
 * - 5 minute TTL balances freshness with performance
 * - 1 minute stale-while-revalidate provides fallback during updates
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttlSeconds: 300,
  staleWhileRevalidateSeconds: 60,
  keyPrefix: 'cv-api',
  enabled: true,
}

/**
 * Cache key patterns for different endpoints
 * These are used for both caching and invalidation
 */
export const CACHE_KEYS = {
  /** Full CV data */
  CV_DATA: '/api/v1/cv',
  /** CV export (all formats) */
  CV_EXPORT: '/api/v1/cv/export',
  /** CV sections prefix */
  CV_SECTIONS: '/api/v1/cv/sections/',
} as const

/**
 * Generate a cache key from a request
 *
 * Uses the full URL as the cache key to ensure query parameters
 * (like ?format=yaml) create separate cache entries.
 *
 * @param request - Incoming request
 * @param config - Cache configuration
 * @returns Cache key URL
 */
export function getCacheKey(request: Request, config: CacheConfig): string {
  const url = new URL(request.url)
  // Use pathname + search for cache key (ignoring origin for flexibility)
  return `https://${config.keyPrefix}.cache${url.pathname}${url.search}`
}

/**
 * Check if a request should be cached
 *
 * Only caches:
 * - GET requests (safe, idempotent)
 * - Successful responses (2xx status codes)
 * - Public endpoints (not requiring auth)
 *
 * @param request - Incoming request
 * @returns Whether the request is cacheable
 */
export function isCacheable(request: Request): boolean {
  // Only cache GET requests
  if (request.method !== 'GET') return false

  const url = new URL(request.url)
  const pathname = url.pathname

  // Cache these public endpoints
  const cacheablePatterns = [
    /^\/api\/v1\/cv\/?$/,
    /^\/api\/v1\/cv\/export\/?$/,
    /^\/api\/v1\/cv\/sections\/[a-zA-Z]+\/?$/,
  ]

  return cacheablePatterns.some(pattern => pattern.test(pathname))
}

/**
 * Create cache control header value
 *
 * @param config - Cache configuration
 * @returns Cache-Control header value
 */
export function createCacheControl(config: CacheConfig): string {
  return `public, max-age=${config.ttlSeconds}, stale-while-revalidate=${config.staleWhileRevalidateSeconds}`
}

/**
 * Response Cache Manager
 *
 * Handles caching and invalidation of API responses using
 * Cloudflare's Cache API.
 */
export class ResponseCache {
  private readonly config: CacheConfig
  private readonly cache: Cache

  constructor(cache: Cache, config: Partial<CacheConfig> = {}) {
    this.cache = cache
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config }
  }

  /**
   * Try to get a cached response
   *
   * @param request - Incoming request
   * @returns Cached response or null
   */
  async get(request: Request): Promise<Response | null> {
    if (!this.config.enabled || !isCacheable(request)) {
      return null
    }

    const cacheKey = getCacheKey(request, this.config)
    const cachedResponse = await this.cache.match(cacheKey)

    if (cachedResponse) {
      // Clone and add cache hit header for debugging
      const headers = new Headers(cachedResponse.headers)
      headers.set('X-Cache', 'HIT')
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers,
      })
    }

    return null
  }

  /**
   * Cache a response
   *
   * Only caches successful (2xx) responses from cacheable endpoints.
   *
   * @param request - Original request
   * @param response - Response to cache
   * @returns Response with cache headers added
   */
  async put(request: Request, response: Response): Promise<Response> {
    if (!this.config.enabled || !isCacheable(request)) {
      return response
    }

    // Only cache successful responses
    if (response.status < 200 || response.status >= 300) {
      return response
    }

    const cacheKey = getCacheKey(request, this.config)

    // Clone response for caching (responses can only be consumed once)
    const responseToCache = response.clone()

    // Add cache control headers
    const headers = new Headers(responseToCache.headers)
    headers.set('Cache-Control', createCacheControl(this.config))
    headers.set('X-Cache', 'MISS')

    const cachedResponse = new Response(responseToCache.body, {
      status: responseToCache.status,
      statusText: responseToCache.statusText,
      headers,
    })

    // Store in cache (fire and forget - don't block response)
    // Using waitUntil would be better but requires ExecutionContext
    this.cache.put(cacheKey, cachedResponse.clone()).catch(err => {
      console.error('Cache put error:', err)
    })

    return cachedResponse
  }

  /**
   * Invalidate cached responses for CV data
   *
   * Called automatically after write operations (POST, import).
   * Purges all related cache keys to ensure fresh data is served.
   *
   * **This is how cache invalidation works automatically:**
   * 1. User updates CV via POST /api/v1/cv or POST /api/v1/cv/import
   * 2. Handler calls `cache.invalidate(request)` after successful write
   * 3. All cached CV responses are purged
   * 4. Next GET request fetches fresh data from KV
   *
   * @param request - Request that triggered invalidation (for base URL)
   */
  async invalidate(request: Request): Promise<void> {
    if (!this.config.enabled) return

    const url = new URL(request.url)
    const baseUrl = `https://${this.config.keyPrefix}.cache`

    // Keys to invalidate when CV data changes
    const keysToInvalidate = [
      `${baseUrl}${CACHE_KEYS.CV_DATA}`,
      `${baseUrl}${CACHE_KEYS.CV_DATA}/`,
      `${baseUrl}${CACHE_KEYS.CV_EXPORT}`,
      `${baseUrl}${CACHE_KEYS.CV_EXPORT}/`,
      `${baseUrl}${CACHE_KEYS.CV_EXPORT}?format=json`,
      `${baseUrl}${CACHE_KEYS.CV_EXPORT}?format=yaml`,
    ]

    // Also invalidate section endpoints
    const sections = [
      'personalInfo',
      'experience',
      'skills',
      'education',
      'certifications',
      'achievements',
      'languages',
      'metadata',
    ]
    for (const section of sections) {
      keysToInvalidate.push(`${baseUrl}${CACHE_KEYS.CV_SECTIONS}${section}`)
      keysToInvalidate.push(`${baseUrl}${CACHE_KEYS.CV_SECTIONS}${section}/`)
    }

    // Delete all cached keys (fire and forget)
    await Promise.all(
      keysToInvalidate.map(key =>
        this.cache.delete(key).catch(err => {
          console.error(`Cache delete error for ${key}:`, err)
        })
      )
    )

    console.log(
      `[Cache] Invalidated ${keysToInvalidate.length} cache keys after write to ${url.pathname}`
    )
  }
}

/**
 * Cache middleware options
 */
export interface CacheMiddlewareOptions {
  /**
   * Cache configuration
   */
  config?: Partial<CacheConfig>
}

/**
 * Create caching middleware
 *
 * Returns a middleware object that handles cache lookup, storage,
 * and invalidation.
 *
 * @param options - Middleware options
 * @returns Cache middleware object
 *
 * @example
 * ```typescript
 * const cacheMiddleware = createCacheMiddleware({ config: { ttlSeconds: 300 } })
 *
 * // In router:
 * const cached = await cacheMiddleware.get(request)
 * if (cached) return cached
 *
 * const response = await handler(request)
 * return cacheMiddleware.put(request, response)
 *
 * // After write operations:
 * await cacheMiddleware.invalidate(request)
 * ```
 */
export function createCacheMiddleware(options: CacheMiddlewareOptions = {}) {
  // Get the default cache (caches.default in Workers)
  // This is available globally in Workers runtime
  // In test environment, caches may not be defined - return a no-op middleware
  let cache: Cache | null = null
  try {
    // Using type assertion as caches.default is Cloudflare Workers-specific
    cache = (caches as unknown as { default: Cache }).default
  } catch {
    // caches not available (test environment or non-Workers runtime)
    cache = null
  }

  // If caches is not available, caches.default may be undefined
  if (
    typeof caches === 'undefined' ||
    !(caches as unknown as { default: Cache }).default
  ) {
    cache = null
  }

  // Return no-op middleware if cache is not available
  if (!cache) {
    return {
      async get(): Promise<Response | null> {
        return null
      },
      async put(_request: Request, response: Response): Promise<Response> {
        return response
      },
      async invalidate(): Promise<void> {
        // No-op
      },
      isCacheable(request: Request): boolean {
        return isCacheable(request)
      },
    }
  }

  const responseCache = new ResponseCache(cache, options.config)

  return {
    /**
     * Try to get a cached response
     */
    async get(request: Request): Promise<Response | null> {
      return responseCache.get(request)
    },

    /**
     * Cache a response
     */
    async put(request: Request, response: Response): Promise<Response> {
      return responseCache.put(request, response)
    },

    /**
     * Invalidate cache after write operations
     */
    async invalidate(request: Request): Promise<void> {
      return responseCache.invalidate(request)
    },

    /**
     * Check if a request is cacheable
     */
    isCacheable(request: Request): boolean {
      return isCacheable(request)
    },
  }
}
