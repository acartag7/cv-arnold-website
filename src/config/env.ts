import { z } from 'zod'

// Environment validation schema
const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Next.js public variables
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SITE_NAME: z
    .string()
    .default('Arnold Cartagena - Software Engineer'),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),

  // Analytics (optional)
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),

  // Cloudflare configuration (optional for development)
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),
  KV_NAMESPACE_ID: z.string().optional(),
  CLOUDFLARE_ANALYTICS_TOKEN: z.string().optional(),

  // API configuration
  API_BASE_URL: z.string().url().optional(),

  // Authentication
  ADMIN_AUTH_TOKEN: z.string().optional(),
  JWT_SECRET: z.string().optional(),

  // Email service
  SENDGRID_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),

  // External integrations
  CALENDLY_USERNAME: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
})

// Validate environment variables
export const env = envSchema.parse(process.env)

// Type for environment variables
export type Env = z.infer<typeof envSchema>

// Helper function to get environment variable with fallback
export function getEnvVar(key: keyof Env, fallback?: string): string {
  const value = env[key]
  if (value === undefined || value === '') {
    if (fallback !== undefined) {
      return fallback
    }
    throw new Error(`Environment variable ${key} is required but not set`)
  }
  return String(value)
}

// Environment checks
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'
