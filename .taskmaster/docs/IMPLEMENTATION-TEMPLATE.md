# Task X.Y Implementation: [Task Title]

**Status:** [Pending/In Progress/Completed]
**Date:** YYYY-MM-DD
**Branch:** `feat/task-X.Y-description`

## Overview

Brief description of what this task accomplishes and why it's needed.

## Files Created/Modified

### Core Files

**`path/to/file.ts`** (XXX lines)

- Brief description of what this file does
- Key exports or functionality

## Key Implementation Details

### Architecture Decisions

> **CRITICAL:** Document WHY and WHY NOT for every choice

#### Decision 1: [Technology/Pattern Choice]

- **What:** [What was chosen]
- **Why:** [Benefits, requirements it meets, advantages]
- **Why NOT alternatives:**
  - Alternative 1: [Why rejected - specific reason]
  - Alternative 2: [Why rejected - specific reason]
  - Alternative 3: [Why rejected - specific reason]
- **Trade-offs:** [What we gain vs what we lose]

#### Decision 2: [Implementation Pattern]

- **What:** [Pattern or approach used]
- **Why:** [Reasoning for this approach]
- **Why NOT alternatives:**
  - [Alternative approaches considered and why rejected]
- **Trade-offs:** [Pros and cons]

### Code Examples

```typescript
// Key code patterns worth highlighting
// Include context comments
```

### Configuration Changes

Any package.json, tsconfig, or other config modifications.

## Testing & Verification

**Steps taken:**

```bash
# Commands run for verification
pnpm exec tsc --noEmit
pnpm build
pnpm validate:cv  # or other test commands
```

**Results:**

- ✅ TypeScript compilation: PASSED
- ✅ Production build: PASSED (XX pages, X.Xs)
- ✅ [Other verification steps]

## Dependencies

**Added:**

- `package-name@^version` - [Why needed]

**Updated:**

- `package-name@^old-version` → `^new-version` - [Why updated]

## Next Steps (Future Tasks)

How this connects to upcoming work. What should happen next.

## Troubleshooting Notes

Any issues encountered and how they were resolved. Useful for future reference.

## Verification Checklist

- [ ] All acceptance criteria met
- [ ] TypeScript compilation passes (strict mode)
- [ ] Production build successful
- [ ] Tests written/updated (if applicable)
- [ ] Documentation updated
- [ ] Architecture decisions documented with rationale
- [ ] Pre-commit hooks pass
- [ ] Ready for PR

## References

Links to relevant documentation, similar implementations, or research.
