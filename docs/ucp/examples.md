---
sidebar_position: 5
---

# Examples & Use Cases

Real-world examples of using QWED-UCP for commerce verification.

---

## Example 1: E-commerce Checkout

### Scenario

An AI shopping assistant helps a user buy flowers online. The AI calculates discounts and taxes.

### The Checkout Data

```python
checkout = {
    "currency": "USD",
    "status": "ready_for_complete",
    "line_items": [
        {
            "id": "red-roses-dozen",
            "quantity": 2,
            "item": {
                "name": "Red Roses (Dozen)",
                "price": 49.99
            }
        },
        {
            "id": "crystal-vase",
            "quantity": 1,
            "item": {
                "name": "Crystal Vase",
                "price": 29.99
            }
        }
    ],
    "totals": [
        {"type": "subtotal", "amount": 129.97},  # 2×49.99 + 29.99
        {"type": "discount", "amount": 12.99},   # 10% off
        {"type": "tax", "amount": 9.62},         # 8.25% tax
        {"type": "shipping", "amount": 5.99},
        {"type": "total", "amount": 132.59}
    ]
}
```

### Verification

```python
from qwed_ucp import UCPVerifier

verifier = UCPVerifier()
result = verifier.verify_checkout(checkout)

# Verification breakdown:
# ✅ Line Items: 2×49.99 + 1×29.99 = 129.97
# ✅ Discount: 10% of 129.97 = 12.997 ≈ 12.99
# ✅ Tax: 8.25% of (129.97 - 12.99) = 9.65 ≈ 9.62 (within tolerance)
# ✅ Total: 129.97 - 12.99 + 9.62 + 5.99 = 132.59
```

---

## Example 2: International Currency (Japan)

### Scenario

AI agent booking a hotel in Tokyo. JPY has no decimal places.

### Correct (Verified)

```python
checkout_japan = {
    "currency": "JPY",
    "line_items": [
        {"id": "hotel-room", "quantity": 3, "item": {"price": 15000}}
    ],
    "totals": [
        {"type": "subtotal", "amount": 45000},
        {"type": "tax", "amount": 4500},  # 10% consumption tax
        {"type": "total", "amount": 49500}
    ]
}

result = verifier.verify_checkout(checkout_japan)
# ✅ VERIFIED - No decimals, math correct
```

### Incorrect (Blocked)

```python
checkout_japan_bad = {
    "currency": "JPY",
    "totals": [
        {"type": "total", "amount": 49500.50}  # JPY can't have decimals!
    ]
}

result = verifier.verify_checkout(checkout_japan_bad)
# ❌ FAILED: JPY amounts cannot have decimal places
```

---

## Example 3: Discount Validation

### Scenario

AI applies a "20% off" coupon. Need to verify the math.

### Percentage Discount

```python
from qwed_ucp.guards import DiscountGuard
from decimal import Decimal

guard = DiscountGuard()

# AI claims: 20% of $150 = $30
result = guard.verify_percentage_discount(
    subtotal=Decimal("150.00"),
    discount_amount=Decimal("30.00"),
    percentage=Decimal("20")
)
# ✅ VERIFIED: 20% of 150 = 30
```

### AI Makes Mistake

```python
# AI claims: 20% of $150 = $35 (WRONG!)
result = guard.verify_percentage_discount(
    subtotal=Decimal("150.00"),
    discount_amount=Decimal("35.00"),
    percentage=Decimal("20")
)
# ❌ FAILED: 20% of $150 = $30, not $35
# Error: Discount calculation mismatch: expected $30.00, got $35.00
```

---

## Example 4: State Machine Transitions

### Scenario

Checkout progresses through states. Invalid transitions should be blocked.

### Valid Flow

```python
from qwed_ucp.guards import StateGuard

guard = StateGuard()

# Step 1: Empty cart
guard.verify({"status": "incomplete", "line_items": []})
# ✅ Valid: incomplete can be empty

# Step 2: Items added, ready
guard.verify({"status": "ready_for_complete", "line_items": [{"id": "item1"}]})
# ✅ Valid: ready_for_complete has items

# Step 3: Completed
guard.verify({"status": "completed", "order": {"id": "ORD-123"}})
# ✅ Valid: completed has order object
```

### Invalid Transition (Blocked)

```python
# Trying to go backwards: completed → ready_for_complete
guard.verify_transition(
    from_state="completed",
    to_state="ready_for_complete"
)
# ❌ FAILED: Cannot transition from 'completed' to 'ready_for_complete'
```

---

## Example 5: FastAPI Production Setup

### Full Implementation

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from qwed_ucp.middleware.fastapi import QWEDUCPMiddleware
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Commerce API with QWED-UCP")

# Add verification middleware
app.add_middleware(
    QWEDUCPMiddleware,
    verify_paths=["/api/v1/checkout"],
    on_failure="reject",  # or "log" to just log without blocking
    tolerance=0.01
)

