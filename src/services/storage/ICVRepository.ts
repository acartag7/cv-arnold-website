/**
 * Repository interface for CV data storage abstraction
 *
 * This interface defines the contract for all storage implementations,
 * enabling dependency injection and easy swapping of storage backends
 * (JSON files, Cloudflare KV, databases, etc.)
 */

import type { CVData } from '@/types/cv'

/**
 * Storage repository interface for CV data operations
 */
export interface ICVRepository {
  /**
   * Retrieve all CV data
   * @returns Promise resolving to complete CV data or null if not found
   */
  getData(): Promise<CVData | null>

  /**
   * Update CV data (full replacement)
   * @param data - Complete CV data object to store
   * @returns Promise resolving when update is complete
   */
  updateData(data: CVData): Promise<void>

  /**
   * Get specific section of CV data
   * @param section - Section key to retrieve
   * @returns Promise resolving to section data or null if not found
   */
  getSection<K extends keyof CVData>(section: K): Promise<CVData[K] | null>

  /**
   * Update specific section of CV data
   * @param section - Section key to update
   * @param data - Section data to store
   * @returns Promise resolving when update is complete
   */
  updateSection<K extends keyof CVData>(
    section: K,
    data: CVData[K]
  ): Promise<void>

  /**
   * Check if CV data exists
   * @returns Promise resolving to true if data exists, false otherwise
   */
  exists(): Promise<boolean>

  /**
   * Delete all CV data (use with caution)
   * @returns Promise resolving when deletion is complete
   */
  delete(): Promise<void>
}
