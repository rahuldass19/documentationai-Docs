---
sidebar_position: 4
title: Troubleshooting
---

# Troubleshooting

## Common Issues

### 1. Z3 Solver Errors
**Error:** `Z3Exception: ...`
**Cause:** Typical z3 installation issues or complex logical contradictions.
**Fix:** Ensure `z3-solver` is correctly installed. Check for contradictory policy statements (e.g., Allow and Deny on the same resource/action without conditions).

### 2. Terraform Parsing Failures
**Error:** `HCLParserError`
**Cause:** Syntax error in `.tf` files or unsupported HCL features (e.g., complex modules or dynamic blocks not yet supported).
**Fix:** Validate your terraform code with `terraform validate`. 

### 3. Missing Pricing Data
**Error:** `PriceNotFound`
**Cause:** Instance type not in the embedded static catalog.
**Fix:** Update `qwed-infra` or check `CostGuard.pricing_catalog` to verify coverage.

## Support

For issues not listed here, please open an issue on [GitHub](https://github.com/QWED-AI/qwed-infra/issues).
