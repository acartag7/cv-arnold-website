# TFLint Configuration for Cloudflare Infrastructure
# https://github.com/terraform-linters/tflint

plugin "terraform" {
  enabled = true
  preset  = "recommended"
}

# Note: Cloudflare doesn't have an official TFLint ruleset yet
# Using standard Terraform rules only

# General rules
rule "terraform_deprecated_interpolation" {
  enabled = true
}

rule "terraform_deprecated_index" {
  enabled = true
}

rule "terraform_unused_declarations" {
  enabled = true
}

rule "terraform_comment_syntax" {
  enabled = true
}

rule "terraform_documented_outputs" {
  enabled = true
}

rule "terraform_documented_variables" {
  enabled = true
}

rule "terraform_typed_variables" {
  enabled = true
}

rule "terraform_naming_convention" {
  enabled = true
  format  = "snake_case"
}

rule "terraform_required_version" {
  enabled = true
}

rule "terraform_required_providers" {
  enabled = true
}

rule "terraform_standard_module_structure" {
  enabled = false  # Not a module
}
