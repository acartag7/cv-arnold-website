# Cloudflare Infrastructure

Infrastructure as Code (IaC) for the CV Arnold Website using Terraform/OpenTofu.

## Prerequisites

- [Terraform](https://terraform.io) >= 1.0.0 or [OpenTofu](https://opentofu.org) >= 1.0.0
- Cloudflare API Token with permissions:
  - Workers Scripts: Edit
  - Workers KV Storage: Edit
  - Workers Routes: Edit
  - DNS: Edit
  - Zone: Read
  - Zone Settings: Edit

## Quick Start

```bash
# Navigate to infrastructure directory
cd infrastructure/cloudflare

# Copy example variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your Cloudflare Account ID and Zone ID

# Set API token (don't commit this!)
export CLOUDFLARE_API_TOKEN="your-api-token"

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply changes
terraform apply
```

## Resources Managed

| Resource                            | Description                            |
| ----------------------------------- | -------------------------------------- |
| `cloudflare_workers_kv_namespace`   | KV storage for CV data                 |
| `cloudflare_worker_domain`          | Custom domain (cv.arnoldcartagena.com) |
| `cloudflare_zone_settings_override` | Security & performance settings        |
| `cloudflare_r2_bucket`              | (Optional) Image storage               |

## Environment Variables

| Variable                       | Description                  |
| ------------------------------ | ---------------------------- |
| `CLOUDFLARE_API_TOKEN`         | API token for authentication |
| `TF_VAR_cloudflare_account_id` | Cloudflare Account ID        |
| `TF_VAR_cloudflare_zone_id`    | Zone ID for the domain       |

## CI/CD Integration

For GitHub Actions, add these secrets:

- `CLOUDFLARE_API_TOKEN`
- `TF_VAR_cloudflare_account_id`
- `TF_VAR_cloudflare_zone_id`

## State Management

For production use, configure a remote backend:

### Option 1: Cloudflare R2 (Recommended)

```hcl
backend "s3" {
  bucket = "terraform-state"
  key    = "cv-arnold-website/terraform.tfstate"
  # ... see versions.tf for full config
}
```

### Option 2: Terraform Cloud

```hcl
cloud {
  organization = "your-org"
  workspaces { name = "cv-arnold-website" }
}
```

## Security Notes

- Never commit `terraform.tfvars` or `.tfstate` files
- Use environment variables or CI/CD secrets for sensitive values
- API tokens should have minimal required permissions
- Consider using Cloudflare Access to protect the Terraform state bucket
