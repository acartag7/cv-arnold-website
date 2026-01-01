# CMS Schema Documentation

This document defines the data structures that the Admin CMS must support for editing the CV website content.

## Overview

All website content is stored in `/src/data/cv-data.json` and defined by TypeScript interfaces in `/src/types/cv.ts`. The CMS should provide forms/editors for each section.

---

## Site Configuration (`siteConfig`)

**Purpose:** Global site branding, navigation, and SEO settings.

### Schema

| Field        | Type   | Required | Description                                  |
| ------------ | ------ | -------- | -------------------------------------------- |
| `branding`   | string | Yes      | Site branding text (e.g., "~/arnold.dev")    |
| `version`    | string | Yes      | Version display (e.g., "v2024.12")           |
| `footerText` | string | No       | Footer text. Supports `{{year}}` placeholder |
| `navLinks`   | array  | No       | Navigation links array                       |
| `seo`        | object | No       | SEO metadata                                 |

### SEO Sub-schema

| Field         | Type     | Description          |
| ------------- | -------- | -------------------- |
| `title`       | string   | Page title           |
| `description` | string   | Meta description     |
| `keywords`    | string[] | SEO keywords array   |
| `ogImage`     | string   | Open Graph image URL |

### CMS Form Requirements

- Text inputs for branding, version, footerText
- Repeatable group for navLinks (label, href, external checkbox)
- Collapsible section for SEO fields
- Preview of how branding appears in header

---

## Hero Stats (`heroStats`)

**Purpose:** Statistics displayed in the hero section dashboard cards.

### Schema

| Field   | Type   | Required | Description                           |
| ------- | ------ | -------- | ------------------------------------- |
| `id`    | string | Yes      | Unique identifier                     |
| `value` | string | Yes      | Display value (e.g., "8+", "50+")     |
| `label` | string | Yes      | Label text (e.g., "Years Experience") |
| `icon`  | enum   | Yes      | Icon identifier                       |
| `order` | number | Yes      | Display order (lower first)           |

### Icon Options

```
terminal | shield | cloud | server | code | award | users | briefcase
```

### CMS Form Requirements

- Sortable/draggable list for reordering
- Icon picker with visual preview
- Add/remove stats dynamically
- Limit: Recommend 4-6 stats for optimal layout

---

## Section Titles (`sectionTitles`)

**Purpose:** Terminal-style section headers throughout the page.

### Schema

| Field            | Type   | Required | Description                                 |
| ---------------- | ------ | -------- | ------------------------------------------- |
| `heroPath`       | string | Yes      | Hero subtitle (e.g., "~/platform-engineer") |
| `experience`     | string | Yes      | Experience section title                    |
| `skills`         | string | Yes      | Skills section title                        |
| `certifications` | string | Yes      | Certifications section title                |
| `contact`        | string | Yes      | Contact section title                       |

### CMS Form Requirements

- Text inputs with monospace font preview
- Suggested format hints (e.g., "Use terminal-style paths like ~/path or file.ext")
- Live preview of how titles render

---

## Featured Highlights (`featuredHighlights`)

**Purpose:** Special badges/achievements displayed prominently (e.g., Kubestronaut badge).

### Schema

| Field      | Type    | Required | Description                        |
| ---------- | ------- | -------- | ---------------------------------- |
| `id`       | string  | Yes      | Unique identifier                  |
| `title`    | string  | Yes      | Badge title (e.g., "KUBESTRONAUT") |
| `subtitle` | string  | Yes      | Status text                        |
| `icon`     | enum    | Yes      | Icon identifier                    |
| `section`  | enum    | Yes      | Which section to display in        |
| `enabled`  | boolean | Yes      | Toggle visibility                  |

### Icon Options

```
award | shield | star | trophy
```

### Section Options

```
certifications | achievements | experience
```

### CMS Form Requirements

- Toggle switch for enabled/disabled
- Icon picker with visual icons
- Dropdown for section selection
- Preview of badge appearance

---

## Theme Configuration (`themeConfig`)

**Purpose:** Full color palette and theme behavior settings. Allows complete customization of the site's visual appearance.

### Schema

| Field          | Type         | Required | Description                |
| -------------- | ------------ | -------- | -------------------------- |
| `defaultTheme` | enum         | Yes      | Default theme on load      |
| `allowToggle`  | boolean      | Yes      | Allow user theme switching |
| `activePreset` | enum         | No       | Quick preset selector      |
| `dark`         | ColorPalette | Yes      | Dark mode full palette     |
| `light`        | ColorPalette | Yes      | Light mode full palette    |

### Default Theme Options

```
dark | light | system
```

### Palette Preset Options

```
green | blue | purple | orange | custom
```

### ColorPalette Sub-schema (dark/light)

