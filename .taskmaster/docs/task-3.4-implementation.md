# Task 3.4: Mock Data Service - Implementation Notes

**Status:** ✅ Completed
**Date:** 2025-10-21
**Branch:** `feature/task-3.4-mock-data-service`

---

## Overview

Created a comprehensive mock data generation service for realistic CV data in development and
testing. All generated data passes Zod schema validation with support for various seniority levels
and edge cases.

## Files Created

### Source Code

- `src/services/MockDataService.ts` (558 lines)
  - Singleton service for generating mock CV data
  - Supports 4 seniority levels with appropriate profiles
  - Seeded random generation for reproducibility
  - Edge case data for testing (unicode, special chars, long text)

### Tests

- `src/services/__tests__/MockDataService.test.ts` (550 lines)
  - 49 comprehensive tests
  - 100% test pass rate
  - Covers all major functionality

## Key Features

### 1. Seniority Level Variations

The service generates realistic data based on career progression:

| Level         | Years Exp | Jobs | Skills                | Certs | Achievements |
| ------------- | --------- | ---- | --------------------- | ----- | ------------ |
| **Junior**    | 1-3       | 1-2  | beginner/intermediate | 0-2   | 1-3          |
| **Mid**       | 4-7       | 3-5  | intermediate/advanced | 1-4   | 3-6          |
| **Senior**    | 8-15      | 5-8  | advanced/expert       | 2-6   | 5-10         |
| **Principal** | 15-25     | 8-12 | expert                | 4-8   | 8-15         |

**Usage:**

```typescript
const mockService = MockDataService.getInstance()

const juniorCV = mockService.generateMockCV({ seniorityLevel: 'junior' })
const seniorCV = mockService.generateMockCV({ seniorityLevel: 'senior' })
```

### 2. Seeded Generation (Reproducibility)

For consistent test data across runs:

```typescript
// Same seed = identical data
const cv1 = mockService.generateMockCV({ seed: 12345 })
const cv2 = mockService.generateMockCV({ seed: 12345 })
// cv1 === cv2 ✅
```

**Use Cases:**

- Deterministic test data for CI/CD
- Snapshot testing
- Debugging with consistent data

### 3. Edge Case Data

Testing edge cases is critical for robust validation:

```typescript
const edgeCaseCV = mockService.generateMockCV({ includeEdgeCases: true })
```

**Edge Cases Covered:**

- **Unicode characters**: `François-René`, `São Paulo`, `Côte d'Ivoire`
- **Special characters**: `O'Connor-Müller`, `Société Générale & Co.`
- **Long text**: 5-paragraph summaries, 4-paragraph job descriptions
- **Long titles**: "Senior Software Engineer / Technical Lead"
- **E.164 phone format**: Starts with 1-9, 12 digits total

### 4. Comprehensive Data Generation

**Personal Info:**

- Full name with edge case support
- Professional title from faker
- Valid email (lowercase)
- E.164 compliant phone number
- Location with city, country, country code
- Optional: website, LinkedIn, GitHub, Twitter
- Professional summary (10-5000 chars)
- Optional profile image
- Availability status with optional message

**Experience:**

- Realistic job history with proper chronology
- Employment gaps (30% probability)
- Current job (null endDate, 70% for most recent)
- Valid date ranges (start ≤ end)
- Achievements (2-6 per job)
- Technologies (3-10 per job)
- Featured flag for recent 3 positions
- Employment types: full_time, part_time, contract, freelance

**Skills:**

- 4 categories: Programming, Frontend, Backend, DevOps
- Realistic skill names and years of experience
- Skill levels aligned with seniority
- Optional lastUsed dates
- Featured skills flagged

**Education:**

- 1-3 entries based on seniority
- Bachelor's and Master's degrees
- Valid date ranges
- Optional grades (3.8 GPA, First Class, Distinction)
- Location and highlights

**Certifications:**

- Count scales with seniority (0-8)
- Realistic cert names (AWS, GCP, K8s, Azure, Scrum, CISSP)
- Valid expiration logic
- Status: active/expired/in_progress
- Optional credential ID and URLs

**Achievements:**

- Count scales with seniority (1-15)
- Categories: award, publication, speaking, project, contribution
- Past 5 years of dates
- Optional issuer, URL, technologies
- Featured flag for top 5

**Languages:**

- 2-4 languages per CV
- Always includes native English
- CEFR levels: a1, a2, b1, b2, c1, c2, native
- 2-letter language codes (ISO 639-1)

**Metadata:**

- SEO keywords array
- Meta description (≤500 chars)
- Version (semantic: 1.0.0)
- lastUpdated (ISO 8601 date)

