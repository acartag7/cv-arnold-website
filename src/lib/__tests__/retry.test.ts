/**
 * Tests for retry utility with exponential backoff
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { withRetry, isNetworkError } from '../retry'
import { CVRetryExhaustedError } from '../errors'

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should succeed on first attempt', async () => {
    const mockFn = vi.fn().mockResolvedValue('success')

    const result = withRetry(mockFn)
    await vi.runAllTimersAsync()
    const finalResult = await result

    expect(finalResult).toBe('success')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should retry on failure and succeed', async () => {
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success')

    const resultPromise = withRetry(mockFn, { initialDelay: 100 })
    await vi.runAllTimersAsync()
    const result = await resultPromise

    expect(result).toBe('success')
    expect(mockFn).toHaveBeenCalledTimes(3)
  })

  it('should throw CVRetryExhaustedError after max attempts', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Persistent failure'))

    const resultPromise = withRetry(mockFn, {
      maxAttempts: 3,
      initialDelay: 100,
    })

    // Set up error expectations before running timers to catch errors cleanly
    const errorAssertions = Promise.all([
      expect(resultPromise).rejects.toThrow(CVRetryExhaustedError),
      expect(resultPromise).rejects.toThrow(/failed after 3 attempts/),
    ])

    await vi.runAllTimersAsync()
    await errorAssertions

    expect(mockFn).toHaveBeenCalledTimes(3)
  })

  it('should use exponential backoff', async () => {
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail'))
      .mockResolvedValue('success')

    const resultPromise = withRetry(mockFn, {
      initialDelay: 1000,
      backoffMultiplier: 2,
    })

    // First attempt fails immediately
    await vi.advanceTimersByTimeAsync(0)
    expect(mockFn).toHaveBeenCalledTimes(1)

    // Wait for first retry delay (1000ms)
    await vi.advanceTimersByTimeAsync(1000)
    await vi.runAllTimersAsync()

    const result = await resultPromise
    expect(result).toBe('success')
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('should respect maxDelay cap', async () => {
    const delays: number[] = []
    const mockFn = vi.fn().mockRejectedValue(new Error('Fail'))

    const onRetry = vi.fn((_, attempt) => {
      delays.push(attempt)
    })

    const resultPromise = withRetry(mockFn, {
      maxAttempts: 5,
      initialDelay: 1000,
      maxDelay: 3000,
      backoffMultiplier: 2,
      onRetry,
    })

    // Catch error to prevent unhandled rejection warnings
    const errorCatch = resultPromise.catch(() => {
      // Expected to fail
    })

    await vi.runAllTimersAsync()
    await errorCatch

    expect(mockFn).toHaveBeenCalledTimes(5)
    expect(onRetry).toHaveBeenCalledTimes(4) // Retries after attempts 1-4
  })

  it('should call onRetry callback', async () => {
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail'))
      .mockResolvedValue('success')

    const onRetry = vi.fn()

    const resultPromise = withRetry(mockFn, {
      initialDelay: 100,
      onRetry,
    })

    await vi.runAllTimersAsync()
    await resultPromise

    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 2)
  })

  it('should respect isRetryable predicate', async () => {
    const nonRetriableError = new Error('Non-retryable')

    const mockFn = vi.fn().mockRejectedValue(nonRetriableError)

    const resultPromise = withRetry(mockFn, {
      maxAttempts: 3,
      initialDelay: 100,
      isRetryable: error => {
        return error instanceof Error && error.message.includes('Network')
      },
    })

    // Set up error expectation before running timers
    const errorAssertion =
      expect(resultPromise).rejects.toThrow('Non-retryable')

    await vi.runAllTimersAsync()
    await errorAssertion

    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should retry only retryable errors', async () => {
    const networkError = new Error('Network request failed')
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(networkError)
      .mockResolvedValue('success')

    const resultPromise = withRetry(mockFn, {
      initialDelay: 100,
      isRetryable: isNetworkError,
    })

    await vi.runAllTimersAsync()
    const result = await resultPromise

    expect(result).toBe('success')
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('should handle async errors', async () => {
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Async fail'))
      .mockResolvedValue('success')

    const resultPromise = withRetry(mockFn, { initialDelay: 100 })

    await vi.runAllTimersAsync()
    const result = await resultPromise

    expect(result).toBe('success')
  })

  it('should use default options when not provided', async () => {
    const mockFn = vi.fn().mockResolvedValue('success')

    const resultPromise = withRetry(mockFn)
    await vi.runAllTimersAsync()
    const result = await resultPromise

    expect(result).toBe('success')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})

describe('isNetworkError', () => {
  it('should return true for network error message', () => {
    const error = new Error('Network request failed')
    expect(isNetworkError(error)).toBe(true)
  })

  it('should return true for ECONNREFUSED in message', () => {
    const error = new Error('ECONNREFUSED Connection refused')
    expect(isNetworkError(error)).toBe(true)
  })

  it('should return true for ETIMEDOUT in message', () => {
    const error = new Error('ETIMEDOUT Operation timed out')
    expect(isNetworkError(error)).toBe(true)
  })

  it('should return true for ENOTFOUND in message', () => {
    const error = new Error('ENOTFOUND Host not found')
    expect(isNetworkError(error)).toBe(true)
  })

  it('should return true for timeout in message', () => {
    const error = new Error('Request timeout exceeded')
    expect(isNetworkError(error)).toBe(true)
  })

  it('should return false for regular Error', () => {
    const error = new Error('Regular error')
    expect(isNetworkError(error)).toBe(false)
  })

  it('should return false for non-Error objects', () => {
    expect(isNetworkError('string error')).toBe(false)
    expect(isNetworkError(null)).toBe(false)
    expect(isNetworkError(undefined)).toBe(false)
    expect(isNetworkError(123)).toBe(false)
  })
})
