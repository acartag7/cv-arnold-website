# API Proxy Security Review

**Date:** 2026-01-03
**Pattern:** Backend for Frontend (BFF) / API Proxy
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
│   │  • Reads CF_ACCESS_CLIENT_ID from environment (secret)          │  │
│   │  • Reads CF_ACCESS_CLIENT_SECRET from environment (secret)      │  │
│   │  • Adds headers to outgoing request                             │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│        │                                                                │
└────────┼────────────────────────────────────────────────────────────────┘
         │
         │ 3. HTTPS request with service token headers
         │    CF-Access-Client-Id: xxxxx.access
         │    CF-Access-Client-Secret: xxxxx
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        SECURITY BOUNDARY                                 │
│                   (Cloudflare Access - Service Token)                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  api.arnoldcartagena.com/*  (Protected by Access)               │  │
│   │                                                                 │  │
│   │  Validates:                                                     │  │
│   │  • Service token (CF-Access-Client-Id + CF-Access-Client-Secret)│  │
│   │  • OR user email (if direct browser access with Access cookie)  │  │
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

| Layer                             | Protection        | Validates                       |
| --------------------------------- | ----------------- | ------------------------------- |
| Admin Panel (`/admin/*`)          | Cloudflare Access | GitHub OAuth (your emails only) |
| Proxy Route (`/api/proxy/*`)      | Cloudflare Access | GitHub OAuth (your emails only) |
| API (`api.arnoldcartagena.com/*`) | Cloudflare Access | Service token OR email          |

### 2. Service Token Security

| Aspect    | Implementation                                | Risk Mitigation                          |
| --------- | --------------------------------------------- | ---------------------------------------- |
| Storage   | Cloudflare Worker secrets (encrypted at rest) | Never in git, never in logs              |
| Injection | GitHub Actions at deploy time                 | Secrets not in wrangler.toml             |
| Exposure  | Server-side only (never sent to browser)      | Proxy runs in Worker, not client JS      |
| Rotation  | 1-year expiry, managed via Terraform          | Annual rotation reminder                 |
| Scope     | Only valid for CV API Access app              | Cannot access other Cloudflare resources |

### 3. Request Flow Security

```text
❌ BLOCKED: curl https://cv.arnoldcartagena.com/api/proxy/api/v1/cv
   → Cloudflare Access returns 403 (no valid session)

❌ BLOCKED: curl https://api.arnoldcartagena.com/api/v1/cv
   → Cloudflare Access returns 403 (no service token or session)

✅ ALLOWED: Browser with valid Access session → /api/proxy/* → API
   → User authenticated via GitHub OAuth
   → Proxy adds service token
   → API validates service token
```

---

## Threat Model

### Threats Mitigated

| Threat                           | Mitigation                                             |
| -------------------------------- | ------------------------------------------------------ |
| Unauthorized API access          | Cloudflare Access on both proxy and API                |
| Service token theft from browser | Token never sent to client (server-side only)          |
| Service token in git             | Stored in Cloudflare secrets + GitHub secrets          |
| Man-in-the-middle                | HTTPS enforced, TLS 1.2+ required                      |
| Cross-origin attacks             | Same-origin proxy, CORS not applicable                 |
| Session hijacking                | Cloudflare Access manages sessions with secure cookies |

### Residual Risks (Accepted)

| Risk                                  | Likelihood | Impact | Mitigation                                |
| ------------------------------------- | ---------- | ------ | ----------------------------------------- |
| Cloudflare breach                     | Very Low   | High   | Trust Cloudflare's security posture       |
| GitHub Actions compromise             | Low        | High   | Enable branch protection, require reviews |
| Service token expiry during operation | Low        | Low    | 1-year expiry, monitor renewal            |

---

## Comparison: Why This Pattern?

### Option 1: Public API + API-level Auth (Rejected)

```text
❌ Browser → API (with API key in request)
```

- API key would be visible in browser DevTools
- Anyone could extract and reuse the key

### Option 2: Same-origin API Routes (Considered)

```text
✓ Browser → /api/cv (Next.js API route with direct KV access)
```

- Would require moving all API logic into frontend
- Loses separation between frontend and API workers
- More complex deployment

### Option 3: BFF Proxy Pattern (Chosen) ✅

```text
✓ Browser → /api/proxy/* → API (with service token)
```

- Clean separation of concerns
- Service token never exposed to client
- Both endpoints protected by Access
- Industry standard pattern (Netflix, Spotify, etc.)

---

## Verification Checklist

- [x] Proxy route protected by Cloudflare Access
- [x] API protected by Cloudflare Access
- [x] Service token stored as secret (not in code)
- [x] Service token added server-side only
- [x] HTTPS enforced on all endpoints
- [x] Access policies restrict to allowed emails only
- [ ] Verify proxy returns 403 without valid Access session (manual test)
- [ ] Verify API returns 403 without service token (manual test)

---

## References

- [Cloudflare Access Service Tokens](https://developers.cloudflare.com/cloudflare-one/identity/service-tokens/)
- [Backend for Frontend Pattern](https://samnewman.io/patterns/architectural/bff/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
