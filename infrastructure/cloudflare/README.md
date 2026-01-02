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
- R2 bucket named `terraform-state` for remote state storage
- R2 API Token with read/write access to the state bucket

## State Backend Setup (R2)

Before running Terraform, create an R2 bucket for state storage:

1. **Create R2 Bucket:**
   - Cloudflare Dashboard → R2 → Create bucket
   - Name: `terraform-state`
   - Location: Auto (or your preferred region)

2. **Create R2 API Token:**
   - Cloudflare Dashboard → R2 → Manage R2 API Tokens → Create API token
   - Permissions: Object Read & Write
   - Specify bucket: `terraform-state`
   - Save the Access Key ID and Secret Access Key

## Quick Start (Local)

```bash
# Navigate to infrastructure directory
cd infrastructure/cloudflare

# Copy example variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your Cloudflare Account ID and Zone ID

# Set environment variables (don't commit these!)
export CLOUDFLARE_API_TOKEN="your-api-token"
export AWS_ACCESS_KEY_ID="your-r2-access-key-id"
export AWS_SECRET_ACCESS_KEY="your-r2-secret-access-key"

# Initialize Terraform with R2 backend
terraform init \
  -backend-config="endpoints={s3=\"https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com\"}"

# Preview changes
terraform plan

# Apply changes
terraform apply
```

## Resources Managed

| Resource                                   | Description                            |
| ------------------------------------------ | -------------------------------------- |
| `cloudflare_workers_kv_namespace`          | KV storage for CV data, rate limiting  |
| `cloudflare_workers_domain`                | Custom domain (cv.arnoldcartagena.com) |
| `cloudflare_zone_settings_override`        | Security & performance settings        |
| `cloudflare_r2_bucket`                     | Image storage                          |
| `cloudflare_zero_trust_access_application` | Admin portal protection                |
| `cloudflare_zero_trust_access_policy`      | Access control policy                  |

## State Locking

⚠️ **IMPORTANT:** This configuration does not include state locking.
R2 doesn't support DynamoDB-style locking natively.

**Best Practices:**

- Only CI/CD pipeline should apply changes (automated via GitHub Actions on merge to main)
- Manual applies should be avoided in favor of `workflow_dispatch`
- If manual apply is necessary, coordinate with team to avoid concurrent modifications

**Future Options:**

- Implement custom locking using Cloudflare Workers KV
- Use Terraform Cloud (free tier) for built-in state locking

## Environment Variables

| Variable                       | Description                  |
| ------------------------------ | ---------------------------- |
| `CLOUDFLARE_API_TOKEN`         | API token for authentication |
| `TF_VAR_cloudflare_account_id` | Cloudflare Account ID        |
| `TF_VAR_cloudflare_zone_id`    | Zone ID for the domain       |

## CI/CD Integration

For GitHub Actions, add these repository secrets:

| Secret                           | Description                      | Where to Find                                   |
| -------------------------------- | -------------------------------- | ----------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`           | API token for Terraform provider | Cloudflare Dashboard → Profile → API Tokens     |
| `CLOUDFLARE_ACCOUNT_ID`          | Your Cloudflare Account ID       | Dashboard → Account Home (right sidebar)        |
| `CLOUDFLARE_ZONE_ID`             | Zone ID for your domain          | Dashboard → Domain → Overview (right sidebar)   |
| `TF_STATE_R2_ACCESS_KEY_ID`      | R2 API token Access Key          | R2 → Manage R2 API Tokens                       |
| `TF_STATE_R2_SECRET_ACCESS_KEY`  | R2 API token Secret              | (generated with access key)                     |
| `CF_ACCESS_GITHUB_CLIENT_ID`     | GitHub OAuth App Client ID       | Cloudflare Zero Trust → Authentication → GitHub |
| `CF_ACCESS_GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret   | (from Cloudflare Access GitHub IDP config)      |

The workflow automatically:

- Plans on pull requests (posts comment with plan output)
- Applies on merge to main
- Supports manual trigger for plan/apply

## Security Notes

- Never commit `terraform.tfvars` or `.tfstate` files
- Use environment variables or CI/CD secrets for sensitive values
- API tokens should have minimal required permissions
- Consider using Cloudflare Access to protect the Terraform state bucket
