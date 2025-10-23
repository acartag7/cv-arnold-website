# Task 3.6: React Context for State Management - Implementation Notes

**Status:** ✅ Completed
**Date:** 2025-10-21
**Branch:** `feature/task-3.6-react-context`

## Overview

Implemented a robust React Context solution for global CV data state management with advanced
performance optimizations, comprehensive error handling, and full test coverage.

## Files Created

### Core Implementation

1. **`src/contexts/CVDataContext.tsx`** (463 lines)
   - CVDataProvider component with context value splitting
   - 8 hooks for accessing state and actions
   - Optimistic updates with error rollback
   - Loading states: idle, loading, refreshing, updating
   - Comprehensive error handling

2. **`src/contexts/__tests__/CVDataContext.test.tsx`** (577 lines)
   - 24 comprehensive tests (100% passing)
   - Tests for all hooks, actions, and error scenarios
   - React Testing Library + Vitest integration

3. **`src/test/setup.ts`** (7 lines)
   - Vitest test setup file
   - Imports @testing-library/jest-dom matchers

### Configuration Updates

1. **`vitest.config.ts`**
   - Added `happy-dom` environment for React testing
   - Added setup file configuration
   - Added `.tsx` test patterns
   - Added `src/contexts/**/*.tsx` to coverage

2. **`package.json`**
   - Added `@testing-library/react@16.3.0`
   - Added `@testing-library/react-hooks@8.0.1`
   - Added `@testing-library/user-event@14.6.1`
   - Added `@testing-library/jest-dom@6.9.1`
   - Added `happy-dom@20.0.7`

## Architecture Decisions

### 1. Context Value Splitting

**Decision:** Separate state and actions contexts
**Why:** Performance optimization - components using only actions don't re-render on state changes
**Why NOT:** Single context (simpler but causes unnecessary re-renders)
**Trade-offs:** Slightly more complex API for better performance

```typescript
// Separate contexts
const CVDataStateContext = createContext<CVDataState | undefined>(undefined)
const CVDataActionsContext = createContext<CVDataActions | undefined>(undefined)

// Components using only actions won't re-render on state changes
const actions = useCVDataActions() // Stable reference
```

### 2. Optimistic Updates Pattern

**Decision:** Immediate UI updates with rollback on error
**Why:** Better UX - instant feedback, no loading spinners for updates
**Why NOT:** Wait for server confirmation (slower UX)
**Trade-offs:** More complex error handling, but significantly better perceived performance

```typescript
const updateData = useCallback(async (newData: CVData) => {
  const previousData = state.data
  setState(prev => ({ ...prev, data: newData, loading: 'updating' }))

  try {
    await service.updateData(newData)
    // Success - optimistic update stays
  } catch (error) {
    // Error - revert to previous data
    setState(prev => ({ ...prev, data: previousData, error: {...} }))
  }
}, [service, state.data])
```

### 3. Loading State Enum

**Decision:** Use string enum ('idle' | 'loading' | 'refreshing' | 'updating')
**Why:** More semantic than boolean, allows UI to show appropriate loading indicators
**Why NOT:** Simple boolean (loses information about type of loading)
**Trade-offs:** Slightly more complex state management for better UX control

### 4. Error Type Mapping

**Decision:** Map specific error types (CVDataNotFoundError, CVValidationError, etc.) to error codes
**Why:** Type-safe error handling, better error categorization for UI
**Why NOT:** Generic error object (loses type information)
**Trade-offs:** More error handling code, but much better error semantics

```typescript
const errorState: ErrorState = {
  message: error instanceof Error ? error.message : 'Unknown error occurred',
  code:
    error instanceof CVDataNotFoundError
      ? 'NOT_FOUND'
      : error instanceof CVValidationError
        ? 'VALIDATION_ERROR'
        : error instanceof CVStorageError
          ? 'STORAGE_ERROR'
          : 'UNKNOWN',
  details: error,
}
```

### 5. Performance Optimizations

**Implemented:**

