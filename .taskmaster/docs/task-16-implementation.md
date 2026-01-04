# Task 16: Admin CMS Portal - Implementation Plan

## Overview

Build a comprehensive admin interface at `/admin` for CV content management with
Cloudflare Access authentication, direct save workflow, side-by-side live preview,
version history, and AI-powered content enhancement.

## Key Decisions

| Decision        | Choice                                        | Why                                                  | Why NOT Alternatives                                    |
| --------------- | --------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------- |
| Location        | `/admin` route                                | Shared components, simpler deployment, single domain | Separate subdomain adds DNS/CORS complexity             |
| Auth            | Cloudflare Access (Google OAuth + Magic Link) | Zero-code auth, enterprise-grade, free tier          | JWT requires custom implementation and token management |
| Data Source     | Cloudflare KV                                 | Already have API (Task 7), serverless, fast          | JSON file requires git commits for every change         |
| Save Mode       | Direct Save with History                      | Simple save flow, but with undo/revert capability    | Draft/Publish adds complexity without benefit           |
| Preview         | Side-by-side (Notion-style)                   | Immediate feedback, better UX                        | Separate tab loses context                              |
| UI Framework    | shadcn/ui + Tailwind                          | Already in project, accessible, customizable         | Material UI adds bundle size, different design language |
| History Storage | R2 Bucket                                     | Free tier generous, stores snapshots as JSON         | KV has size limits, R2 better for backups               |
| Local Dev       | Cloudflare Tunnel                             | Real Access auth works, production-like              | Mock auth diverges from prod behavior                   |

---

## Architecture

```text
/admin (protected by Cloudflare Access)
├── /admin                    → Dashboard (overview, quick stats, recent history)
├── /admin/personal-info      → Personal info editor
├── /admin/experience         → Experience list + editor
├── /admin/skills             → Skills categories + items
├── /admin/certifications     → Certifications list + editor
├── /admin/education          → Education entries
├── /admin/languages          → Languages list
├── /admin/achievements       → Achievements list + editor
├── /admin/hero-stats         → Hero dashboard cards
├── /admin/section-titles     → Terminal-style headers
├── /admin/theme              → Theme/palette selector
├── /admin/site-config        → Branding, SEO, footer
├── /admin/media              → Profile photo (R2 upload)
├── /admin/export             → JSON/YAML export/import
└── /admin/history            → Version history browser + restore
```

### Data Flow

```text
Admin UI
    ↓ (edit)
Save Button Clicked
    ↓
┌─────────────────────────────────────────┐
│ 1. Backup current state to R2 (history) │
│ 2. Save new data to KV                  │
│ 3. Trigger site rebuild                 │
└─────────────────────────────────────────┘
    ↓
Live Preview updates (client-side)
    ↓
Static Site rebuilds (async)
```

### Version History Flow

```text
Save triggered
    ↓
Get current data from KV
    ↓
Save to R2: cv-history/{timestamp}.json
    ↓
Save new data to KV
    ↓
Update history index in KV (list of versions)
```

### Authentication Flow

```text
User visits /admin
    ↓
Cloudflare Access intercepts (edge)
    ↓
User authenticates (Google OAuth or Magic Link)
    ↓
Access sets CF-Access-JWT-Assertion header
    ↓
Next.js middleware verifies header
    ↓
Admin UI loads
```

---

## Phase 0: Data Migration & Cleanup (CRITICAL)

**Must complete before any admin work!**

### 0.1 Cloudflare Infrastructure Setup

- Create KV namespaces (CV_DATA, RATE_LIMIT_KV, CV_HISTORY)
- Create R2 bucket (cv-assets)
- Update wrangler.toml with IDs
- Configure Cloudflare Access
- Set up Cloudflare Tunnel for local dev
- **Reference:** `.taskmaster/docs/cloudflare-setup-guide.md`

### 0.2 Seed KV with Existing Data

- Take current `src/data/cv-data.json` content
- POST to `/api/v1/cv` to populate KV
- Verify API returns correct data
- Create initial history snapshot in R2

### 0.3 Update Frontend to Fetch from API

- Currently: `import cvData from '@/data/cv-data.json'`
- Change to: Fetch from KV at build time (SSG)
- Update `src/app/page.tsx` to use `getStaticProps` or similar
- Update all section components to receive data as props

### 0.4 Remove Hardcoded Data

- Delete `src/data/cv-data.json`
- Remove all direct imports of cv-data
- Update any tests using the JSON file
- Verify build succeeds without JSON file

### 0.5 Verify Site Works

