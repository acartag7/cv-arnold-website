# Input Variables for Cloudflare Infrastructure
#
# Set these via:
# - terraform.tfvars (git-ignored, for local development)
# - Environment variables: TF_VAR_<name>
# - CI/CD secrets (recommended for production)

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for arnoldcartagena.com"
  type        = string
  sensitive   = true
}

variable "domain" {
  description = "Base domain name"
  type        = string
  default     = "arnoldcartagena.com"
}

variable "subdomain" {
  description = "Subdomain for the CV site"
  type        = string
  default     = "cv"
}

variable "worker_name" {
  description = "Name of the Cloudflare Worker"
  type        = string
  default     = "cv-arnold-website"
}

variable "environment" {
  description = "Environment name (production, staging)"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["production", "staging"], var.environment)
    error_message = "Environment must be 'production' or 'staging'."
  }
}

# Note: KV namespace names and R2 bucket names are hardcoded in main.tf
# to match existing resources created via Wrangler CLI.
# See imports.tf for the import blocks that bring these into Terraform state.
