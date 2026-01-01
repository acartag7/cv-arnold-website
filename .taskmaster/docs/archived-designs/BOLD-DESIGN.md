# Bold/Modern Design - Implementation Guide

This design direction is preserved for future use. It features an award-winning
agency aesthetic with gradient typography and vibrant colors.

## Design Characteristics

- **Background**: Deep navy (#0B1121)
- **Typography**: Giant gradient text (pink → purple → cyan)
- **Accents**: Pink (#EC4899), Purple (#8B5CF6), Cyan (#06B6D4)
- **Style**: Creative agency, portfolio, award-winning sites

## Color Palette

```typescript
const colors = {
  bg: '#0B1121',
  bgLight: '#0F172A',
  surface: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(255, 255, 255, 0.1)',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  pink: '#EC4899',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
}

// Gradient for text
const gradient = 'linear-gradient(to right, #EC4899, #8B5CF6, #06B6D4)'
```

## Key Elements

1. **Giant Name Typography**
   - "Arnold" in white
   - "Cartagena" with pink-purple gradient
   - Uses `bg-clip-text text-transparent`

2. **Floating Social Bar**
   - Fixed position at bottom center
   - Semi-transparent background with blur
   - Links: LinkedIn, GitHub, Email

3. **Achievement Cards**
   - Numbered (01, 02, 03, 04)
   - Glass-morphism effect
   - Hover animations

4. **Gradient Mesh Background**
   - Multiple radial gradients
   - Subtle blur effects
   - Large decorative "CV" watermark

## To Implement Site-Wide

1. Copy the page.tsx from `/design-showcase/bold/` to your main pages
2. Update `src/app/page.tsx` to use Bold components
3. Apply the color tokens to your CSS variables in `tokens.css`:

```css
:root {
  --color-bg: #0b1121;
  --color-surface: rgba(255, 255, 255, 0.05);
  --color-text: #ffffff;
  --color-text-muted: rgba(255, 255, 255, 0.6);
  --color-accent-pink: #ec4899;
  --color-accent-purple: #8b5cf6;
  --color-accent-cyan: #06b6d4;
}
```

1. For light mode support, create alternate palette:

```css
[data-theme='light'] {
  --color-bg: #fafafa;
  --color-surface: #ffffff;
  --color-text: #0f172a;
  --color-text-muted: #64748b;
  /* Keep vibrant gradients */
}
```

## Files Included

- `page.tsx` - Full page implementation with all sections
- This `IMPLEMENTATION.md` - Implementation guide

## Best For

- Creative/design roles
- Portfolio sites
- Standing out from typical tech CVs
- Roles at agencies or startups