- Full build test
- All sections render correctly
- No references to old JSON file
- API endpoints working

---

## Phase 1: Foundation

### 1.1 Admin Route Setup

- Create `/app/admin/layout.tsx` with admin shell
  - Responsive sidebar (collapsible on mobile)
  - Header with user info, theme toggle, save status
  - Mobile-friendly navigation (hamburger menu)
- Create `/app/admin/page.tsx` dashboard
- Add middleware to verify Cloudflare Access headers
- Loading skeleton while auth verifies

### 1.2 Admin Dashboard

- Overview cards: sections count, last updated, site status
- Quick links to each section editor
- Recent history log (last 5 changes)
- Quick actions: Export, View Site, Trigger Rebuild

### 1.3 Admin Data Service

- Create `src/services/admin/AdminDataService.ts`
- Methods:
  - `getData(): Promise<CVData>` - Get full CV
  - `getSection(name): Promise<Section>` - Get one section
  - `updateData(data): Promise<void>` - Save with history
  - `getHistory(): Promise<HistoryEntry[]>` - List versions
  - `restoreVersion(id): Promise<void>` - Restore from history
- Connect to existing API endpoints from Task 7
- Handle loading states and errors with React Query

### 1.4 History Service

- Create `src/services/admin/HistoryService.ts`
- Save snapshots to R2 before each save
- Methods:
  - `createSnapshot(data): Promise<string>` - Save and return ID
  - `listSnapshots(): Promise<Snapshot[]>` - List all versions
  - `getSnapshot(id): Promise<CVData>` - Get specific version
  - `deleteOldSnapshots(keepLast: number)` - Cleanup old versions
- Store metadata in KV for fast listing

### 1.5 Error Handling & Notifications

- Toast notification system (react-hot-toast or sonner)
- Error boundary for admin routes
- Retry logic for failed API calls
- Offline detection and warning
- Unsaved changes warning on navigation

---

## Phase 2: Core Sections

### 2.1 Personal Info Editor

**Fields:** fullName, title, email, phone, location, website, social links, summary, availability

**UI Components:**

- Text inputs for basic fields
- Location sub-form (city, country, countryCode dropdown)
- Social links repeater (add/remove links)
- Markdown editor for summary with preview
- Availability status dropdown + optional message
- **AI Enhancement:** "Improve Summary" button

**Mobile:** Stack form fields vertically, full-width inputs

### 2.2 Experience CRUD

**Features:**

- List view with drag-to-reorder
- Add/Edit in slide-out drawer (Sheet)
- Delete with confirmation dialog
- Duplicate entry button
- Fields per schema

**UI Components:**

- Sortable list (dnd-kit)
- Date picker with "Present" checkbox
- Achievements as repeatable text inputs with AI suggestions
- Technologies as tag input with autocomplete
- Rich text for description

**AI Features:**

- "Enhance Description" - Improve wording
- "Suggest Achievements" - Generate from description
- "Add Keywords" - SEO-friendly terms

**Mobile:** Cards stack vertically, swipe actions for edit/delete

### 2.3 Skills CRUD

**Structure:** Categories → Skills

**Features:**

- Category management (add/edit/delete)
- Skills within each category (nested drag-drop)
- Proficiency level selector with visual bar
- Bulk operations (move skill between categories)

**UI Components:**

- Accordion for categories (expandable)
- Skill cards with level indicator (visual progress bar)
- Drag handles for reordering

**AI Features:**

- "Suggest Skills" based on experience descriptions

**Mobile:** Full accordion view, touch-friendly drag handles

### 2.4 Certifications CRUD

**Fields:** name, issuer, dates, status, credentialId, credentialUrl, badgeImageUrl, description

**UI Components:**

- Card list with status badges (active/expired/in-progress)
- Auto-calculate status from dates
- URL validation for credential/badge links
- Badge image preview (fetch from Credly URL)
- Expiration warning indicator

**Mobile:** Single-column card list

---

## Phase 3: New Sections

### 3.1 Education Section (NEW)

**Fields:** institution, degree, field, dates, grade, location, description, highlights[], educationType

**Education Types:** degree, bootcamp, online_course, self_taught, certification

**UI:** Similar to Experience CRUD with type selector
**Mobile:** Full-screen editor on small screens

### 3.2 Languages Section (NEW)

**Fields:** name, code (ISO 639-1), proficiency (CEFR), native flag

**UI Components:**

- Simple list with inline edit
- Language name input with code auto-detection
- Proficiency dropdown with visual level indicator
- Native speaker toggle (auto-sets proficiency to 'native')
- Flag emoji display based on language code

