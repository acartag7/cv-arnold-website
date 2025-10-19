/**
 * Tests for custom error classes
 */

import { describe, it, expect } from 'vitest'
import {
  CVError,
  CVDataNotFoundError,
  CVValidationError,
  CVStorageError,
  CVRetryExhaustedError,
  CVNetworkError,
} from '../errors'

describe('CVError', () => {
  it('should create error with message and code', () => {
    const error = new CVError('Test error', 'TEST_CODE')
    expect(error.message).toBe('Test error')
    expect(error.code).toBe('TEST_CODE')
    expect(error.name).toBe('CVError')
  })

  it('should include cause when provided', () => {
    const cause = new Error('Original error')
    const error = new CVError('Wrapped error', 'TEST_CODE', cause)
    expect(error.cause).toBe(cause)
  })

  it('should be instanceof Error', () => {
    const error = new CVError('Test', 'TEST')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(CVError)
  })

  it('should maintain stack trace', () => {
    const error = new CVError('Test', 'TEST')
    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('CVError')
  })
})

describe('CVDataNotFoundError', () => {
  it('should create with default message', () => {
    const error = new CVDataNotFoundError()
    expect(error.message).toBe('CV data not found')
    expect(error.code).toBe('CV_DATA_NOT_FOUND')
    expect(error.name).toBe('CVDataNotFoundError')
  })

  it('should create with custom message', () => {
    const error = new CVDataNotFoundError('Custom not found message')
    expect(error.message).toBe('Custom not found message')
  })

  it('should be instanceof CVError', () => {
    const error = new CVDataNotFoundError()
    expect(error).toBeInstanceOf(CVError)
    expect(error).toBeInstanceOf(CVDataNotFoundError)
  })
})

describe('CVValidationError', () => {
  it('should create with message', () => {
    const error = new CVValidationError('Validation failed')
    expect(error.message).toBe('Validation failed')
    expect(error.code).toBe('CV_VALIDATION_ERROR')
    expect(error.name).toBe('CVValidationError')
  })

  it('should include validation errors', () => {
    const validationErrors = { field: 'Invalid value' }
    const error = new CVValidationError('Validation failed', validationErrors)
    expect(error.validationErrors).toEqual(validationErrors)
  })

  it('should be instanceof CVError', () => {
    const error = new CVValidationError('Test')
    expect(error).toBeInstanceOf(CVError)
    expect(error).toBeInstanceOf(CVValidationError)
  })
})

describe('CVStorageError', () => {
  it('should create with operation type', () => {
    const error = new CVStorageError('Storage failed', 'write')
    expect(error.message).toBe('Storage failed')
    expect(error.code).toBe('CV_STORAGE_ERROR')
    expect(error.operation).toBe('write')
    expect(error.name).toBe('CVStorageError')
  })

  it('should support all operation types', () => {
    const readError = new CVStorageError('Read failed', 'read')
    const writeError = new CVStorageError('Write failed', 'write')
    const deleteError = new CVStorageError('Delete failed', 'delete')

    expect(readError.operation).toBe('read')
    expect(writeError.operation).toBe('write')
    expect(deleteError.operation).toBe('delete')
  })

  it('should be instanceof CVError', () => {
    const error = new CVStorageError('Test', 'read')
    expect(error).toBeInstanceOf(CVError)
    expect(error).toBeInstanceOf(CVStorageError)
  })
})

describe('CVRetryExhaustedError', () => {
  it('should create with attempt count', () => {
    const error = new CVRetryExhaustedError('Retries exhausted', 3)
    expect(error.message).toBe('Retries exhausted')
    expect(error.code).toBe('CV_RETRY_EXHAUSTED')
    expect(error.attempts).toBe(3)
    expect(error.name).toBe('CVRetryExhaustedError')
  })

  it('should be instanceof CVError', () => {
    const error = new CVRetryExhaustedError('Test', 5)
    expect(error).toBeInstanceOf(CVError)
    expect(error).toBeInstanceOf(CVRetryExhaustedError)
  })
})

describe('CVNetworkError', () => {
  it('should create with message', () => {
    const error = new CVNetworkError('Network failed')
    expect(error.message).toBe('Network failed')
    expect(error.code).toBe('CV_NETWORK_ERROR')
    expect(error.name).toBe('CVNetworkError')
  })

  it('should be instanceof CVError', () => {
    const error = new CVNetworkError('Test')
    expect(error).toBeInstanceOf(CVError)
    expect(error).toBeInstanceOf(CVNetworkError)
  })
})
