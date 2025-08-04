# Types

TypeScript type definitions and interfaces for the application.

## Structure

- **`index.ts`** - Main type exports and common interfaces
- **`api.ts`** - API request/response types
- **`components.ts`** - Component prop types and interfaces

## Usage

Types ensure type safety throughout the application:

```tsx
import type { CVData, Experience, Skill } from '@/types'

const profile: CVData = {
  personalInfo: {
    /* ... */
  },
  experience: [],
  skills: [],
}
```

## Conventions

- All interfaces use PascalCase naming
- Generic types are prefixed with `T`
- API types mirror backend response structures
- Utility types are created for common patterns
