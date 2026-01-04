/**
 * Cloudflare KV storage adapter for CV data
 *
 * Implements ICVRepository interface for production deployment
 * on Cloudflare Pages/Workers with global distribution and
 * low-latency data access.
 *
 * Key Features:
 * - Hierarchical key structure with versioning
 * - JSON serialization for type-safe storage
 * - Optional compression for large payloads
 * - Metadata tracking (last updated, version)
 * - Eventually consistent global writes
 */

import type { CVData } from '@/types/cv'
import type { ICVRepository } from './ICVRepository'
import type { KVStorageConfig } from './KVConfig'
import { KV_KEYS } from './KVConfig'
import { CVStorageError } from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { withRetry, isNetworkError } from '@/lib/retry'

const logger = createLogger('KVStorageAdapter')

/**
 * Metadata stored alongside CV data in KV
 */
interface CVMetadata {
  lastUpdated: string // ISO timestamp
  version: string // Schema version (e.g., 'v1')
  dataVersion?: number // Incremental version for change tracking
}

/**
 * Wrapper for stored data with compression metadata
 */
interface StoredData<T = unknown> {
  data: T
  compressed: boolean
  timestamp: string
}

/**
 * Cloudflare KV storage adapter implementing ICVRepository
 */
export class KVStorageAdapter implements ICVRepository {
  private readonly namespace: KVStorageConfig['namespace']
  private readonly keyPrefix: string
  private readonly version: string
  private readonly enableCompression: boolean
  private readonly compressionThreshold: number
  private readonly defaultTtl: number | undefined

  constructor(config: KVStorageConfig) {
    this.namespace = config.namespace
    this.keyPrefix = config.keyPrefix ?? 'cv'
    this.version = config.version ?? 'v1'
    this.enableCompression = config.enableCompression ?? false
    this.compressionThreshold = config.compressionThreshold ?? 10240 // 10KB
    this.defaultTtl = config.defaultTtl

    logger.debug('KVStorageAdapter initialized', {
      keyPrefix: this.keyPrefix,
      version: this.version,
      compression: this.enableCompression,
    })
  }

  /**
   * Retrieve complete CV data from KV
   *
   * Uses BINARY-FIRST approach to handle both compressed and uncompressed data:
   * 1. Read as ArrayBuffer (works for both formats)
   * 2. Check gzip magic number (0x1f 0x8b) to detect compression
   * 3. Decompress if gzip, otherwise decode as UTF-8 text
   * 4. Parse JSON and unwrap StoredData format if present
   */
  async getData(): Promise<CVData | null> {
    try {
      const key = KV_KEYS.DATA(this.keyPrefix, this.version)
      logger.debug('KV get data', { key })

      // BINARY-FIRST: Read as ArrayBuffer to handle both compressed and uncompressed
      const buffer = await this.namespace.get(key, 'arrayBuffer')

      if (!buffer || buffer.byteLength === 0) {
        logger.debug('No CV data found in KV', { key })
        return null
      }

      // Detect format by checking gzip magic number (0x1f 0x8b)
      let jsonString: string
      if (this.isGzipData(buffer)) {
        logger.debug('Decompressing gzip data from KV', { key })
        jsonString = await this.decompressData(buffer)
        logger.debug('CV data decompressed', {
          key,
          compressedSize: buffer.byteLength,
          decompressedSize: jsonString.length,
        })
      } else {
        // Uncompressed: decode as UTF-8 text
        jsonString = new TextDecoder().decode(buffer)
      }

      // Parse JSON
      const stored = JSON.parse(jsonString) as StoredData<CVData> | CVData

      // Handle StoredData wrapper format (from KVStorageAdapter writes)
      if (this.isStoredData(stored)) {
        logger.debug('CV data retrieved from KV (StoredData format)', { key })
        return stored.data
      }

      // Legacy: raw CVData format (from wrangler CLI seeding)
      logger.debug('CV data retrieved from KV (legacy format)', { key })
      return stored as CVData
    } catch (error) {
      throw new CVStorageError(
        'Failed to retrieve CV data from KV',
        'read',
        error
      )
    }
  }

