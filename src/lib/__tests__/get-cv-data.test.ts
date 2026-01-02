/**
 * Tests for CV Data Fetching Layer
 *
 * Tests the get-cv-data module which fetches CV data from:
 * - Cloudflare KV (production/build)
 * - Local JSON file (development fallback)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as childProcess from 'child_process'
import { getCVData, __testing } from '../get-cv-data'

// Mock child_process
vi.mock('child_process')

// Mock logger to prevent console output
vi.mock('../logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}))

// Get the mocked function
const mockExecFileSync = vi.mocked(childProcess.execFileSync)

// Valid CV data for mocking KV responses - must match isCVData validation
const validKVResponse = JSON.stringify({
  version: '1.0.0',
  personalInfo: {
    fullName: 'KV Test User',
    title: 'Software Engineer',
    email: 'kv-test@example.com',
    phone: '+1234567890',
    location: { city: 'Test City', country: 'Test Country', countryCode: 'TC' },
    summary: 'A test summary',
    social: { linkedin: 'https://linkedin.com/in/test' },
  },
  experience: [], // Note: 'experience' not 'experiences'
  skills: [],
  certifications: [],
  achievements: [],
  education: [],
  languages: [],
  heroStats: {
    yearsExperience: 10,
    certificationsCount: 5,
    projectsDelivered: 50,
    yearsExperienceLabel: 'Years',
    certificationsLabel: 'Certs',
    projectsDeliveredLabel: 'Projects',
  },
})

describe('get-cv-data', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Default: development mode, no CI, no USE_KV
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('CI', '')
    vi.stubEnv('USE_KV', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('getCVData', () => {
    describe('in development mode', () => {
      it('should fetch from local file by default', async () => {
        vi.stubEnv('NODE_ENV', 'development')

        const result = await getCVData()

        // Should use local file (cv-data.json exists)
        expect(result).toBeDefined()
        expect(result.personalInfo.fullName).toBe('Arnold Cartagena')
        // execFileSync should NOT be called since not in production/CI
        expect(mockExecFileSync).not.toHaveBeenCalled()
      })

      it('should not attempt KV fetch in development without USE_KV flag', async () => {
        vi.stubEnv('NODE_ENV', 'development')
        vi.stubEnv('USE_KV', '')

        await getCVData()

        expect(mockExecFileSync).not.toHaveBeenCalled()
      })
    })

    describe('in production mode', () => {
      it('should attempt KV fetch first when in production', async () => {
        vi.stubEnv('NODE_ENV', 'production')
        mockExecFileSync.mockImplementation(() => validKVResponse)

        const result = await getCVData()

        expect(mockExecFileSync).toHaveBeenCalledWith(
          'npx',
          expect.arrayContaining(['wrangler', 'kv', 'key', 'get']),
          expect.objectContaining({ encoding: 'utf-8' })
        )
        expect(result.personalInfo.fullName).toBe('KV Test User')
      })

      it('should fall back to local file when KV fetch fails', async () => {
        vi.stubEnv('NODE_ENV', 'production')
        mockExecFileSync.mockImplementation(() => {
          throw new Error('KV fetch failed')
        })

        const result = await getCVData()

        // Should fall back to local file
        expect(result).toBeDefined()
        expect(result.personalInfo.fullName).toBe('Arnold Cartagena')
      })
    })

    describe('in CI mode', () => {
      it('should attempt KV fetch when CI=true', async () => {
        vi.stubEnv('NODE_ENV', 'development')
        vi.stubEnv('CI', 'true')
        mockExecFileSync.mockReturnValue(validKVResponse)

        await getCVData()

        expect(mockExecFileSync).toHaveBeenCalled()
      })
    })

    describe('with USE_KV flag', () => {
      it('should attempt KV fetch when USE_KV=true', async () => {
        vi.stubEnv('NODE_ENV', 'development')
        vi.stubEnv('USE_KV', 'true')
        mockExecFileSync.mockReturnValue(validKVResponse)

        await getCVData()

        expect(mockExecFileSync).toHaveBeenCalled()
      })
    })

    describe('custom configuration', () => {
      it('should accept custom kvNamespaceId', async () => {
        vi.stubEnv('NODE_ENV', 'production')
        const customNamespaceId = 'custom-namespace-id'
        mockExecFileSync.mockReturnValue(validKVResponse)

        await getCVData({ kvNamespaceId: customNamespaceId })

        expect(mockExecFileSync).toHaveBeenCalledWith(
          'npx',
          expect.arrayContaining([`--namespace-id=${customNamespaceId}`]),
          expect.any(Object)
        )
      })

      it('should accept custom kvKey', async () => {
        vi.stubEnv('NODE_ENV', 'production')
        const customKey = 'custom_key'
        mockExecFileSync.mockReturnValue(validKVResponse)

        await getCVData({ kvKey: customKey })

        expect(mockExecFileSync).toHaveBeenCalledWith(
          'npx',
          expect.arrayContaining([customKey]),
          expect.any(Object)
        )
      })
    })
  })

  describe('fetchFromKV', () => {
    it('should parse JSON from wrangler output with warnings', async () => {
      vi.stubEnv('NODE_ENV', 'production')

      // Mock output with wrangler warnings before JSON
      const wranglerOutput = `Warning: something
Another warning

${validKVResponse}`

      mockExecFileSync.mockImplementation(() => wranglerOutput)

      const result = await getCVData()

      expect(result).toBeDefined()
      expect(result.personalInfo.fullName).toBe('KV Test User')
    })

    it('should return null when no JSON found in output (fallback to file)', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      mockExecFileSync.mockReturnValue('No JSON here\nJust text')

      // Should fall back to local file
      const result = await getCVData()
      expect(result).toBeDefined()
      expect(result.personalInfo.fullName).toBe('Arnold Cartagena')
    })

    it('should return null when JSON parse fails (fallback to file)', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      mockExecFileSync.mockReturnValue('{invalid json}')

      // Should fall back to local file
      const result = await getCVData()
      expect(result.personalInfo.fullName).toBe('Arnold Cartagena')
    })

    it('should return null when validation fails (fallback to file)', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      // Valid JSON but missing required fields
      mockExecFileSync.mockReturnValue('{"invalid": "structure"}')

      // Should fall back to local file
      const result = await getCVData()
      expect(result.personalInfo.fullName).toBe('Arnold Cartagena')
    })

    it('should handle timeout correctly with default value', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      mockExecFileSync.mockReturnValue(validKVResponse)

      await getCVData()

      // Default timeout is 10000ms (configurable via KV_FETCH_TIMEOUT_MS)
      expect(mockExecFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.objectContaining({ timeout: 10000 })
      )
    })
  })

  describe('fetchFromFile', () => {
    it('should return valid CV data from local file', async () => {
      vi.stubEnv('NODE_ENV', 'development')

      const result = await getCVData()

      // Uses the real local cv-data.json
      expect(result.personalInfo.fullName).toBe('Arnold Cartagena')
      expect(result.personalInfo.email).toBeDefined()
    })
  })

  describe('security (command injection prevention)', () => {
    it('should use execFileSync with argument array', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      mockExecFileSync.mockReturnValue(validKVResponse)

      await getCVData()

      // Verify execFileSync is called with separate arguments, not a single string
      expect(mockExecFileSync).toHaveBeenCalledWith(
        'npx',
        [
          'wrangler',
          'kv',
          'key',
          'get',
          expect.any(String), // kvKey
          expect.stringContaining('--namespace-id='), // namespace-id arg
          '--remote',
        ],
        expect.any(Object)
      )
    })

    it('should not interpolate user input into command string', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      // Attempt to inject a malicious command via config
      const maliciousKey = 'key"; rm -rf /'
      mockExecFileSync.mockReturnValue(validKVResponse)

      await getCVData({ kvKey: maliciousKey })

      // The malicious key should be passed as a single argument, not executed
      expect(mockExecFileSync).toHaveBeenCalledWith(
        'npx',
        expect.arrayContaining([maliciousKey]),
        expect.any(Object)
      )
    })
  })

  describe('__testing exports', () => {
    it('should export DEFAULT_CONFIG with correct values', () => {
      expect(__testing.DEFAULT_CONFIG.kvKey).toBe('cv_data')
      expect(__testing.DEFAULT_CONFIG.fallbackPath).toBe(
        './src/data/cv-data.json'
      )
    })

    it('should export fetchFromKV function', () => {
      expect(typeof __testing.fetchFromKV).toBe('function')
    })

    it('should export fetchFromFile function', () => {
      expect(typeof __testing.fetchFromFile).toBe('function')
    })
  })
})
