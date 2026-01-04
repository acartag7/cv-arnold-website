# KV Data Seeding Guide

This document explains how to seed/populate the Cloudflare KV namespaces with CV data.

## KV Namespace IDs

| Environment | Namespace   | ID                                 |
| ----------- | ----------- | ---------------------------------- |
| Production  | CV_DATA     | `c9df8a4271984ad8bb0a02c30ff3568d` |
| Dev         | CV_DATA_DEV | `80606d373eff4764b8756c28026fdae9` |

## Key Structure

**IMPORTANT: There are TWO key formats in use!**

### Current Key Usage

| Component       | Key          | Format | Notes                                             |
| --------------- | ------------ | ------ | ------------------------------------------------- |
| Public Site SSR | `cv_data`    | Legacy | Used by `getCVData()` in `src/lib/get-cv-data.ts` |
| API Worker      | `cv:data:v1` | New    | Used by `KVStorageAdapter`                        |

Both keys should contain the same data for consistency.

### KVStorageAdapter Key Format (New)

```text
cv:data:v1      - Main CV data (full JSON document)
cv:metadata     - Metadata (lastUpdated, version info)
cv:section:{name}:v1 - Individual sections (optional caching)
```

### Legacy SSR Key Format

```text
cv_data         - Main CV data (used by public site SSR fallback)
```

## Seeding Production KV

### Option 1: Direct KV Write via Wrangler (Recommended for Initial Setup)

```bash
# Upload CV data to BOTH keys for consistency
# New format (API Worker)
npx wrangler kv key put "cv:data:v1" \
  --namespace-id=c9df8a4271984ad8bb0a02c30ff3568d \
  --path=src/data/cv-data.json \
  --remote

# Legacy format (Public Site SSR)
npx wrangler kv key put "cv_data" \
  --namespace-id=c9df8a4271984ad8bb0a02c30ff3568d \
  --path=src/data/cv-data.json \
  --remote

# Verify both keys were created
npx wrangler kv key list \
  --namespace-id=c9df8a4271984ad8bb0a02c30ff3568d \
  --remote
```

### Option 2: Via API (Requires Cloudflare Access Authentication)

```bash
# POST to the API endpoint (requires auth cookie from Cloudflare Access)
curl -X POST https://cv.arnoldcartagena.com/api/proxy/api/v1/cv \
  -H "Content-Type: application/json" \
  -H "Cookie: CF_Authorization=<your-auth-cookie>" \
  -d @src/data/cv-data.json
```

### Option 3: Via Admin Panel

1. Navigate to <https://cv.arnoldcartagena.com/admin>
2. Authenticate via Cloudflare Access (GitHub OAuth)
3. Use the import feature to upload `cv-data.json`

## Seeding Dev Environment

```bash
# Upload to dev KV namespace
npx wrangler kv key put "cv:data:v1" \
  --namespace-id=80606d373eff4764b8756c28026fdae9 \
  --path=src/data/cv-data.json \
  --remote
```

## Data Format

The CV data must conform to the Zod schema defined in `src/schemas/cv.schema.ts`.

Minimum required structure:

```json
{
  "version": "1.1.0",
  "lastUpdated": "2025-01-04T00:00:00.000Z",
  "personalInfo": {
    "name": "...",
    "title": "...",
    "email": "...",
    "location": "..."
  }
}
```

See `src/data/cv-data.json` for a complete example.

## Troubleshooting

### 404 "CV data not found"

This error means the KV namespace is empty. Solution:

1. Verify the KV namespace ID is correct
2. Verify the key format is `cv:data:v1`
3. Run the seeding command above

### Verifying Data

```bash
# List all keys in namespace
npx wrangler kv key list --namespace-id=<NAMESPACE_ID> --remote

# Get a specific key's value
npx wrangler kv key get "cv:data:v1" --namespace-id=<NAMESPACE_ID> --remote
```

### Understanding the Legacy Key

If you see a key named `cv_data` (without colons), this is the legacy format.
The new adapter uses `cv:data:v1`. Both may coexist, but the adapter reads
from `cv:data:v1`.

## Related Files

- `src/services/storage/KVStorageAdapter.ts` - KV adapter implementation
- `src/services/storage/KVConfig.ts` - Key format constants
- `src/data/cv-data.json` - Source CV data
- `src/workers/api/handlers/cv.ts` - API handlers that read from KV
