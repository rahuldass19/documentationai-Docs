---
sidebar_position: 1
title: UCP Integration
description: Payment token verification for Universal Commerce Protocol
---

# UCP Integration

Connect QWED-Finance to the **Universal Commerce Protocol** for verified e-commerce payments.

## Quick Start

```python
from qwed_finance import UCPIntegration

ucp = UCPIntegration(
    max_transaction_amount=100000,
    allowed_currencies=["USD", "EUR"],
    require_kyc=True
)

# Verify payment token
result = ucp.verify_payment_token({
    "amount": 15000,
    "currency": "USD",
    "customer_country": "US",
    "kyc_verified": True
})

print(result.can_proceed)  # True ✅
print(result.status)       # PaymentStatus.APPROVED
```

---

## Capability Discovery

For UCP's **Dynamic Discovery**, declare your capability:

```python
capability = UCPIntegration.get_capability_definition()
```

### Add to `.well-known/ucp.json`

```json
{
  "business": {
    "name": "Your Bank",
    "verification": {
      "qwed-finance": {
        "enabled": true,
        "endpoint": "/api/qwed/verify",
        "version": "1.0.0",
        "operations": [
          "verify_payment_token",
          "verify_iso20022_payment",
          "verify_loan_terms"
        ]
      }
    }
  }
}
```

---

## Middleware Pattern

Drop into your UCP flow:

```python
# Create middleware
middleware = ucp.create_ucp_middleware()

# Use in your payment handler
@app.post("/ucp/checkout")
def checkout(request: UCPRequest):
    # QWED intercepts
    verification = middleware({
        "action": "payment",
        "payload": request.payment_token
    })
    
    if not verification["allowed"]:
        raise HTTPException(400, verification["violations"])
    
    # Proceed with payment
    return process_payment(request)
```

---

## ISO 20022 Payments

For bank transfers using ISO 20022:

```python
result = ucp.verify_iso20022_payment(
    xml_message=pacs008_xml,
    sanctions_list=["ACME Corp", "Bad Bank"]
)

if result.can_proceed:
    send_to_swift(pacs008_xml)
else:
    flag_for_compliance(result.violations)
```

---

## Verification Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Checkout  │────▶│   QWED      │────▶│   Payment   │
│   Request   │     │   Verify    │     │   Gateway   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │   Checks:   │
                    │ • Amount    │
                    │ • Currency  │
                    │ • AML       │
                    │ • KYC       │
                    │ • Sanctions │
                    └─────────────┘
```

---

## Receipt IDs

Every verification returns receipt IDs for audit:

```python
result = ucp.verify_payment_token(token_data)

for receipt in result.receipts:
    print(f"Receipt: {receipt.receipt_id}")
    print(f"  Guard: {receipt.guard_name}")
    print(f"  Hash: {receipt.input_hash}")
```
