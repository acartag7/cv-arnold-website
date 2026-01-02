# Terraform Outputs
#
# These values are displayed after apply and can be used
# in CI/CD pipelines or other Terraform configurations.

# =============================================================================
# KV Namespaces
# =============================================================================

output "kv_cv_data_id" {
  description = "ID of the CV_DATA KV namespace"
  value       = cloudflare_workers_kv_namespace.cv_data.id
}

output "kv_rate_limit_id" {
  description = "ID of the RATE_LIMIT_KV namespace"
  value       = cloudflare_workers_kv_namespace.rate_limit.id
}

output "kv_cv_history_id" {
  description = "ID of the CV_HISTORY KV namespace"
  value       = cloudflare_workers_kv_namespace.cv_history.id
}

# =============================================================================
# Custom Domain
# =============================================================================

output "custom_domain" {
  description = "Custom domain for the CV website"
  value       = cloudflare_workers_domain.cv_site.hostname
}

output "worker_url" {
  description = "URL of the CV website"
  value       = "https://${cloudflare_workers_domain.cv_site.hostname}"
}

# =============================================================================
# R2 Storage
# =============================================================================

output "r2_bucket_name" {
  description = "Name of the R2 bucket for CV assets"
  value       = cloudflare_r2_bucket.cv_assets.name
}

# =============================================================================
# Staging Environment (when enabled)
# =============================================================================

output "staging_kv_cv_data_id" {
  description = "ID of the staging CV_DATA KV namespace"
  value       = cloudflare_workers_kv_namespace.cv_data_staging.id
}

output "staging_kv_rate_limit_id" {
  description = "ID of the staging RATE_LIMIT_KV namespace"
  value       = cloudflare_workers_kv_namespace.rate_limit_staging.id
}

output "staging_domain" {
  description = "Staging domain (if enabled)"
  value       = var.enable_staging ? cloudflare_workers_domain.cv_site_staging[0].hostname : null
}

output "staging_url" {
  description = "Staging URL (if enabled)"
  value       = var.enable_staging ? "https://${cloudflare_workers_domain.cv_site_staging[0].hostname}" : null
}

# =============================================================================
# Cloudflare Access (managed via Dashboard)
# =============================================================================
# AUD for JWT verification: 20f09cf4ff703120bd78d2cc3005e7fb86f3f7017d401aad3c777772d1f883f8

# =============================================================================
# Environment
# =============================================================================

output "environment" {
  description = "Current environment"
  value       = var.environment
}
