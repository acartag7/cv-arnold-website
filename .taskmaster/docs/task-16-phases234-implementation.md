# Task 16 Phases 2-4: Section Editors Implementation Plan

## Overview

This document outlines the implementation plan for completing Phases 2, 3, and 4 of
the Admin CMS Portal. This covers 10 section editors that will allow Arnold to
manage all CV content through a professional admin interface.

## Current State

### Completed

- Phase 0: Data Migration (KV setup, API, frontend fetch)
- Phase 1: Foundation (Admin layout, dashboard, services, toasts)
- Phase 2.1: Personal Info Editor (16.10)

### To Implement

- **Phase 2**: Experience (16.11), Skills (16.12), Certifications (16.13)
- **Phase 3**: Education (16.14), Languages (16.15), Achievements (16.16)
- **Phase 4**: Hero Stats (16.17), Section Titles (16.18), Theme (16.19), Site Config (16.20)

---

## Architecture Patterns

### File Structure Per Section

```text
src/app/admin/[section]/
├── page.tsx              # Server component wrapper with metadata
├── [Section]Editor.tsx   # Client component - data fetching, state management
├── [Section]Form.tsx     # Form component for single-item editing (simple sections)
└── [Section]List.tsx     # List component for CRUD sections (arrays)
```

### Editor Pattern (from PersonalInfoEditor)

```typescript
'use client'
import { useAdminData, useUpdateData } from '@/hooks/useAdminData'
import { useToast } from '@/components/ui/ToastProvider'

export function SectionEditor() {
  const { data, isLoading, error, refetch } = useAdminData()
  const { mutate: updateData, isPending: isSaving } = useUpdateData()
  const toast = useToast()

  // Handle loading, error, success states
  // Render form with defaultValues={data.section}
}
```

### Form Pattern (from PersonalInfoFormStripe)

```typescript
'use client'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SectionSchema } from '@/schemas/cv.schema'

// Stripe-style form with:
// - Gradient background
// - Section headers with icons
// - FormField, FormInput, FormTextarea components
// - Status bar showing validation state
// - Save/Cancel buttons
```

### CRUD List Pattern (for array sections)

```typescript
// List with:
// - Add new button
// - Sortable items (drag-to-reorder)
// - Edit/Delete actions per item
// - Modal or drawer for editing
// - Confirmation dialog for delete
```

---

## Phase 2: Core Sections

### 16.11 Experience CRUD

**Complexity**: High (nested data, drag-drop, date handling)

**Schema Fields** (from cv.schema.ts):

- id, company, companyUrl, position, type (enum)
- startDate, endDate (nullable for "present")
- location: { city?, country?, remote }
- description (markdown)
- achievements[] (string array)
- technologies[] (tag array)
- order, featured

**UI Components**:

- Sortable list of experience cards
- Modal/drawer for add/edit with:
  - Basic info section (company, position, type)
  - Date range with "Currently working here" checkbox
  - Location with remote toggle
  - Description textarea
  - Achievements repeater (add/remove)
  - Technologies tag input
  - Featured toggle

**Files to Create**:

- `src/app/admin/experience/page.tsx`
- `src/app/admin/experience/ExperienceEditor.tsx`
- `src/app/admin/experience/ExperienceList.tsx`
- `src/app/admin/experience/ExperienceFormModal.tsx`

---

### 16.12 Skills CRUD

**Complexity**: Medium-High (nested categories, two-level drag-drop)

**Schema Fields**:

- SkillCategory: id, name, description?, skills[], order, icon?
- Skill: name, level (enum), yearsOfExperience?, lastUsed?, featured?

**UI Components**:

- Category accordion/cards
- Skills within each category
- Category CRUD (add/edit/delete)
- Skill CRUD within category
- Proficiency level selector (visual bar)
- Drag-drop for both levels

**Files to Create**:

- `src/app/admin/skills/page.tsx`
- `src/app/admin/skills/SkillsEditor.tsx`
- `src/app/admin/skills/SkillCategoryList.tsx`
- `src/app/admin/skills/SkillCategoryModal.tsx`
- `src/app/admin/skills/SkillModal.tsx`

---

### 16.13 Certifications CRUD

**Complexity**: Medium