**Mobile:** Compact list with tap-to-edit

### 3.3 Achievements CRUD

**Fields:** title, category, date, issuer, description, url, technologies[], featured

**Categories:** award, publication, speaking, project, contribution, other

**UI:** Card list with category badges, featured star toggle
**AI Features:** "Enhance Description"

---

## Phase 4: Site Configuration

### 4.1 Hero Stats Editor

**Fields per stat:** id, value, label, icon, order

**UI Components:**

- Sortable card grid (2x2 on mobile, 4x1 on desktop)
- Icon picker with visual icons
- Limit indicator (recommend 4-6 stats)
- Preview of stat appearance

### 4.2 Section Titles Editor

**Fields:** heroPath, experience, skills, certifications, contact

**UI:** Text inputs with live monospace preview, format hints

### 4.3 Theme Selector

**Features:**

- Preset picker (green, blue, purple, orange) with visual swatches
- Custom palette editor (collapsible advanced section)
- Live preview of both dark/light modes side-by-side
- Default theme selector (dark/light/system)
- Toggle for allowToggle
- Contrast ratio checker (WCAG AA warning)

**Mobile:** Stacked preview, color pickers in modal

### 4.4 Site Config Editor

**Fields:** branding, version, footerText, navLinks[], seo{}

**UI Components:**

- Text inputs for branding/version
- Footer text with {{year}} placeholder hint
- Nav links repeater with drag-to-reorder
- SEO section (collapsible): title, description, keywords[], ogImage

---

## Phase 5: Advanced Features

### 5.1 Profile Photo Upload

**Integration:** Cloudflare R2

**Features:**

- Drag-and-drop upload area
- Image preview with crop tool (optional)
- Delete/replace button
- Free tier usage indicator
- Automatic image optimization (resize to max 500px)

### 5.2 Export/Import

**Formats:** JSON, YAML

**Features:**

- Export current data as downloadable file
- Import from file with validation preview
- Diff view showing what will change
- Confirmation before applying import
- Auto-backup before import

### 5.3 Live Preview Panel

**Implementation:**

- Responsive split layout: Editor (left) | Preview (right)
- On mobile: Toggle button to switch between editor/preview
- Preview renders actual CV components
- Updates on field change (300ms debounce)
- Theme toggle in preview header
- Device size toggle (desktop/tablet/mobile preview)

### 5.4 Version History Browser

**Features:**

- List of all saved versions with timestamps
- Preview any version before restoring
- Diff view comparing current vs selected version
- One-click restore with confirmation
- Auto-cleanup of old versions (keep last 50)

---

## Phase 6: AI-Powered Features

> **📚 Detailed Implementation:** See
> [task-23-ai-implementation.md](./task-23-ai-implementation.md) for comprehensive
> AI features documentation including provider abstraction, system prompts,
> UI components, and implementation code.

**Integration:** OpenRouter API with cascading free model fallback

### Key Features

- **Provider Abstraction** - Swap between OpenRouter, Workers AI, or custom providers
- **PDF Import** - Upload CV PDF → AI extracts structured data → User confirms → Save
- **Inline Enhancement** - Enhance, Grammar, Shorter, Expand buttons on textareas
- **Achievement Generator** - Context-aware suggestions from job descriptions
- **Skills Suggester** - Analyze experiences to recommend missing skills
- **Job Match Analyzer** - Compare CV against job descriptions with match score
- **Multi-Job Comparison** - Compare fit across multiple job postings
- **Interview Prep** - AI-generated preparation tips
- **ATS Estimator** - Compatibility score for Applicant Tracking Systems
- **Free Tier Management** - Cascading fallback (free → other free → paid if available)

---

## Technical Implementation Details

### UI Component Library

Using shadcn/ui components:

- `Form`, `Input`, `Textarea` - Form fields
- `Select`, `Switch`, `Checkbox` - Selection controls
- `Card`, `Accordion`, `Tabs` - Layout
- `Dialog`, `Sheet`, `Drawer` - Modals and panels
- `Button`, `Badge` - Actions and status
- `Toast` (sonner) - Notifications
- `DataTable` - Lists with sorting/filtering
- `Skeleton` - Loading states

### Form Handling

- React Hook Form for form state
- Zod schemas (from `src/schemas/cv.schema.ts`)
- Field-level validation with inline error messages
- Debounced auto-save indicator

### State Management

- React Query for server state (API calls, caching)
- Local state for form editing
- Optimistic updates for better UX
- Persist unsaved changes to localStorage

