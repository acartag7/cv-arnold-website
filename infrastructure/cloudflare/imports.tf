# Terraform Import Blocks
#
# These blocks import existing Cloudflare resources that were created
# manually via Wrangler CLI or Dashboard into Terraform state management.
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
#
# Reference: https://developer.hashicorp.com/terraform/language/import

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
# Cloudflare Access - Application
# =============================================================================
# Find ID in Access Dashboard URL: /access/apps/self-hosted/<APP_ID>
#
# import {
#   to = cloudflare_zero_trust_access_application.admin
#   id = "${var.cloudflare_account_id}/<APP_ID>"
# }

# Note: Access Policy is created by Terraform, not imported
# If you have an existing policy to import, use:
# import {
#   to = cloudflare_zero_trust_access_policy.admin_allow
#   id = "account/${var.cloudflare_account_id}/<APP_ID>/<POLICY_ID>"
# }
