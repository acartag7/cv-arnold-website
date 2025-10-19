/**
 * Quick verification script for date validation edge cases
 */

import { ExperienceSchema } from '../src/schemas/cv.schema'

const testCases = [
  // Valid dates (date-only format)
  { date: '2024-02-29', expected: true, description: 'Valid leap year date' },
  { date: '2025-01-15', expected: true, description: 'Valid regular date' },
  { date: '2025-12-31', expected: true, description: 'Valid end of year' },

  // Valid datetimes (with timestamp)
  {
    date: '2025-10-19T12:00:00.000Z',
    expected: true,
    description: 'Valid datetime with timestamp',
  },
  {
    date: '2024-02-29T23:59:59.999Z',
    expected: true,
    description: 'Valid leap year datetime',
  },

  // Invalid dates (date-only format)
  {
    date: '2025-02-29',
    expected: false,
    description: 'Invalid leap year (2025 is not leap)',
  },
  { date: '2025-13-01', expected: false, description: 'Invalid month (13)' },
  { date: '2025-01-32', expected: false, description: 'Invalid day (32)' },
  {
    date: '2025-04-31',
    expected: false,
    description: 'Invalid day for April (31)',
  },
  { date: '2025-00-15', expected: false, description: 'Invalid month (0)' },

  // Invalid datetimes
  {
    date: '2025-13-01T12:00:00.000Z',
    expected: false,
    description: 'Invalid datetime (month 13)',
  },
]

console.log('🧪 Testing date validation edge cases...\n')

let passed = 0
let failed = 0

for (const { date, expected, description } of testCases) {
  // Test via ExperienceSchema startDate field
  const result = ExperienceSchema.shape.startDate.safeParse(date)
  const success = result.success === expected

  if (success) {
    console.log(`✅ ${description}`)
    console.log(`   Input: ${date} → ${result.success ? 'VALID' : 'INVALID'}\n`)
    passed++
  } else {
    console.log(`❌ ${description}`)
    console.log(`   Input: ${date}`)
    console.log(`   Expected: ${expected ? 'VALID' : 'INVALID'}`)
    console.log(`   Got: ${result.success ? 'VALID' : 'INVALID'}`)
    if (!result.success) {
      console.log(`   Error: ${result.error.issues[0]?.message}\n`)
    }
    failed++
  }
}

console.log(`\n📊 Results: ${passed}/${testCases.length} passed`)

if (failed > 0) {
  console.log(`\n⚠️  ${failed} test(s) failed - validation needs improvement`)
  process.exit(1)
} else {
  console.log('\n✅ All edge cases handled correctly!')
  process.exit(0)
}