### Mobile Responsiveness

- Tailwind breakpoints: sm (640px), md (768px), lg (1024px)
- Mobile-first approach
- Touch-friendly targets (min 44px)
- Swipe gestures for common actions
- Bottom navigation on mobile
- Collapsible sidebar

### Error Handling

- Toast notifications for all operations
- Error boundary with recovery options
- Retry buttons for failed operations
- Offline mode detection
- Unsaved changes warning

### Loading States

- Skeleton loaders for initial load
- Inline spinners for save operations
- Optimistic UI updates
- Progress indicators for uploads

---

## Security Considerations

1. **Cloudflare Access** - All `/admin/*` routes protected at edge
2. **API Authentication** - POST endpoints verify CF-Access-JWT-Assertion
3. **Input Validation** - Zod schemas on both client and server
4. **XSS Prevention** - Sanitize markdown/HTML inputs (DOMPurify)
5. **No Secrets in Git** - Access config in Cloudflare dashboard only
6. **R2 Bucket Security** - Private bucket, signed URLs for access
7. **Rate Limiting** - AI features have daily limits

---

## Testing Strategy

### Unit Tests

- Form validation logic
- Data transformation functions
- Component rendering
- History service logic

### Integration Tests

- API calls with mocked responses
- Form submission flows
- Error handling scenarios
- History save/restore

### E2E Tests (Playwright)

- Full admin workflow
- Mobile responsive behavior
- Auth flow (with Cloudflare Tunnel)

### Coverage Target

- ≥80% for all admin code

---

## Subtask Breakdown for TaskMaster

### Subtasks 1-4: Data Migration

- Cloudflare infrastructure setup (user + instructions)
- Seed KV with existing cv-data.json
- Update frontend to fetch from API
- Remove hardcoded data and verify

### Subtasks 5-9: Foundation

- Admin route setup and responsive layout
- Admin dashboard with quick actions
- Admin data service with React Query
- History service (R2 snapshots)
- Error handling and toast notifications

### Subtasks 10-13: Core Sections

- Personal Info editor with AI enhancement
- Experience CRUD with AI suggestions
- Skills CRUD (categories + items)
- Certifications CRUD with badge preview

### Subtasks 14-16: New Sections

- Education section (NEW)
- Languages section (NEW)
- Achievements CRUD

### Subtasks 17-20: Site Configuration

- Hero Stats editor
- Section Titles editor
- Theme selector with live preview
- Site Config editor (branding, SEO)

### Subtasks 21-24: Advanced

- Profile photo upload (R2)
- Export/Import with diff preview
- Live preview panel (Notion-style)
- Version history browser with restore

### Subtasks 25-35: AI Features

> See [task-23-ai-implementation.md](./task-23-ai-implementation.md) for detailed
> implementation.

- AI Provider Abstraction & OpenRouter Integration
- Inline Text Enhancement (Enhance, Grammar, Shorter, Expand)
- Achievement Generator (context-aware)
- Skills Suggester (from experience analysis)
- PDF Import (Setup Wizard + Admin Dashboard)
- CV vs Job Description Analyzer
- Multi-Job Comparison
- Interview Preparation Tips
- ATS Score Estimator
- Resume Translation
- Dashboard AI Hub

Total: 35 subtasks across 6 phases

---

## PR Strategy

| Phase   | Subtasks | PR Count | Notes                              |
| ------- | -------- | -------- | ---------------------------------- |
| Phase 0 | 1-4      | 1 PR     | Foundation, must be first          |
| Phase 1 | 5-9      | 1 PR     | Admin shell + services             |
| Phase 2 | 10-13    | 4 PRs    | 1 per section editor               |
| Phase 3 | 14-16    | 3 PRs    | 1 per section editor               |
| Phase 4 | 17-20    | 2 PRs    | Group related config               |
| Phase 5 | 21-24    | 2 PRs    | Group by complexity                |
| Phase 6 | 25-35    | 3 PRs    | Provider+inline, analysis, PDF+hub |

Total: ~16 PRs

---

## Requirements From User

Before starting implementation:

- [ ] Complete Cloudflare setup (see cloudflare-setup-guide.md)
- [ ] Provide KV namespace IDs
- [ ] Confirm Access application is configured
- [ ] Provide OpenRouter API key (for AI features, optional)
- [ ] Confirm email(s) for Access whitelist

---

## Next Steps

1. User completes Cloudflare setup
2. I expand Task 16 in TaskMaster with these subtasks
3. Create feature branch `feat/task-16-admin-cms`
4. Start with Phase 0: Data Migration
