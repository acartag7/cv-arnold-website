# Cloudflare Infrastructure for CV Arnold Website
#
# This configuration manages:
# - KV Namespace for CV data storage
# - Worker custom domain routing
# - DNS records for custom domain
# - (Optional) R2 bucket for image storage
#
# Note: The Worker itself is deployed via GitHub Actions (wrangler deploy)
# This Terraform config manages the supporting infrastructure.

locals {
  full_domain = "${var.subdomain}.${var.domain}"

  common_tags = {
    Project     = "cv-arnold-website"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# =============================================================================
# KV Namespaces
# =============================================================================

# Main CV data storage
resource "cloudflare_workers_kv_namespace" "cv_data" {
  account_id = var.cloudflare_account_id
  title      = "CV_DATA"
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
}

# =============================================================================
# Worker Custom Domain
# =============================================================================

# Custom domain for the Worker
# This routes cv.arnoldcartagena.com to the Worker
resource "cloudflare_workers_domain" "cv_site" {
  account_id = var.cloudflare_account_id
  zone_id    = var.cloudflare_zone_id
  hostname   = local.full_domain
  service    = var.worker_name
}

# =============================================================================
# DNS Records
# =============================================================================

# DNS record is auto-created by cloudflare_worker_domain, but we can also
# explicitly manage it for more control:
#
# resource "cloudflare_record" "cv_cname" {
#   zone_id = var.cloudflare_zone_id
#   name    = var.subdomain
#   type    = "CNAME"
#   content = "${var.worker_name}.${var.cloudflare_account_id}.workers.dev"
#   proxied = true
#   ttl     = 1  # Auto TTL when proxied
#   comment = "CV website - managed by Terraform"
# }

# =============================================================================
# R2 Bucket (for image storage)
# =============================================================================

resource "cloudflare_r2_bucket" "cv_assets" {
  account_id = var.cloudflare_account_id
  name       = "cv-assets"
  location   = "EEUR" # Eastern Europe
}

# =============================================================================
# Worker Settings (Secrets & Environment Variables)
# =============================================================================

# Note: Worker secrets should be managed via GitHub Actions secrets
# and passed during deployment, not stored in Terraform state.
#
# If you need to manage them here (not recommended for secrets):
#
# resource "cloudflare_worker_secret" "api_key" {
#   account_id  = var.cloudflare_account_id
#   script_name = var.worker_name
#   name        = "API_KEY"
#   secret_text = var.api_key  # From TF_VAR_api_key
# }

# =============================================================================
# Zone Settings (Security Headers at Edge)
# =============================================================================

# Enable security features at the zone level
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

    # Performance (minify removed - not available on all plans)
    brotli = "on"

    # Caching
    browser_cache_ttl = 14400 # 4 hours
  }
}
