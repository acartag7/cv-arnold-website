# Cloudflare Deployment Guide

## Complete Setup Instructions for CV Website

### Document Version

- **Version**: 1.0
- **Date**: August 3, 2025
- **Purpose**: Step-by-step Cloudflare deployment instructions
- **Requirements**: Cloudflare account (free tier), GitHub account

---

## Prerequisites

### Required Accounts

- [ ] Cloudflare account (free tier)
- [ ] GitHub account
- [ ] Domain already in Cloudflare (cv.arnoldcartagena.com)

### Required Tools

```bash
# Node.js 18+ and pnpm
node --version  # Should be 18.x or higher
pnpm --version  # Should be 9.x or higher

# Install pnpm globally (if not already installed)
npm install -g pnpm

# Wrangler CLI for Cloudflare Workers
pnpm install -g wrangler
wrangler --version  # Should be 3.x

# Git
git --version
```

---

## 1. Project Setup

### 1.1 Clone Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/cv-arnold-website.git
cd cv-arnold-website

# Install dependencies
pnpm install

# Test local development
pnpm run dev
```

### 1.2 Environment Variables

```bash
# Create .env.local for development
cp .env.example .env.local

# Required variables
NEXT_PUBLIC_API_URL=http://localhost:8787
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
KV_NAMESPACE_ID=your_kv_namespace_id
ADMIN_AUTH_TOKEN=your_secure_admin_token
```

---

## 2. Cloudflare Pages Setup

### 2.1 Create Pages Project

1. **Login to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Select your account

2. **Create Pages Project**

   ```
   Workers & Pages → Create application → Pages → Connect to Git
   ```

3. **Configure GitHub Integration**
   - Authorize Cloudflare to access your GitHub
   - Select the `cv-arnold-website` repository
   - Click "Begin setup"

4. **Build Configuration**

   ```yaml
   Project name: cv-arnold-website
   Production branch: main

   Build settings:
     Framework preset: Next.js
     Build command: pnpm run build
     Build output directory: .next

   Environment variables:
     NODE_VERSION: 18
     NEXT_PUBLIC_API_URL: https://api.cv.arnoldcartagena.com
   ```

5. **Deploy**
   - Click "Save and Deploy"
   - Wait for initial deployment (~2-3 minutes)

### 2.2 Custom Domain Setup

1. **Add Custom Domain**

   ```
   Pages project → Custom domains → Add custom domain
   ```

2. **Configure Domain**

   ```
   Domain: cv.arnoldcartagena.com
   ```

3. **DNS Configuration** (Should auto-configure if domain is in Cloudflare)
   ```
   Type: CNAME
   Name: cv
   Content: cv-arnold-website.pages.dev
   Proxy: Yes (Orange cloud)
   ```

---

## 3. Workers Setup (API)

### 3.1 Create Workers Project

```bash
# Navigate to workers directory
cd workers/api

# Initialize wrangler
wrangler init

# Configure wrangler.toml
```

### 3.2 Wrangler Configuration

```toml
# workers/api/wrangler.toml
name = "cv-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.production]
routes = [
  { pattern = "api.cv.arnoldcartagena.com/*", zone_name = "arnoldcartagena.com" }
]

[[kv_namespaces]]
binding = "CV_DATA"
id = "your_kv_namespace_id"

[vars]
ALLOWED_ORIGIN = "https://cv.arnoldcartagena.com"
```

### 3.3 Create KV Namespace

```bash
# Create KV namespace
wrangler kv:namespace create "CV_DATA"

# Output will show:
# { binding = "CV_DATA", id = "abcd1234..." }
# Add this ID to wrangler.toml
```

### 3.4 Deploy Worker

```bash
# Deploy to Cloudflare
wrangler deploy

# Verify deployment
curl https://api.cv.arnoldcartagena.com/health
```

---

## 4. Data Migration

### 4.1 Prepare CV Data

```bash
# Run migration script
cd scripts
python migrate_data.py

# This will:
# 1. Read data from src/data/cv-data.json
# 2. Transform to KV format
# 3. Upload to Cloudflare KV
```

### 4.2 Manual KV Upload (Alternative)

```bash
# Upload CV data to KV
wrangler kv:key put --binding=CV_DATA "cv-data:current" < cv-data.json

# Verify data
wrangler kv:key get --binding=CV_DATA "cv-data:current"
```

### 4.3 Set Metadata

```bash
# Set version
wrangler kv:key put --binding=CV_DATA "cv-data:version" "1.0.0"

# Set metadata
wrangler kv:key put --binding=CV_DATA "cv-data:metadata" '{"lastUpdated":"2025-08-03T10:00:00Z","updateCount":1}'
```

---

## 5. GitHub Actions CI/CD

### 5.1 Create Workflow File

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}

      - name: Deploy to Cloudflare Pages
        if: github.ref == 'refs/heads/main'
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: cv-arnold-website
          directory: .next
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### 5.2 Configure GitHub Secrets

```
Repository → Settings → Secrets → Actions

