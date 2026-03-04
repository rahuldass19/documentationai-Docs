---
sidebar_position: 4
title: GitHub Action (CI/CD)
description: Integrate QWED Finance into your CI/CD pipeline
---

# QWED Finance GitHub Action

QWED Finance v2.0 includes a production-ready GitHub Action to verify financial logic in your CI/CD pipeline.

## Usage

### Basic Verification

```yaml
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - name: Verify IRR Calculation
        uses: QWED-AI/qwed-finance@v2
        with:
          action: verify
          verification_type: irr
          cashflows: "-1000, 300, 400, 500, 600"
          llm_output: "24.89%"
```

### SARIF Scanning (Security Dashboard)

QWED automatically outputs SARIF reports that integrate with GitHub Advanced Security.

```yaml
jobs:
  scan:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - name: Scan Financial Models
        uses: QWED-AI/qwed-finance@v2
        with:
          action: scan
          scan_target: ./models
          scan_type: npv
      
      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: qwed-results.sarif
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `action` | Mode: `verify` (single check) or `scan` (audit files) | No | `verify` |
| `verification_type` | `npv`, `irr`, `ytm`, `sharpe` | Yes (for verify) | - |
| `llm_output` | The value claimed by the LLM (e.g., "15.4%") | Yes (for verify) | - |
| `scan_target` | Directory to scan for logic files | Yes (for scan) | - |

## Supported Verification Types

| Type | Params (Env Vars) | Description |
|------|-------------------|-------------|
| `npv` | `INPUT_CASHFLOWS`, `INPUT_RATE` | Net Present Value |
| `irr` | `INPUT_CASHFLOWS` | Internal Rate of Return |
| `ytm` | `INPUT_FACE_VALUE`, `INPUT_COUPON_RATE`, `INPUT_PRICE`, `INPUT_YEARS` | Yield to Maturity |
| `sharpe` | `INPUT_RETURN`, `INPUT_RISK_FREE`, `INPUT_VOLATILITY` | Sharpe Ratio |

:::info Zero-Config SARIF
When running in `scan` mode, the action automatically generates `qwed-results.sarif`. No extra configuration needed.
:::
