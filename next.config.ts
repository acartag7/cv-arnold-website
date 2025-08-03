import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Static export configuration for Cloudflare Pages (disabled for development)
  // Uncomment when infrastructure repository is ready
  // output: 'export',
  // trailingSlash: true,
  // images: {
  //   unoptimized: true,
  // },
  // skipTrailingSlashRedirect: true,
  // compress: false, // Cloudflare handles compression

  // Development configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
