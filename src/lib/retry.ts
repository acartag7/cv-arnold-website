/**
 * Retry utility with exponential backoff
 *
 * Provides configurable retry logic for network operations and
 * other potentially failing asynchronous operations.
 */

import { CVRetryExhaustedError } from './errors'
import { createLogger } from './logger'

const logger = createLogger('RetryUtil')

export interface RetryOptions {
  /**
   * Maximum number of retry attempts (default: 3)
   */
  maxAttempts?: number

  /**
   * Initial delay in milliseconds (default: 1000)
   */
  initialDelay?: number

  /**
   * Maximum delay in milliseconds (default: 10000)
   */
  maxDelay?: number

  /**
   * Backoff multiplier (default: 2 for exponential backoff)
   */
  backoffMultiplier?: number

  /**
   * Function to determine if error is retryable (default: always retry)
   */
  isRetryable?: (error: unknown) => boolean

  /**
   * Callback invoked before each retry attempt
   */
  onRetry?: (error: unknown, attempt: number) => void
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  isRetryable: () => true,
  onRetry: () => {
    /* noop */
  },
}

/**
 * Execute an async function with retry logic and exponential backoff
 *
 * @param fn - Async function to execute
 * @param options - Retry configuration options
 * @returns Promise resolving to function result
 * @throws CVRetryExhaustedError if all retry attempts fail
 *
 * @example
 * ```typescript
 * const data = await withRetry(
 *   () => fetchData(),
 *   { maxAttempts: 5, initialDelay: 500 }
 * )
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: unknown
  let delay = opts.initialDelay

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Check if error is retryable
      if (!opts.isRetryable(error)) {
        logger.debug('Error is not retryable, throwing immediately', {
          error,
          attempt,
        })
        throw error
      }

      // If this was the last attempt, throw
      if (attempt === opts.maxAttempts) {
        logger.warn('All retry attempts exhausted', {
          attempts: opts.maxAttempts,
          error,
        })
        break
      }

      // Log retry attempt
      logger.debug('Retrying after error', {
        attempt,
        maxAttempts: opts.maxAttempts,
        delay,
        error,
      })

      // Invoke retry callback (with next attempt number)
      opts.onRetry(error, attempt + 1)

      // Wait with exponential backoff
      await sleep(delay)

      // Calculate next delay (exponential backoff with max cap)
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay)
    }
  }

  // All attempts failed
  throw new CVRetryExhaustedError(
    `Operation failed after ${opts.maxAttempts} attempts`,
    opts.maxAttempts,
    lastError
  )
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if error is a network error (common retryable errors)
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const networkErrorPatterns = [
      /network/i,
      /timeout/i,
      /ECONNREFUSED/,
      /ENOTFOUND/,
      /ETIMEDOUT/,
      /fetch failed/i,
    ]
    return networkErrorPatterns.some(pattern => pattern.test(error.message))
  }
  return false
}
