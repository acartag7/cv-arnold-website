/**
 * Admin Data Service
 *
 * Client-side service for managing CV data through the API.
 * Used by the admin interface to fetch and update CV data.
 *
 * @module services/admin/AdminDataService
 */

import type { CVData } from '@/types'
import { createLogger } from '@/lib/logger'

const logger = createLogger('AdminDataService')

/**
 * API base URL - uses environment variable or defaults to relative path
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

/**
 * Custom error class for API errors
 */
export class AdminAPIError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message)
    this.name = 'AdminAPIError'
  }
}

/**
 * Response envelope from API
 */
interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    timestamp: string
    requestId: string
    version: string
  }
}

/**
 * Import result from API
 */
export interface ImportResult {
  message: string
  format: 'json' | 'yaml'
  version: string
}

/**
 * Preview result from API
 */
export interface PreviewResult {
  message: string
  preview: boolean
  format: 'json' | 'yaml'
  version: string
  sections: {
    personalInfo: boolean
    experience: number
    skills: number
    education: number
    certifications: number
    languages: number
  }
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  let result: APIResponse<T>
  try {
    result = await response.json()
  } catch (parseError) {
    // Wrap JSON parse errors in AdminAPIError for consistent error handling
    logger.error('Failed to parse API response', parseError as Error, {
      endpoint,
      status: response.status,
    })
    throw new AdminAPIError(
      'Failed to parse API response',
      response.status,
      'PARSE_ERROR'
    )
  }

  if (!response.ok || !result.success) {
    const errorMessage =
      result.error?.message || `API error: ${response.status}`
    const errorCode = result.error?.code
    logger.error('API request failed', new Error(errorMessage), {
      endpoint,
      status: response.status,
      code: errorCode,
    })
    throw new AdminAPIError(errorMessage, response.status, errorCode)
  }

  return result.data as T
}

/**
 * Admin Data Service
 *
 * Provides methods for managing CV data through the API
 */
export const AdminDataService = {
  /**
   * Get the complete CV data
   */
  async getData(): Promise<CVData> {
    logger.info('Fetching CV data')
    return apiRequest<CVData>('/api/v1/cv')
  },

  /**
   * Get a specific section of the CV data
   */
  async getSection<K extends keyof CVData>(section: K): Promise<CVData[K]> {
    logger.info('Fetching section', { section })
    return apiRequest<CVData[K]>(`/api/v1/cv/sections/${section}`)
  },

  /**
   * Update the complete CV data
   */
  async updateData(data: CVData): Promise<void> {
    logger.info('Updating CV data')
    await apiRequest<void>('/api/v1/cv', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Export CV data as JSON or YAML
   */
  async exportData(format: 'json' | 'yaml' = 'json'): Promise<Blob> {
    const url = `${API_BASE_URL}/api/v1/cv/export?format=${format}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new AdminAPIError('Failed to export data', response.status)
    }

    return response.blob()
  },

  /**
   * Import CV data from a file
   */
  async importData(file: File): Promise<ImportResult> {
    const content = await file.text()
    const contentType =
      file.name.endsWith('.yaml') || file.name.endsWith('.yml')
        ? 'application/x-yaml'
        : 'application/json'

    logger.info('Importing CV data', { filename: file.name, contentType })

    const response = await fetch(`${API_BASE_URL}/api/v1/cv/import`, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
      },
      body: content,
    })

    const result: APIResponse<ImportResult> = await response.json()

    if (!response.ok || !result.success) {
      const errorMessage = result.error?.message || 'Import failed'
      throw new AdminAPIError(errorMessage, response.status, result.error?.code)
    }

    return result.data as ImportResult
  },

  /**
   * Validate import data without saving (preview)
   */
  async previewImport(file: File): Promise<PreviewResult> {
    const content = await file.text()
    const contentType =
      file.name.endsWith('.yaml') || file.name.endsWith('.yml')
        ? 'application/x-yaml'
        : 'application/json'

    logger.info('Previewing import', { filename: file.name })

    const response = await fetch(
      `${API_BASE_URL}/api/v1/cv/import?preview=true`,
      {
        method: 'POST',
        headers: {
          'Content-Type': contentType,
        },
        body: content,
      }
    )

    const result: APIResponse<PreviewResult> = await response.json()

    if (!response.ok || !result.success) {
      const errorMessage = result.error?.message || 'Preview failed'
      throw new AdminAPIError(errorMessage, response.status, result.error?.code)
    }

    return result.data as PreviewResult
  },
}

export default AdminDataService
