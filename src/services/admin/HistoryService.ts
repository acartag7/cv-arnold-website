/**
 * History Service
 *
 * Client-side service for managing CV data history/snapshots.
 * Communicates with the /api/v1/cv/history endpoints.
 *
 * @module services/admin/HistoryService
 */

import { createLogger } from '@/lib/logger'
import type { CVData } from '@/types/cv'

const logger = createLogger('HistoryService')

/**
 * Snapshot metadata (without full data)
 */
export interface SnapshotMetadata {
  id: string
  timestamp: string
  description: string
  createdBy: string | null
  size: number
  version: string
}

/**
 * Full snapshot including CV data
 */
export interface Snapshot extends SnapshotMetadata {
  data: CVData
}

/**
 * Paginated history list response
 */
export interface HistoryListResponse {
  snapshots: SnapshotMetadata[]
  total: number
  limit: number
  offset: number
}

/**
 * Create snapshot request
 */
export interface CreateSnapshotRequest {
  description?: string
}

/**
 * Custom error for History API failures
 */
export class HistoryAPIError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message)
    this.name = 'HistoryAPIError'
  }
}

/**
 * Base URL for the API (relative)
 */
const API_BASE = '/api/v1/cv/history'

/**
 * Make an API request with error handling
 */
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'Unknown error',
    }))
    throw new HistoryAPIError(
      error.error || `HTTP ${response.status}`,
      response.status,
      error.code
    )
  }

  return response.json()
}

/**
 * History Service API
 */
export const HistoryService = {
  /**
   * List all snapshots with pagination
   *
   * @param options - Pagination options
   * @returns Paginated list of snapshot metadata
   */
  async list(options?: {
    limit?: number
    offset?: number
  }): Promise<HistoryListResponse> {
    const params = new URLSearchParams()
    if (options?.limit) params.set('limit', String(options.limit))
    if (options?.offset) params.set('offset', String(options.offset))

    const url = params.toString() ? `${API_BASE}?${params}` : API_BASE

    logger.info('Fetching history list', {
      limit: options?.limit,
      offset: options?.offset,
    })
    const response = await apiRequest<{ data: HistoryListResponse }>(url)
    return response.data
  },

  /**
   * Get a specific snapshot by ID
   *
   * @param id - Snapshot ID
   * @returns Full snapshot including CV data
   */
  async get(id: string): Promise<Snapshot> {
    logger.info('Fetching snapshot', { id })
    const response = await apiRequest<{ data: Snapshot }>(`${API_BASE}/${id}`)
    return response.data
  },

  /**
   * Create a new snapshot of current CV data
   *
   * @param request - Optional description
   * @returns Created snapshot metadata
   */
  async create(request?: CreateSnapshotRequest): Promise<SnapshotMetadata> {
    logger.info('Creating snapshot', { description: request?.description })
    const response = await apiRequest<{
      data: { message: string; snapshot: SnapshotMetadata }
    }>(API_BASE, {
      method: 'POST',
      body: JSON.stringify(request ?? {}),
    })
    return response.data.snapshot
  },

  /**
   * Delete a snapshot
   *
   * @param id - Snapshot ID to delete
   */
  async delete(id: string): Promise<void> {
    logger.info('Deleting snapshot', { id })
    await apiRequest<{ data: { message: string; id: string } }>(
      `${API_BASE}/${id}`,
      { method: 'DELETE' }
    )
  },
}