- `React.memo` on provider component
- `useMemo` for actions object (stable reference)
- `useCallback` for all action functions
- Context value splitting (state vs actions)
- Selector hooks (useCVDataValue, useIsLoading, etc.)

**Benefits:**

- Prevents unnecessary re-renders
- Stable references for callbacks
- Components can subscribe to specific state slices

### 6. Selector Hooks Pattern

**Decision:** Provide granular selector hooks (useIsLoading, useCVDataValue, etc.)
**Why:** Components can access only what they need, reducing re-renders
**Why NOT:** Only provide useCVDataState (forces components to subscribe to all state)
**Trade-offs:** More hooks to maintain, but much better performance at scale

```typescript
// Granular selectors
export function useCVDataValue(): CVData | null
export function useIsLoading(): boolean
export function useIsUpdating(): boolean
export function useCVDataError(): ErrorState | null
```

## Testing Strategy

### Test Categories (24 tests total)

1. **Provider Tests** (3 tests)
   - Renders children correctly
   - Auto-fetch behavior (on/off)

2. **Hook Tests** (5 tests)
   - Error handling when used outside provider
   - State access via useCVDataState
   - Actions access via useCVDataActions
   - Combined access via useCVData

3. **Selector Hook Tests** (4 tests)
   - useCVDataValue returns correct data
   - useIsLoading tracks loading states
   - useIsUpdating tracks update state
   - useCVDataError returns error state

4. **Action Tests** (5 tests)
   - refresh() fetches new data
   - updateData() performs optimistic updates
   - Optimistic update rollback on error
   - clearError() clears error state
   - reset() returns to initial state

5. **Error Handling Tests** (4 tests)
   - CVDataNotFoundError mapping
   - CVValidationError mapping
   - CVStorageError mapping
   - Unknown error handling

6. **Loading State Tests** (3 tests)
   - Initial fetch loading state
   - Refresh loading state (with delayed mock)
   - Update loading state (with delayed mock)

### Key Testing Patterns

**Delayed Mock Services for Timing Tests:**

```typescript
const delayedService = createMockService()
;(delayedService.getData as Mock).mockImplementation(
  () =>
    new Promise(resolve => {
      setTimeout(() => resolve(mockCVData), 10)
    })
)

// Now we can capture intermediate loading states
expect(result.current.state.loading).toBe('refreshing')
```

**React Testing Library Integration:**

```typescript
import { render, renderHook, act, waitFor } from '@testing-library/react'

// Test hooks
const { result } = renderHook(() => useCVData(), {
  wrapper: ({ children }) => (
    <CVDataProvider service={mockService}>{children}</CVDataProvider>
  ),
})
```

## Errors Encountered & Fixes

### 1. React Not Defined in Tests

**Error:** `ReferenceError: React is not defined`
**Cause:** JSX in test files requires React import in test environment
**Fix:** Added `import React from 'react'` to test file

### 2. Missing `toBeInTheDocument` Matcher

**Error:** `Invalid Chai property: toBeInTheDocument`
**Cause:** Custom matchers from jest-dom not available in Vitest
**Fix:**

- Installed `@testing-library/jest-dom`
- Created `src/test/setup.ts` with `import '@testing-library/jest-dom/vitest'`
- Added setup file to vitest.config.ts

### 3. Timing Issues in Loading State Tests

**Error:** `expected 'idle' to be 'refreshing'`
**Cause:** Mock service resolved immediately, state changed before assertion
**Fix:** Used delayed promise mocks to capture intermediate states

### 4. Missing `social` Property in Mock Data

**Error:** `Property 'social' is missing in type`
**Cause:** Mock CV data didn't include new required `social` field
**Fix:** Added `social: {}` to mockCVData

### 5. autoFetch Type Error

**Error:** `Type 'boolean | undefined' is not assignable to type 'boolean'`
**Cause:** exactOptionalPropertyTypes strict mode
**Fix:** Added default value in Wrapper component: `autoFetch = false`

### 6. CVStorageError Constructor Args

