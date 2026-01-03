# Enterprise Architecture Implementation Plan

**Branch:** `feat/terraform-iac`
**Created:** 2026-01-03
**Status:** In Progress

---

## Executive Summary

Refactoring CV Arnold Website from messy infrastructure to enterprise-grade with:

- Proper security (API protected by Cloudflare Access)
- Clean URL structure (custom domains, no random workers.dev URLs)
- Dev environment for safe testing
- Infrastructure as Code (Terraform)
- **Trunk-Based Development with Release Please** (no develop branch)

---

## Target Architecture

### URLs

| Environment | Type     | URL                                | Worker                  |
| ----------- | -------- | ---------------------------------- | ----------------------- |
| Production  | Frontend | `cv.arnoldcartagena.com`           | `cv-arnold-website`     |
| Production  | Admin    | `cv.arnoldcartagena.com/admin`     | (same)                  |
| Production  | API      | `api.arnoldcartagena.com`          | `cv-arnold-api`         |
| Dev         | Frontend | `dev-cv.arnoldcartagena.com`       | `cv-arnold-website-dev` |
| Dev         | Admin    | `dev-cv.arnoldcartagena.com/admin` | (same)                  |
| Dev         | API      | `api-dev.arnoldcartagena.com`      | `cv-arnold-api-dev`     |

### Security

- **Public site** (`/`): No authentication required, uses SSR
- **Admin** (`/admin/*`): Protected by Cloudflare Access (GitHub OAuth)
- **API** (`api.*/*`): Protected by Cloudflare Access (same session)

### KV Namespaces

| Environment | CV Data     | Rate Limit        | History        |
| ----------- | ----------- | ----------------- | -------------- |
| Production  | CV_DATA     | RATE_LIMIT_KV     | CV_HISTORY     |
| Dev         | CV_DATA_DEV | RATE_LIMIT_KV_DEV | CV_HISTORY_DEV |

---

## Branching & Release Strategy

### Trunk-Based Development with Release Please

```text
Feature Branch → PR → main (auto-deploys to dev)
                      ↓
              Release Please creates Release PR
                      ↓
              Merge Release PR → Tag v1.0.0 → Production
```

### Deployment Triggers

| Trigger          | Environment | URLs                                                        |
| ---------------- | ----------- | ----------------------------------------------------------- |
| Push to `main`   | Dev         | `dev-cv.arnoldcartagena.com`, `api-dev.arnoldcartagena.com` |
| Pull Request     | Preview     | Temporary preview URL                                       |
| Release tag `v*` | Production  | `cv.arnoldcartagena.com`, `api.arnoldcartagena.com`         |

### Release Please Workflow

1. Push conventional commits to `main` (e.g., `feat:`, `fix:`, `chore:`)
2. Release Please automatically creates/updates a "Release PR"
3. The Release PR contains:
   - Updated `CHANGELOG.md`
   - Version bump in `package.json`
4. When ready for production, merge the Release PR
5. GitHub release is created with semantic version tag (e.g., `v1.2.0`)
6. Tag triggers production deployment workflows

### Commit Types

| Type                           | Version Bump          | Example         |
| ------------------------------ | --------------------- | --------------- |
| `feat:`                        | Minor (1.0.0 → 1.1.0) | New feature     |
| `fix:`                         | Patch (1.0.0 → 1.0.1) | Bug fix         |
| `feat!:` or `BREAKING CHANGE:` | Major (1.0.0 → 2.0.0) | Breaking change |
| `chore:`, `docs:`, `refactor:` | None                  | Maintenance     |

---

## Implementation Phases

### Phase 1: Terraform Infrastructure ✅ DONE

**Files Changed:**

- `infrastructure/cloudflare/main.tf` - Complete rewrite
- `infrastructure/cloudflare/variables.tf` - Simplified
- `infrastructure/cloudflare/outputs.tf` - Better organized
- `infrastructure/cloudflare/imports.tf` - Added moved blocks

**Key Changes:**

- Added `api.arnoldcartagena.com` domain → `cv-arnold-api`
- Added `dev-cv.arnoldcartagena.com` domain → `cv-arnold-website-dev`
- Added `api-dev.arnoldcartagena.com` domain → `cv-arnold-api-dev`
- Added Cloudflare Access protection for API
- Renamed staging KV namespaces to dev
- Added `moved` blocks to preserve state

---

### Phase 2: Wrangler Configuration ✅ DONE

