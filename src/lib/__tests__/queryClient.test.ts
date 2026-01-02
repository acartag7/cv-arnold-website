/**
 * Tests for React Query client configuration
 */

import { describe, it, expect } from 'vitest'
import { createQueryClient, queryKeys } from '../queryClient'

describe('queryClient', () => {
  describe('createQueryClient', () => {
    it('should create a new QueryClient instance', () => {
      const client = createQueryClient()

      expect(client).toBeDefined()
      expect(typeof client.getDefaultOptions).toBe('function')
    })

    it('should configure default stale time', () => {
      const client = createQueryClient()
      const options = client.getDefaultOptions()

      expect(options.queries?.staleTime).toBe(5 * 60 * 1000) // 5 minutes
    })

    it('should configure retry settings', () => {
      const client = createQueryClient()
      const options = client.getDefaultOptions()

      expect(options.queries?.retry).toBe(3)
      expect(options.mutations?.retry).toBe(1)
    })

    it('should disable refetch on window focus', () => {
      const client = createQueryClient()
      const options = client.getDefaultOptions()

      expect(options.queries?.refetchOnWindowFocus).toBe(false)
    })

    it('should create independent instances', () => {
      const client1 = createQueryClient()
      const client2 = createQueryClient()

      expect(client1).not.toBe(client2)
    })
  })

  describe('queryKeys', () => {
    describe('cv keys', () => {
      it('should have all key', () => {
        expect(queryKeys.cv.all).toEqual(['cv'])
      })

      it('should generate data key', () => {
        expect(queryKeys.cv.data()).toEqual(['cv', 'data'])
      })

      it('should generate section key', () => {
        expect(queryKeys.cv.section('experience')).toEqual([
          'cv',
          'section',
          'experience',
        ])
        expect(queryKeys.cv.section('skills')).toEqual([
          'cv',
          'section',
          'skills',
        ])
        expect(queryKeys.cv.section('education')).toEqual([
          'cv',
          'section',
          'education',
        ])
      })

      it('should return arrays from key generators', () => {
        const dataKey = queryKeys.cv.data()
        const sectionKey = queryKeys.cv.section('test')

        // Verify they return proper arrays
        expect(Array.isArray(queryKeys.cv.all)).toBe(true)
        expect(Array.isArray(dataKey)).toBe(true)
        expect(Array.isArray(sectionKey)).toBe(true)
      })
    })

    describe('history keys', () => {
      it('should have all key', () => {
        expect(queryKeys.history.all).toEqual(['history'])
      })

      it('should generate list key', () => {
        expect(queryKeys.history.list()).toEqual(['history', 'list'])
      })

      it('should generate snapshot key', () => {
        expect(queryKeys.history.snapshot('abc123')).toEqual([
          'history',
          'snapshot',
          'abc123',
        ])
        expect(queryKeys.history.snapshot('xyz789')).toEqual([
          'history',
          'snapshot',
          'xyz789',
        ])
      })

      it('should return arrays from key generators', () => {
        const listKey = queryKeys.history.list()
        const snapshotKey = queryKeys.history.snapshot('test')

        // Verify they return proper arrays
        expect(Array.isArray(queryKeys.history.all)).toBe(true)
        expect(Array.isArray(listKey)).toBe(true)
        expect(Array.isArray(snapshotKey)).toBe(true)
      })
    })

    describe('key hierarchy', () => {
      it('should have cv data key as child of cv all', () => {
        const allKey = queryKeys.cv.all
        const dataKey = queryKeys.cv.data()

        expect(dataKey.slice(0, allKey.length)).toEqual([...allKey])
      })

      it('should have section key as child of cv all', () => {
        const allKey = queryKeys.cv.all
        const sectionKey = queryKeys.cv.section('experience')

        expect(sectionKey.slice(0, allKey.length)).toEqual([...allKey])
      })

      it('should have history list key as child of history all', () => {
        const allKey = queryKeys.history.all
        const listKey = queryKeys.history.list()

        expect(listKey.slice(0, allKey.length)).toEqual([...allKey])
      })

      it('should have snapshot key as child of history all', () => {
        const allKey = queryKeys.history.all
        const snapshotKey = queryKeys.history.snapshot('id')

        expect(snapshotKey.slice(0, allKey.length)).toEqual([...allKey])
      })
    })
  })
})