  /**
   * Update complete CV data in KV (full replacement)
   */
  async updateData(data: CVData): Promise<void> {
    try {
      const key = KV_KEYS.DATA(this.keyPrefix, this.version)
      const timestamp = new Date().toISOString()

      // Wrap data with metadata
      const wrapped: StoredData<CVData> = {
        data,
        compressed: false,
        timestamp,
      }

      let serialized = JSON.stringify(wrapped)
      const shouldCompress = this.shouldCompress(serialized)

      logger.debug('KV update data', {
        key,
        size: serialized.length,
        compress: shouldCompress,
      })

      // Store data with optional compression and TTL
      const options = this.defaultTtl
        ? { expirationTtl: this.defaultTtl }
        : undefined

      if (shouldCompress) {
        // Set compression flag and re-serialize with correct metadata
        wrapped.compressed = true
        serialized = JSON.stringify(wrapped)

        // Compress and store as ArrayBuffer
        const compressed = await this.compressData(serialized)

        // Retry KV put operation for transient network errors
        await withRetry(() => this.namespace.put(key, compressed, options), {
          maxAttempts: 3,
          initialDelay: 500,
          isRetryable: isNetworkError,
        })

        logger.info('CV data compressed and updated in KV', {
          key,
          originalSize: serialized.length,
          compressedSize: compressed.byteLength,
          ratio:
            ((compressed.byteLength / serialized.length) * 100).toFixed(2) +
            '%',
        })
      } else {
        // Store as JSON with retry logic
        await withRetry(() => this.namespace.put(key, serialized, options), {
          maxAttempts: 3,
          initialDelay: 500,
          isRetryable: isNetworkError,
        })
        logger.info('CV data updated in KV', { key, size: serialized.length })
      }

      // Update metadata (non-critical, log warning if fails)
      try {
        await this.updateMetadata()
      } catch (error) {
        logger.warn('Failed to update metadata (data write succeeded)', {
          error,
          key,
        })
        // Don't throw - data is already stored successfully
      }
    } catch (error) {
      throw new CVStorageError('Failed to update CV data in KV', 'write', error)
    }
  }

  /**
   * Type guard to check if data is wrapped with StoredData metadata
   */
  private isStoredData<T>(data: unknown): data is StoredData<T> {
    return (
      typeof data === 'object' &&
      data !== null &&
      'data' in data &&
      'compressed' in data &&
      'timestamp' in data
    )
  }

  /**
   * Get specific section of CV data
   *
   * Uses BINARY-FIRST approach (same as getData) to handle compression.
   */
  async getSection<K extends keyof CVData>(
    section: K
  ): Promise<CVData[K] | null> {
    try {
      const sanitizedSection = this.sanitizeKey(section as string)
      const key = KV_KEYS.SECTION(
        this.keyPrefix,
        sanitizedSection,
        this.version
      )
      logger.debug('KV get section', { key, section })

      // BINARY-FIRST: Read as ArrayBuffer to handle both compressed and uncompressed
      const buffer = await this.namespace.get(key, 'arrayBuffer')

      if (!buffer || buffer.byteLength === 0) {
        logger.debug('No section data found in KV', { key, section })
        return null
      }

      // Detect format by checking gzip magic number
      let jsonString: string
      if (this.isGzipData(buffer)) {
        logger.debug('Decompressing gzip section data from KV', {
          key,
          section,
        })
        jsonString = await this.decompressData(buffer)
      } else {
        jsonString = new TextDecoder().decode(buffer)
      }

      // Parse JSON
      const stored = JSON.parse(jsonString) as StoredData<CVData[K]> | CVData[K]

      // Handle StoredData wrapper format
      if (this.isStoredData(stored)) {
        logger.debug('Section data retrieved from KV (StoredData format)', {
          key,
          section,
        })
        return stored.data
      }

      // Legacy: raw section data format
      logger.debug('Section data retrieved from KV (legacy format)', {
        key,
        section,
      })
      return stored as CVData[K]
    } catch (error) {
      throw new CVStorageError(
        `Failed to retrieve section '${section as string}' from KV`,
        'read',
        error
      )
    }
  }

