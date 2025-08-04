# Design System Specifications

## CV Website UI/UX Guidelines

### Document Version

- **Version**: 1.0
- **Date**: August 3, 2025
- **Purpose**: Define comprehensive design system for consistency
- **Usage**: Reference for all UI implementation

---

## 1. Design Principles

### 1.1 Core Principles

1. **Professional First**: Clean, sophisticated, hiring-manager friendly
2. **Performance Conscious**: Every pixel must earn its weight
3. **Accessibility Built-in**: WCAG 2.1 AA minimum
4. **Mobile Excellence**: Touch-first, thumb-friendly
5. **Subtle Sophistication**: Animations enhance, not distract

### 1.2 Visual Hierarchy

```text
Primary Focus    → Name, Title, CTA
Secondary Focus  → Section Headers, Key Info
Tertiary Focus   → Body Text, Details
Supporting       → Metadata, Timestamps
```

---

## 2. Design Tokens

### 2.1 Color System

```css
/* Base Palette */
--color-neutral-0: #ffffff;
--color-neutral-50: #fafafa;
--color-neutral-100: #f4f4f5;
--color-neutral-200: #e4e4e7;
--color-neutral-300: #d4d4d8;
--color-neutral-400: #a1a1aa;
--color-neutral-500: #71717a;
--color-neutral-600: #52525b;
--color-neutral-700: #3f3f46;
--color-neutral-800: #27272a;
--color-neutral-900: #18181b;
--color-neutral-950: #09090b;

/* Theme 1: Professional Teal */
--color-teal-50: #f0fdfa;
--color-teal-100: #ccfbf1;
--color-teal-200: #99f6e4;
--color-teal-300: #5eead4;
--color-teal-400: #2dd4bf;
--color-teal-500: #14b8a6;
--color-teal-600: #0d9488;
--color-teal-700: #0f766e;
--color-teal-800: #115e59;
--color-teal-900: #134e4a;

/* Theme 2: Modern Blue */
--color-blue-50: #eff6ff;
--color-blue-100: #dbeafe;
--color-blue-200: #bfdbfe;
--color-blue-300: #93c5fd;
--color-blue-400: #60a5fa;
--color-blue-500: #3b82f6;
--color-blue-600: #2563eb;
--color-blue-700: #1d4ed8;
--color-blue-800: #1e40af;
--color-blue-900: #1e3a8a;

/* Theme 3: Bold Emerald */
--color-emerald-50: #ecfdf5;
--color-emerald-100: #d1fae5;
--color-emerald-200: #a7f3d0;
--color-emerald-300: #6ee7b7;
--color-emerald-400: #34d399;
--color-emerald-500: #10b981;
--color-emerald-600: #059669;
--color-emerald-700: #047857;
--color-emerald-800: #065f46;
--color-emerald-900: #064e3b;

/* Semantic Colors */
--color-success: var(--color-emerald-600);
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: var(--color-blue-600);
```

### 2.2 Typography System

```css
/* Font Families */
--font-sans:
  -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
  Arial, sans-serif;
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;

/* Font Sizes - Perfect Fourth Scale (1.333) */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */
--text-5xl: 3rem; /* 48px */

/* Line Heights */
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Letter Spacing */
--tracking-tighter: -0.05em;
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
```

### 2.3 Spacing System

```css
/* 8px Grid System */
--space-0: 0;
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
--space-24: 6rem; /* 96px */
--space-32: 8rem; /* 128px */
```

### 2.4 Animation Tokens

```css
/* Durations */
--duration-instant: 0ms;
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;
--duration-slower: 500ms;

/* Easings */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Spring Animations */
--spring-bounce: cubic-bezier(0.68, -0.6, 0.32, 1.6);
--spring-smooth: cubic-bezier(0.4, 0, 0.2, 1);
```

### 2.5 Layout Tokens

```css
/* Breakpoints */
--screen-sm: 640px; /* Mobile landscape */
--screen-md: 768px; /* Tablet portrait */
--screen-lg: 1024px; /* Tablet landscape */
--screen-xl: 1280px; /* Desktop */
--screen-2xl: 1536px; /* Large desktop */

/* Container Widths */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;

/* Border Radius */
--radius-none: 0;
--radius-sm: 0.125rem; /* 2px */
--radius-base: 0.25rem; /* 4px */
--radius-md: 0.375rem; /* 6px */
--radius-lg: 0.5rem; /* 8px */
--radius-xl: 0.75rem; /* 12px */
--radius-2xl: 1rem; /* 16px */
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl:
  0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

---

## 3. Component Specifications

### 3.1 Button Component

```typescript
// Variants
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

