# Technical Guidelines

## Standards and Conventions for All Claude Code Agents

### Document Version

- **Version**: 1.0
- **Date**: August 3, 2025
- **Purpose**: Ensure consistency across all parallel workstreams
- **Enforcement**: All agents must follow these guidelines

---

## 1. General Principles

### 1.1 Code Philosophy

- **Clarity over Cleverness**: Write code that is easy to understand
- **Performance Matters**: Every millisecond counts
- **Type Safety**: TypeScript strict mode always
- **Component Purity**: Prefer pure, predictable components
- **Progressive Enhancement**: Core functionality works everywhere

### 1.2 Communication Between Agents

- Use PR descriptions to communicate changes
- Document all API contracts in comments
- Create integration tests at boundaries
- Use semantic commit messages
- Tag relevant workstream owners in PRs

---

## 2. Code Standards

### 2.1 TypeScript Configuration

```typescript
// tsconfig.json requirements
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 2.2 File Naming Conventions

```text
components/
  Button.tsx           // PascalCase for components
  Button.test.tsx      // Test files adjacent
  Button.stories.tsx   // Storybook stories
  index.ts            // Barrel exports

hooks/
  useScrollLock.ts    // camelCase with 'use' prefix

utils/
  formatDate.ts       // camelCase for utilities

types/
  index.ts           // Centralized type definitions
```

### 2.3 Component Structure

```typescript
// 1. Imports (sorted)
import React from 'react'
import { motion } from 'framer-motion'
import type { ButtonProps } from '@/types'

// 2. Type definitions
interface Props extends ButtonProps {
  variant?: 'primary' | 'secondary'
}

// 3. Component definition
export function Button({ variant = 'primary', ...props }: Props) {
  // 4. Hooks first
  const [state, setState] = useState(false)

  // 5. Handlers
  const handleClick = () => {}

  // 6. Render
  return <button {...props} />
}

// 7. Display name for debugging
Button.displayName = 'Button'
```

### 2.4 CSS and Styling Rules

```typescript
// Use Tailwind classes with consistent ordering
// 1. Layout (display, position)
// 2. Sizing (width, height, padding, margin)
// 3. Typography
// 4. Visual (background, border, shadow)
// 5. Animation
// 6. States (hover, focus)

<div className="flex items-center justify-between p-4 text-sm bg-white
  border rounded-lg shadow-sm hover:shadow-md transition-shadow" />

// CSS Custom Properties for themes
:root {
  --color-primary: theme('colors.blue.600');
  --spacing-unit: 8px;
}

// NO inline styles except for dynamic values
<div style={{ transform: `translateX(${offset}px)` }} />
```

---

## 3. Component Architecture

### 3.1 Component Categories

```typescript
// 1. Base Components (atoms)
// Simple, reusable, no business logic
;(Button, Input, Card, Badge)

// 2. Layout Components
// Structure and composition
;(Header, Footer, Section, Container)

// 3. Feature Components
// Business logic, composed of base
;(ExperienceCard, SkillsMatrix, ContactForm)

// 4. Page Components
// Full pages, data fetching
;(HomePage, AdminPage)
```

### 3.2 Props Interface Pattern

```typescript
// Always extend HTML element props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

// Use discriminated unions for variants
type ButtonVariant =
  | { variant: 'primary'; primaryColor: string }
  | { variant: 'secondary'; outlineColor: string }
```

### 3.3 Custom Hooks Guidelines

```typescript
// Hook naming: useXxx
// Return consistent shape
// Handle loading and error states

function useScrollDirection() {
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const [isAtTop, setIsAtTop] = useState(true)

  // Implementation...

  return { direction, isAtTop } // Always return object
}
```

---

## 4. State Management

### 4.1 State Hierarchy

```typescript
// 1. Local state for UI (useState)
const [isOpen, setIsOpen] = useState(false)

// 2. Context for theme/auth
const ThemeContext = createContext<ThemeContextType>()

// 3. Server state with React Query (future)
const { data } = useQuery(['cv-data'], fetchCVData)

// 4. URL state for navigation
const searchParams = useSearchParams()
```

### 4.2 Data Flow Rules

- Props down, events up
- No prop drilling beyond 2 levels
- Use context for cross-cutting concerns
- Keep server state separate from UI state

---

## 5. Performance Requirements

### 5.1 Bundle Size Limits

```javascript
// Max sizes per route
{
  '/': 150, // KB gzipped
  '/admin': 200,
  'shared': 100
}
```

### 5.2 Optimization Checklist

- [ ] Use dynamic imports for heavy components
- [ ] Implement virtual scrolling for long lists
- [ ] Optimize images with next/image
- [ ] Memoize expensive computations
- [ ] Use CSS transforms for animations
- [ ] Preload critical resources

### 5.3 Required Optimizations

```typescript
// Always memoize callbacks in lists
const handleClick = useCallback((id: string) => {
  // handle click
}, [dependency])

// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  // render
})

// Lazy load heavy sections
const HeavySection = dynamic(() => import('./HeavySection'), {
  loading: () => <Skeleton />
})
```

---

## 6. API Design (Cloudflare Workers)

### 6.1 Endpoint Structure

```typescript
// REST-like endpoints
GET    /api/cv-data
GET    /api/cv-data/experience
PUT    /api/cv-data/experience/:id
GET    /api/cv-data/version

// Response format
{
  "success": boolean,
  "data": T | null,
  "error": string | null,
  "timestamp": string
}
```

### 6.2 Error Handling

```typescript
// Consistent error responses
class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
  }
}

// Error codes
RATE_LIMITED = 'RATE_LIMITED'
NOT_FOUND = 'NOT_FOUND'
INVALID_DATA = 'INVALID_DATA'
```

---

## 7. Testing Requirements

### 7.1 Test Coverage Targets

- Components: 80% coverage
- Utilities: 100% coverage
- Hooks: 90% coverage
- API handlers: 100% coverage

### 7.2 Test Structure

```typescript
// Component tests
describe('Button', () => {
  it('renders with default props', () => {})
  it('handles click events', () => {})
  it('shows loading state', () => {})
  it('applies correct styles for variants', () => {})
})

// Integration tests
describe('Header Navigation', () => {
  it('highlights active section on scroll', () => {})
  it('collapses on mobile', () => {})
})
```

---

## 8. Git Workflow

### 8.1 Branch Naming

```text
feature/workstream-a-infrastructure
feature/workstream-b-design-system
fix/header-mobile-menu
chore/update-dependencies
```

### 8.2 Commit Messages

```text
feat(header): add scroll-aware behavior
fix(nav): correct mobile menu z-index issue
style(button): update hover states
perf(images): implement lazy loading
docs(api): add endpoint documentation
chore(deps): update framer-motion to v12
```

### 8.3 PR Process

1. Create draft PR early
2. Tag relevant workstream owners
3. Include screenshots for UI changes
4. Run all checks locally first
5. Squash merge when complete

---

## 9. Security Guidelines

### 9.1 Data Handling

- Never commit sensitive data
- Use environment variables for secrets
- Implement CSP headers
- Sanitize all user inputs
- Use HTTPS everywhere

### 9.2 API Security

```typescript
// Rate limiting example
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests
}

// CORS configuration
const CORS_OPTIONS = {
  origin: 'https://cv.arnoldcartagena.com',
  credentials: true,
}
```

---

## 10. Monitoring & Logging

### 10.1 Required Metrics

- Page load time
- API response time
- Error rates
- Bundle sizes
- Core Web Vitals

### 10.2 Logging Standards

```typescript
// Structured logging
logger.info('API_REQUEST', {
  endpoint: '/api/cv-data',
  duration: 45,
  status: 200,
})

// Error logging
logger.error('API_ERROR', {
  endpoint: '/api/cv-data',
  error: error.message,
  stack: error.stack,
})
```

---

## 11. Agent-Specific Guidelines

### 11.1 frontend-developer

- Focus on component reusability
- Implement proper loading states
- Ensure keyboard navigation
- Test on multiple devices

### 11.2 deployment-engineer

- Document all environment variables
- Create rollback procedures
- Monitor resource usage
- Automate everything possible

### 11.3 ui-ux-designer

- Follow 8px grid system
- Maintain design token consistency
- Create component documentation
- Consider all device sizes

### 11.4 python-pro

- Use type hints always
- Follow PEP 8
- Create reusable utilities
- Document data transformations

### 11.5 ai-engineer

- Implement graceful fallbacks
- Monitor API costs
- Cache responses appropriately
- Document prompts and models

### 11.6 golang-pro

- Follow Go idioms
- Implement proper error handling
- Create benchmarks
- Use goroutines wisely

### 11.7 ml-engineer

- Document data pipelines
- Version models properly
- Monitor prediction accuracy
- Implement A/B testing

### 11.8 code-reviewer

- Check against these guidelines
- Verify test coverage
- Ensure consistent style
- Look for performance issues

---

## 12. Definition of Done

A feature is considered complete when:

- [ ] Code follows all guidelines
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] Performance budgets are met
- [ ] Accessibility checks pass
- [ ] Code review approved
- [ ] Deployed to preview environment
- [ ] Integration tests pass

---

## Quick Reference

### DO ✅

- Use TypeScript strict mode
- Write tests for all features
- Follow naming conventions
- Optimize for performance
- Document complex logic
- Use semantic HTML
- Handle errors gracefully
- Keep components pure

### DON'T ❌

- Use `any` type
- Ignore ESLint warnings
- Commit sensitive data
- Use inline styles
- Skip loading states
- Forget error boundaries
- Nest ternaries
- Premature optimization

---

These guidelines ensure consistent, high-quality code across all
workstreams. When in doubt, prioritize clarity and maintainability.
