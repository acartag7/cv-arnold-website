# Test Pages Inventory

This document lists all test/development pages created during the design exploration phase.

## Pages to KEEP

| Route    | Purpose                         | Recommendation            |
| -------- | ------------------------------- | ------------------------- |
| `/`      | Main CV page (Dashboard design) | **KEEP** - Production     |
| `/admin` | Admin CMS placeholder           | **KEEP** - Future Task 16 |

## Pages to REMOVE (Test/Development)

### Design Showcase Pages

| Route                        | Purpose                          | Files                                        |
| ---------------------------- | -------------------------------- | -------------------------------------------- |
| `/design-showcase`           | Design direction selector        | `src/app/design-showcase/page.tsx`           |
| `/design-showcase/bold`      | Bold design preview              | `src/app/design-showcase/bold/page.tsx`      |
| `/design-showcase/dashboard` | Dashboard design preview         | `src/app/design-showcase/dashboard/page.tsx` |
| `/design-showcase/editorial` | Editorial design preview         | `src/app/design-showcase/editorial/page.tsx` |
| `/color-compare`             | Green vs Blue palette comparison | `src/app/color-compare/page.tsx`             |

### Component Test Pages

| Route                | Purpose                  | Files                                |
| -------------------- | ------------------------ | ------------------------------------ |
| `/components`        | Component showcase index | `src/app/components/page.tsx`        |
| `/components/badge`  | Badge component tests    | `src/app/components/badge/page.tsx`  |
| `/components/button` | Button component tests   | `src/app/components/button/page.tsx` |
| `/components/card`   | Card component tests     | `src/app/components/card/page.tsx`   |
| `/button-test`       | Button testing page      | `src/app/button-test/page.tsx`       |
| `/layout-test`       | Layout testing page      | `src/app/layout-test/page.tsx`       |
| `/responsive-test`   | Responsive testing page  | `src/app/responsive-test/page.tsx`   |
| `/typography-test`   | Typography testing page  | `src/app/typography-test/page.tsx`   |

### Saved Design Documentation

| Path                                                      | Purpose                          |
| --------------------------------------------------------- | -------------------------------- |
| `src/app/design-showcase/saved-designs/CURRENT-DESIGN.md` | Original design restore guide    |
| `src/app/design-showcase/saved-designs/BOLD-DESIGN.md`    | Bold design implementation guide |

### Hero Variant Components

| Path                                                      | Purpose                     |
| --------------------------------------------------------- | --------------------------- |
| `src/components/sections/hero-variants/HeroBold.tsx`      | Bold hero variant           |
| `src/components/sections/hero-variants/HeroDashboard.tsx` | Dashboard hero variant      |
| `src/components/sections/hero-variants/HeroEditorial.tsx` | Editorial hero variant      |
| `src/components/sections/hero-variants/index.ts`          | Hero variants barrel export |

## Cleanup Commands

To remove all test pages:

```bash
# Remove design showcase pages
rm -rf src/app/design-showcase
rm -rf src/app/color-compare

# Remove component test pages
rm -rf src/app/components
rm -rf src/app/button-test
rm -rf src/app/layout-test
rm -rf src/app/responsive-test
rm -rf src/app/typography-test

# Remove hero variants (no longer needed - design is finalized)
rm -rf src/components/sections/hero-variants
```

## What to Archive (Optional)

If you want to keep design documentation for future reference, move to `.taskmaster/docs/`:

```bash
# Archive saved designs documentation
mv src/app/design-showcase/saved-designs/*.md .taskmaster/docs/archived-designs/
```

## Summary

- **11 test routes** to remove
- **4 hero variant components** to remove
- **2 design docs** to optionally archive
- Keep: `/` (main), `/admin` (future CMS)