## Architecture Decisions

### Why Singleton Pattern?

**Decision:** Use singleton pattern for MockDataService

**Why:**

- Ensures consistent mock data across application
- Single source of truth for test data configuration
- Easy to access from anywhere (`MockDataService.getInstance()`)
- Prevents multiple instances with different configurations

**Trade-off:**

- Less flexibility for multiple configurations
- Acceptable: Mock data service doesn't need multiple instances

### Why Faker.js?

**Decision:** Use `@faker-js/faker` for data generation

**Why:**

- Industry standard for realistic mock data
- Rich API for names, emails, dates, companies, etc.
- Seeded random generation support
- Active maintenance and community

**Why NOT:**

- Custom generators: Too much work, less realistic
- Chance.js: Less popular, smaller community
- Static data: Not varied enough for testing

**Trade-off:**

- External dependency vs maintainability
- 50KB bundle size acceptable for dev/test

### Why Validate Generated Data?

**Decision:** Validate all generated data against Zod schemas and throw on failure

**Why:**

- Ensures mock data always matches production schemas
- Catches schema changes that break mock generation
- Self-testing service (fails fast if broken)
- Developer confidence in test data validity

**Implementation:**

```typescript
const validationResult = CVDataSchema.safeParse(cvData)
if (!validationResult.success) {
  throw new Error(`Generated mock data failed validation: ${...}`)
}
```

## Technical Highlights

### Phone Number E.164 Compliance

**Challenge:** Faker's phone numbers can start with 0, failing E.164 validation (`/^\+?[1-9]\d{1,14}$/`)

**Solution:**

```typescript
// ❌ WRONG: Can generate +0123456789 (starts with 0)
phone: `+${faker.string.numeric(12)}`

// ✅ CORRECT: Always starts with 1-9
phone: `+${faker.number.int({ min: 1, max: 9 })}${faker.string.numeric(11)}`
```

### Native Language Guarantee

**Challenge:** Random selection from languages might not include a native speaker

**Solution:**

```typescript
// Always include English as native, then add 1-3 additional languages
const nativeLanguage = {
  name: 'English',
  code: 'en',
  proficiency: 'native',
  native: true,
}
const additionalCount = faker.number.int({ min: 1, max: 3 })
const selectedAdditional = faker.helpers.arrayElements(
  additionalLanguages,
  additionalCount
)
return [nativeLanguage, ...selectedAdditional]
```

### Date Range Chronology

**Challenge:** Work history must be chronologically correct (recent to oldest)

**Solution:**

```typescript
let endDate = currentDate // Start from present

for (let i = 0; i < count; i++) {
  const isCurrent =
    i === 0 && faker.helpers.maybe(() => true, { probability: 0.7 })
  const yearsInRole = faker.number.int({ min: 1, max: 4 })

  const startDate = new Date(endDate)
  startDate.setFullYear(startDate.getFullYear() - yearsInRole)

  // ... create experience entry ...

  // Set next job's end date (with possible employment gap)
  if (!isCurrent) {
    endDate = new Date(startDate)
    if (faker.helpers.maybe(() => true, { probability: 0.3 })) {
      endDate.setMonth(
        endDate.getMonth() - faker.number.int({ min: 1, max: 6 })
      )
    }
  }
}
```

## Testing Strategy

### Test Categories

1. **Singleton Pattern** (2 tests)
   - Same instance across multiple calls
   - Maintains singleton over 10+ calls

2. **Zod Schema Validation** (7 tests)
   - All 4 seniority levels pass validation
   - Edge cases pass validation
   - Service throws on validation failure

3. **Data Structure** (6 tests)
   - All required top-level fields present
   - Valid version and date formats
   - Personal info completeness
   - Metadata presence

4. **Seniority Variations** (5 tests)
   - Job count matches seniority profile
   - Certifications scale with seniority
   - Achievements scale with seniority
   - Skill levels align with seniority

5. **Edge Cases** (5 tests)
   - Unicode characters in names
   - Special characters in company names
   - Long text descriptions
   - Long job titles
   - Unicode in locations

6. **Reproducibility** (3 tests)
   - Same seed produces identical data
   - Different seeds produce different data
   - Consistent across multiple generations

7. **Experience Data** (5 tests)
   - Proper ordering
   - Valid date ranges
   - Achievements and technologies present
   - Featured flag for recent jobs
   - Valid employment types

8. **Skills Data** (4 tests)
   - Multiple categories
   - Skills in each category
   - Valid skill levels
   - Years of experience within bounds

9. **Education Data** (3 tests)
   - At least one entry
   - Valid date ranges
   - Required fields present

