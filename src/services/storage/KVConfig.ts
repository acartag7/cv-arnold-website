/**
 * Configuration types for Cloudflare KV storage adapter
 */

/**
 * Cloudflare KV namespace binding interface
 * Matches the Workers KV runtime API
 */
export interface KVNamespace {
  get(key: string): Promise<string | null>
  get(key: string, type: 'text'): Promise<string | null>
  get<T = unknown>(key: string, type: 'json'): Promise<T | null>
  get(key: string, type: 'arrayBuffer'): Promise<ArrayBuffer | null>
  get(key: string, type: 'stream'): Promise<ReadableStream | null>
  put(
    key: string,
    value: string | ReadableStream | ArrayBuffer,
    options?: KVPutOptions
  ): Promise<void>
  delete(key: string): Promise<void>
  list(options?: KVListOptions): Promise<KVListResult>
}

/**
 * Options for KV put operations
 */
export interface KVPutOptions {
  /** Expiration time in seconds from now */
  expirationTtl?: number
  /** Absolute expiration time as Unix timestamp */
  expiration?: number
  /** Arbitrary JSON metadata to attach */
  metadata?: Record<string, unknown>
}

/**
 * Options for KV list operations
 */
export interface KVListOptions {
  /** Filter by key prefix */
  prefix?: string
  /** Maximum number of keys to return (default: 1000, max: 1000) */
  limit?: number
  /** Cursor for pagination */
  cursor?: string
}

/**
 * Result from KV list operations
 */
export interface KVListResult {
  keys: Array<{
    name: string
    expiration?: number
    metadata?: Record<string, unknown>
  }>
  list_complete: boolean
  cursor?: string
}

/**
 * Configuration for KVStorageAdapter
 */
export interface KVStorageConfig {
  /** KV namespace binding */
  namespace: KVNamespace
  /** Key prefix for all CV data (default: 'cv') */
  keyPrefix?: string
  /** Schema version (default: 'v1') */
  version?: string
  /** Enable compression for large objects (default: false) */
  enableCompression?: boolean
  /** Compression threshold in bytes (default: 10240 = 10KB) */
  compressionThreshold?: number
  /** Default TTL for cached data in seconds (optional) */
  defaultTtl?: number
}

/**
 * Key structure constants for CV data
 */
export const KV_KEYS = {
  /** Main CV data key pattern: cv:data:v1 */
  DATA: (prefix: string, version: string) => `${prefix}:data:${version}`,
  /** Section key pattern: cv:section:{name}:v1 */
  SECTION: (prefix: string, section: string, version: string) =>
    `${prefix}:section:${section}:${version}`,
  /** Metadata key pattern: cv:metadata */
  METADATA: (prefix: string) => `${prefix}:metadata`,
} as const
