/**
 * JSON File Storage Adapter
 *
 * Development storage implementation that reads/writes CV data to JSON files.
 * Implements ICVRepository interface for dependency injection.
 *
 * **IMPORTANT LIMITATIONS:**
 *
 * 1. **No File Locking**: This adapter does not implement file locking for concurrent
 *    writes. The atomic write pattern (temp file + rename) prevents corruption from a
 *    single write operation, but does NOT prevent race conditions from concurrent writes.
 *
 *    Race condition scenario:
 *    - Request A reads data at T0
 *    - Request B reads data at T1
 *    - Request A writes at T2 (with stale data from T0)
 *    - Request B writes at T3 (overwrites A's changes with data from T1)
 *
 *    **Why not implemented:** This is development-only code. Production will use
 *    Cloudflare KV which handles concurrent access differently (eventual consistency
 *    with last-write-wins semantics). Adding file locking would require a new dependency
 *    (e.g., proper-lockfile) and add complexity for a dev-only feature.
 *
 *    **Mitigation:** For development, avoid concurrent writes to the same data file.
 *    For production, use Cloudflare KV adapter which has built-in concurrency handling.
 *
 * 2. **Development Use Only**: This adapter is intended for local development and
 *    testing. For production deployments, use Cloudflare KV adapter or other
 *    production-ready storage backends.
 */

import fs from 'fs/promises'
import path from 'path'
import type { CVData } from '@/types/cv'
import type { ICVRepository } from './ICVRepository'
import { CVStorageError } from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { withRetry } from '@/lib/retry'

const logger = createLogger('JSONFileAdapter')

/**
 * JSON file-based storage adapter for CV data
 *
 * Stores data in a JSON file on the filesystem. Suitable for
 * development and local testing. Uses atomic writes to prevent
 * data corruption.
 */
export class JSONFileAdapter implements ICVRepository {
  private readonly filePath: string

  constructor(filePath: string) {
    this.filePath = path.resolve(filePath)
    logger.info('JSONFileAdapter initialized', { filePath: this.filePath })
  }

  /**
   * Retrieve all CV data from JSON file with retry
   */
  async getData(): Promise<CVData | null> {
    logger.debug('Reading CV data from file', { filePath: this.filePath })

    return withRetry(
      async () => {
        try {
          const fileContent = await fs.readFile(this.filePath, 'utf-8')
          const data = JSON.parse(fileContent) as CVData
          logger.debug('CV data read successfully')
          return data
        } catch (error) {
          // File not found is not an error, return null
          if (this.isFileNotFoundError(error)) {
            logger.debug('CV data file not found', { filePath: this.filePath })
            return null
          }

          logger.error('Failed to read CV data file', error)
          throw new CVStorageError(
            `Failed to read file: ${this.filePath}`,
            'read',
            error
          )
        }
      },
      {
        maxAttempts: 2, // Fewer retries for local file operations
        initialDelay: 100,
        onRetry: (error, attempt) => {
          logger.debug('Retrying file read', { attempt, error })
        },
      }
    )
  }

  /**
   * Update CV data in JSON file (atomic write) with retry
   */
  async updateData(data: CVData): Promise<void> {
    logger.debug('Writing CV data to file', { filePath: this.filePath })

    return withRetry(
      async () => {
        try {
          // Ensure directory exists
          const dir = path.dirname(this.filePath)
          await fs.mkdir(dir, { recursive: true })

          // Write to temporary file first (atomic write)
          const tempPath = `${this.filePath}.tmp`
          const jsonContent = JSON.stringify(data, null, 2)
          await fs.writeFile(tempPath, jsonContent, 'utf-8')

          // Rename to actual file (atomic operation on most filesystems)
          await fs.rename(tempPath, this.filePath)

          logger.debug('CV data written successfully')
        } catch (error) {
          logger.error('Failed to write CV data file', error)
          throw new CVStorageError(
            `Failed to write file: ${this.filePath}`,
            'write',
            error
          )
        }
      },
      {
        maxAttempts: 2,
        initialDelay: 100,
        onRetry: (error, attempt) => {
          logger.debug('Retrying file write', { attempt, error })
        },
      }
    )
  }

  /**
   * Get specific section of CV data
   */
  async getSection<K extends keyof CVData>(
    section: K
  ): Promise<CVData[K] | null> {
    logger.debug('Reading CV section from file', {
      section,
      filePath: this.filePath,
    })

    const data = await this.getData()
    if (!data) {
      return null
    }

    return data[section] ?? null
  }

  /**
   * Update specific section of CV data
   */
  async updateSection<K extends keyof CVData>(
    section: K,
    sectionData: CVData[K]
  ): Promise<void> {
    logger.debug('Updating CV section in file', {
      section,
      filePath: this.filePath,
    })

    const data = await this.getData()
    if (!data) {
      throw new CVStorageError(
        'Cannot update section: CV data does not exist',
        'write'
      )
    }

    // Update section and write entire file
    const updatedData = { ...data, [section]: sectionData }
    await this.updateData(updatedData)
  }

  /**
   * Check if CV data file exists
   */
  async exists(): Promise<boolean> {
    logger.debug('Checking if CV data file exists', {
      filePath: this.filePath,
    })

    try {
      await fs.access(this.filePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Delete CV data file
   */
  async delete(): Promise<void> {
    logger.debug('Deleting CV data file', { filePath: this.filePath })

    try {
      await fs.unlink(this.filePath)
      logger.debug('CV data file deleted successfully')
    } catch (error) {
      if (this.isFileNotFoundError(error)) {
        // File already doesn't exist, nothing to delete
        logger.debug('CV data file already deleted or does not exist')
        return
      }

      logger.error('Failed to delete CV data file', error)
      throw new CVStorageError(
        `Failed to delete file: ${this.filePath}`,
        'delete',
        error
      )
    }
  }

  /**
   * Check if error is a file not found error
   */
  private isFileNotFoundError(error: unknown): boolean {
    return (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ENOENT'
    )
  }
}
