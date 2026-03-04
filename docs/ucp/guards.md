---
sidebar_position: 2
title: Guards Reference
description: Complete reference for all 6 QWED-UCP verification guards
---

# Guards Reference

QWED-UCP includes **6 verification guards** that validate different aspects of UCP checkout data.

---

## 1. Money Guard

**Verifies the total formula is mathematically correct.**

```
Total = Subtotal - Discount + Tax + Shipping + Fee
```

### Usage

```python
driver = MoneyGuard()
result = driver.verify_cart_totals(
    line_items=[{"price": 35.00, "quantity": 2}, {"price": 15.00, "quantity": 1}],
    taxes=8.25,
    discounts=10.00,
    claimed_total=98.25
)
# Returns: {"verified": True}
```

### Tolerance

Uses `Decimal` precision with 1 cent ($0.01) tolerance for floating-point errors.

---

## 2. State Guard

**Verifies valid checkout state machine transitions.**

### Valid States

```
incomplete → ready_for_complete → completed
                              ↓
                            failed
                              ↓
                           cancelled
```

### Usage

```python
from qwed_ucp.guards.state_guard import StateGuard

guard = StateGuard()
# Check if we can SHIP given the current state is PAID
result = guard.verify_transition(
    current_state="paid",
    action="ship"
)
# Returns: {"verified": True}
```

### Rules

- `incomplete`: Can be empty
- `ready_for_complete`: Must have line items
- `completed`: Must have order object
- Cannot transition backwards

---

## 3. Schema Guard

**Validates UCP JSON schema compliance.**

### Usage

```python
from qwed_ucp.guards import SchemaGuard

guard = SchemaGuard()
result = guard.verify(checkout_data)
```

### Validates

- Required fields present
- Correct types (string, number, array)
- Valid enum values (status, total types)

---

## 4. Line Items Guard

**Verifies price × quantity = line total for each item.**

### Usage

```python
from qwed_ucp.guards import LineItemsGuard

guard = LineItemsGuard()
result = guard.verify({
    "line_items": [
        {"id": "roses", "quantity": 2, "item": {"price": 35.00}},
        {"id": "pot", "quantity": 1, "item": {"price": 15.00}}
    ],
    "totals": [{"type": "subtotal", "amount": 85.00}]  # 2×35 + 1×15 = 85 ✓
})
```

### Checks

- Each item: `price × quantity = line_total`
- Sum of line items = subtotal
- Quantities must be positive integers
- Prices must be non-negative

---

## 5. Discount Guard

**Verifies percentage and fixed discount calculations.**

### Usage - Percentage Discount

```python
from qwed_ucp.guards import DiscountGuard
from decimal import Decimal

guard = DiscountGuard()
result = guard.verify_percentage_discount(
    subtotal=Decimal("100.00"),
    discount_amount=Decimal("10.00"),
    percentage=Decimal("10")  # 10% of 100 = 10 ✓
)
```

### Usage - Fixed Discount

```python
result = guard.verify_fixed_discount(
    subtotal=Decimal("50.00"),
    discount_amount=Decimal("5.00")  # Fixed $5 off ✓
)
```

### Rules

- Percentage: Must be 0-100%
- Fixed: Cannot exceed subtotal
- Discount must be non-negative

---

## 6. Currency Guard

**Validates ISO 4217 currency codes and format.**

### Usage

```python
from qwed_ucp.guards import CurrencyGuard

guard = CurrencyGuard()
result = guard.verify({"currency": "USD"})
```

### Validates

- 3-letter ISO 4217 codes (USD, EUR, GBP, JPY, etc.)
- Zero-decimal currencies (JPY, KRW) have no decimals
- Currency conversion accuracy

### Zero-Decimal Currencies

```python
# Valid - no decimals
{"currency": "JPY", "totals": [{"type": "total", "amount": 1000}]}

# Invalid - JPY shouldn't have decimals
{"currency": "JPY", "totals": [{"type": "total", "amount": 1000.50}]}
```

---

## Running All Guards

Use `UCPVerifier` to run all guards at once:

```python
from qwed_ucp import UCPVerifier

verifier = UCPVerifier()
result = verifier.verify_checkout(checkout_data)

print(f"Verified: {result.verified}")
print(f"Guards passed: {len([g for g in result.guards if g.verified])}")
```