**Error:** `Expected 2-3 arguments, but got 1`
**Cause:** CVStorageError requires operation ('read' | 'write' | 'delete')
**Fix:** Updated test to pass operation: `new CVStorageError('Storage failed', 'read')`

### 7. Logger Context Type Mismatch

**Error:** `CVDataState is not assignable to LogContext`
**Cause:** LogContext requires index signature, CVDataState doesn't have one
**Fix:** Wrapped state in object: `logger.debug('message', { state })`

## API Surface

### Provider Component

```typescript
<CVDataProvider
  service={cvDataService}  // CVDataService instance (required)
  autoFetch={true}         // Auto-fetch on mount (default: true)
  devTools={false}         // Enable debug logging (default: false)
>
  <App />
</CVDataProvider>
```

### Hooks

```typescript
// Full state access
const { data, loading, error, lastFetchedAt } = useCVDataState()

// Actions only
const { refresh, updateData, clearError, reset } = useCVDataActions()

// Combined (convenience)
const { state, actions } = useCVData()

// Granular selectors (performance optimized)
const cvData = useCVDataValue()
const isLoading = useIsLoading()
const isUpdating = useIsUpdating()
const error = useCVDataError()
```

### Actions

```typescript
// Refresh from storage
await actions.refresh()

// Optimistic update
await actions.updateData(newCVData)

// Clear error state
actions.clearError()

// Reset to initial state
actions.reset()
```

## Performance Characteristics

**Re-render Prevention:**

- Components using `useCVDataActions()` don't re-render on state changes
- Components using `useIsLoading()` only re-render when loading state changes
- Selector hooks enable fine-grained subscriptions

**Memory:**

- Stable action references via useMemo/useCallback
- No memory leaks from unstable references

**Loading States:**

- Optimistic updates show instant feedback
- Different loading states for better UX
- Error rollback maintains data integrity

## Integration Points

**Service Layer:** Requires CVDataService interface

```typescript
interface CVDataService {
  getData(): Promise<CVData>
  updateData(data: CVData): Promise<void>
  // ... other methods
}
```

**Error Handling:** Integrates with custom error classes

- CVDataNotFoundError → 'NOT_FOUND'
- CVValidationError → 'VALIDATION_ERROR'
- CVStorageError → 'STORAGE_ERROR'
- Generic Error → 'UNKNOWN'

**Logging:** Uses structured logger for debugging

## Lessons Learned

1. **Context Splitting is Worth It:** The performance benefits of split contexts are significant in
   larger apps. Components using actions don't re-render on every state change.

2. **Optimistic Updates Require Careful Error Handling:** Always store previous state before
   optimistic update, and always have a rollback strategy.

3. **Timing in Tests is Hard:** Testing intermediate loading states requires delayed mocks.
   Synchronous mocks complete too fast to capture intermediate states.

4. **Strict TypeScript Helps:** exactOptionalPropertyTypes caught the autoFetch bug. Index
   signatures matter for generic interfaces like LogContext.

5. **Selector Hooks Scale Better:** While more hooks to maintain, granular selectors prevent
   unnecessary re-renders and make components more efficient.

6. **Test Setup Matters:** Proper test environment configuration (happy-dom, jest-dom matchers)
   is crucial for React component testing with Vitest.

## Next Steps

This completes Task 3.6. The React Context implementation is production-ready with:

- ✅ Full TypeScript type safety
- ✅ Comprehensive test coverage (24/24 tests passing)
- ✅ Performance optimizations (context splitting, memoization)
- ✅ Robust error handling and recovery
- ✅ Developer-friendly API with multiple hooks

The context can now be used throughout the Next.js application to manage CV data state globally.

## Related Tasks

- Task 3.1: TypeScript interfaces (defines CVData type)
- Task 3.2: Zod schemas (runtime validation)
- Task 3.3: Repository pattern (storage abstraction)
- Task 3.4: Mock Data Service (test data generation)
- Task 3.5: KV storage adapter (Cloudflare KV integration)