  /**
   * Update specific section of CV data
   */
  async updateSection<K extends keyof CVData>(
    section: K,
    data: CVData[K]
  ): Promise<void> {
    try {
      const sanitizedSection = this.sanitizeKey(section as string)
      const key = KV_KEYS.SECTION(
        this.keyPrefix,
        sanitizedSection,
        this.version
      )
      const timestamp = new Date().toISOString()

      // Wrap data with metadata
      const wrapped: StoredData<CVData[K]> = {
        data,
        compressed: false,
        timestamp,
      }

      let serialized = JSON.stringify(wrapped)
      const shouldCompress = this.shouldCompress(serialized)

      logger.debug('KV update section', {
        key,
        section,
        size: serialized.length,
        compress: shouldCompress,
      })

      // Store data with optional compression and TTL
      const options = this.defaultTtl
        ? { expirationTtl: this.defaultTtl }
        : undefined

      if (shouldCompress) {
        // Set compression flag and re-serialize with correct metadata
        wrapped.compressed = true
        serialized = JSON.stringify(wrapped)

        // Compress and store as ArrayBuffer
        const compressed = await this.compressData(serialized)

        // Retry KV put operation for transient network errors
        await withRetry(() => this.namespace.put(key, compressed, options), {
          maxAttempts: 3,
          initialDelay: 500,
          isRetryable: isNetworkError,
        })

        logger.info('Section compressed and updated in KV', {
          key,
          section,
          originalSize: serialized.length,
          compressedSize: compressed.byteLength,
        })
      } else {
        // Store as JSON with retry logic
        await withRetry(() => this.namespace.put(key, serialized, options), {
          maxAttempts: 3,
          initialDelay: 500,
          isRetryable: isNetworkError,
        })
        logger.info('Section updated in KV', { key, section })
      }

      // Update metadata (non-critical, log warning if fails)
      try {
        await this.updateMetadata()
      } catch (error) {
        logger.warn('Failed to update metadata (section write succeeded)', {
          error,
          key,
          section,
        })
        // Don't throw - section data is already stored successfully
      }
    } catch (error) {
      throw new CVStorageError(
        `Failed to update section '${section as string}' in KV`,
        'write',
        error
      )
    }
  }

  /**
   * Check if CV data exists in KV
   */
  async exists(): Promise<boolean> {
    try {
      const key = KV_KEYS.DATA(this.keyPrefix, this.version)
      logger.debug('KV check exists', { key })

      const data = await this.namespace.get(key)

      return data !== null
    } catch (error) {
      // Don't throw on exists check - return false if error
      logger.warn('Error checking KV existence', { error })
      return false
    }
  }

  /**
   * Delete all CV data from KV (use with caution)
   */
  async delete(): Promise<void> {
    try {
      const dataKey = KV_KEYS.DATA(this.keyPrefix, this.version)
      const metadataKey = KV_KEYS.METADATA(this.keyPrefix)

      logger.warn('Deleting CV data from KV', { dataKey, metadataKey })

      // Delete main data and metadata
      await Promise.all([
        this.namespace.delete(dataKey),
        this.namespace.delete(metadataKey),
      ])

      // Delete all sections (list and delete)
      await this.deleteAllSections()

      logger.warn('CV data deleted from KV', { dataKey })
    } catch (error) {
      throw new CVStorageError(
        'Failed to delete CV data from KV',
        'delete',
        error
      )
    }
  }

