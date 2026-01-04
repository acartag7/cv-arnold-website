# Terraform Outputs for CV Arnold Website
#
# These outputs provide the resource IDs and URLs needed for:
# - Wrangler configuration (KV namespace IDs)
# - CI/CD pipeline configuration
# - Documentation

# =============================================================================
# URLs - Production
# =============================================================================

output "production_urls" {
  description = "Production environment URLs"
  value = {
    frontend = "https://${local.prod_frontend}"
    admin    = "https://${local.prod_frontend}/admin"
    api      = "https://${local.prod_api}"
  }
}

# =============================================================================
# URLs - Dev Environment
# =============================================================================

output "dev_urls" {
  description = "Dev environment URLs (null if dev environment disabled)"
  value = var.enable_dev_environment ? {
    frontend = "https://${local.dev_frontend}"
    admin    = "https://${local.dev_frontend}/admin"
    api      = "https://${local.dev_api}"
  } : null
}

# =============================================================================
# KV Namespace IDs - Production
# =============================================================================

output "kv_namespace_ids_prod" {
  description = "Production KV namespace IDs for wrangler.toml"
  value = {
    cv_data    = cloudflare_workers_kv_namespace.cv_data.id
    rate_limit = cloudflare_workers_kv_namespace.rate_limit.id
    cv_history = cloudflare_workers_kv_namespace.cv_history.id
  }
}

# =============================================================================
# KV Namespace IDs - Dev Environment
# =============================================================================

output "kv_namespace_ids_dev" {
  description = "Dev KV namespace IDs for wrangler.toml"
  value = {
    cv_data    = cloudflare_workers_kv_namespace.cv_data_dev.id
    rate_limit = cloudflare_workers_kv_namespace.rate_limit_dev.id
    cv_history = cloudflare_workers_kv_namespace.cv_history_dev.id
  }
}

# =============================================================================
# Worker Names
# =============================================================================

output "worker_names" {
  description = "Worker names for deployment"
  value = {
    frontend_prod = local.frontend_worker_prod
    frontend_dev  = local.frontend_worker_dev
    api_prod      = local.api_worker_prod
    api_dev       = local.api_worker_dev
  }
}

# =============================================================================
# R2 Bucket
# =============================================================================

output "r2_bucket_name" {
  description = "R2 bucket name for asset storage"
  value       = cloudflare_r2_bucket.cv_assets.name
}

# =============================================================================
# Cloudflare Access
# =============================================================================

output "access_application_ids" {
  description = "Cloudflare Access application IDs"
  value = {
    admin = cloudflare_zero_trust_access_application.admin.id
    api   = cloudflare_zero_trust_access_application.api.id
  }
}

# =============================================================================
# Domain Configuration (for reference)
# =============================================================================

output "domains" {
  description = "All configured domains"
  value = {
    production = {
      frontend = local.prod_frontend
      api      = local.prod_api
    }
    dev = var.enable_dev_environment ? {
      frontend = local.dev_frontend
      api      = local.dev_api
    } : null
  }
}
