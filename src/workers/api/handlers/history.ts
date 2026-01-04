/**
 * History Endpoint Handlers
 *
 * Manages CV data snapshots for change tracking and rollback.
 * Stores snapshots in KV with metadata index for efficient listing.
 *
 * ## Storage Schema
 *
 * ```
 * cv:history:index     - Array of snapshot metadata (id, timestamp, description)
 * cv:history:snap:{id} - Full snapshot data with CV content
 * ```
 *
 * ## Retention Policy
 * - Maximum 50 snapshots retained
 * - Oldest snapshots auto-deleted when limit exceeded
 *
 * @module workers/api/handlers/history
 */

import type { KVNamespace } from '@/services/storage/KVConfig'
import type { CVData } from '@/types/cv'
import {
  KV_KEYS,
  isGzipData,
  decompressData,
  isStoredData,
} from '@/services/storage/KVConfig'
import {
  jsonResponse,
  notFound,
  badRequest,
  internalError,
  HttpStatus,
} from '../utils/response'

/**
 * Maximum number of snapshots to retain
 */
const MAX_SNAPSHOTS = 50

/**
 * Read CV data from KV with compression support
 * Uses binary-first approach to handle both compressed and uncompressed data
 */
async function readCVDataFromKV(kv: KVNamespace): Promise<CVData | null> {
  const key = KV_KEYS.DATA('cv', 'v1')
  const buffer = await kv.get(key, 'arrayBuffer')

  if (!buffer || buffer.byteLength === 0) {
    return null
  }

  // Detect and decompress if needed
  let jsonString: string
  if (isGzipData(buffer)) {
    jsonString = await decompressData(buffer)
  } else {
    jsonString = new TextDecoder().decode(buffer)
  }

  const rawData = JSON.parse(jsonString)

  // Unwrap StoredData format if present
  if (isStoredData<CVData>(rawData)) {
    return rawData.data
  }

  return rawData as CVData
}

/**
 * Snapshot metadata stored in the index
 */
export interface SnapshotMetadata {
  /** Unique snapshot ID */
  id: string
  /** ISO timestamp when snapshot was created */
  timestamp: string
  /** User-provided description or auto-generated */
  description: string
  /** Email of user who created the snapshot */
  createdBy: string | null
  /** Size of snapshot data in bytes */
  size: number
  /** CV version at time of snapshot */
  version: string
}

/**
 * Full snapshot with data
 */
export interface Snapshot extends SnapshotMetadata {
  /** The CV data at this point in time */
  data: CVData
}

/**
 * Environment bindings for history handlers
 */
export interface HistoryHandlerEnv {
  CV_DATA: KVNamespace
}

/**
 * KV key for the history index
 */
const HISTORY_INDEX_KEY = 'cv:history:index'

/**
 * Generate KV key for a snapshot
 */
function getSnapshotKey(id: string): string {
  return `cv:history:snap:${id}`
}

/**
 * Generate a unique snapshot ID
 */