class LineItem(BaseModel):
    id: str
    quantity: int
    price: float

class CheckoutRequest(BaseModel):
    currency: str
    line_items: List[LineItem]
    discount_percent: float = 0
    shipping: float = 0

@app.post("/api/v1/checkout")
async def process_checkout(request: CheckoutRequest):
    """
    Process checkout - QWED-UCP already verified the math!
    """
    # Calculate totals (these are already verified by middleware)
    subtotal = sum(item.price * item.quantity for item in request.line_items)
    discount = subtotal * (request.discount_percent / 100)
    tax = (subtotal - discount) * 0.0825  # 8.25% tax
    total = subtotal - discount + tax + request.shipping
    
    return {
        "status": "completed",
        "order_id": "ORD-" + str(hash(str(request)))[:8],
        "total": round(total, 2),
        "verified": True
    }

@app.exception_handler(HTTPException)
async def verification_error_handler(request, exc):
    if exc.status_code == 422:
        return JSONResponse(
            status_code=422,
            content={
                "error": "verification_failed",
                "message": exc.detail,
                "help": "Please recalculate and try again"
            }
        )
    raise exc
```

---

## Example 6: Express.js Production Setup

### Full Implementation

```javascript
const express = require('express');
const { createQWEDUCPMiddleware, UCPVerifier } = require('qwed-ucp-middleware');

const app = express();
app.use(express.json());

// Create verifier with custom config
const verifier = new UCPVerifier({
    tolerance: 0.01,
    strictMode: true
});

// Add middleware to checkout routes
app.use('/api/checkout', createQWEDUCPMiddleware({
    verifier,
    onFailure: (error, req, res) => {
        res.status(422).json({
            error: 'verification_failed',
            guard: error.guard,
            message: error.message,
            expected: error.expected,
            actual: error.actual
        });
    }
}));

app.post('/api/checkout', (req, res) => {
    // If we reach here, math is verified!
    const orderId = 'ORD-' + Date.now();
    
    res.json({
        status: 'completed',
        orderId,
        verified: true
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'internal_error' });
});

app.listen(3000, () => {
    console.log('Commerce API running on port 3000');
    console.log('QWED-UCP verification enabled');
});
```

---

## Example 7: Testing with pytest

### Unit Tests for Guards

```python
import pytest
from decimal import Decimal
from qwed_ucp import UCPVerifier
from qwed_ucp.guards import MoneyGuard, LineItemsGuard

class TestMoneyGuard:
    def test_correct_total(self):
        guard = MoneyGuard()
        result = guard.verify({
            "totals": [
                {"type": "subtotal", "amount": 100.00},
                {"type": "discount", "amount": 10.00},
                {"type": "tax", "amount": 8.25},
                {"type": "total", "amount": 98.25}
            ]
        })
        assert result.verified is True

    def test_wrong_total(self):
        guard = MoneyGuard()
        result = guard.verify({
            "totals": [
                {"type": "subtotal", "amount": 100.00},
                {"type": "total", "amount": 99.00}  # Should be 100!
            ]
        })
        assert result.verified is False
        assert "mismatch" in result.error.lower()

class TestLineItemsGuard:
    def test_correct_line_math(self):
        guard = LineItemsGuard()
        result = guard.verify({
            "line_items": [
                {"quantity": 2, "item": {"price": 25.00}}
            ],
            "totals": [{"type": "subtotal", "amount": 50.00}]
        })
        assert result.verified is True

    def test_quantity_price_mismatch(self):
        guard = LineItemsGuard()
        result = guard.verify({
            "line_items": [
                {"quantity": 2, "item": {"price": 25.00}}
            ],
            "totals": [{"type": "subtotal", "amount": 60.00}]  # Wrong!
        })
        assert result.verified is False
```

---

## Best Practices

### 1. Always Verify Before Payment

```python
# Good: Verify first
if verifier.verify_checkout(checkout).verified:
    process_payment(checkout)
else:
    log_error_and_retry()

# Bad: Process without verification
process_payment(checkout)  # Could have wrong totals!
```

### 2. Use Middleware in Production

Middleware catches errors automatically:
```python
# Instead of manual verification everywhere...
app.add_middleware(QWEDUCPMiddleware)
```

### 3. Log Verification Failures

```python
result = verifier.verify_checkout(checkout)
if not result.verified:
    logger.error(f"Verification failed: {result.error}")
    logger.error(f"Failed guard: {result.failed_guard}")
    logger.error(f"Checkout data: {checkout}")
```

### 4. Set Appropriate Tolerance

```python
# For most currencies: $0.01 tolerance
verifier = UCPVerifier(tolerance=Decimal("0.01"))

# For high-precision applications: stricter
verifier = UCPVerifier(tolerance=Decimal("0.001"))
```
