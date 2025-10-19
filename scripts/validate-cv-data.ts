/**
 * Validation script for CV data
 *
 * This script validates the cv-data.json file against the Zod schemas
 * to ensure runtime type safety and catch any data inconsistencies.
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { validateCVData } from '../src/schemas/cv.schema'

// Read the CV data
const cvDataPath = join(process.cwd(), 'src/data/cv-data.json')
const rawData = readFileSync(cvDataPath, 'utf-8')
const jsonData = JSON.parse(rawData)

// Validate the data
console.log('🔍 Validating CV data...\n')
const result = validateCVData(jsonData)

if (result.success) {
  console.log('✅ CV data validation successful!')
  console.log('\n📊 Data summary:')
  console.log(`   - Version: ${result.data!.version}`)
  console.log(`   - Last updated: ${result.data!.lastUpdated}`)
  console.log(`   - Experience entries: ${result.data!.experience.length}`)
  console.log(`   - Skill categories: ${result.data!.skills.length}`)
  console.log(`   - Education entries: ${result.data!.education.length}`)
  console.log(`   - Certifications: ${result.data!.certifications.length}`)
  console.log(`   - Achievements: ${result.data!.achievements.length}`)
  console.log(`   - Languages: ${result.data!.languages.length}`)
  process.exit(0)
} else {
  console.error('❌ CV data validation failed!\n')
  console.error('Error:', result.error?.message)
  console.error('\nDetails:', JSON.stringify(result.error?.details, null, 2))
  process.exit(1)
}
