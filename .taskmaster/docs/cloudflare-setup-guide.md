# Cloudflare Setup Guide for CV Admin CMS

This guide documents all Cloudflare configuration completed for the Admin CMS portal.

**Cost:** All features use Cloudflare Free Tier ($0/month)

**Completed:** January 1, 2026

---

## Summary of What Was Configured

| Service      | Resource                   | ID/Name                                |
| ------------ | -------------------------- | -------------------------------------- |
| KV Namespace | CV_DATA                    | `c9df8a4271984ad8bb0a02c30ff3568d`     |
| KV Namespace | RATE_LIMIT_KV              | `30a87d8776c04d54a423fdd4e84cba5f`     |
| KV Namespace | CV_HISTORY                 | `0c0ada9ed85a427fb87b97bd5761e407`     |
| R2 Bucket    | cv-assets                  | `cv-assets`                            |
| Access Team  | arnoldcartagena            | `arnoldcartagena.cloudflareaccess.com` |
| Access App   | CV Admin Portal            | AUD: `20f09cf4ff703120bd78...`         |
| Tunnel       | cv-dev                     | `4aac86d4-f18b-4154-a0e5-bff691dde7da` |
| DNS Route    | dev-cv.arnoldcartagena.com | Points to tunnel                       |

---

## Prerequisites

- Cloudflare account (free)
- Domain configured in Cloudflare DNS
- Node.js 18+ installed
- wrangler CLI: `pnpm add -D wrangler`
- cloudflared CLI: `brew install cloudflared`

---

## Step 1: Wrangler CLI Authentication

```bash
# Login to Cloudflare via browser
npx wrangler login

# Verify authentication
npx wrangler whoami
```

---

## Step 2: Create KV Namespaces

### 2.1 CV_DATA (main CV storage)

```bash
npx wrangler kv namespace create CV_DATA
```

Output:

```text
🌀 Creating namespace with title "CV_DATA"
✨ Success!
id = "c9df8a4271984ad8bb0a02c30ff3568d"
```

### 2.2 RATE_LIMIT_KV (API rate limiting)

```bash
npx wrangler kv namespace create RATE_LIMIT_KV
```

Output:

```text
🌀 Creating namespace with title "RATE_LIMIT_KV"
✨ Success!
id = "30a87d8776c04d54a423fdd4e84cba5f"
```

### 2.3 CV_HISTORY (version history metadata)

```bash
npx wrangler kv namespace create CV_HISTORY
```

Output:

```text
🌀 Creating namespace with title "CV_HISTORY"
✨ Success!
id = "0c0ada9ed85a427fb87b97bd5761e407"
```

---

## Step 3: Create R2 Bucket

```bash
npx wrangler r2 bucket create cv-assets
```

Output:

```text
Creating bucket 'cv-assets'...
✅ Created bucket 'cv-assets' with default storage class of Standard.
```

### R2 Free Tier Limits

| Limit                | Free Tier         |
| -------------------- | ----------------- |
| Storage              | 10 GB             |
| Class A ops (writes) | 1 million/month   |
| Class B ops (reads)  | 10 million/month  |
| Egress               | Unlimited (free!) |

Admin dashboard will show storage usage with warnings at 80%.

---

## Step 4: Update wrangler.toml

Add the namespace and bucket bindings:

```toml
# KV Namespaces
[[kv_namespaces]]
binding = "CV_DATA"
id = "c9df8a4271984ad8bb0a02c30ff3568d"

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "30a87d8776c04d54a423fdd4e84cba5f"

[[kv_namespaces]]
binding = "CV_HISTORY"
id = "0c0ada9ed85a427fb87b97bd5761e407"

# R2 Bucket
[[r2_buckets]]
binding = "CV_ASSETS"
bucket_name = "cv-assets"
```

---

## Step 5: Cloudflare Access Setup

### 5.1 Create Zero Trust Account

1. Go to: `https://one.dash.cloudflare.com/`
1. Set team name: `arnoldcartagena`
1. This creates: `arnoldcartagena.cloudflareaccess.com`

### 5.2 Create Access Application

1. Navigate: **Access** → **Applications** → **Add an application**
1. Select: **Self-hosted**
1. Configure:

| Field            | Value                    |
| ---------------- | ------------------------ |
| Application name | `CV Admin Portal`        |
| Session Duration | `24 hours`               |
| Domain           | `cv.arnoldcartagena.com` |
| Path             | `/admin`                 |

Then add second domain for development:

| Field  | Value                        |
| ------ | ---------------------------- |
| Domain | `dev-cv.arnoldcartagena.com` |
| Path   | `/admin`                     |

### 5.3 Configure Access Policy

1. Policy name: `Admin Users`
1. Action: **Allow**
1. Include rule:
   - Selector: **Emails**
   - Value: `cartagena.arnold@gmail.com`

### 5.4 Configure Identity Providers

1. Navigate: **Settings** → **Authentication**
1. Add login methods:

GitHub OAuth:

- Click **Add new** → **GitHub**
- Cloudflare handles OAuth automatically (no API keys needed)

One-time PIN (Magic Link):

- Click **Add new** → **One-time PIN**
- Toggle **ON**

### 5.5 Get Application AUD Tag

1. Go to **Access** → **Applications** → **CV Admin Portal**
1. Copy **Application Audience (AUD) Tag**:

```text
20f09cf4ff703120bd78d2cc3005e7fb86f3f7017d401aad3c777772d1f883f8
```

---

## Step 6: Cloudflare Tunnel for Local Development

