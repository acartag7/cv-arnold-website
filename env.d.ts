/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare namespace NodeJS {
  interface ProcessEnv {
    // Node environment
    NODE_ENV: 'development' | 'production' | 'test'

    // Next.js public variables
    NEXT_PUBLIC_SITE_URL: string
    NEXT_PUBLIC_SITE_NAME: string
    NEXT_PUBLIC_API_URL?: string

    // Analytics
    NEXT_PUBLIC_GA_MEASUREMENT_ID?: string
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN?: string

    // Cloudflare configuration
    CLOUDFLARE_ACCOUNT_ID?: string
    CLOUDFLARE_API_TOKEN?: string
    KV_NAMESPACE_ID?: string
    CLOUDFLARE_ANALYTICS_TOKEN?: string

    // API configuration
    API_BASE_URL?: string

    // Authentication
    ADMIN_AUTH_TOKEN?: string
    JWT_SECRET?: string

    // Email service
    SENDGRID_API_KEY?: string
    RESEND_API_KEY?: string
    FROM_EMAIL?: string

    // External integrations
    CALENDLY_USERNAME?: string
    GITHUB_TOKEN?: string
  }
}