  /**
   * Delete all section keys from KV
   * Uses prefix-based listing to find and delete all sections
   */
  private async deleteAllSections(): Promise<void> {
    const sectionPrefix = `${this.keyPrefix}:section:`
    let cursor: string | undefined

    do {
      const result = await this.namespace.list({
        prefix: sectionPrefix,
        limit: 1000,
        ...(cursor !== undefined && { cursor }),
      })

      // Delete all found keys in parallel
      await Promise.all(result.keys.map(key => this.namespace.delete(key.name)))

      cursor = result.cursor
    } while (cursor)

    logger.debug('All section keys deleted', { prefix: sectionPrefix })
  }

  /**
   * Update metadata after data changes
   */
  private async updateMetadata(): Promise<void> {
    const key = KV_KEYS.METADATA(this.keyPrefix)
    const metadata: CVMetadata = {
      lastUpdated: new Date().toISOString(),
      version: this.version,
    }

    // Retry metadata update for transient errors
    await withRetry(() => this.namespace.put(key, JSON.stringify(metadata)), {
      maxAttempts: 3,
      initialDelay: 500,
      isRetryable: isNetworkError,
    })
    logger.debug('Metadata updated', { key, metadata })
  }

  /**
   * Determine if data should be compressed based on size threshold
   */
  private shouldCompress(serialized: string): boolean {
    return (
      this.enableCompression && serialized.length > this.compressionThreshold
    )
  }

  /**
   * Detect if an ArrayBuffer contains gzip-compressed data
   * by checking for the gzip magic number (0x1f 0x8b)
   */
  private isGzipData(buffer: ArrayBuffer): boolean {
    const bytes = new Uint8Array(buffer)
    return bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b
  }

  /**
   * Sanitize section name for safe use in KV keys
   *
   * Prevents key injection attacks from admin CMS forms by removing
   * special characters that could manipulate key structure.
   *
   * @param section - Raw section name (potentially from user input)
   * @returns Sanitized section name safe for KV keys
   */
  private sanitizeKey(section: string): string {
    // Allow only alphanumeric, underscore, hyphen
    // Remove colons, slashes, dots that could break hierarchical structure
    return section.replace(/[^a-zA-Z0-9_-]/g, '_')
  }

  /**
   * Compress data using gzip (via CompressionStream API)
   */
  private async compressData(data: string): Promise<ArrayBuffer> {
    const stream = new Blob([data])
      .stream()
      .pipeThrough(new CompressionStream('gzip'))

    const chunks: Uint8Array[] = []
    const reader = stream.getReader()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }

      // Combine chunks into single ArrayBuffer
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const result = new Uint8Array(totalLength)
      let offset = 0

      for (const chunk of chunks) {
        result.set(chunk, offset)
        offset += chunk.length
      }

      return result.buffer
    } finally {
      // Always release the reader to prevent memory leaks
      reader.releaseLock()
    }
  }

  /**
   * Decompress data using gzip (via DecompressionStream API)
   */
  private async decompressData(buffer: ArrayBuffer): Promise<string> {
    const stream = new Blob([buffer])
      .stream()
      .pipeThrough(new DecompressionStream('gzip'))

    const chunks: Uint8Array[] = []
    const reader = stream.getReader()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }

      // Combine chunks and decode to string
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const result = new Uint8Array(totalLength)
      let offset = 0

      for (const chunk of chunks) {
        result.set(chunk, offset)
        offset += chunk.length
      }

      return new TextDecoder().decode(result)
    } finally {
      // Always release the reader to prevent memory leaks
      reader.releaseLock()
    }
  }

  /**
   * Get current metadata from KV
   */
  async getMetadata(): Promise<CVMetadata | null> {
    try {
      const key = KV_KEYS.METADATA(this.keyPrefix)
      const data = await this.namespace.get<CVMetadata>(key, 'json')
      return data
    } catch (error) {
      logger.warn('Error retrieving metadata', { error })
      return null
    }
  }
}
