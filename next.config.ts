import type { NextConfig } from 'next'

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
