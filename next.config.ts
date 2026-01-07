import type { NextConfig } from 'next'
import packageJson from './package.json' with { type: 'json' }

// Initialize Cloudflare bindings for local development ONLY
// This enables getCloudflareContext() to work with `next dev`
// by using wrangler's getPlatformProxy under the hood
//
// Guards prevent execution during:
// - Production builds (NODE_ENV=production)
// - CI builds (CI=true)
// - Test runs (VITEST=true)
const shouldInitCloudflare =
  process.env.NODE_ENV === 'development' &&
  process.env.CI !== 'true' &&
  process.env.VITEST !== 'true'

if (shouldInitCloudflare) {
  // Dynamic import to avoid bundling issues during build
  import('@opennextjs/cloudflare')
    .then(({ initOpenNextCloudflareForDev }) => {
      initOpenNextCloudflareForDev()

      console.log('[next.config] Cloudflare bindings initialized for local dev')
    })
    .catch((error: Error) => {
      // Log warning but don't fail - app will still work with local file fallback

      console.warn(
        '[next.config] Failed to initialize Cloudflare bindings:',
        error.message,
        '\n  → KV bindings will not be available during local development',
        '\n  → App will fall back to local cv-data.json'
      )
    })
}

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    // Content Security Policy - defense against XSS and injection attacks
    // NOTE: 'unsafe-inline' and 'unsafe-eval' are required by Next.js for:
    // - Client-side hydration (inline scripts for __NEXT_DATA__)
    // - Dynamic code evaluation in development
    // - Styled-jsx and CSS-in-JS solutions
    // TODO: Implement nonce-based CSP for stricter security (Task backlog)
    // See: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  // Expose app version from package.json at build time
  // Used as default fallback when siteConfig.version is not set
  env: {
    NEXT_PUBLIC_APP_VERSION: `v${packageJson.version}`,
  },

  // Image configuration - restrict to known domains for security
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.arnoldcartagena.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      // CNCF artwork for Kubestronaut badge
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/cncf/artwork/**',
      },
      // Allow localhost for development
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },

  // Security headers for all routes
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