| Field          | Type   | Description                   | Example (Blue Dark)        |
| -------------- | ------ | ----------------------------- | -------------------------- |
| `bg`           | string | Page background               | `#0B0D14`                  |
| `surface`      | string | Card/panel background         | `#12151E`                  |
| `surfaceHover` | string | Hover state background        | `#1A1E2A`                  |
| `border`       | string | Border color                  | `#1E2433`                  |
| `text`         | string | Primary text color            | `#FFFFFF`                  |
| `textMuted`    | string | Secondary/muted text          | `#B8C0D0`                  |
| `textDim`      | string | Dim/tertiary text             | `#6B7280`                  |
| `accent`       | string | Primary accent color          | `#60A5FA`                  |
| `accentDim`    | string | Dimmed accent for backgrounds | `rgba(96, 165, 250, 0.15)` |

### Preset Palettes Reference

**Blue (Default):**

- Dark: `#60A5FA` accent, `#B8C0D0` muted text
- Light: `#3B82F6` accent, `#64748B` muted text

**Green:**

- Dark: `#00FF94` accent, `#B4B4BC` muted text
- Light: `#059669` accent, `#64748B` muted text

**Purple:**

- Dark: `#A78BFA` accent, `#C4B5D8` muted text
- Light: `#7C3AED` accent, `#6B7280` muted text

**Orange:**

- Dark: `#FB923C` accent, `#D4C4B0` muted text
- Light: `#EA580C` accent, `#78716C` muted text

### CMS Form Requirements

- Radio buttons for defaultTheme
- Toggle for allowToggle
- Preset dropdown for quick palette switching
- Color pickers for each palette field (collapsible "Advanced" section)
- Live preview showing both themes side-by-side
- Validation: Ensure sufficient contrast ratios (WCAG AA minimum)
- "Copy from preset" button to populate fields from preset
- Reset to defaults button

---

## Personal Info (`personalInfo`)

**Purpose:** Core personal and contact information.

### Schema

| Field          | Type   | Required | Description                     |
| -------------- | ------ | -------- | ------------------------------- |
| `fullName`     | string | Yes      | Full display name               |
| `title`        | string | Yes      | Professional title              |
| `email`        | string | Yes      | Contact email                   |
| `phone`        | string | No       | Phone number (E.164 format)     |
| `location`     | object | Yes      | Location details                |
| `website`      | string | No       | Personal website URL            |
| `social`       | object | Yes      | Social media links              |
| `summary`      | string | Yes      | Professional summary (markdown) |
| `profileImage` | string | No       | Profile image URL               |
| `availability` | object | Yes      | Availability status             |

### Location Sub-schema

| Field         | Type   | Required                 |
| ------------- | ------ | ------------------------ |
| `city`        | string | Yes                      |
| `country`     | string | Yes                      |
| `countryCode` | string | Yes (ISO 3166-1 alpha-2) |

### Social Sub-schema

| Field      | Type   | Description           |
| ---------- | ------ | --------------------- |
| `linkedin` | string | LinkedIn profile URL  |
| `github`   | string | GitHub profile URL    |
| `twitter`  | string | Twitter/X profile URL |
| `[key]`    | string | Custom social links   |

### Availability Sub-schema

| Field     | Type   | Options                                               |
| --------- | ------ | ----------------------------------------------------- |
| `status`  | enum   | `available`, `not_available`, `open_to_opportunities` |
| `message` | string | Optional custom message                               |

### CMS Form Requirements

- Markdown editor for summary
- Image upload for profileImage
- URL validation for social links
- Dropdown for availability status

---

## Experience (`experience[]`)

**Purpose:** Work history entries.

### Schema

| Field          | Type     | Required | Description                     |
| -------------- | -------- | -------- | ------------------------------- |
| `id`           | string   | Yes      | Unique identifier               |
| `company`      | string   | Yes      | Company name                    |
| `companyUrl`   | string   | No       | Company website                 |
| `position`     | string   | Yes      | Job title                       |
| `type`         | enum     | Yes      | Employment type                 |
| `startDate`    | string   | Yes      | ISO 8601 date                   |
| `endDate`      | string   | No       | ISO 8601 date (null if current) |
| `location`     | object   | Yes      | Work location                   |
| `description`  | string   | Yes      | Job description (markdown)      |
| `achievements` | string[] | Yes      | Key achievements list           |
| `technologies` | string[] | Yes      | Technologies used               |
| `order`        | number   | Yes      | Display order                   |
| `featured`     | boolean  | No       | Highlight this entry            |

### Employment Types

```
full_time | part_time | contract | freelance | internship
```

### CMS Form Requirements

- Date pickers with "Present" option for endDate
- Sortable achievements list
- Tag input for technologies
- Toggle for featured
- Drag-to-reorder entries

---

## Skills (`skills[]`)

**Purpose:** Skills organized by category.

### Category Schema

| Field         | Type    | Required | Description          |
| ------------- | ------- | -------- | -------------------- |
| `id`          | string  | Yes      | Category identifier  |
| `name`        | string  | Yes      | Category name        |
| `description` | string  | No       | Category description |
| `skills`      | Skill[] | Yes      | Skills in category   |
| `order`       | number  | Yes      | Display order        |
| `icon`        | string  | No       | Icon identifier      |

