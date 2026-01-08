# Input Variables for Cloudflare Infrastructure
#
# Enterprise Architecture Variables
#
# Set these via:
# - terraform.tfvars (git-ignored, for local development)
# - Environment variables: TF_VAR_<name>
# - CI/CD secrets (recommended for production)

# =============================================================================
# Cloudflare Account & Zone
# =============================================================================

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

# =============================================================================
# Domain Configuration
# =============================================================================

variable "domain" {
  description = "Base domain name"
  type        = string
  default     = "arnoldcartagena.com"
}

variable "subdomain" {
  description = "Subdomain for the CV site (e.g., 'cv' for cv.domain.com)"
  type        = string
  default     = "cv"
}

variable "worker_name" {
  description = "Base name for Cloudflare Workers"
  type        = string
  default     = "cv-arnold-website"
}

# =============================================================================
# Environment Configuration
# =============================================================================

variable "enable_dev_environment" {
  description = "Enable dev environment (dev-cv.domain.com + api-dev.domain.com)"
  type        = bool
  default     = true
}

# =============================================================================
# Cloudflare Access (Zero Trust)
# =============================================================================

variable "access_allowed_emails" {
  description = "Email addresses allowed to access admin portal and API"
  type        = list(string)
  # No default - must be provided via environment variable or tfvars
  # Example: TF_VAR_access_allowed_emails='["user@example.com"]'
}

# =============================================================================
# GitHub OAuth (for Cloudflare Access Identity Provider)
# =============================================================================

variable "github_oauth_client_id" {
  description = "GitHub OAuth App Client ID for Cloudflare Access"
  type        = string
  sensitive   = true
}

variable "github_oauth_client_secret" {
  description = "GitHub OAuth App Client Secret for Cloudflare Access"
  type        = string
  sensitive   = true
}

# =============================================================================
# Contact Form Secrets
# =============================================================================
#
# These secrets are NOT stored in git. Provide via:
#   - Environment variable: export TF_VAR_resend_api_key="re_xxx"
#   - CI/CD: GitHub Actions secrets → TF_VAR_resend_api_key
#   - Terraform Cloud: Sensitive variable in workspace
#
# The terraform.tfvars file is .gitignored and can be used for local dev.

variable "resend_api_key" {
  description = "Resend API key for contact form email delivery. Set via TF_VAR_resend_api_key env var."
  type        = string
  sensitive   = true
}