10. **Certifications Data** (3 tests)
    - Present for non-junior levels
    - Valid statuses
    - Valid expiration logic

11. **Achievements Data** (3 tests)
    - Always present
    - Valid categories
    - Featured achievements

12. **Languages Data** (3 tests)
    - 2-4 languages
    - Valid proficiency levels
    - At least one native language

### Test Results

```text
✓ 49 tests passing
✓ 0 tests failing
✓ 100% pass rate
⏱️ 76ms execution time
```

## Integration with Existing Code

### Dependencies

```typescript
import { faker } from '@faker-js/faker'
import type { CVData, PersonalInfo, ... } from '@/schemas/cv.schema'
import { CVDataSchema } from '@/schemas/cv.schema'
```

**Notes:**

- Uses Zod schemas for validation (Task 3.2)
- Uses TypeScript types inferred from Zod (Task 3.1)
- No dependency on repositories or storage (Task 3.3)

### Usage in Development

```typescript
// In storybook stories
import { mockDataService } from '@/services/MockDataService'

export const JuniorProfile = {
  args: {
    cvData: mockDataService.generateMockCV({ seniorityLevel: 'junior' }),
  },
}

// In component development
const mockCV = mockDataService.generateMockCV({ seed: 123 })
```

### Usage in Testing

```typescript
// In service tests
import { mockDataService } from '@/services/MockDataService'

const mockCV = mockDataService.generateMockCV({
  seniorityLevel: 'senior',
  seed: 12345, // Reproducible
  includeEdgeCases: true, // Test edge cases
})
```

## Lessons Learned

### 1. Faker.js Edge Cases

**Issue:** `faker.string.numeric()` can generate numbers starting with 0, failing E.164 phone validation.

**Solution:** Use `faker.number.int({ min: 1, max: 9 })` for first digit.

**Pattern:** Always validate faker output against schemas during development.

### 2. Random Selection Guarantees

**Issue:** Random language selection doesn't guarantee a native speaker.

**Solution:** Always include at least one guaranteed element, then randomly select additional.

**Pattern:** For requirements like "at least one X", don't rely on random selection alone.

### 3. Self-Validating Services

**Benefit:** Having the service validate its own output catches schema changes early.

**Example:** When schema is updated, mock data service tests fail immediately, forcing fix.

**Pattern:** Services that generate data should validate against their own schemas.

## Future Enhancements (Out of Scope for Task 3.4)

### More Customization Options

```typescript
interface MockCVOptions {
  seniorityLevel?: SeniorityLevel
  seed?: number
  includeEdgeCases?: boolean

  // Future enhancements:
  industry?: 'tech' | 'healthcare' | 'finance' | 'education'
  region?: 'north-america' | 'europe' | 'asia' | 'latam'
  skillFocus?: 'frontend' | 'backend' | 'fullstack' | 'devops'
  languageCount?: number
  includeRemoteOnly?: boolean
}
```

### Bulk Generation for Performance Testing

```typescript
generateMockCVBulk(count: number, options: MockCVOptions): CVData[]
```

### Specific Section Generation

```typescript
generateMockPersonalInfo(options: PersonalInfoOptions): PersonalInfo
generateMockExperience(count: number, seniorityLevel: SeniorityLevel): Experience[]
```

## Dependencies Installed

```json
{
  "devDependencies": {
    "@faker-js/faker": "^10.1.0"
  }
}
```

**Note:** Installed as devDependency since only used for testing/development.

## Commit Strategy

**Single atomic commit:**

```text
feat: implement comprehensive mock data service (Task 3.4)

- Add MockDataService with singleton pattern
- Support 4 seniority levels (junior, mid, senior, principal)
- Seeded generation for reproducibility
- Edge case data for robust testing
- 49 comprehensive tests, all passing
- All generated data passes Zod validation

Key features:
- Realistic data with @faker-js/faker
- E.164 compliant phone numbers
- Guaranteed native language
- Chronological work history
- Valid date ranges and constraints

TaskMaster: ✅ Task 3.4 - Generate comprehensive mock data service
```

## Next Steps

1. Create PR for Task 3.4
2. Wait for CI and Claude Code Review
3. Address any feedback
4. Merge when approved
5. Continue to Task 3.6 (React Context for data layer)

---

**Task 3.4 Complete!** 🎉

All acceptance criteria met:
✅ Mock data service created with generateMockCV()
✅ Realistic data using faker.js
✅ All data passes Zod validation
✅ Seniority level variations (4 levels)
✅ Edge cases (unicode, special chars, long text)
✅ Singleton pattern implemented
✅ 49 comprehensive tests
✅ 100% test pass rate