// Visual Specs
const buttonSpecs = {
  sizes: {
    sm: {
      height: '32px',
      padding: '0 12px',
      fontSize: '14px',
      iconSize: '16px',
    },
    md: {
      height: '40px',
      padding: '0 16px',
      fontSize: '16px',
      iconSize: '20px',
    },
    lg: {
      height: '48px',
      padding: '0 24px',
      fontSize: '18px',
      iconSize: '24px',
    },
  },

  variants: {
    primary: {
      background: 'var(--color-primary)',
      color: 'white',
      border: 'none',
      hover: {
        background: 'var(--color-primary-dark)',
        transform: 'translateY(-1px)',
        shadow: 'var(--shadow-md)',
      },
    },
    secondary: {
      background: 'transparent',
      color: 'var(--color-primary)',
      border: '2px solid var(--color-primary)',
      hover: {
        background: 'var(--color-primary)',
        color: 'white',
      },
    },
  },
}
```

### 3.2 Card Component

```typescript
// Card Specifications
const cardSpecs = {
  padding: 'var(--space-6)',
  borderRadius: 'var(--radius-lg)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',

  hover: {
    transform: 'translateY(-2px)',
    shadow: 'var(--shadow-lg)',
    borderColor: 'var(--color-primary)',
  },

  variants: {
    elevated: {
      shadow: 'var(--shadow-md)',
      border: 'none',
    },
    interactive: {
      cursor: 'pointer',
      transition: 'all 200ms ease-out',
    },
  },
}
```

### 3.3 Navigation Specs

```typescript
// Header Specifications
const headerSpecs = {
  height: {
    default: '80px',
    scrolled: '60px',
    mobile: '64px',
  },

  background: {
    default: 'rgba(var(--color-background-rgb), 0.8)',
    scrolled: 'rgba(var(--color-background-rgb), 0.95)',
  },

  backdropFilter: 'blur(8px)',

  transition: 'all 200ms ease-out',

  mobileMenu: {
    background: 'var(--color-background)',
    animation: 'slideDown 250ms ease-out',
  },
}

// Navigation Items
const navItemSpecs = {
  padding: '8px 16px',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',

  states: {
    default: {
      color: 'var(--color-text-muted)',
    },
    hover: {
      color: 'var(--color-primary)',
    },
    active: {
      color: 'var(--color-primary)',
      borderBottom: '2px solid var(--color-primary)',
    },
  },
}
```

---

## 4. Theme System

### 4.1 Theme Structure

```css
/* Base Theme Variables */
[data-theme='professional'] {
  /* Colors */
  --color-primary: var(--color-teal-600);
  --color-primary-dark: var(--color-teal-700);
  --color-primary-light: var(--color-teal-500);
  --color-secondary: var(--color-teal-400);
  --color-accent: var(--color-cyan-400);

  /* Backgrounds */
  --color-background: var(--color-neutral-0);
  --color-surface: var(--color-neutral-50);
  --color-surface-hover: var(--color-neutral-100);

  /* Text */
  --color-text: var(--color-neutral-900);
  --color-text-muted: var(--color-neutral-600);
  --color-text-disabled: var(--color-neutral-400);

  /* Borders */
  --color-border: var(--color-neutral-200);
  --color-border-hover: var(--color-neutral-300);
}

[data-theme='modern'] {
  --color-primary: var(--color-blue-600);
  --color-primary-dark: var(--color-blue-700);
  --color-primary-light: var(--color-blue-500);
  --color-secondary: var(--color-blue-400);
  --color-accent: var(--color-indigo-400);

  /* ... rest of theme */
}

[data-theme='bold'] {
  --color-primary: var(--color-emerald-600);
  --color-background: var(--color-neutral-950);
  --color-surface: var(--color-neutral-900);
  --color-text: var(--color-neutral-50);

  /* Dark theme specifics */
}
```

### 4.2 Theme Switching Animation

```css
/* Smooth theme transitions */
* {
  transition:
    background-color 200ms ease-out,
    color 200ms ease-out,
    border-color 200ms ease-out;
}

