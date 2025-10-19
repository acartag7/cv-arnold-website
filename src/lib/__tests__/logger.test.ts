/**
 * Tests for Logger utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Logger, createLogger } from '../logger'

describe('Logger', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>
    warn: ReturnType<typeof vi.spyOn>
    error: ReturnType<typeof vi.spyOn>
  }

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('debug', () => {
    it('should log debug message in development', () => {
      vi.stubEnv('NODE_ENV', 'development')

      const logger = new Logger('TestLogger')
      logger.debug('Debug message')

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[DEBUG\].*\[TestLogger\]/),
        'Debug message',
        ''
      )

      vi.unstubAllEnvs()
    })

    it('should not log debug in production', () => {
      vi.stubEnv('NODE_ENV', 'production')

      const logger = new Logger('TestLogger')
      logger.debug('Debug message')

      expect(consoleSpy.log).not.toHaveBeenCalled()

      vi.unstubAllEnvs()
    })

    it('should log debug with context data', () => {
      vi.stubEnv('NODE_ENV', 'development')

      const logger = new Logger('TestLogger')
      logger.debug('Debug message', { userId: 123, action: 'test' })

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[DEBUG\].*\[TestLogger\]/),
        'Debug message',
        expect.objectContaining({ userId: 123, action: 'test' })
      )

      vi.unstubAllEnvs()
    })
  })

  describe('info', () => {
    it('should log info message in development', () => {
      vi.stubEnv('NODE_ENV', 'development')

      const logger = new Logger('TestLogger')
      logger.info('Info message')

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[INFO\].*\[TestLogger\]/),
        'Info message',
        ''
      )

      vi.unstubAllEnvs()
    })

    it('should not log info in production', () => {
      vi.stubEnv('NODE_ENV', 'production')

      const logger = new Logger('TestLogger')
      logger.info('Info message')

      expect(consoleSpy.log).not.toHaveBeenCalled()

      vi.unstubAllEnvs()
    })

    it('should cache environment detection at construction time', () => {
      // Start in development
      vi.stubEnv('NODE_ENV', 'development')
      const logger = new Logger('TestLogger')

      // Log in development (should log)
      logger.info('Info in dev')
      expect(consoleSpy.log).toHaveBeenCalledTimes(1)

      // Change to production AFTER construction
      vi.stubEnv('NODE_ENV', 'production')

      // Logger should still behave as development (environment cached)
      logger.info('Info after env change')
      expect(consoleSpy.log).toHaveBeenCalledTimes(2)

      vi.unstubAllEnvs()
    })
  })

  describe('warn', () => {
    it('should log warning in all environments', () => {
      const logger = new Logger('TestLogger')
      logger.warn('Warning message')

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringMatching(/\[WARN\].*\[TestLogger\]/),
        'Warning message',
        ''
      )
    })

    it('should log warning in production', () => {
      vi.stubEnv('NODE_ENV', 'production')

      const logger = new Logger('TestLogger')
      logger.warn('Warning message')

      expect(consoleSpy.log).toHaveBeenCalled()

      vi.unstubAllEnvs()
    })
  })

  describe('error', () => {
    it('should log error in all environments', () => {
      const logger = new Logger('TestLogger')
      logger.error('Error message')

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringMatching(/\[ERROR\].*\[TestLogger\]/),
        'Error message',
        ''
      )
    })

    it('should log error with Error object', () => {
      const logger = new Logger('TestLogger')
      const testError = new Error('Test error')
      logger.error('Error occurred', testError)

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringMatching(/\[ERROR\].*\[TestLogger\]/),
        'Error occurred',
        expect.objectContaining({
          error: expect.objectContaining({
            name: 'Error',
            message: 'Test error',
          }),
        })
      )
    })

    it('should log error with additional context', () => {
      const logger = new Logger('TestLogger')
      const testError = new Error('Test error')
      logger.error('Error occurred', testError, { userId: 456 })

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringMatching(/\[ERROR\].*\[TestLogger\]/),
        'Error occurred',
        expect.objectContaining({
          userId: 456,
          error: expect.any(Object),
        })
      )
    })
  })
})

describe('createLogger', () => {
  it('should create logger instance', () => {
    const logger = createLogger('TestContext')
    expect(logger).toBeInstanceOf(Logger)
  })

  it('should create functional logger', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const logger = createLogger('TestContext')
    logger.error('Test error')

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[TestContext\]/),
      'Test error',
      ''
    )

    consoleSpy.mockRestore()
  })
})