**Schema Fields**:

- id, name, issuer, issuerUrl?
- issueDate, expirationDate? (nullable)
- status (enum: active, expired, in_progress)
- credentialId?, credentialUrl?, description?
- order

**UI Components**:

- Sortable certification cards with status badges
- Modal for add/edit with:
  - Name and issuer
  - Dates with "No expiration" checkbox
  - Status (auto-calculated from dates)
  - Credential ID and verification URL
  - Description

**Files to Create**:

- `src/app/admin/certifications/page.tsx`
- `src/app/admin/certifications/CertificationsEditor.tsx`
- `src/app/admin/certifications/CertificationList.tsx`
- `src/app/admin/certifications/CertificationFormModal.tsx`

---

## Phase 3: New Sections

### 16.14 Education Section

**Complexity**: Medium

**Schema Fields**:

- id, institution, institutionUrl?
- degree, field
- startDate, endDate? (nullable)
- grade?, location?, description?, highlights[]?
- order

**UI Components**:

- Sortable education cards
- Modal for add/edit similar to Experience
- Support for various education types (degree, bootcamp, course)

**Files to Create**:

- `src/app/admin/education/page.tsx`
- `src/app/admin/education/EducationEditor.tsx`
- `src/app/admin/education/EducationList.tsx`
- `src/app/admin/education/EducationFormModal.tsx`

---

### 16.15 Languages Section

**Complexity**: Low

**Schema Fields**:

- name, code (ISO 639-1), proficiency (CEFR enum), native?

**UI Components**:

- Simple sortable list
- Inline or modal editing
- Proficiency dropdown with visual indicator
- Native speaker toggle

**Files to Create**:

- `src/app/admin/languages/page.tsx`
- `src/app/admin/languages/LanguagesEditor.tsx`
- `src/app/admin/languages/LanguageList.tsx`
- `src/app/admin/languages/LanguageFormModal.tsx`

---

### 16.16 Achievements CRUD

**Complexity**: Medium

**Schema Fields**:

- id, title, category (enum), date
- issuer?, description, url?
- technologies[]?, order, featured?

**UI Components**:

- Sortable cards with category badges
- Featured star toggle
- Modal for add/edit
- Category filter (optional)

**Files to Create**:

- `src/app/admin/achievements/page.tsx`
- `src/app/admin/achievements/AchievementsEditor.tsx`
- `src/app/admin/achievements/AchievementList.tsx`
- `src/app/admin/achievements/AchievementFormModal.tsx`

---

## Phase 4: Site Configuration

### 16.17 Hero Stats Editor

**Complexity**: Low-Medium

**Schema**: Array of { id, value, label, icon, order }

**UI Components**:

- Sortable stat cards (2x2 grid on mobile, 4x1 on desktop)
- Icon picker (lucide icons)
- Value and label inputs
- Preview of stat appearance

**Files to Create**:

- `src/app/admin/hero-stats/page.tsx`
- `src/app/admin/hero-stats/HeroStatsEditor.tsx`
- `src/app/admin/hero-stats/HeroStatList.tsx`
- `src/app/admin/hero-stats/HeroStatModal.tsx`

---

### 16.18 Section Titles Editor

**Complexity**: Low

**Schema**: Object with heroPath, experience, skills, certifications, contact

**UI Components**:

- Simple form with text inputs
- Monospace font preview
- Terminal-style path hints

**Files to Create**:

- `src/app/admin/section-titles/page.tsx`
- `src/app/admin/section-titles/SectionTitlesEditor.tsx`
- `src/app/admin/section-titles/SectionTitlesForm.tsx`

---

### 16.19 Theme Selector

**Complexity**: Medium

**Schema**: themeConfig with defaultTheme, allowToggle, dark/light palettes

**UI Components**:

- Preset theme cards (green, blue, purple, orange)
- Custom palette editor (collapsible)
- Live preview panel
- Dark/light toggle preview
- WCAG contrast warnings

**Files to Create**:

- `src/app/admin/theme/page.tsx`
- `src/app/admin/theme/ThemeEditor.tsx`
- `src/app/admin/theme/ThemePresetPicker.tsx`
- `src/app/admin/theme/ThemePreview.tsx`

---