**Files Updated:**

- `wrangler.toml` (API Worker) - Added dev environment
- `wrangler.pages.toml` (Frontend Worker) - Added dev environment

---

### Phase 3: CI/CD Workflows with Release Please ✅ DONE

**Files Created:**

- `.github/workflows/release-please.yml` - Automated releases
- `release-please-config.json` - Release Please configuration
- `.release-please-manifest.json` - Version tracking

**Files Updated:**

- `.github/workflows/deploy.yml` - Trunk-based deployment
- `.github/workflows/deploy-api.yml` - Trunk-based deployment

**Files Deleted:**

- `.github/workflows/claude.yml` - Unused workflow

---

### Phase 4: Frontend API URL ⏳ PENDING

**Goal:** Verify frontend uses correct API URL

**Files to Check:**

- `src/services/admin/AdminDataService.ts` - Verify uses env var

**Verification:**

```typescript
// Should use NEXT_PUBLIC_API_URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
```

---

### Phase 5: Public Site SSR ⏳ PENDING

**Goal:** Ensure public CV page doesn't need client-side API calls

**Investigation Needed:**

1. Check how public page fetches CV data
2. If client-side: Convert to server-side (getServerSideProps or server component)
3. If already SSR: Verify it works without public API access

**Alternative:** Allow GET /api/v1/cv as public (read-only), protect write operations only.

---

### Phase 6: Testing & Deployment ⏳ PENDING

**Pre-Deployment Checklist:**

- [ ] Run `terraform plan` - verify no destructive changes
- [ ] Review plan output carefully
- [ ] Backup current state

**Deployment Steps:**

1. `terraform apply` - Create new domains and access rules
2. Deploy API worker with new config (manual trigger to dev)
3. Deploy frontend worker with new API URL (manual trigger to dev)
4. Test dev environment:
   - [ ] Visit `dev-cv.arnoldcartagena.com` - should work (public)
   - [ ] Visit `dev-cv.arnoldcartagena.com/admin` - should prompt login
   - [ ] After login, admin should work
   - [ ] API calls from admin should work (same session)
5. Create first release:
   - [ ] Merge Release Please PR (or create initial tag manually)
   - [ ] Verify production deployment triggered
   - [ ] Test production environment

**Rollback Plan:**

- Terraform state is versioned
- Can revert to previous commit
- workers.dev URLs still work as fallback

---

### Phase 7: Cleanup ⏳ PENDING

**Tasks:**

- [ ] Remove old staging references from code
- [ ] Update README with new architecture
- [ ] Document release process
- [ ] Archive or delete unused resources

---

## Risk Mitigation

| Risk                              | Mitigation                                |
| --------------------------------- | ----------------------------------------- |
| Terraform destroys resources      | `moved` blocks + careful plan review      |
| API inaccessible during migration | Deploy in stages, test each step          |
| Auth breaks                       | Test auth flow before announcing          |
| Public site breaks                | SSR ensures site works without client API |

---

## Success Criteria

- [ ] `cv.arnoldcartagena.com` loads public CV
- [ ] `cv.arnoldcartagena.com/admin` requires authentication
- [ ] `api.arnoldcartagena.com` requires authentication
- [ ] Admin can CRUD CV data after login
- [ ] `dev-cv.arnoldcartagena.com` works independently
- [ ] Dev environment uses separate KV data
- [ ] No public access to API (except via authenticated session)
- [ ] All infrastructure managed by Terraform
- [ ] Release Please creates automated releases
- [ ] Tags trigger production deployments

---

## Files Modified Summary

### Created

- `.github/workflows/release-please.yml`
- `release-please-config.json`
- `.release-please-manifest.json`
- `.taskmaster/docs/enterprise-architecture-plan.md`

### Modified

- `infrastructure/cloudflare/main.tf`
- `infrastructure/cloudflare/variables.tf`
- `infrastructure/cloudflare/outputs.tf`
- `infrastructure/cloudflare/imports.tf`
- `wrangler.toml`
- `wrangler.pages.toml`
- `.github/workflows/deploy.yml`
- `.github/workflows/deploy-api.yml`

### Deleted

- `.github/workflows/claude.yml`

---

## Notes

- Branch: `feat/terraform-iac`
- This refactor demonstrates enterprise patterns for the portfolio
- workers.dev URLs will become internal-only (not advertised)
- Release Please starts at v0.1.0
