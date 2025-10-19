/**
 * Custom error classes for CV application
 *
 * Domain-specific errors provide type-safe error handling and
 * clear error semantics throughout the application.
 */

/**
 * Base class for all CV application errors
 */
export class CVError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = this.constructor.name
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

/**
 * Error thrown when CV data is not found
 */
export class CVDataNotFoundError extends CVError {
  constructor(message = 'CV data not found', cause?: unknown) {
    super(message, 'CV_DATA_NOT_FOUND', cause)
  }
}

/**
 * Error thrown when data validation fails
 */
export class CVValidationError extends CVError {
  constructor(
    message: string,
    public readonly validationErrors?: unknown,
    cause?: unknown
  ) {
    super(message, 'CV_VALIDATION_ERROR', cause)
  }
}

/**
 * Error thrown when storage operations fail
 */
export class CVStorageError extends CVError {
  constructor(
    message: string,
    public readonly operation: 'read' | 'write' | 'delete',
    cause?: unknown
  ) {
    super(message, 'CV_STORAGE_ERROR', cause)
  }
}

/**
 * Error thrown when retry attempts are exhausted
 */
export class CVRetryExhaustedError extends CVError {
  constructor(
    message: string,
    public readonly attempts: number,
    cause?: unknown
  ) {
    super(message, 'CV_RETRY_EXHAUSTED', cause)
  }
}

/**
 * Error thrown when network operations fail
 */
export class CVNetworkError extends CVError {
  constructor(message: string, cause?: unknown) {
    super(message, 'CV_NETWORK_ERROR', cause)
  }
}

/**
 * Type guard to check if error is a CVError
 */
export function isCVError(error: unknown): error is CVError {
  return error instanceof CVError
}

/**
 * Type guard to check if error is a CVDataNotFoundError
 */
export function isCVDataNotFoundError(
  error: unknown
): error is CVDataNotFoundError {
  return error instanceof CVDataNotFoundError
}

/**
 * Type guard to check if error is a CVValidationError
 */
export function isCVValidationError(
  error: unknown
): error is CVValidationError {
  return error instanceof CVValidationError
}

/**
 * Type guard to check if error is a CVStorageError
 */
export function isCVStorageError(error: unknown): error is CVStorageError {
  return error instanceof CVStorageError
}

/**
 * Type guard to check if error is a CVRetryExhaustedError
 */
export function isCVRetryExhaustedError(
  error: unknown
): error is CVRetryExhaustedError {
  return error instanceof CVRetryExhaustedError
}

/**
 * Type guard to check if error is a CVNetworkError
 */
export function isCVNetworkError(error: unknown): error is CVNetworkError {
  return error instanceof CVNetworkError
}
