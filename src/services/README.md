# Services

Service layer for API calls, data management, and business logic.

## Structure

- **`api/`** - API service classes and endpoints
- **`data/`** - Data transformation and processing utilities
- **`storage/`** - Local storage and caching utilities

## Usage

Services provide abstracted interfaces for external dependencies:

```tsx
import { CVDataService } from '@/services/api'
import { StorageService } from '@/services/storage'

const data = await CVDataService.fetchProfile()
```

## Conventions

- All services use TypeScript interfaces
- Error handling is consistent across services
- Services are singleton classes where appropriate
- Async operations use proper error boundaries
