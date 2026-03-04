---
sidebar_position: 3
title: Integration
description: Using TaxPreFlight middleware
---

# Integration Guide

The primary usage pattern for QWED-Tax is the **Pre-Flight Check**.

## TaxPreFlight Middleware

Wrap your Fintech API calls with this auditor.

```python
from qwed_tax.verifier import TaxPreFlight

# 1. Initialize
preflight = TaxPreFlight()

# 2. Capture Intent (from AI Agent)
intent = {
    "action": "hire_worker",
    "worker_type": "1099",  # LLM Decision
    "worker_facts": {
        "provides_tools": True,       # Fact: We gave them a laptop
        "reimburses_expenses": True,  # Fact: We pay for travel
        "indefinite_relationship": True
    },
    "state": "NY",
    "sales_data": {"amount": 600000}  # Fact: YTD Sales
}

# 3. Audit
report = preflight.audit_transaction(intent)

# 4. Enforce
if not report["allowed"]:
    print(f"🛑 BLOCKED: {report['blocks']}")
    # Do NOT call Gusto/Stripe API
else:
    print("✅ Verified. Proceeding to Fintech API.")
    # call_gusto_api()
```

### Standalone Usage

You can also use specific guards individually found in `qwed_tax.jurisdictions`.

```python
from qwed_tax.jurisdictions.us import PayrollGuard

pg = PayrollGuard()
result = pg.verify_fica_tax(gross_ytd=180000, current=5000, claimed_tax=310)
print(result.message) 
# -> "❌ FICA Error: Expected $68.20 (Hit Limit)"
```

## 🌐 TypeScript SDK (New!)
Run compliance checks proactively in the browser/frontend.

```bash
npm install @qwed-ai/tax
```

```typescript
import { TaxPreFlight } from '@qwed-ai/tax';

const result = TaxPreFlight.audit({
  action: "hire",
  worker_type: "1099",
  worker_facts: { provides_tools: true, reimburses_expenses: true } // implies Employee
});

if (!result.allowed) {
   alert(" Compliance Block: " + result.blocks.join(", "));
}
```
