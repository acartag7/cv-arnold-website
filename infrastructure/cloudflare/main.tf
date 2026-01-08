# Cloudflare Infrastructure for CV Arnold Website
#
# Enterprise Architecture:
# - Production: cv.arnoldcartagena.com + api.arnoldcartagena.com
# - Dev: dev-cv.arnoldcartagena.com + api-dev.arnoldcartagena.com
# - Zero Trust: Admin and API protected by Cloudflare Access
#
# Note: Workers are deployed via GitHub Actions (wrangler deploy)
# This Terraform config manages the supporting infrastructure.

locals {
  # Domain configuration
  prod_frontend = "${var.subdomain}.${var.domain}"     # cv.arnoldcartagena.com
  prod_api      = "api.${var.domain}"                  # api.arnoldcartagena.com
  dev_frontend  = "dev-${var.subdomain}.${var.domain}" # dev-cv.arnoldcartagena.com
  dev_api       = "api-dev.${var.domain}"              # api-dev.arnoldcartagena.com

  # Worker names (aligned with existing deployments)
  frontend_worker_prod = var.worker_name          # cv-arnold-website
  frontend_worker_dev  = "${var.worker_name}-dev" # cv-arnold-website-dev
  api_worker_prod      = "cv-arnold-api"          # Existing API worker name
  api_worker_dev       = "cv-arnold-api-dev"      # Dev API worker
}

# =============================================================================
# KV Namespaces - Production
# =============================================================================

# Main CV data storage
resource "cloudflare_workers_kv_namespace" "cv_data" {
  account_id = var.cloudflare_account_id
  title      = "CV_DATA"

  lifecycle {
    prevent_destroy = true
  }
}

# Rate limiting counters
resource "cloudflare_workers_kv_namespace" "rate_limit" {
  account_id = var.cloudflare_account_id
  title      = "RATE_LIMIT_KV"
}

# CV edit history/snapshots
resource "cloudflare_workers_kv_namespace" "cv_history" {
  account_id = var.cloudflare_account_id
  title      = "CV_HISTORY"

  lifecycle {
    prevent_destroy = true
  }
}

# =============================================================================
# KV Namespaces - Dev Environment
# =============================================================================

# Dev CV data storage (isolated from production)
resource "cloudflare_workers_kv_namespace" "cv_data_dev" {
  account_id = var.cloudflare_account_id
  title      = "CV_DATA_DEV"
}

# Dev rate limiting counters
resource "cloudflare_workers_kv_namespace" "rate_limit_dev" {
  account_id = var.cloudflare_account_id
  title      = "RATE_LIMIT_KV_DEV"
}

# Dev CV edit history/snapshots
resource "cloudflare_workers_kv_namespace" "cv_history_dev" {
  account_id = var.cloudflare_account_id
  title      = "CV_HISTORY_DEV"
}

# =============================================================================
# Worker Custom Domains - Production
# =============================================================================

# Production Frontend: cv.arnoldcartagena.com
resource "cloudflare_workers_domain" "frontend_prod" {
  account_id = var.cloudflare_account_id
  zone_id    = var.cloudflare_zone_id
  hostname   = local.prod_frontend
  service    = local.frontend_worker_prod
}

# Production API: api.arnoldcartagena.com
resource "cloudflare_workers_domain" "api_prod" {
  account_id = var.cloudflare_account_id
  zone_id    = var.cloudflare_zone_id
  hostname   = local.prod_api
  service    = local.api_worker_prod
}

# =============================================================================
# Worker Custom Domains - Dev Environment
# =============================================================================

# Dev Frontend: dev-cv.arnoldcartagena.com
resource "cloudflare_workers_domain" "frontend_dev" {
  count = var.enable_dev_environment ? 1 : 0

  account_id = var.cloudflare_account_id
  zone_id    = var.cloudflare_zone_id
  hostname   = local.dev_frontend
  service    = local.frontend_worker_dev
}

# Dev API: api-dev.arnoldcartagena.com
resource "cloudflare_workers_domain" "api_dev" {
  count = var.enable_dev_environment ? 1 : 0

  account_id = var.cloudflare_account_id
  zone_id    = var.cloudflare_zone_id
  hostname   = local.dev_api
  service    = local.api_worker_dev
}

# =============================================================================
# R2 Bucket (for image storage)
# =============================================================================

resource "cloudflare_r2_bucket" "cv_assets" {
  account_id = var.cloudflare_account_id
  name       = "cv-assets"
  location   = "EEUR" # Eastern Europe

  lifecycle {
    prevent_destroy = true
  }
}

# =============================================================================
# Cloudflare Access - Identity Provider (GitHub)
# =============================================================================

resource "cloudflare_zero_trust_access_identity_provider" "github" {
  account_id = var.cloudflare_account_id
  name       = "GitHub"
  type       = "github"

  config {
    client_id     = var.github_oauth_client_id
    client_secret = var.github_oauth_client_secret
  }
}

# =============================================================================
# Cloudflare Access - Admin Portal Protection
# =============================================================================