### Skill Schema

| Field               | Type    | Required | Description            |
| ------------------- | ------- | -------- | ---------------------- |
| `name`              | string  | Yes      | Skill name             |
| `level`             | enum    | Yes      | Proficiency level      |
| `yearsOfExperience` | number  | No       | Years using skill      |
| `lastUsed`          | string  | No       | ISO 8601 date          |
| `featured`          | boolean | No       | Core/highlighted skill |

### Skill Levels

```
beginner | intermediate | advanced | expert
```

### CMS Form Requirements

- Nested structure: Categories contain skills
- Drag-to-reorder categories and skills within
- Slider or dropdown for skill level
- Visual skill level indicator

---

## Certifications (`certifications[]`)

**Purpose:** Professional certifications.

### Schema

| Field            | Type   | Required | Description                       |
| ---------------- | ------ | -------- | --------------------------------- |
| `id`             | string | Yes      | Unique identifier                 |
| `name`           | string | Yes      | Certification name                |
| `issuer`         | string | Yes      | Issuing organization              |
| `issuerUrl`      | string | No       | Issuer website                    |
| `issueDate`      | string | Yes      | ISO 8601 date                     |
| `expirationDate` | string | No       | ISO 8601 date (null if permanent) |
| `status`         | enum   | Yes      | Current status                    |
| `credentialId`   | string | No       | Credential ID                     |
| `credentialUrl`  | string | No       | Verification URL                  |
| `description`    | string | No       | Description                       |
| `order`          | number | Yes      | Display order                     |

### Status Options

```
active | expired | in_progress
```

### CMS Form Requirements

- Auto-calculate status from dates
- URL validation for credentialUrl
- "No expiration" checkbox for permanent certs
- Badge preview

---

## Education (`education[]`)

**Purpose:** Educational background.

### Schema

| Field            | Type     | Required | Description                         |
| ---------------- | -------- | -------- | ----------------------------------- |
| `id`             | string   | Yes      | Unique identifier                   |
| `institution`    | string   | Yes      | School/university name              |
| `institutionUrl` | string   | No       | Institution website                 |
| `degree`         | string   | Yes      | Degree name                         |
| `field`          | string   | Yes      | Field of study                      |
| `startDate`      | string   | Yes      | ISO 8601 date                       |
| `endDate`        | string   | No       | ISO 8601 date (null if in progress) |
| `grade`          | string   | No       | Grade/GPA                           |
| `location`       | object   | No       | Institution location                |
| `description`    | string   | No       | Description (markdown)              |
| `highlights`     | string[] | No       | Key highlights                      |
| `order`          | number   | Yes      | Display order                       |

---

## Achievements (`achievements[]`)

**Purpose:** Awards, publications, and notable accomplishments.

### Schema

| Field          | Type     | Required | Description                |
| -------------- | -------- | -------- | -------------------------- |
| `id`           | string   | Yes      | Unique identifier          |
| `title`        | string   | Yes      | Achievement title          |
| `category`     | enum     | Yes      | Achievement type           |
| `date`         | string   | Yes      | ISO 8601 date              |
| `issuer`       | string   | No       | Issuing organization       |
| `description`  | string   | Yes      | Description (markdown)     |
| `url`          | string   | No       | Related URL                |
| `technologies` | string[] | No       | Related technologies       |
| `order`        | number   | Yes      | Display order              |
| `featured`     | boolean  | No       | Highlight this achievement |

### Category Options

```
award | publication | speaking | project | contribution | other
```

---

## Languages (`languages[]`)

**Purpose:** Language proficiencies.

### Schema

| Field         | Type    | Required | Description         |
| ------------- | ------- | -------- | ------------------- |
| `name`        | string  | Yes      | Language name       |
| `code`        | string  | Yes      | ISO 639-1 code      |
| `proficiency` | enum    | Yes      | CEFR level          |
| `native`      | boolean | No       | Native speaker flag |

### Proficiency Levels (CEFR)

```
a1 | a2 | b1 | b2 | c1 | c2 | native
```

---

## CMS Implementation Notes

### Priority Sections for MVP

1. **High Priority** (frequently edited):
   - personalInfo
   - experience
   - certifications
   - skills

2. **Medium Priority** (occasional edits):
   - heroStats
   - sectionTitles
   - featuredHighlights
   - achievements

3. **Low Priority** (rare changes):
   - siteConfig
   - themeConfig
   - education
   - languages

### Validation Rules

- All URLs should be validated for proper format
- Dates should be ISO 8601 format
- Email should be validated
- Required fields must be enforced
- Order fields should auto-increment

### Data Persistence

- Save to `/src/data/cv-data.json`
- Increment `version` on significant changes
- Update `lastUpdated` timestamp automatically
- Consider backup/versioning for safety

### Preview Integration

- Real-time preview of changes
- Side-by-side editor and preview
- Theme toggle in preview
- Mobile/desktop preview modes
