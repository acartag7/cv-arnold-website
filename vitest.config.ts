import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // Test environment (happy-dom for React component testing)
    environment: 'happy-dom',

    // Setup files
    setupFiles: ['./src/test/setup.ts'],

    // Test file patterns
    include: [
      '**/__tests__/**/*.test.ts',
      '**/__tests__/**/*.test.tsx',
      '**/__tests__/**/*.spec.ts',
      '**/__tests__/**/*.spec.tsx',
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'src/schemas/**/*.ts',
        'src/services/**/*.ts',
        'src/lib/**/*.ts',
        'src/hooks/**/*.ts',
        'src/contexts/**/*.tsx',
      ],
      exclude: [
        '**/__tests__/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/types.ts',
        '**/index.ts',
        'src/hooks/responsive/**', // Exclude responsive hooks (not in current PR)
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
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
        'src/lib/**': {
          lines: 85,
          functions: 85,
          branches: 85,
          statements: 85,
        },
        'src/hooks/**': {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
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