### 16.20 Site Config Editor

**Complexity**: Low-Medium

**Schema**: siteConfig with branding, version, footerText, navLinks[], seo{}

**UI Components**:

- Basic text inputs (branding, version, footer)
- Nav links repeater
- SEO section (collapsible)
- Preview of branding in header

**Files to Create**:

- `src/app/admin/site-config/page.tsx`
- `src/app/admin/site-config/SiteConfigEditor.tsx`
- `src/app/admin/site-config/SiteConfigForm.tsx`

---

## Shared Components to Create

### 1. Reusable Modal Component

```typescript
// src/components/admin/Modal.tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}
```

### 2. Sortable List Component

```typescript
// src/components/admin/SortableList.tsx
// Using @dnd-kit/core and @dnd-kit/sortable
interface SortableListProps<T> {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string
}
```

### 3. Confirm Dialog Component

```typescript
// src/components/admin/ConfirmDialog.tsx
interface ConfirmDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  message: string
  confirmText?: string
  variant?: 'danger' | 'warning' | 'info'
}
```

### 4. Tag Input Component

```typescript
// src/components/admin/TagInput.tsx
interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  suggestions?: string[]
}
```

### 5. Date Picker Component

```typescript
// src/components/admin/DatePicker.tsx
interface DatePickerProps {
  value: string // ISO 8601
  onChange: (date: string) => void
  allowNull?: boolean
  nullLabel?: string // "Present", "No expiration", etc.
}
```

---

## Dependencies to Add

```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Note: react-hook-form and @hookform/resolvers already installed.

---

## Implementation Order

### Day 1 - Shared Components & Phase 2 Start

1. Install @dnd-kit packages
2. Create Modal, ConfirmDialog, SortableList, TagInput components
3. Start Experience CRUD (16.11) - highest complexity

### Day 2 - Complete Phase 2

1. Complete Experience CRUD with tests
2. Skills CRUD (16.12)
3. Certifications CRUD (16.13)

### Day 3 - Phase 3

1. Education (16.14)
2. Languages (16.15)
3. Achievements (16.16)

### Day 4 - Phase 4

1. Hero Stats (16.17)
2. Section Titles (16.18)
3. Theme Selector (16.19)
4. Site Config (16.20)

### Day 5 - Testing & Polish

1. Write comprehensive tests (≥80% coverage)
2. Update navigation sidebar
3. Final visual review
4. Create PR

---

## Testing Strategy

### Unit Tests

- Form validation logic
- Data transformation functions
- Component rendering
- Modal open/close states

### Integration Tests

- CRUD operations with mocked API
- Drag-drop reordering
- Form submission flows
- Error handling

### Coverage Target

- ≥80% for all new components
- Focus on business logic over presentational code

---

## Navigation Updates

Update `AdminLayoutClient.tsx` sidebar with all section links:

```typescript
const navItems = [
  { label: 'Dashboard', href: '/admin', icon: Home },
  { label: 'Personal Info', href: '/admin/personal', icon: User },
  { label: 'Experience', href: '/admin/experience', icon: Briefcase },
  { label: 'Skills', href: '/admin/skills', icon: Code },
  { label: 'Certifications', href: '/admin/certifications', icon: Award },
  { label: 'Education', href: '/admin/education', icon: GraduationCap },
  { label: 'Languages', href: '/admin/languages', icon: Globe },
  { label: 'Achievements', href: '/admin/achievements', icon: Trophy },
  { label: 'Hero Stats', href: '/admin/hero-stats', icon: BarChart },
  { label: 'Section Titles', href: '/admin/section-titles', icon: Type },
  { label: 'Theme', href: '/admin/theme', icon: Palette },
  { label: 'Site Config', href: '/admin/site-config', icon: Settings },
]
```

---

## Success Criteria

- [ ] All 10 section editors functional
- [ ] CRUD operations work for all array sections
- [ ] Drag-drop reordering works
- [ ] Form validation matches Zod schemas
- [ ] Toast notifications for all operations
- [ ] Loading and error states handled
- [ ] Tests pass with ≥80% coverage
- [ ] Navigation sidebar updated
- [ ] Visual consistency with PersonalInfo editor (Stripe style)
- [ ] Mobile responsive
