import { defineCloudflareConfig } from '@opennextjs/cloudflare'

/**
 * OpenNext configuration for Cloudflare Workers deployment
 *
 * This configures the OpenNext adapter to build Next.js for Cloudflare.
 * The adapter converts Next.js output to a format compatible with
 * Cloudflare Workers, enabling SSR, API routes, and edge functions.
 *
 * @see https://opennext.js.org/cloudflare
 */
export default defineCloudflareConfig({
  // Default configuration - no overrides needed for basic setup
  // The adapter will use KV for caching by default
})
