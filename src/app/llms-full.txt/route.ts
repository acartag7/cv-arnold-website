import { getCVData } from '@/lib/get-cv-data'
import { renderCVAsMarkdown } from '@/lib/render-cv-markdown'
import { createLogger } from '@/lib/logger'

export const revalidate = 60

const logger = createLogger('llms-full.txt')

export async function GET() {
  try {
    const cv = await getCVData()
    const markdown = renderCVAsMarkdown(cv)
    return new Response(markdown, {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=60, s-maxage=60',
      },
    })
  } catch (error) {
    logger.error('Failed to render llms-full.txt', error)
    return new Response('# CV temporarily unavailable\n', {
      status: 503,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
      },
    })
  }
}