function generateSnapshotId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${random}`
}

/**
 * Get the history index from KV
 */
async function getHistoryIndex(kv: KVNamespace): Promise<SnapshotMetadata[]> {
  const raw = await kv.get(HISTORY_INDEX_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as SnapshotMetadata[]
  } catch {
    return []
  }
}

/**
 * Save the history index to KV
 */
async function saveHistoryIndex(
  kv: KVNamespace,
  index: SnapshotMetadata[]
): Promise<void> {
  await kv.put(HISTORY_INDEX_KEY, JSON.stringify(index))
}

/**
 * GET /api/v1/cv/history
 *
 * List all available snapshots with metadata.
 * Returns newest first.
 *
 * Query parameters:
 * - limit: Number of snapshots to return (default: 20, max: 50)
 * - offset: Number of snapshots to skip (default: 0)
 *
 * @param request - Incoming request
 * @param env - Environment bindings
 * @returns JSON response with snapshot list
 */
export async function handleListHistory(
  request: Request,
  env: HistoryHandlerEnv
): Promise<Response> {
  try {
    const url = new URL(request.url)
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') ?? '20', 10),
      MAX_SNAPSHOTS
    )
    const offset = parseInt(url.searchParams.get('offset') ?? '0', 10)

    const index = await getHistoryIndex(env.CV_DATA)

    // Sort by timestamp descending (newest first)
    const sorted = [...index].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    // Apply pagination
    const paginated = sorted.slice(offset, offset + limit)

    return jsonResponse(
      {
        snapshots: paginated,
        total: index.length,
        limit,
        offset,
      },
      HttpStatus.OK,
      { version: 'v1' }
    )
  } catch (error) {
    console.error('Error listing history:', error)
    return internalError('Failed to list history')
  }
}

/**
 * GET /api/v1/cv/history/:id
 *
 * Retrieve a specific snapshot including full CV data.
 *
 * @param request - Incoming request
 * @param env - Environment bindings
 * @param id - Snapshot ID
 * @returns JSON response with full snapshot data
 */
export async function handleGetSnapshot(
  request: Request,
  env: HistoryHandlerEnv,
  id: string
): Promise<Response> {
  try {
    if (!id) {
      return badRequest('Snapshot ID is required')
    }

    const raw = await env.CV_DATA.get(getSnapshotKey(id))
    if (!raw) {
      return notFound(`Snapshot '${id}' not found`)
    }

    const snapshot = JSON.parse(raw) as Snapshot
    return jsonResponse(snapshot, HttpStatus.OK, { version: 'v1' })
  } catch (error) {
    console.error(`Error retrieving snapshot ${id}:`, error)
    return internalError('Failed to retrieve snapshot')
  }
}

/**
 * POST /api/v1/cv/history
 *
 * Create a new snapshot of the current CV data.
 * Automatically enforces retention limits.
 *
 * Request body:
 * - description: Optional description of why this snapshot was created
 *
 * @param request - Incoming request
 * @param env - Environment bindings
 * @returns JSON response with created snapshot metadata
 */
export async function handleCreateSnapshot(
  request: Request,
  env: HistoryHandlerEnv
): Promise<Response> {
  try {
    // Parse optional description from body
    let description = 'Manual snapshot'
    try {
      const body = (await request.json()) as { description?: string }
      if (body.description && typeof body.description === 'string') {
        description = body.description.slice(0, 200) // Limit description length
      }
    } catch {
      // Body is optional, default description used
    }

    // Get current CV data using helper with compression support
    const cvData = await readCVDataFromKV(env.CV_DATA)
    if (!cvData) {
      return notFound('No CV data found to snapshot')
    }

    // Get user email from Cloudflare Access headers
    const createdBy = request.headers.get('Cf-Access-Authenticated-User-Email')

    // Create snapshot
    const id = generateSnapshotId()
    const timestamp = new Date().toISOString()
    // Calculate size from serialized data (for metadata tracking)
    const cvDataSerialized = JSON.stringify(cvData)
    const size = cvDataSerialized.length

    const snapshot: Snapshot = {
      id,
      timestamp,
      description,
      createdBy,
      size,
      version: cvData.version ?? 'unknown',
      data: cvData,
    }

    const metadata: SnapshotMetadata = {
      id,
      timestamp,
      description,
      createdBy,
      size,
      version: snapshot.version,
    }

    // Get current index
    const index = await getHistoryIndex(env.CV_DATA)

    // Add new snapshot to index
    index.unshift(metadata)

    // Enforce retention limit
    const toDelete: string[] = []
    while (index.length > MAX_SNAPSHOTS) {
      const removed = index.pop()
      if (removed) {
        toDelete.push(removed.id)
      }
    }

    // Save snapshot and updated index
    await Promise.all([
      env.CV_DATA.put(getSnapshotKey(id), JSON.stringify(snapshot)),
      saveHistoryIndex(env.CV_DATA, index),
      // Delete old snapshots
      ...toDelete.map(oldId => env.CV_DATA.delete(getSnapshotKey(oldId))),
    ])

    return jsonResponse(
      {
        message: 'Snapshot created successfully',
        snapshot: metadata,
      },
      HttpStatus.CREATED,
      { version: 'v1' }
    )
  } catch (error) {
    console.error('Error creating snapshot:', error)
    return internalError('Failed to create snapshot')
  }
}

/**
 * DELETE /api/v1/cv/history/:id
 *
 * Delete a specific snapshot.
 *
 * @param request - Incoming request
 * @param env - Environment bindings
 * @param id - Snapshot ID to delete
 * @returns JSON response confirming deletion
 */
export async function handleDeleteSnapshot(
  request: Request,
  env: HistoryHandlerEnv,
  id: string
): Promise<Response> {
  try {
    if (!id) {
      return badRequest('Snapshot ID is required')
    }

    // Check if snapshot exists
    const exists = await env.CV_DATA.get(getSnapshotKey(id))
    if (!exists) {
      return notFound(`Snapshot '${id}' not found`)
    }

    // Get current index
    const index = await getHistoryIndex(env.CV_DATA)
    const newIndex = index.filter(s => s.id !== id)

    // Delete snapshot and update index
    await Promise.all([
      env.CV_DATA.delete(getSnapshotKey(id)),
      saveHistoryIndex(env.CV_DATA, newIndex),
    ])

    return jsonResponse(
      {
        message: 'Snapshot deleted successfully',
        id,
      },
      HttpStatus.OK,
      { version: 'v1' }
    )
  } catch (error) {
    console.error(`Error deleting snapshot ${id}:`, error)
    return internalError('Failed to delete snapshot')
  }
}
