# KV Data Seeding Guide

This document explains how to seed/populate the Cloudflare KV namespaces with CV data.

## KV Namespace IDs

| Environment | Namespace   | ID                                 |
| ----------- | ----------- | ---------------------------------- |
| Production  | CV_DATA     | `c9df8a4271984ad8bb0a02c30ff3568d` |
| Dev         | CV_DATA_DEV | `80606d373eff4764b8756c28026fdae9` |

## Key Structure

All components use the **unified key format**:

| Key                    | Purpose                                     |
| ---------------------- | ------------------------------------------- |
| `cv:data:v1`           | Main CV data (full JSON document)           |
| `cv:metadata`          | Metadata (lastUpdated, version info)        |
| `cv:section:{name}:v1` | Individual sections (optional, for caching) |

### Components Using This Format

- **Public Site SSR**: `getCVData()` in `src/lib/get-cv-data.ts`
- **API Worker**: `KVStorageAdapter` in `src/services/storage/`

> **Note**: Previously, the public site used a legacy `cv_data` key format.
> This was unified in January 2026. If you see old `cv_data` keys in KV,
> they can be safely deleted.

## Seeding Production KV

### Option 1: Direct KV Write via Wrangler (Recommended for Initial Setup)

```bash
# Upload CV data to production KV
npx wrangler kv key put "cv:data:v1" \
  --namespace-id=c9df8a4271984ad8bb0a02c30ff3568d \
  --path=src/data/cv-data.json \
  --remote

# Verify the key was created
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

This error means the KV namespace is empty. The error message now includes
the key name and seeding hint:

```text
CV data not found. KV key "cv:data:v1" is empty.
Seed with: npx wrangler kv key put "cv:data:v1" --path=src/data/cv-data.json --remote
```

**Solution:**

1. Verify the KV namespace ID is correct
2. Run the seeding command from the error message

### Verifying Data

```bash
# List all keys in namespace
npx wrangler kv key list --namespace-id=<NAMESPACE_ID> --remote

# Get a specific key's value
npx wrangler kv key get "cv:data:v1" --namespace-id=<NAMESPACE_ID> --remote
```

### Cleaning Up Legacy Keys

If you see a key named `cv_data` (without colons), this is the legacy format
that is no longer used. You can safely delete it:

```bash
npx wrangler kv key delete "cv_data" \
  --namespace-id=c9df8a4271984ad8bb0a02c30ff3568d \
  --remote
```

## Related Files

- `src/lib/get-cv-data.ts` - Public site SSR data fetching
- `src/services/storage/KVStorageAdapter.ts` - API worker KV adapter
- `src/services/storage/KVConfig.ts` - Key format constants
- `src/data/cv-data.json` - Source CV data
- `src/workers/api/handlers/cv.ts` - API handlers that read from KV
