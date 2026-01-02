#!/bin/bash
# Terraform Validation Tests
# Run this script to validate Terraform configuration without applying changes.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔍 Running Terraform validation tests..."
echo ""

# Check formatting
echo "1️⃣  Checking formatting (terraform fmt)..."
if terraform fmt -check -recursive; then
  echo "   ✅ Formatting is correct"
else
  echo "   ❌ Formatting issues found. Run: terraform fmt -recursive"
  exit 1
fi
echo ""

# Initialize without backend (for validation only)
echo "2️⃣  Initializing Terraform (backend=false)..."
terraform init -backend=false -input=false > /dev/null 2>&1
echo "   ✅ Initialization successful"
echo ""

# Validate configuration
echo "3️⃣  Validating configuration (terraform validate)..."
if terraform validate; then
  echo "   ✅ Configuration is valid"
else
  echo "   ❌ Validation failed"
  exit 1
fi
echo ""

# Run tflint if available
if command -v tflint &> /dev/null; then
  echo "4️⃣  Running TFLint..."
  tflint --init > /dev/null 2>&1 || true
  if tflint; then
    echo "   ✅ TFLint passed"
  else
    echo "   ⚠️  TFLint found issues (non-blocking)"
  fi
else
  echo "4️⃣  Skipping TFLint (not installed)"
  echo "   Install with: brew install tflint"
fi
echo ""

echo "✅ All Terraform validation tests passed!"
