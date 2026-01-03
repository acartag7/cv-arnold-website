# Terraform Import and Move Blocks
#
# This file handles:
# 1. Moving existing resources to new addresses (due to refactoring)
# 2. Importing existing Cloudflare resources into Terraform state
#
# Reference: https://developer.hashicorp.com/terraform/language/import

# =============================================================================
# MOVED BLOCKS - Handle Resource Renames
# =============================================================================
# These blocks tell Terraform that resources have been renamed/moved
# and should not be destroyed/recreated.

# Domain resource renamed from cv_site to frontend_prod
moved {
  from = cloudflare_workers_domain.cv_site
  to   = cloudflare_workers_domain.frontend_prod
}

# Staging KV namespaces renamed to dev
moved {
  from = cloudflare_workers_kv_namespace.cv_data_staging
  to   = cloudflare_workers_kv_namespace.cv_data_dev
}

moved {
  from = cloudflare_workers_kv_namespace.rate_limit_staging
  to   = cloudflare_workers_kv_namespace.rate_limit_dev
}

moved {
  from = cloudflare_workers_kv_namespace.cv_history_staging
  to   = cloudflare_workers_kv_namespace.cv_history_dev
}

# =============================================================================
# IMPORT BLOCKS - For New/Manual Resources
# =============================================================================
#
# USAGE FOR EXISTING RESOURCES:
# 1. Uncomment the relevant import block below
# 2. Replace the placeholder ID with your actual resource ID
# 3. Run `terraform plan` to preview the import
# 4. Run `terraform apply` to import into state
# 5. After successful import, you can keep or remove the import block
#
# HOW TO FIND RESOURCE IDs:
# - KV Namespaces: `wrangler kv namespace list` or Cloudflare Dashboard → Workers & Pages → KV
# - R2 Buckets: `wrangler r2 bucket list` or Dashboard → R2
# - Access Apps: Dashboard URL contains the ID, e.g., /access/apps/self-hosted/<APP_ID>
# - Access IDPs: Dashboard URL contains the ID, e.g., /identity-providers/edit/<IDP_ID>

# =============================================================================
# KV Namespaces (created via: wrangler kv namespace create)
# =============================================================================
# Find IDs with: wrangler kv namespace list
#
# import {
#   to = cloudflare_workers_kv_namespace.cv_data
#   id = "${var.cloudflare_account_id}/<KV_NAMESPACE_ID>"
# }
#
# import {
#   to = cloudflare_workers_kv_namespace.rate_limit
#   id = "${var.cloudflare_account_id}/<KV_NAMESPACE_ID>"
# }
#
# import {
#   to = cloudflare_workers_kv_namespace.cv_history
#   id = "${var.cloudflare_account_id}/<KV_NAMESPACE_ID>"
# }

# =============================================================================
# R2 Bucket (created via: wrangler r2 bucket create)
# =============================================================================
# Find bucket name with: wrangler r2 bucket list
#
# import {
#   to = cloudflare_r2_bucket.cv_assets
#   id = "${var.cloudflare_account_id}/<BUCKET_NAME>"
# }

# =============================================================================
# Cloudflare Access - Identity Provider (GitHub)
# =============================================================================
# Find ID in Zero Trust Dashboard URL: /identity-providers/edit/<IDP_ID>
#
# import {
#   to = cloudflare_zero_trust_access_identity_provider.github
#   id = "${var.cloudflare_account_id}/<IDP_ID>"
# }

# =============================================================================
# Cloudflare Access - Applications
# =============================================================================
# Find ID in Access Dashboard URL: /access/apps/self-hosted/<APP_ID>
#
# import {
#   to = cloudflare_zero_trust_access_application.admin
#   id = "${var.cloudflare_account_id}/<APP_ID>"
# }
#
# Note: The API access application is new and will be created by Terraform
