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
  value       = cloudflare_worker_domain.cv_site.hostname
}

output "worker_url" {
  description = "URL of the CV website"
  value       = "https://${cloudflare_worker_domain.cv_site.hostname}"
}

# =============================================================================
# R2 Storage
# =============================================================================

output "r2_bucket_name" {
  description = "Name of the R2 bucket for CV assets"
  value       = cloudflare_r2_bucket.cv_assets.name
}

# =============================================================================
# Environment
# =============================================================================

output "environment" {
  description = "Current environment"
  value       = var.environment
}
