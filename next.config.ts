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
