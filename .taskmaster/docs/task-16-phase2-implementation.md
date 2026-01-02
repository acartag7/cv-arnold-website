# Task 16 Phase 2: Section Editors Implementation Plan

## Overview

Build section editor pages for the Admin CMS, starting with Personal Info (16.10)
and followed by other CRUD sections.

## Current State

### Completed in Phase 1

- ✅ Admin layout shell with Cloudflare Access auth
- ✅ React Query setup with `useAdminData`, `useUpdateData` hooks
- ✅ AdminDataService for API communication
- ✅ Toast notification system
- ✅ Dashboard with section overview cards

### Existing Infrastructure

- **Zod Schemas**: Full validation schemas in `src/schemas/cv.schema.ts`
- **TypeScript Types**: Complete interfaces in `src/types/cv.ts`
- **UI Components**: Button, Card, Grid, Stack, Container, Badge, Skeleton, Toast
- **Hooks**: `useAdminData`, `useUpdateData`, `useExportData`, `useImportData`
- **API**: `/api/v1/cv` (GET, POST), `/api/v1/cv/sections/:section` (GET)

### What's Missing

- ❌ Form components (Input, Textarea, Select, Checkbox, Label)
- ❌ react-hook-form integration
- ❌ @hookform/resolvers for Zod
- ❌ Section editor pages

---

## Key Decisions

| Decision       | Choice                   | Rationale                                                        |
| -------------- | ------------------------ | ---------------------------------------------------------------- |
| Form Library   | react-hook-form          | Industry standard, excellent Zod integration, minimal re-renders |
| Validation     | Zod (existing schemas)   | Already have comprehensive schemas, type-safe                    |
| UI Components  | Custom (extend existing) | Project doesn't use shadcn/ui, maintain consistency              |
| Save Strategy  | Optimistic updates       | Better UX, React Query handles rollback                          |
| Section Update | Full CV save             | API only supports full update, no partial PATCH                  |

---

## Dependencies to Install

```bash
pnpm add react-hook-form @hookform/resolvers
```

---

## File Structure

```text
src/
├── components/ui/
│   ├── Input.tsx              # NEW - Text input with error display
│   ├── Textarea.tsx           # NEW - Multiline input (for summary)
│   ├── Select.tsx             # NEW - Dropdown select
│   ├── Checkbox.tsx           # NEW - Checkbox input
│   ├── Label.tsx              # NEW - Form label
│   ├── FormField.tsx          # NEW - Field wrapper (label + input + error)
│   └── __tests__/
│       └── form-components.test.tsx
│
├── hooks/
│   └── usePersonalInfo.ts     # NEW - Personal info specific mutations
│
├── app/admin/
│   ├── personal/
│   │   ├── page.tsx           # NEW - Personal Info editor page
│   │   └── PersonalInfoForm.tsx  # NEW - Form component
│   └── AdminLayoutClient.tsx  # UPDATE - Add navigation to sidebar
│
└── components/admin/
    └── forms/
        ├── PersonalInfoForm.tsx  # Alternative location
        └── __tests__/
```

---

## Implementation Sequence

### Phase 2.1: Form Component Foundation (~2 hrs)

#### 1. Install Dependencies

```bash
pnpm add react-hook-form @hookform/resolvers
```

#### 2. Create Form Components