### 6.1 Install cloudflared

```bash
brew install cloudflared
```

### 6.2 Authenticate

```bash
cloudflared tunnel login
```

Opens browser for authentication. Credentials saved to:

```text
/Users/acartagena/.cloudflared/cert.pem
```

### 6.3 Create Tunnel

```bash
cloudflared tunnel create cv-dev
```

Output:

```text
Tunnel credentials written to ~/.cloudflared/4aac86d4-f18b-4154-a0e5-bff691dde7da.json
Created tunnel cv-dev with id 4aac86d4-f18b-4154-a0e5-bff691dde7da
```

### 6.4 Configure Tunnel

Create `~/.cloudflared/config.yml`:

```yaml
tunnel: 4aac86d4-f18b-4154-a0e5-bff691dde7da
credentials-file: /Users/acartagena/.cloudflared/4aac86d4-f18b-4154-a0e5-bff691dde7da.json

ingress:
  # Local Next.js dev server
  - hostname: dev-cv.arnoldcartagena.com
    service: http://localhost:3000
  # Catch-all (required)
  - service: http_status:404
```

### 6.5 Add DNS Route

```bash
cloudflared tunnel route dns cv-dev dev-cv.arnoldcartagena.com
```

Output:

```text
INF Added CNAME dev-cv.arnoldcartagena.com which will route to this tunnel
```

---

## Step 7: Environment Variables

### .env (local - not committed to git)

```bash
# Cloudflare Access Configuration
CLOUDFLARE_ACCESS_TEAM_NAME=arnoldcartagena
CLOUDFLARE_ACCESS_AUD=20f09cf4ff703120bd78d2cc3005e7fb86f3f7017d401aad3c777772d1f883f8
CLOUDFLARE_ACCESS_ADMIN_EMAIL=cartagena.arnold@gmail.com

# Cloudflare KV Namespace IDs
KV_CV_DATA_ID=c9df8a4271984ad8bb0a02c30ff3568d
KV_RATE_LIMIT_ID=30a87d8776c04d54a423fdd4e84cba5f
KV_HISTORY_ID=0c0ada9ed85a427fb87b97bd5761e407

# Cloudflare R2
R2_BUCKET_NAME=cv-assets

# Cloudflare Tunnel
TUNNEL_ID=4aac86d4-f18b-4154-a0e5-bff691dde7da
DEV_TUNNEL_URL=https://dev-cv.arnoldcartagena.com

# Development
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Using the Tunnel for Local Development

When developing features that require Cloudflare Access authentication:

Terminal 1 - Start Next.js:

```bash
pnpm dev
```

Terminal 2 - Start Tunnel:

```bash
cloudflared tunnel run cv-dev
```

Access admin locally:

```text
https://dev-cv.arnoldcartagena.com/admin
```

You'll see Cloudflare Access login → authenticate with GitHub → access local Next.js app.

---

## Verification Checklist

- [x] `npx wrangler whoami` shows account
- [x] KV namespace CV_DATA created
- [x] KV namespace RATE_LIMIT_KV created
- [x] KV namespace CV_HISTORY created
- [x] R2 bucket cv-assets created
- [x] wrangler.toml updated with all IDs
- [x] Cloudflare Access team created (arnoldcartagena)
- [x] Access application created for /admin
- [x] GitHub OAuth enabled
- [x] One-time PIN enabled
- [x] Admin email whitelisted
- [x] Dev subdomain added to Access app
- [x] cloudflared installed and authenticated
- [x] Tunnel cv-dev created
- [x] Tunnel config.yml created
- [x] DNS route added for dev-cv subdomain
- [x] .env updated with all values
- [x] Access login page verified working

---

## Free Tier Limits Summary

| Service      | Free Tier Limit   | Expected Usage |
| ------------ | ----------------- | -------------- |
| Workers      | 100k requests/day | < 1k           |
| KV Reads     | 100k/day          | < 1k           |
| KV Writes    | 1k/day            | < 100          |
| R2 Storage   | 10 GB             | < 100 MB       |
| R2 Writes    | 1M/month          | < 1k           |
| Access Users | 50                | 1-2            |
| Tunnels      | Unlimited         | 1              |

Estimated monthly cost: $0

---

## Troubleshooting

### "Access denied" at /admin

- Verify your email is in the Access policy
- Try incognito mode (clears Access cookies)
- Check the path matches `/admin` exactly

### Tunnel not connecting

- Ensure cloudflared is running: `cloudflared tunnel run cv-dev`
- Check credentials file path in config.yml
- Verify DNS route: `cloudflared tunnel route list`

### KV operations failing

- Verify namespace ID is correct in wrangler.toml
- Check binding name matches code (e.g., `CV_DATA`)
- Test manually: `npx wrangler kv key list --namespace-id=<id>`

### R2 upload failing

- Check bucket exists: `npx wrangler r2 bucket list`
- Verify binding name in wrangler.toml
- Check file size < 5MB (our limit)

---

## Security Notes

1. **No secrets in git** - IDs are in .env (gitignored), wrangler.toml has non-sensitive IDs
1. **Access at edge** - Authentication happens at Cloudflare edge, before reaching app
1. **Tunnel credentials** - Stored in ~/.cloudflared/, not in project directory
1. **API protection** - POST endpoints verify CF-Access-JWT-Assertion header

---

## Next Steps After Setup

1. Seed KV with existing cv-data.json
1. Update frontend to fetch from API
1. Remove hardcoded JSON file
1. Build admin UI
