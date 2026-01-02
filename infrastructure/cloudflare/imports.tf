# Terraform Import Blocks
#
# These blocks import existing Cloudflare resources that were created
# manually via Wrangler CLI into Terraform state management.
#
# Import blocks are processed during `terraform plan` and `terraform apply`.
# After successful import, these blocks can be removed (but keeping them
# is harmless and documents the resource history).
#
# Reference: https://developer.hashicorp.com/terraform/language/import

# =============================================================================
# KV Namespaces (created via: wrangler kv namespace create)
# =============================================================================

import {
  to = cloudflare_workers_kv_namespace.cv_data
  id = "${var.cloudflare_account_id}/c9df8a4271984ad8bb0a02c30ff3568d"
}

import {
  to = cloudflare_workers_kv_namespace.rate_limit
  id = "${var.cloudflare_account_id}/30a87d8776c04d54a423fdd4e84cba5f"
}

import {
  to = cloudflare_workers_kv_namespace.cv_history
  id = "${var.cloudflare_account_id}/0c0ada9ed85a427fb87b97bd5761e407"
}

# =============================================================================
# R2 Bucket (created via: wrangler r2 bucket create)
# =============================================================================

import {
  to = cloudflare_r2_bucket.cv_assets
  id = "${var.cloudflare_account_id}/cv-assets"
}

# =============================================================================
# Cloudflare Access (created via Dashboard)
# =============================================================================
# Currently managed via Zero Trust Dashboard. To import into Terraform:
#
# 1. Get the Application ID from the URL when editing the app:
#    https://one.dash.cloudflare.com/.../access/apps/edit/<APP_ID>
#
# 2. Uncomment and add the resource to main.tf, then import:
#
# import {
#   to = cloudflare_zero_trust_access_application.admin
#   id = "${var.cloudflare_account_id}/<APP_ID>"
# }
#
# Access App AUD: 20f09cf4ff703120bd78d2cc3005e7fb86f3f7017d401aad3c777772d1f883f8