resource "cloudflare_zero_trust_access_application" "admin" {
  account_id       = var.cloudflare_account_id
  name             = "CV Admin Portal"
  type             = "self_hosted"
  session_duration = "24h"

  # Production admin route
  destinations {
    type = "public"
    uri  = "${local.prod_frontend}/admin*"
  }

  # Production API proxy route (used by admin panel)
  destinations {
    type = "public"
    uri  = "${local.prod_frontend}/api/proxy/*"
  }

  # Dev admin route
  dynamic "destinations" {
    for_each = var.enable_dev_environment ? [1] : []
    content {
      type = "public"
      uri  = "${local.dev_frontend}/admin*"
    }
  }

  # Dev API proxy route
  dynamic "destinations" {
    for_each = var.enable_dev_environment ? [1] : []
    content {
      type = "public"
      uri  = "${local.dev_frontend}/api/proxy/*"
    }
  }
}

resource "cloudflare_zero_trust_access_policy" "admin_allow" {
  account_id     = var.cloudflare_account_id
  application_id = cloudflare_zero_trust_access_application.admin.id
  name           = "Allow Admin Users"
  precedence     = 1
  decision       = "allow"

  include {
    email = var.access_allowed_emails
  }
}

# =============================================================================
# Cloudflare Access - API Protection
# =============================================================================
# The API is protected by Cloudflare Access for direct browser access.
# However, the frontend communicates with the API via Service Bindings
# (worker-to-worker calls), which bypass Access entirely.
#
# This means:
# - Direct API access (api.arnoldcartagena.com) requires GitHub OAuth
# - Frontend proxy (/api/proxy/*) uses Service Binding (no tokens needed)

resource "cloudflare_zero_trust_access_application" "api" {
  account_id       = var.cloudflare_account_id
  name             = "CV API"
  type             = "self_hosted"
  session_duration = "24h"

  destinations {
    type = "public"
    uri  = "${local.prod_api}/*"
  }

  dynamic "destinations" {
    for_each = var.enable_dev_environment ? [1] : []
    content {
      type = "public"
      uri  = "${local.dev_api}/*"
    }
  }
}

# Policy 1: Allow authenticated users (email-based)
resource "cloudflare_zero_trust_access_policy" "api_allow_users" {
  account_id     = var.cloudflare_account_id
  application_id = cloudflare_zero_trust_access_application.api.id
  name           = "Allow API Users"
  precedence     = 1
  decision       = "allow"

  include {
    email = var.access_allowed_emails
  }
}

# =============================================================================
# Contact Form KV Namespace - Production
# =============================================================================

# Contact form submissions backup storage
resource "cloudflare_workers_kv_namespace" "contact_submissions" {
  account_id = var.cloudflare_account_id
  title      = "CONTACT_SUBMISSIONS"
}

# Contact form submissions - Dev
resource "cloudflare_workers_kv_namespace" "contact_submissions_dev" {
  account_id = var.cloudflare_account_id
  title      = "CONTACT_SUBMISSIONS_DEV"
}

# =============================================================================
# Cloudflare Turnstile - Spam Protection for Contact Form
# =============================================================================

# Production Turnstile widget
resource "cloudflare_turnstile_widget" "contact_form" {
  account_id = var.cloudflare_account_id
  name       = "CV Contact Form"
  mode       = "managed"
  domains    = [var.domain, local.prod_frontend]
  # Bot fight mode is automatically enabled
}

# Dev Turnstile widget (separate for testing)
resource "cloudflare_turnstile_widget" "contact_form_dev" {
  count = var.enable_dev_environment ? 1 : 0

  account_id = var.cloudflare_account_id
  name       = "CV Contact Form (Dev)"
  mode       = "managed"
  domains    = [local.dev_frontend, "localhost"]
}

# =============================================================================
# Worker Secrets - Production API
# =============================================================================
# These secrets are injected into the Worker at runtime
# Note: Secrets appear in Terraform state. For enterprise compliance, use:
# - Terraform Cloud with encrypted state
# - S3 backend with server-side encryption
# - Azure Blob with encryption at rest

resource "cloudflare_workers_secret" "resend_api_key_prod" {
  account_id  = var.cloudflare_account_id
  script_name = local.api_worker_prod
  name        = "RESEND_API_KEY"
  secret_text = var.resend_api_key
}

resource "cloudflare_workers_secret" "turnstile_secret_prod" {
  account_id  = var.cloudflare_account_id
  script_name = local.api_worker_prod
  name        = "TURNSTILE_SECRET_KEY"
  secret_text = cloudflare_turnstile_widget.contact_form.secret
}

# =============================================================================
# Worker Secrets - Dev API
# =============================================================================

resource "cloudflare_workers_secret" "resend_api_key_dev" {
  count = var.enable_dev_environment ? 1 : 0

  account_id  = var.cloudflare_account_id
  script_name = local.api_worker_dev
  name        = "RESEND_API_KEY"
  secret_text = var.resend_api_key
}

resource "cloudflare_workers_secret" "turnstile_secret_dev" {
  count = var.enable_dev_environment ? 1 : 0

  account_id  = var.cloudflare_account_id
  script_name = local.api_worker_dev
  name        = "TURNSTILE_SECRET_KEY"
  # Dev can use test key or real dev turnstile secret
  secret_text = cloudflare_turnstile_widget.contact_form_dev[0].secret
}

# =============================================================================
# Zone Settings (Security Headers at Edge)
# =============================================================================

resource "cloudflare_zone_settings_override" "security" {
  zone_id = var.cloudflare_zone_id

  settings {
    # SSL/TLS
    ssl                      = "strict"
    always_use_https         = "on"
    min_tls_version          = "1.2"
    automatic_https_rewrites = "on"

    # Security
    security_level = "medium"
    browser_check  = "on"

    # Performance
    brotli = "on"

    # Caching
    browser_cache_ttl = 14400 # 4 hours
  }
}