/* Prevent transition on page load */
.no-transition * {
  transition: none !important;
}
```

---

## 5. Responsive Design

### 5.1 Breakpoint Strategy

```scss
// Mobile First Approach
.component {
  // Base mobile styles
  padding: var(--space-4);

  @media (min-width: 640px) {
    // Tablet styles
    padding: var(--space-6);
  }

  @media (min-width: 1024px) {
    // Desktop styles
    padding: var(--space-8);
  }
}
```

### 5.2 Touch Targets

```css
/* Minimum touch target sizes */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Spacing between touch targets */
.touch-target + .touch-target {
  margin-top: var(--space-2);
}
```

### 5.3 Responsive Typography

```css
/* Fluid typography with clamp() */
.heading-1 {
  font-size: clamp(2rem, 4vw + 1rem, 3rem);
  line-height: var(--leading-tight);
}

.body-text {
  font-size: clamp(1rem, 2vw + 0.5rem, 1.125rem);
  line-height: var(--leading-relaxed);
}
```

---

## 6. Motion Design

### 6.1 Animation Principles

1. **Purpose**: Every animation has a clear purpose
2. **Performance**: Use transform and opacity only
3. **Timing**: Fast enough to feel responsive (200-300ms)
4. **Easing**: Natural easing functions
5. **Accessibility**: Respect prefers-reduced-motion

### 6.2 Common Animations

```typescript
// Fade In
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 },
}

// Slide Up
export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
}

// Scale In
export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2 },
}

// Stagger Children
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}
```

### 6.3 Micro-interactions

```css
/* Button hover */
.button {
  transform: translateY(0);
  transition: all 200ms ease-out;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.button:active {
  transform: translateY(0);
  transition-duration: 50ms;
}

/* Link underline animation */
.link {
  position: relative;
}

.link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width 200ms ease-out;
}

.link:hover::after {
  width: 100%;
}
```

---

## 7. Iconography

### 7.1 Icon System

- **Library**: Lucide React
- **Size**: 16px, 20px, 24px
- **Stroke Width**: 2px
- **Style**: Outlined, consistent

### 7.2 Icon Usage

```typescript
// Icon sizes by context
const iconSizes = {
  button: {
    sm: 16,
    md: 20,
    lg: 24,
  },
  inline: 16,
  decorative: 24,
  hero: 32,
}

// Common icons
const icons = {
  navigation: ['Menu', 'X', 'ChevronDown', 'ChevronRight'],
  actions: ['Download', 'Mail', 'Phone', 'ExternalLink'],
  social: ['Linkedin', 'Github', 'Twitter'],
  ui: ['Moon', 'Sun', 'Search', 'Filter'],
}
```

---

## 8. Accessibility Guidelines

### 8.1 Color Contrast

- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum
- Focus indicators: 3:1 minimum

### 8.2 Focus States

```css
/* Consistent focus styles */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Remove default outline */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 8.3 Screen Reader Support

```html
<!-- Descriptive labels -->
<button aria-label="Download CV as PDF"><Download /> Download CV</button>

<!-- Live regions -->
<div role="status" aria-live="polite">Form submitted successfully</div>

<!-- Skip navigation -->
<a href="#main" class="sr-only focus:not-sr-only"> Skip to main content </a>
```

---

## 9. Component States

### 9.1 Interactive States

```css
/* Default state */
.component {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

/* Hover state */
.component:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-border-hover);
}

/* Focus state */
.component:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Active state */
.component:active {
  transform: scale(0.98);
}

/* Disabled state */
.component:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading state */
.component.loading {
  position: relative;
  color: transparent;
}

.component.loading::after {
  content: '';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Loading spinner */
}
```

---

## 10. Layout Patterns

### 10.1 Grid System

```css
/* 12-column grid */
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
}

/* Responsive columns */
.col-span-12 {
  grid-column: span 12;
}
.col-span-6 {
  grid-column: span 6;
}
.col-span-4 {
  grid-column: span 4;
}
.col-span-3 {
  grid-column: span 3;
}

@media (max-width: 768px) {
  .col-span-6,
  .col-span-4,
  .col-span-3 {
    grid-column: span 12;
  }
}
```

### 10.2 Section Spacing

```css
/* Consistent section spacing */
.section {
  padding-block: var(--space-16);
}

.section-sm {
  padding-block: var(--space-12);
}

.section-lg {
  padding-block: var(--space-20);
}

/* Container */
.container {
  width: 100%;
  max-width: var(--container-xl);
  margin-inline: auto;
  padding-inline: var(--space-4);
}
```

---

This design system provides a solid foundation for building a consistent,
professional, and performant CV website. All specifications follow modern
best practices and are optimized for developer experience.