**Input.tsx** - Base text input

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}
```

**Textarea.tsx** - Multiline input

```tsx
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}
```

**Select.tsx** - Dropdown select

```tsx
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
  error?: string
}
```

**Label.tsx** - Form label with required indicator

```tsx
interface LabelProps {
  htmlFor: string
  required?: boolean
  children: React.ReactNode
}
```

**FormField.tsx** - Composite wrapper

```tsx
interface FormFieldProps {
  label: string
  name: string
  error?: string
  required?: boolean
  children: React.ReactNode
}
```

### Phase 2.2: Personal Info Editor (~3 hrs)

#### Files to Create

1. **`src/app/admin/personal/page.tsx`**
   - Server component wrapper
   - Page metadata

2. **`src/app/admin/personal/PersonalInfoForm.tsx`**
   - Client component with form
   - react-hook-form with zodResolver
   - All PersonalInfo fields:
     - fullName (text)
     - title (text)
     - email (email)
     - phone (tel, optional)
     - location.city (text)
     - location.country (text)
     - location.countryCode (text, 2 chars)
     - website (url, optional)
     - social.linkedin (url, optional)
     - social.github (url, optional)
     - social.twitter (url, optional)
     - summary (textarea, markdown)
     - profileImage (url, optional)
     - availability.status (select)
     - availability.message (text, optional)

#### Form Sections (Collapsible)

1. **Basic Info** - name, title, email, phone
2. **Location** - city, country, countryCode
3. **Online Presence** - website, social links
4. **Professional Summary** - summary (markdown textarea)
5. **Status** - profileImage, availability

### Phase 2.3: Hook for Personal Info (~1 hr)

Create `usePersonalInfo.ts`:

```typescript
export function usePersonalInfo() {
  const { data } = useAdminData()
  const { mutate: updateData } = useUpdateData()

  const updatePersonalInfo = (personalInfo: PersonalInfo) => {
    if (!data) return
    updateData({ ...data, personalInfo })
  }

  return { personalInfo: data?.personalInfo, updatePersonalInfo }
}
```

### Phase 2.4: Navigation Update (~30 min)

Update `AdminLayoutClient.tsx` sidebar:

- Add Personal Info link
- Highlight active route

### Phase 2.5: Tests (~2 hrs)

1. **Form component tests**
   - Input renders with error
   - Textarea handles onChange
   - Select displays options
   - FormField shows label and error

2. **PersonalInfoForm tests**
   - Renders all fields
   - Validates required fields
   - Shows validation errors
   - Submits valid data

---

## Personal Info Form Schema (from existing Zod)

```typescript
// Already exists in src/schemas/cv.schema.ts
PersonalInfoSchema = z.object({
  fullName: z.string().min(2).max(100),
  title: z.string().min(2).max(100),
  email: emailSchema,
  phone: phoneSchema.optional(),
  location: z.object({
    city: z.string().min(2).max(100),
    country: z.string().min(2).max(100),
    countryCode: countryCodeSchema, // auto-uppercases
  }),
  website: urlSchema.optional(),
  social: z
    .object({
      linkedin: urlSchema.optional(),
      github: urlSchema.optional(),
      twitter: urlSchema.optional(),
    })
    .catchall(z.string().url().optional()),
  summary: z.string().min(10).max(5000),
  profileImage: urlSchema.optional(),
  availability: z.object({
    status: AvailabilityStatusSchema, // enum
    message: z.string().max(500).optional(),
  }),
})
```

---

## UI Design Patterns

### Field Layout

```text
┌─────────────────────────────────────┐
│ Label *                             │
│ ┌─────────────────────────────────┐ │
│ │ Input                           │ │
│ └─────────────────────────────────┘ │
│ Error message (if any)              │
└─────────────────────────────────────┘
```

### Form Layout

```text
┌─ Personal Information ─────────────────────────────────┐
│                                                        │
│  ┌────────────────┐  ┌────────────────┐               │
│  │ Full Name *    │  │ Title *        │               │
│  └────────────────┘  └────────────────┘               │
│                                                        │
│  ┌────────────────┐  ┌────────────────┐               │
│  │ Email *        │  │ Phone          │               │
│  └────────────────┘  └────────────────┘               │
│                                                        │
├─ Location ─────────────────────────────────────────────┤
│                                                        │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────┐ │
│  │ City *         │  │ Country *      │  │ Code *   │ │
│  └────────────────┘  └────────────────┘  └──────────┘ │
│                                                        │
├─ Online Presence ──────────────────────────────────────┤
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │ Website                                        │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────┐ │
│  │ LinkedIn       │  │ GitHub         │  │ Twitter  │ │
│  └────────────────┘  └────────────────┘  └──────────┘ │
│                                                        │
├─ Professional Summary ─────────────────────────────────┤
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │ Summary (markdown) *                           │   │
│  │                                                │   │
│  │                                                │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
├─ Status ───────────────────────────────────────────────┤
│                                                        │
│  ┌────────────────┐  ┌────────────────────────────┐   │
│  │ Availability * │  │ Status Message             │   │
│  └────────────────┘  └────────────────────────────┘   │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │ Profile Image URL                              │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│                         ┌──────────┐ ┌────────────┐   │
│                         │ Cancel   │ │ Save       │   │
│                         └──────────┘ └────────────┘   │
└────────────────────────────────────────────────────────┘
```

---

## Error Handling

1. **Validation errors** - Show inline under each field
2. **API errors** - Show toast notification
3. **Network errors** - Show retry option
4. **Optimistic update failure** - Roll back and show error toast

---

## Testing Strategy

### Unit Tests

- Form components: render, error display, change handlers
- FormField: label, required indicator, error state

### Integration Tests

- PersonalInfoForm: full form submission flow
- Validation: required fields, format validation

### E2E (Manual)

- Navigate to /admin/personal
- Fill form, submit, verify toast
- Verify data persisted

---

## Success Criteria

- [ ] Form components created with proper accessibility
- [ ] Personal Info page loads existing data
- [ ] Form validates using existing Zod schema
- [ ] Save updates CV data via API
- [ ] Toast notifications for success/error
- [ ] Tests pass with 80%+ coverage
- [ ] Navigation updated in sidebar

---

## Future Phases (for reference)

### Phase 2.3: Experience Editor (16.11)

- CRUD for experience entries
- Date pickers (start/end)
- Achievements list (add/remove)
- Technologies tags
- Drag-to-reorder

### Phase 2.4: Skills Editor (16.12)

- Category CRUD
- Skill CRUD within categories
- Proficiency level selector
- Drag-to-reorder

### Phase 2.5+: Other Sections

- Certifications (16.13)
- Education (16.14)
- Languages (16.15)
- Achievements (16.16)
