---
sidebar_position: 1
title: Overview
description: QWED-UCP - Verification guards for the Universal Commerce Protocol
---

# QWED-UCP

**Verify AI-driven commerce transactions before they reach payment.**

[![PyPI version](https://img.shields.io/pypi/v/qwed-ucp)](https://pypi.org/project/qwed-ucp/)
[![Tests](https://github.com/QWED-AI/qwed-ucp/actions/workflows/ci.yml/badge.svg)](https://github.com/QWED-AI/qwed-ucp/actions)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

---

## What is QWED-UCP?

QWED-UCP provides **deterministic verification guards** for the [Universal Commerce Protocol (UCP)](https://developers.google.com/commerce/ucp) - Google's open standard for AI-driven commerce.

### The Problem

When AI agents shop on behalf of users, they can make calculation errors that result in:
- 💸 **Wrong totals** - Customers overcharged or undercharged
- 📉 **Bad discounts** - Percentage calculations off
- 🧾 **Incorrect tax** - Legal compliance issues
- 💱 **Currency errors** - International payment failures

### The Solution

QWED-UCP intercepts checkout requests and **mathematically verifies** every calculation before payment:

```
AI Agent → UCP Checkout → QWED-UCP Guard → Payment Gateway
                              │
                         ✅ Pass → Continue
                         ❌ Fail → Block + Error
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Shopping Agent                             │
│                    (Claude, GPT, etc.)                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ UCP Checkout Request
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    QWED-UCP Middleware                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ Money Guard  │  │ State Guard  │  │   Line Items Guard     │ │
│  │   ₹+$+¥     │  │  → → → →     │  │   qty × price = total  │ │
│  └──────────────┘  └──────────────┘  └────────────────────────┘ │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │Discount Guard│  │Currency Guard│  │    Schema Guard        │ │
│  │   10% = 10   │  │  USD/EUR/JPY │  │    JSON Validation     │ │
│  └──────────────┘  └──────────────┘  └────────────────────────┘ │
│                                                                  │
│                     All Guards Pass?                             │
│                    YES ─────┬───── NO                            │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
              ┌───────────────┴────────────────┐
              ▼                                ▼
        ┌──────────┐                    ┌──────────────┐
        │ Payment  │                    │ 422 Error    │
        │ Gateway  │                    │ + Details    │
        └──────────┘                    └──────────────┘
```

---

## The 6 Guards

| Guard | What It Verifies | Error When Wrong |
|-------|------------------|------------------|
| **Money Guard** | `total = subtotal - discount + tax` | "Calculated 98.25, Agent claimed 100.00" (Checked via **SymPy**) |
| **State Guard** | Valid checkout state transitions | "Invalid transition: completed → incomplete" (Checked via **Z3 Solver**) |
| **Schema Guard** | UCP JSON schema compliance | "Missing required field: currency" |
| **Line Items Guard** | `price × quantity = line_total` | "Line item mismatch: 2 × $35 ≠ $65" |
| **Discount Guard** | Percentage and fixed discount math | "10% of $100 should be $10, not $15" |
| **Currency Guard** | ISO 4217 codes, JPY no-decimals | "JPY cannot have decimal amounts" |

---

## Installation

### Python (PyPI)

```bash
pip install qwed-ucp
```

### Node.js (npm)

```bash
npm install qwed-ucp-middleware
```

---

## Quick Start

### Basic Verification

```python
from qwed_ucp import UCPVerifier

verifier = UCPVerifier()

# Verify a checkout
result = verifier.verify_checkout({
    "currency": "USD",
    "status": "ready_for_complete",
    "line_items": [
        {"id": "roses", "quantity": 2, "item": {"price": 35.00}},
        {"id": "vase", "quantity": 1, "item": {"price": 15.00}}
    ],
    "totals": [
        {"type": "subtotal", "amount": 85.00},  # 2×35 + 1×15 = 85 ✓
        {"type": "discount", "amount": 8.50},   # 10% off
        {"type": "tax", "amount": 6.29},        # 8.2% tax on $76.50
        {"type": "total", "amount": 82.79}      # 85 - 8.50 + 6.29 = 82.79 ✓
    ]
})

if result.verified:
    print("✅ Checkout verified! Safe to proceed to payment.")
else:
    print(f"❌ Verification failed: {result.error}")
    print(f"   Guard: {result.failed_guard}")
```

### Middleware Integration (FastAPI)

```python
from fastapi import FastAPI
from qwed_ucp.middleware.fastapi import QWEDUCPMiddleware

app = FastAPI()

# Add QWED-UCP middleware - automatically verifies all /checkout endpoints
app.add_middleware(QWEDUCPMiddleware)

@app.post("/checkout")
async def checkout(request: CheckoutRequest):
    # If we get here, QWED-UCP already verified the math!
    return {"status": "completed", "order_id": "ORD-123"}
```

### Middleware Integration (Express.js)

```javascript
const express = require('express');
const { createQWEDUCPMiddleware } = require('qwed-ucp-middleware');

const app = express();

// Add QWED-UCP middleware
app.use('/checkout', createQWEDUCPMiddleware());

app.post('/checkout', (req, res) => {
    // If we get here, QWED-UCP already verified the math!
    res.json({ status: 'completed', orderId: 'ORD-123' });
});
```

---

## GitHub Action (CI/CD)

Use QWED-UCP as a GitHub Action to audit transaction logs in your CI/CD pipeline.

### Installation

Add to your workflow (`.github/workflows/commerce-audit.yml`):

```yaml
name: Commerce Audit

on:
  push:
    paths:
      - 'logs/transactions/**'

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Audit Commerce Transactions
        uses: QWED-AI/qwed-ucp@v0.2.0
        with:
          log_path: logs/transactions/
          strict_mode: true
```

### Parameters

| Input | Description | Default |
|-------|-------------|---------|
| `log_path` | Path to transaction JSON logs | `./logs/` |
| `strict_mode` | Fail on any violation | `true` |
| `tolerance` | Rounding tolerance (cents) | `0.01` |

### What Gets Audited

The Action scans all `.json` files in the specified path and verifies:
- ✅ Line item math: `price × quantity = total`
- ✅ Discount calculations
- ✅ Tax amounts
- ✅ Currency format (ISO 4217)
- ✅ No "Penny Slicing" (rounding theft)

### Example Output

```
🛡️ QWED-UCP Audit: 3 vulnerabilities blocked

1. ❌ Penny Slicing: tx_001.json - Tax $7.99 should be $8.00
2. ❌ Zombie Return: tx_045.json - Return without original order
3. ❌ Phantom Discount: tx_089.json - 15% discount on non-sale item

Action: BLOCKED (Exit Code 1)
```

---

## Why QWED-UCP?

### Business Impact

| Scenario | Without QWED-UCP | With QWED-UCP |
|----------|------------------|---------------|
| AI miscalculates 10% discount as 15% | Customer overcharged $5 | ❌ Blocked, 422 returned |
| Tax calculation rounds wrong | Legal audit issues | ✅ Caught before payment |
| Currency format invalid | Payment gateway rejects | ✅ Caught at middleware |
| State transition invalid | Order stuck in limbo | ✅ Proper error message |

### ROI Calculation

For a platform processing **100M transactions/year**:
- **Error rate** without verification: ~0.1%
- **Errors per year**: 100,000 transactions
- **Average error cost**: $6.39 (dispute handling + refunds)
- **Potential loss**: **$638,700/year**

QWED-UCP catches these errors **before they become expensive problems**.

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `QWED_UCP_STRICT` | Fail on any schema mismatch | `true` |
| `QWED_UCP_LOG_LEVEL` | Logging level | `INFO` |
| `QWED_UCP_TOLERANCE` | Tolerance for rounding (cents) | `0.01` |

### Custom Guard Configuration

```python
from qwed_ucp import UCPVerifier, MoneyGuard

# Custom tolerance for floating-point errors
verifier = UCPVerifier(
    money_guard=MoneyGuard(tolerance=0.02),  # $0.02 tolerance
    strict_mode=False  # Allow minor schema violations
)
```

---

## Next Steps

- [Guards Reference](./guards) - Deep dive into each guard
- [Examples](./examples) - Real-world use cases
- [FastAPI Middleware](./middleware-fastapi) - Python integration
- [Express.js Middleware](./middleware-express) - Node.js integration
- [Troubleshooting](./troubleshooting) - Common issues

---

## Links

- **GitHub:** [QWED-AI/qwed-ucp](https://github.com/QWED-AI/qwed-ucp)
- **PyPI:** [qwed-ucp](https://pypi.org/project/qwed-ucp/)
- **npm:** [qwed-ucp-middleware](https://www.npmjs.com/package/qwed-ucp-middleware)
- **UCP Protocol:** [developers.google.com/commerce/ucp](https://developers.google.com/commerce/ucp)
