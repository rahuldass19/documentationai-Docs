---
sidebar_position: 3
title: FastAPI Middleware
description: Integrate QWED-UCP with FastAPI applications
---

# FastAPI Middleware

Add automatic verification to your FastAPI UCP merchant server.

---

## Installation

```bash
pip install qwed-ucp fastapi uvicorn
```

---

## Basic Usage

```python
from fastapi import FastAPI
from qwed_ucp.middleware.fastapi import QWEDUCPMiddleware

app = FastAPI()

# Add middleware - automatically verifies all checkout requests
app.add_middleware(QWEDUCPMiddleware)

@app.post("/checkout-sessions")
async def create_checkout(checkout: dict):
    # If we get here, checkout is already verified!
    return {"status": "created", "checkout": checkout}
```

---

## Configuration Options

```python
app.add_middleware(
    QWEDUCPMiddleware,
    verify_paths=["/checkout-sessions", "/checkout"],  # Paths to verify
    verify_methods=["POST", "PUT", "PATCH"],           # Methods to verify
    block_on_failure=True,                              # Return 422 on failure
    include_details=True,                               # Include guard details in error
    use_advanced_guards=True                            # Run all 6 guards
)
```

---

## Response Headers

The middleware adds verification headers to all responses:

| Header | Value | Description |
|--------|-------|-------------|
| `X-QWED-Verified` | `true` / `false` | Verification result |
| `X-QWED-Guards-Passed` | `6` | Number of guards passed |
| `X-QWED-Error` | Error message | Only on failure |

---

## Error Response

When verification fails, the middleware returns a 422 response:

```json
{
  "error": "QWED-UCP Verification Failed",
  "message": "Total mismatch: expected 98.25, got 100.00",
  "code": "VERIFICATION_FAILED",
  "details": {
    "guards_passed": 4,
    "guards_failed": 1,
    "guards": [
      {"guard": "Currency Guard", "verified": true, "error": null},
      {"guard": "Money Guard", "verified": false, "error": "Total mismatch..."}
    ]
  }
}
```

---

## Manual Verification

For more control, use the dependency injection pattern:

```python
from fastapi import FastAPI, Depends, HTTPException
from qwed_ucp.middleware.fastapi import create_verification_dependency

app = FastAPI()
verify = create_verification_dependency()

@app.post("/checkout-sessions")
async def create_checkout(
    checkout: dict,
    verification = Depends(verify)
):
    if not verification["verified"]:
        raise HTTPException(422, verification["error"])
    
    # Proceed with verified checkout
    return {"status": "created"}
```

---

## Complete Example

```python
"""UCP Merchant Server with QWED-UCP Verification"""

from fastapi import FastAPI
from pydantic import BaseModel
from qwed_ucp.middleware.fastapi import QWEDUCPMiddleware

app = FastAPI(title="QWED-UCP Demo Merchant")

app.add_middleware(
    QWEDUCPMiddleware,
    block_on_failure=True,
    use_advanced_guards=True
)

class LineItem(BaseModel):
    id: str
    quantity: int = 1
    price: float

class CheckoutRequest(BaseModel):
    currency: str = "USD"
    line_items: list[LineItem]

@app.post("/checkout-sessions")
async def create_checkout(request: CheckoutRequest):
    subtotal = sum(item.price * item.quantity for item in request.line_items)
    tax = round(subtotal * 0.0825, 2)
    total = round(subtotal + tax, 2)
    
    return {
        "id": "checkout_123",
        "currency": request.currency,
        "status": "incomplete",
        "line_items": request.line_items,
        "totals": [
            {"type": "subtotal", "amount": subtotal},
            {"type": "tax", "amount": tax},
            {"type": "total", "amount": total},
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8182)
```

Run with:
```bash
python server.py
```
