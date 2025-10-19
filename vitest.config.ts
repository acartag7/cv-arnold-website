import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Test file patterns
    include: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.spec.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'src/schemas/**/*.ts',
        'src/services/**/*.ts',
        'src/lib/**/*.ts',
      ],
      exclude: [
        '**/__tests__/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/types.ts',
        '**/index.ts',
        'node_modules/**',
        'dist/**',
        '.next/**',
      ],
      // Enforce minimum coverage thresholds
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
        // Per-directory thresholds (as per CLAUDE.md standards)
        'src/schemas/**': {
          lines: 90,
          functions: 80,
          branches: 90,
          statements: 90,
        },
        'src/services/**': {
          lines: 85,
          functions: 85,
          branches: 85,
          statements: 85,
        },
        'src/lib/**': {
          lines: 85,
          functions: 85,
          branches: 85,
          statements: 85,
        },
      },
    },

    // Global test configuration
    globals: true,

    // Test timeout
    testTimeout: 10000,
  },

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
