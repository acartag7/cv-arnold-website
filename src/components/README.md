# Components

React components organized by type and purpose.

## Structure

- **`layout/`** - Layout components (Header, Footer, Navigation)
- **`sections/`** - Page section components (Hero, Experience, Skills, etc.)
- **`ui/`** - Reusable UI components (Button, Card, Typography, etc.)

## Usage

Components are exported through barrel exports from each directory:

```tsx
import { Header } from '@/components/layout'
import { HeroSection } from '@/components/sections'
import { Button } from '@/components/ui'
```

## Conventions

- All components use TypeScript with strict typing
- Props interfaces are exported from the same file
- Components follow the compound component pattern where appropriate
- Styles are handled through Tailwind CSS classes
