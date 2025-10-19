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
   */
  async getData(): Promise<CVData | null> {
    try {
      const key = KV_KEYS.DATA(this.keyPrefix, this.version)
      logger.debug('KV get data', { key })

      // Try to get as JSON first (uncompressed or wrapped)
      const stored = await this.namespace.get<StoredData<CVData> | CVData>(
        key,
        'json'
      )

      if (!stored) {
        logger.debug('No CV data found in KV', { key })
        return null
      }

      // Check if data is wrapped with compression metadata
      if (this.isStoredData(stored)) {
        if (stored.compressed) {
          // Data is compressed, need to get as arrayBuffer and decompress
          const compressed = await this.namespace.get(key, 'arrayBuffer')
          if (!compressed) return null

          const decompressed = await this.decompressData(compressed)
          const parsed = JSON.parse(decompressed) as StoredData<CVData>
          logger.debug('CV data retrieved and decompressed from KV', {
            key,
            originalSize: compressed.byteLength,
            decompressedSize: decompressed.length,
          })
          return parsed.data
        }
        return stored.data
      }

      // Legacy: data stored directly without wrapper
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

      const serialized = JSON.stringify(wrapped)
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
        // Compress and store as ArrayBuffer
        const compressed = await this.compressData(serialized)
        wrapped.compressed = true
        await this.namespace.put(key, compressed, options)
        logger.info('CV data compressed and updated in KV', {
          key,
          originalSize: serialized.length,
          compressedSize: compressed.byteLength,
          ratio:
            ((compressed.byteLength / serialized.length) * 100).toFixed(2) +
            '%',
        })
      } else {
        // Store as JSON
        await this.namespace.put(key, serialized, options)
        logger.info('CV data updated in KV', { key, size: serialized.length })
      }

      // Update metadata
      await this.updateMetadata()
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
   */
  async getSection<K extends keyof CVData>(
    section: K
  ): Promise<CVData[K] | null> {
    try {
      const key = KV_KEYS.SECTION(
        this.keyPrefix,
        section as string,
        this.version
      )
      logger.debug('KV get section', { key, section })

      // Try to get as JSON first (uncompressed or wrapped)
      const stored = await this.namespace.get<
        StoredData<CVData[K]> | CVData[K]
      >(key, 'json')

      if (!stored) {
        logger.debug('No section data found in KV', { key, section })
        return null
      }

      // Check if data is wrapped with compression metadata
      if (this.isStoredData(stored)) {
        if (stored.compressed) {
          // Data is compressed, need to get as arrayBuffer and decompress
          const compressed = await this.namespace.get(key, 'arrayBuffer')
          if (!compressed) return null

          const decompressed = await this.decompressData(compressed)
          const parsed = JSON.parse(decompressed) as StoredData<CVData[K]>
          logger.debug('Section data retrieved and decompressed from KV', {
            key,
            section,
          })
          return parsed.data
        }
        return stored.data
      }

      // Legacy: data stored directly without wrapper
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
      const key = KV_KEYS.SECTION(
        this.keyPrefix,
        section as string,
        this.version
      )
      const timestamp = new Date().toISOString()

      // Wrap data with metadata
      const wrapped: StoredData<CVData[K]> = {
        data,
        compressed: false,
        timestamp,
      }

      const serialized = JSON.stringify(wrapped)
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
        // Compress and store as ArrayBuffer
        const compressed = await this.compressData(serialized)
        wrapped.compressed = true
        await this.namespace.put(key, compressed, options)
        logger.info('Section compressed and updated in KV', {
          key,
          section,
          originalSize: serialized.length,
          compressedSize: compressed.byteLength,
        })
      } else {
        // Store as JSON
        await this.namespace.put(key, serialized, options)
        logger.info('Section updated in KV', { key, section })
      }

      // Update metadata
      await this.updateMetadata()
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

    await this.namespace.put(key, JSON.stringify(metadata))
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
   * Compress data using gzip (via CompressionStream API)
   */
  private async compressData(data: string): Promise<ArrayBuffer> {
    const stream = new Blob([data])
      .stream()
      .pipeThrough(new CompressionStream('gzip'))

    const chunks: Uint8Array[] = []
    const reader = stream.getReader()

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
