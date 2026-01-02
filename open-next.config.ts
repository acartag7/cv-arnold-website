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
  // Disable cache interception until KV bindings are configured
  enableCacheInterception: false,
  // Use dummy cache purge (no CDN invalidation)
  cachePurge: 'dummy',
})
