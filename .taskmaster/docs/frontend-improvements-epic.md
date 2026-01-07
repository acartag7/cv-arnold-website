# Frontend Improvements Epic - January 2026

## Overview

This document tracks the comprehensive frontend improvements for cv-arnold-website,
spanning both the public CV site and the Admin CMS.

**Related PRs:** #65 (section visibility, expandable cards), #67 (logout, font consistency)

---

## Progress Tracker

### Session Status

- [ ] Session 1: Phase 1 + Phase 2 (Critical bugs + UX Architecture)
- [ ] Session 2: Phase 3 + Phase 4 (Version fixes + Public site polish)
- [ ] Session 3: Phase 5 + Phase 6 (Admin UX + Testing/PR)

---

## PHASE 1: Critical Bug Fixes

### 1.1 Personal Info Save Functionality

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**Files:**

- `src/app/admin/personal/PersonalInfoEditor.tsx`
- `src/app/admin/personal/PersonalInfoFormStripe.tsx`
- `src/hooks/useAdminData.ts`

**Issue:** User cannot save changes in Personal Info page
**Investigation needed:** Check form submission, mutation hook, API endpoint

### 1.2 Section Titles - Add Missing Sections

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**Files:**

- `src/types/cv.ts` - SectionTitles interface
- `src/schemas/cv.schema.ts` - SectionTitlesSchema
- `src/app/admin/section-titles/SectionTitlesEditor.tsx`

**Issue:** Only 5 sections shown (heroPath, experience, skills, certifications, contact)
**Missing:** education, languages, achievements

**Changes needed:**

```typescript
// Add to SectionTitles interface in cv.ts
education: string // e.g., "education.log"
languages: string // e.g., "languages.config"
achievements: string // e.g., "achievements.yaml"
```

### 1.3 Update SectionTitles Type

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**File:** `src/types/cv.ts`

### 1.4 Update SectionTitlesSchema

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**File:** `src/schemas/cv.schema.ts`

---

## PHASE 2: UX Architecture Changes

### 2.1 Move Section Visibility to Individual Pages

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**Files to modify:**

- `src/app/admin/site-config/SiteConfigEditor.tsx` - Remove section visibility
- `src/app/admin/experience/ExperienceEditor.tsx` - Add toggle
- `src/app/admin/skills/SkillsEditor.tsx` - Add toggle
- `src/app/admin/certifications/CertificationsEditor.tsx` - Add toggle
- `src/app/admin/education/EducationEditor.tsx` - Add toggle
- `src/app/admin/languages/LanguagesEditor.tsx` - Add toggle
- `src/app/admin/achievements/AchievementsEditor.tsx` - Add toggle

**Design:** Add a visibility toggle at top of each section editor:
`[x] Show this section on public site`

### 2.2 Grey Out Disabled Sections in Sidebar

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**File:** `src/app/admin/AdminLayoutClient.tsx`

**Implementation:**

- Read sectionVisibility from CV data
- Apply `opacity-50` and different styling to disabled sections
- Add visual indicator (eye-off icon)

### 2.3 Improve Site Config UX

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**File:** `src/app/admin/site-config/SiteConfigEditor.tsx`

**Add help text for:**

- Navigation Links: "Add custom links to the header navigation (e.g., Blog, Portfolio)"
- OG Image URL: "Image shown when sharing on social media (recommended: 1200x630px)"
- Footer Text: "Supports {{year}} placeholder for dynamic year"

---

## PHASE 3: Version & Dynamic Data

### 3.1 Make Version Dynamic

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**Files:**

- `src/lib/version.ts` (new file)
- `next.config.ts`

**Implementation:**

```typescript
// next.config.ts - expose version at build time
const packageJson = require('./package.json')
module.exports = {
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
}
```

### 3.2 Update Footer Version Display

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**File:** `src/components/layout/Footer.tsx` or `src/components/CVPageClient.tsx`

### 3.3 Update Admin Dashboard Version

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**File:** `src/app/admin/AdminDashboard.tsx`

### 3.4 Remove Hardcoded Fallback

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**File:** `src/components/CVPageClient.tsx`
**Change:** Replace `'v2024.12'` with dynamic version

---

## PHASE 4: Public Site Polish

### 4.1 Add Hover States to Nav Links

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**File:** `src/components/CVPageClient.tsx` or `src/components/layout/Header.tsx`

**Implementation:** Add `hover:text-blue-400 transition-colors` to nav items

### 4.2 Add Loading Skeletons

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**File:** `src/components/CVPageClient.tsx`

**Use existing:** `src/components/ui/Skeleton.tsx`

### 4.3 Fix Experience Card Whitespace

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**File:** `src/components/CVPageClient.tsx`

**Issue:** Too much margin between section header and first card

### 4.4 Fix Achievements Card Inconsistency

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**File:** `src/components/CVPageClient.tsx`

**Issue:** Third achievement card missing company name - add fallback styling

### 4.5 Add Count-Up Animation to Stats

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**File:** `src/components/CVPageClient.tsx` or `src/components/sections/HeroSection.tsx`

**Implementation:** Use CSS counter animation or small JS animation on scroll into view

### 4.6 Add Tooltips to Proficiency Bars

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**File:** `src/components/sections/skills/ProficiencyIndicator.tsx`

**Implementation:** Show exact years on hover

---

## PHASE 5: Admin UX Improvements

### 5.1 Add Focus Indicators (Accessibility)

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**Files:** All admin form components

**Implementation:** Add `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`

### 5.2 Improve Sidebar Active State

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**File:** `src/app/admin/AdminLayoutClient.tsx`

**Current:** Background highlight only
**Improved:** Add left border accent + stronger background

### 5.3 Add Unsaved Changes Warning

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**Files:** All admin editor components

**Implementation:** Use `beforeunload` event + custom hook

### 5.4 Add Inline Validation Feedback

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**Files:** Admin form components

**Implementation:** Real-time validation messages under inputs

### 5.5 Update Theme Preview

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**File:** `src/app/admin/theme/ThemeEditor.tsx`

**Change:** Replace "John Doe" with actual user's name from personalInfo

---

## PHASE 6: Testing & PR

### 6.1 Run Test Suite

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**Command:** `pnpm test`

### 6.2 Verify Coverage

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**Command:** `pnpm test:coverage`
**Target:** ≥80%

### 6.3 Visual Testing

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**Sites:**

- [ ] Public site (dev-cv.arnoldcartagena.com)
- [ ] Admin CMS (/admin)
- [ ] Dark mode
- [ ] Light mode

### 6.4 Create PR

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

---

## Technical Notes

### Key Dependencies

- `react-hook-form` - Form management
- `zod` - Schema validation
- `@tanstack/react-query` - Data fetching
- `lucide-react` - Icons

### Testing Commands

```bash
pnpm test              # Run tests
pnpm test:coverage     # With coverage
pnpm typecheck         # TypeScript check
pnpm build            # Production build
pnpm dev              # Local development
```

### Important Patterns

1. All admin editors use `useAdminData()` hook for fetching
2. All mutations use `useUpdateData()` hook
3. Toast notifications via `useToast()`
4. Forms use Zod schemas for validation

---

## Session Log

### Session 1 - [DATE]

- Started:
- Completed:
- Notes:

### Session 2 - [DATE]

- Started:
- Completed:
- Notes:

### Session 3 - [DATE]

- Started:
- Completed:
- Notes:
