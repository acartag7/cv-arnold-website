/**
 * Logging utility for CV application
 *
 * Provides structured logging with different log levels.
 * In production, only warnings and errors are logged.
 * In development, all levels are logged for debugging.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: unknown
}

/**
 * Logger class for structured logging
 */
export class Logger {
  private readonly context: string
  private readonly isDevelopment: boolean

  constructor(context: string) {
    this.context = context
    this.isDevelopment = process.env.NODE_ENV !== 'production'
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, data?: LogContext): void {
    if (this.isDevelopment) {
      this.log('debug', message, data)
    }
  }

  /**
   * Log informational message (development only)
   */
  info(message: string, data?: LogContext): void {
    if (this.isDevelopment) {
      this.log('info', message, data)
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: LogContext): void {
    this.log('warn', message, data)
  }

  /**
   * Log error message
   */
  error(message: string, error?: unknown, data?: LogContext): void {
    const errorData: LogContext = {
      ...data,
      ...(error !== undefined && {
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
      }),
    }
    this.log(
      'error',
      message,
      Object.keys(errorData).length > 0 ? errorData : undefined
    )
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, data?: LogContext): void {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      ...(data && { data }),
    }

    // In development, use console methods for better DX
    // In production, use console.log for structured JSON logging
    if (this.isDevelopment) {
      const method =
        level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'
      console[method](
        `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`,
        message,
        data || ''
      )
    } else {
      // Production: JSON logs for parsing by log aggregators
      console.log(JSON.stringify(logEntry))
    }
  }
}

/**
 * Create a logger instance for a given context
 */
export function createLogger(context: string): Logger {
  return new Logger(context)
}
