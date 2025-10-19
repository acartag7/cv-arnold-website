# Task 3.2 Implementation: Zod Schemas for Runtime Validation

**Status:** Completed
**Date:** 2025-10-19
**Branch:** `feat/task-3.2-zod-schemas`

## Overview

Implemented comprehensive Zod schemas that mirror all TypeScript interfaces from Task 3.1,
providing runtime validation and type safety for CV data.

## Files Created

### Core Schema File

**`src/schemas/cv.schema.ts`** (650+ lines)

- All 6 enum schemas with proper Zod typing
- All 11 interface schemas with validation rules
- Custom validators for common patterns
- Helper functions for validation
- Exported inferred types

### Supporting Files

**`src/schemas/index.ts`**

- Barrel export for all schemas

**`scripts/validate-cv-data.ts`**

- Validation script for testing schemas against actual data
- Added npm script: `pnpm validate:cv`

## Key Implementation Details

### Custom Validators

```typescript
// ISO 8601 date validation
const iso8601DateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)?$/)

// URL with protocol validation
const urlSchema = z
  .string()
  .url()
  .refine(url => {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  })

// Email with length constraints
const emailSchema = z.string().email().min(5).max(255)

// ISO 3166-1 alpha-2 country code
const countryCodeSchema = z.string().length(2).toUpperCase()

// ISO 639-1 language code
const languageCodeSchema = z.string().length(2).toLowerCase()

// E.164 phone format
const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/)
  .optional()
```

### String Length Constraints

Applied appropriate limits across all schemas:

- Names/titles: 2-100 characters
- Descriptions: 10-5000 characters (varies by context)
- URLs: validated format + protocol check
- IDs: minimum 1 character

### Date Range Validation

All date ranges (Experience, Education, Certification) include refinement:

```typescript
.refine(
  data => {
    if (!data.endDate) return true
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    return start <= end
  },
  {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
  }
)
```

### Validation Helper Functions

Three main validation utilities:

1. **`validateCVData(data: unknown)`** - Safe validation with error object
2. **`parseCVData(data: unknown)`** - Parse and throw on error
3. **`validateCVDataPartial(data: unknown)`** - Partial updates validation

### Type Inference

All types can be inferred from schemas as alternative to importing from `types/cv.ts`:

```typescript
export type CVData = z.infer<typeof CVDataSchema>
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>
// ... etc
```

## Validation Results

Tested against existing `src/data/cv-data.json`:

```text
✅ CV data validation successful!
📊 Data summary:
   - Version: 1.0.0
   - Last updated: 2025-10-18T17:00:00.000Z
   - Experience entries: 7
   - Skill categories: 4
   - Education entries: 1
   - Certifications: 5
   - Achievements: 4
   - Languages: 4
```

## Dependencies

- **Added:** `zod@^4.0.14` (already in package.json)
- **Added:** `tsx@^4.20.6` (dev dependency for script execution)

## npm Scripts Added

```json
{
  "validate:cv": "tsx scripts/validate-cv-data.ts"
}
```

## Architecture Notes

### Schema vs Type Usage

**When to use Zod schemas:**

- Runtime data validation (API responses, user input, file uploads)
- Data parsing from external sources (JSON files, databases)
- Form validation in admin panel

**When to use TypeScript types:**

- Component props and internal state
- Function parameters and return types (already type-safe)
- Pure TypeScript compilation checks

### Schema Organization

```text
src/schemas/
├── cv.schema.ts      # All CV-related schemas
└── index.ts          # Barrel export
```

Follows same pattern as `src/types/`:

```text
src/types/
├── cv.ts             # All CV-related types
└── index.ts          # Barrel export
```

## Next Steps (Future Tasks)

Task 3.3 will use these schemas in the repository service layer:

```typescript
// Future usage in CVDataService
import { validateCVData, parseCVData } from '@/schemas'

class CVDataService {
  async load(): Promise<CVData> {
    const raw = await fetch('/api/cv')
    const result = validateCVData(raw)
    if (!result.success) throw new Error(result.error.message)
    return result.data
  }
}
```

## Testing Strategy

**Current:**

- ✅ Manual validation script (`pnpm validate:cv`)
- ✅ TypeScript compilation passes
- ✅ Existing data validates successfully

**Future (Task 3.2 test strategy):**

- Unit tests for each schema
- Edge case testing (invalid dates, malformed URLs)
- Custom error message verification
- Type inference tests

## Key Decisions

1. **Simplified enum definitions** - Removed errorMap (not supported in Zod v4), relying on
   default error messages
2. **Strict validation** - All optional fields explicitly marked, required fields have min/max constraints
3. **ISO standards** - Enforced ISO 8601 (dates), ISO 3166-1 alpha-2 (countries), ISO 639-1 (languages)
4. **Helper functions** - Three validation utilities for different use cases (safe, throwing, partial)
5. **Type inference** - Exported both schemas and inferred types for flexibility

## Verification Checklist

- [x] All TypeScript interfaces have matching Zod schemas
- [x] All enums have matching Zod enums
- [x] Custom validators for email, URL, dates, country codes, language codes
- [x] String length limits on all text fields
- [x] Date range validation (startDate <= endDate)
- [x] Existing cv-data.json validates successfully
- [x] TypeScript compilation passes (strict mode)
- [x] Validation script created and tested
- [x] npm script added to package.json
- [x] Documentation complete