Add secrets:
- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID
- NEXT_PUBLIC_API_URL
- ADMIN_AUTH_TOKEN
```

---

## 6. Environment Configuration

### 6.1 Cloudflare Pages Environment Variables

```bash
# Production variables
NEXT_PUBLIC_API_URL=https://api.cv.arnoldcartagena.com
NODE_VERSION=18

# Preview variables (for PRs)
NEXT_PUBLIC_API_URL=https://api-preview.cv.arnoldcartagena.com
```

### 6.2 Workers Environment Variables

```bash
# Set via wrangler
wrangler secret put ADMIN_AUTH_TOKEN
# Enter token when prompted
```

---

## 7. DNS Configuration

### 7.1 Required DNS Records

```
# Main site
Type: CNAME
Name: cv
Content: cv-arnold-website.pages.dev
Proxy: Yes

# API subdomain
Type: CNAME
Name: api.cv
Content: cv-api.workers.dev
Proxy: Yes
```

### 7.2 SSL/TLS Settings

```
SSL/TLS → Overview → Full (strict)
SSL/TLS → Edge Certificates → Always Use HTTPS: ON
```

---

## 8. Performance Configuration

### 8.1 Page Rules

```
# Cache static assets
URL: cv.arnoldcartagena.com/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month

# API caching
URL: api.cv.arnoldcartagena.com/cv-data
Settings:
  - Cache Level: Standard
  - Edge Cache TTL: 5 minutes
```

### 8.2 Optimization Settings

```
Speed → Optimization →
  - Auto Minify: HTML, CSS, JS
  - Brotli: On
  - Early Hints: On
  - Rocket Loader: Off (conflicts with Next.js)
```

---

## 9. Monitoring Setup

### 9.1 Analytics

```
Analytics → Web Analytics →
  - Add site: cv.arnoldcartagena.com
  - Install JS snippet (automatic with Pages)
```

### 9.2 Error Tracking

```javascript
// Add to Workers
addEventListener('fetch', event => {
  event.respondWith(
    handleRequest(event.request).catch(err => {
      // Log to Cloudflare Analytics
      event.waitUntil(logError(err, event.request))
      return errorResponse(err)
    })
  )
})
```

---

## 10. Testing & Validation

### 10.1 Deployment Checklist

- [ ] Site loads at cv.arnoldcartagena.com
- [ ] API responds at api.cv.arnoldcartagena.com
- [ ] CV data loads correctly
- [ ] Theme switching works
- [ ] Mobile responsive
- [ ] Download CV works
- [ ] Contact form functional
- [ ] Analytics tracking

### 10.2 Performance Testing

```bash
# Lighthouse CI
pnpm install -g @lhci/cli
lhci autorun

# Speed test
curl -w "@curl-format.txt" -o /dev/null -s https://cv.arnoldcartagena.com
```

### 10.3 Security Headers

```bash
# Check security headers
curl -I https://cv.arnoldcartagena.com

# Should include:
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
# - Content-Security-Policy: ...
```

---

## 11. Maintenance

### 11.1 Updating Content

```bash
# Update via API
curl -X PUT https://api.cv.arnoldcartagena.com/cv-data \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d @updated-cv-data.json
```

### 11.2 Rollback Procedure

```bash
# Pages rollback
# Dashboard → Pages → cv-arnold-website → Deployments →
# Find previous deployment → Rollback

# Workers rollback
wrangler rollback
```

### 11.3 Backup Strategy

```bash
# Backup KV data
wrangler kv:key get --binding=CV_DATA "cv-data:current" > backup-$(date +%Y%m%d).json

# Automated daily backup via GitHub Actions
```

---

## 12. Troubleshooting

### Common Issues

1. **Build Fails**

   ```bash
   # Check Node version
   # Verify environment variables
   # Check build logs in Cloudflare dashboard
   ```

2. **Custom Domain Not Working**

   ```bash
   # Verify DNS propagation
   dig cv.arnoldcartagena.com

   # Check SSL certificate
   ```

3. **API Not Responding**

   ```bash
   # Check Worker logs
   wrangler tail

   # Verify KV binding
   ```

4. **Performance Issues**

   ```bash
   # Check cache headers
   curl -I https://cv.arnoldcartagena.com

   # Review Analytics for slow endpoints
   ```

---

## 13. Cost Monitoring (Free Tier Limits)

### Cloudflare Free Tier Includes:

- **Pages**: Unlimited sites, 500 builds/month
- **Workers**: 100,000 requests/day
- **KV**: 100,000 reads/day, 1,000 writes/day
- **Analytics**: Basic analytics included

### Monitoring Usage:

```
Dashboard → Workers & Pages → cv-api → Analytics
Dashboard → Workers & Pages → cv-arnold-website → Analytics
```

---

## 14. Next Steps

After deployment:

1. **Test Everything**: Run through full test checklist
2. **Monitor**: Watch analytics for first 24 hours
3. **Optimize**: Based on real usage data
4. **Document**: Any custom configurations
5. **Share**: Your awesome new CV website!

---

## Support Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)
- [Workers Documentation](https://developers.cloudflare.com/workers)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler)

---

This guide provides everything needed to deploy and maintain the CV website on Cloudflare's free tier. Follow each section carefully and test thoroughly at each step.
