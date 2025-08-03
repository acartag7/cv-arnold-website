import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Configure for static export to Cloudflare Pages
  output: 'export',
  trailingSlash: true,

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Skip trailing slash for API routes (if any)
  skipTrailingSlashRedirect: true,

  // Optimize for static hosting
  compress: false, // Cloudflare handles compression
}

export default nextConfig
