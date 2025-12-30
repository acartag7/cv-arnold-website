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
