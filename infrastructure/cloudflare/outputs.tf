# Terraform Outputs
#
# These values are displayed after apply and can be used
# in CI/CD pipelines or other Terraform configurations.

output "kv_namespace_id" {
  description = "ID of the KV namespace for CV data"
  value       = cloudflare_workers_kv_namespace.cv_data.id
}

output "kv_namespace_title" {
  description = "Title of the KV namespace"
  value       = cloudflare_workers_kv_namespace.cv_data.title
}

output "custom_domain" {
  description = "Custom domain for the CV website"
  value       = cloudflare_worker_domain.cv_site.hostname
}

output "custom_domain_id" {
  description = "ID of the custom domain resource"
  value       = cloudflare_worker_domain.cv_site.id
}

output "worker_url" {
  description = "URL of the CV website"
  value       = "https://${cloudflare_worker_domain.cv_site.hostname}"
}

output "r2_bucket_name" {
  description = "Name of the R2 bucket (if enabled)"
  value       = var.enable_r2_bucket ? cloudflare_r2_bucket.assets[0].name : null
}

output "environment" {
  description = "Current environment"
  value       = var.environment
}
