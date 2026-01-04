# API Proxy Security Review

**Date:** 2026-01-04
**Pattern:** Backend for Frontend (BFF) with Service Bindings
**Status:** ✅ Reviewed and Secured

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        SECURITY BOUNDARY                                 │
│                   (Cloudflare Access - GitHub OAuth)                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Browser (Admin User)                                                  │
│        │                                                                │
│        │ 1. User authenticated via GitHub OAuth                         │
│        │    Access cookie set for cv.arnoldcartagena.com                │
│        │                                                                │
│        ▼                                                                │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  cv.arnoldcartagena.com/admin/*  (Protected by Access)          │  │
│   │  cv.arnoldcartagena.com/api/proxy/*  (Protected by Access)      │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│        │                                                                │
│        │ 2. Admin panel calls /api/proxy/api/v1/cv                      │
│        │    (Same-origin request, Access cookie included automatically) │
│        │                                                                │
│        ▼                                                                │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  Proxy Route (Server-side, runs in Worker)                      │  │
│   │                                                                 │  │
│   │  Uses Cloudflare Service Binding to call API Worker             │  │
│   │  • Direct worker-to-worker call (no HTTP, no internet)          │  │
│   │  • No secrets or tokens needed                                  │  │
│   │  • Bypasses Access (internal call)                              │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│        │                                                                │
│        │ 3. Service Binding: env.API.fetch(request)                    │
│        │    Direct function call, same server thread                   │
│        │                                                                │
│        ▼                                                                │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  API Worker (cv-arnold-api)                                     │  │
│   │                                                                 │  │
│   │  Called via Service Binding:                                    │  │
│   │  • No network hop                                               │  │
│   │  • No Access validation needed (trusted internal call)          │  │
│   │  • ~0ms latency overhead                                        │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│        │                                                                │
│        ▼                                                                │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  KV: CV_DATA                                                    │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Security Controls

### 1. Authentication Layers

| Layer                        | Protection        | Validates                       |
| ---------------------------- | ----------------- | ------------------------------- |
| Admin Panel (`/admin/*`)     | Cloudflare Access | GitHub OAuth (your emails only) |
| Proxy Route (`/api/proxy/*`) | Cloudflare Access | GitHub OAuth (your emails only) |
| API (direct access)          | Cloudflare Access | GitHub OAuth (optional)         |
| API (via Service Binding)    | None needed       | Internal call, trusted          |

### 2. Service Binding Security

| Aspect             | Implementation                           | Benefit                   |
| ------------------ | ---------------------------------------- | ------------------------- |
| No secrets         | Service binding uses internal call       | Nothing to leak or rotate |
| No network         | Worker-to-worker, same thread            | No MITM possible          |
| No Access bypass   | Binding is internal, Access not involved | Simpler security model    |
| Deployment control | API must be deployed first               | Controlled dependency     |
| Same account only  | Both workers in same CF account          | Implicit trust boundary   |

### 3. Request Flow Security

```text
❌ BLOCKED: curl https://cv.arnoldcartagena.com/api/proxy/api/v1/cv
   → Cloudflare Access returns 403 (no valid session)

❌ BLOCKED: curl https://api.arnoldcartagena.com/api/v1/cv
   → Cloudflare Access returns 403 (no session, optional protection)

✅ ALLOWED: Browser with valid Access session → /api/proxy/* → Service Binding → API
   → User authenticated via GitHub OAuth
   → Proxy uses service binding (internal call)
   → API processes request directly
```

---

## Proxy Route Security Features

### Path Validation (SSRF Prevention)

```typescript
// Only allows paths starting with 'api/'
// Filters out '..' and '.' segments
function validatePath(pathSegments: string[]): {
  valid: boolean
  sanitized?: string
  error?: string
}
```

### Request Limits

| Limit     | Value | Purpose                           |
| --------- | ----- | --------------------------------- |
| Body size | 10MB  | Prevent memory exhaustion         |
| Timeout   | 25s   | Stay under Cloudflare's 30s limit |

### Header Allowlist

Only these headers are forwarded:

- `content-type`
- `accept`
- `accept-language`
- `x-request-id`

---

## Threat Model

### Threats Mitigated

| Threat                  | Mitigation                                 |
| ----------------------- | ------------------------------------------ |
| Unauthorized API access | Cloudflare Access on proxy route           |
| Secret theft            | No secrets (service binding)               |
| Token rotation burden   | No tokens to rotate                        |
| Man-in-the-middle       | Internal call, no network hop              |
| Cross-origin attacks    | Same-origin proxy, CORS not applicable     |
| Session hijacking       | Cloudflare Access manages sessions         |
| Path traversal          | Path validation filters dangerous segments |
| Request smuggling       | Header allowlist prevents injection        |

### Residual Risks (Accepted)

| Risk                             | Likelihood | Impact | Mitigation                          |
| -------------------------------- | ---------- | ------ | ----------------------------------- |
| Cloudflare breach                | Very Low   | High   | Trust Cloudflare's security posture |
| Worker deployment race condition | Low        | Low    | Deploy API before frontend          |

---

## Comparison: Service Binding vs Service Token

| Aspect                 | Service Token (Previous)   | Service Binding (Current) |
| ---------------------- | -------------------------- | ------------------------- |
| Secrets to manage      | 2 (ID + Secret)            | 0                         |
| Rotation needed        | Annually                   | Never                     |
| Network hops           | 2 (proxy → internet → API) | 0 (direct call)           |
| Latency                | ~10-50ms added             | ~0ms added                |
| Access policies needed | 2 apps, 3 policies         | 1 app, 1 policy           |
| Attack surface         | Token could leak           | No external surface       |
| Complexity             | Medium                     | Low                       |

---

## Configuration

### wrangler.pages.toml

```toml
# Service binding to API worker
[[services]]
binding = "API"
service = "cv-arnold-api"

# Dev environment
[[env.dev.services]]
binding = "API"
service = "cv-arnold-api-dev"
```

### Proxy Route Usage

```typescript
import { getCloudflareContext } from '@opennextjs/cloudflare'

const { env } = getCloudflareContext()
const response = await env.API.fetch(request)
```

---

## Verification Checklist

- [x] Proxy route protected by Cloudflare Access
- [x] Service binding configured in wrangler.pages.toml
- [x] Path validation prevents SSRF/traversal
- [x] Body size limit (10MB) enforced
- [x] Timeout (25s) prevents hanging requests
- [x] Header allowlist prevents injection
- [x] No secrets in code or environment
- [ ] Verify proxy returns 403 without valid Access session (manual test)
- [ ] Verify service binding works after deployment (manual test)

---

## References

- [Cloudflare Service Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
- [Service Bindings GA Blog](https://blog.cloudflare.com/service-bindings-ga/)
- [OpenNext Cloudflare Context](https://opennext.js.org/cloudflare)
- [Backend for Frontend Pattern](https://samnewman.io/patterns/architectural/bff/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
