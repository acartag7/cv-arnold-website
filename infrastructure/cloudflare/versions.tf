# Terraform/OpenTofu Configuration
# Compatible with both Terraform and OpenTofu

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

  # Remote state in Cloudflare R2 (S3-compatible)
  # Credentials passed via -backend-config in CI or environment variables
  backend "s3" {
    bucket                      = "terraform-state"
    key                         = "cv-arnold-website/terraform.tfstate"
    region                      = "auto"
    encrypt                     = true # R2 encrypts by default, explicit for documentation
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
    use_path_style              = true
    # endpoints and credentials configured via -backend-config flags in CI
  }
}

provider "cloudflare" {
  # API token with required permissions:
  # - Workers Scripts: Edit
  # - Workers KV Storage: Edit
  # - Workers Routes: Edit
  # - DNS: Edit (for custom domain)
  # - Zone: Read
  #
  # Set via environment variable: CLOUDFLARE_API_TOKEN
  # Or uncomment below:
  # api_token = var.cloudflare_api_token
}
