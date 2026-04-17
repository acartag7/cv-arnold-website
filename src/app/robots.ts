import type { MetadataRoute } from 'next'

const SITE_URL = 'https://cv.arnoldcartagena.com'

const AI_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'CCBot',
  'Google-Extended',
  'Applebot-Extended',
  'Bytespider',
  'Amazonbot',
  'Meta-ExternalAgent',
  'DuckAssistBot',
  'Diffbot',
  'cohere-ai',
  'YouBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
      ...AI_BOTS.map(userAgent => ({
        userAgent,
        allow: '/',
        disallow: ['/admin', '/api'],
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
