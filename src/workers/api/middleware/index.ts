/**
 * Middleware exports for Workers API
 *
 * @module workers/api/middleware
 */

export {
  type CORSConfig,
  DEFAULT_CORS_CONFIG,
  getCORSHeaders,
  getPreflightHeaders,
  handlePreflight,
  isOriginAllowed,
  createCORSMiddleware,
} from './cors'

export {
  type AccessJWTClaims,
  type AuthContext,
  getAuthContext,
  requireAuth,
  requireEmailDomain,
  requireEmail,
  createAuthMiddleware,
} from './auth'

export {
  type RateLimitConfig,
  type RateLimitStatus,
  type RateLimitMiddlewareOptions,
  DEFAULT_RATE_LIMIT_CONFIG,
  RateLimiter,
  getClientIdentifier,
  getWindowKey,
  createRateLimitHeaders,
  tooManyRequests,
  createRateLimitMiddleware,
  HTTP_TOO_MANY_REQUESTS,
} from './rateLimit'

export {
  type CacheConfig,
  type CacheMiddlewareOptions,
  DEFAULT_CACHE_CONFIG,
  CACHE_KEYS,
  ResponseCache,
  getCacheKey,
  isCacheable,
  createCacheControl,
  createCacheMiddleware,
} from './cache'
