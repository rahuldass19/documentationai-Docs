---
sidebar_position: 6
---

# Troubleshooting

Common issues and solutions when using QWED-UCP.

---

## Installation Issues

### "No module named 'qwed_ucp'"

**Cause:** Package not installed correctly

**Solutions:**

1. **Check Python version** (requires 3.10+):
   ```bash
   python --version
   ```

2. **Install in correct environment:**
   ```bash
   pip install qwed-ucp
   # or with virtual env
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install qwed-ucp
   ```

3. **Verify installation:**
   ```bash
   pip show qwed-ucp
   python -c "from qwed_ucp import UCPVerifier; print('OK')"
   ```

---

### npm install fails for Express middleware

**Cause:** Node.js version incompatibility

**Solution:**
```bash
# Requires Node.js 18+
node --version

# Install
npm install qwed-ucp-middleware
```

---

## Verification Failures

### "Total mismatch: expected $X, got $Y"

**Cause:** Money Guard detected incorrect total calculation

**Debug:**
```python
from qwed_ucp.guards import MoneyGuard
from decimal import Decimal

guard = MoneyGuard()
result = guard.verify(checkout)

if not result.verified:
    print(f"Expected total: {result.expected}")
    print(f"Actual total: {result.actual}")
    print(f"Difference: {result.difference}")
```

**Common causes:**
- Discount not subtracted
- Tax calculated on wrong base
- Rounding differences

**Fix:** Use `Decimal` for monetary calculations:
```python
from decimal import Decimal, ROUND_HALF_UP

subtotal = Decimal("100.00")
discount = subtotal * Decimal("0.10")  # 10%
tax = (subtotal - discount) * Decimal("0.0825")
total = (subtotal - discount + tax).quantize(Decimal("0.01"), ROUND_HALF_UP)
```

---

### "Line item mismatch: qty × price ≠ line_total"

**Cause:** Line Items Guard detected math error

**Debug:**
```python
for item in checkout["line_items"]:
    expected = item["quantity"] * item["item"]["price"]
    print(f"Item: {item['id']}")
    print(f"  {item['quantity']} × ${item['item']['price']} = ${expected}")
```

**Common causes:**
- Floating-point precision issues
- Wrong quantity multiplied
- Missing items in calculation

---

### "Invalid currency: JPY amounts cannot have decimals"

**Cause:** Currency Guard detected invalid format

**Zero-decimal currencies:**
- JPY (Japanese Yen)
- KRW (Korean Won)
- VND (Vietnamese Dong)

**Fix:**
```python
# Wrong
{"currency": "JPY", "amount": 1000.50}

# Correct
{"currency": "JPY", "amount": 1000}
```

---

### "Invalid state transition"

**Cause:** State Guard detected invalid checkout flow

**Valid transitions:**
```
incomplete → ready_for_complete → completed
                               → failed → cancelled
```

**Invalid examples:**
- `completed → incomplete` (can't go back)
- `cancelled → ready_for_complete` (can't resurrect)

**Fix:** Follow the state machine flow properly.

---

## Middleware Issues

### FastAPI middleware not intercepting requests

**Check route configuration:**
```python
# Make sure middleware is added BEFORE routes
app = FastAPI()
app.add_middleware(QWEDUCPMiddleware)  # First

@app.post("/checkout")  # Then routes
async def checkout(): ...
```

**Check verify_paths:**
```python
app.add_middleware(
    QWEDUCPMiddleware,
    verify_paths=["/checkout", "/api/v1/checkout"]  # Must match your routes
)
```

---

### Express middleware returns 500 instead of 422

**Check error handling:**
```javascript
app.use('/checkout', createQWEDUCPMiddleware({
    onFailure: (error, req, res) => {
        // Make sure this doesn't throw
        res.status(422).json({
            error: error.message
        });
    }
}));
```

---

### CORS issues with middleware

**Solution for FastAPI:**
```python
from fastapi.middleware.cors import CORSMiddleware

# Add CORS BEFORE QWED-UCP
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(QWEDUCPMiddleware)
```

---

## Performance Issues

### Verification is slow

**Optimize with caching:**
```python
from functools import lru_cache

@lru_cache(maxsize=1000)
def verify_cached(checkout_hash: str, checkout_json: str):
    return verifier.verify_checkout(json.loads(checkout_json))
```

**Skip unchanged checkouts:**
```python
# Calculate hash first
checkout_hash = hash(frozenset(checkout.items()))
if checkout_hash in verified_cache:
    return verified_cache[checkout_hash]
```

---

## Common Errors Reference

| Error Message | Guard | Likely Cause | Fix |
|---------------|-------|--------------|-----|
| "Total mismatch" | Money | Wrong total calculation | Recalculate total |
| "Line item mismatch" | LineItems | qty × price error | Check each line |
| "Invalid currency" | Currency | Bad format | Check ISO 4217 |
| "Invalid transition" | State | Wrong state flow | Follow state machine |
| "Schema validation failed" | Schema | Missing fields | Check UCP schema |
| "Discount exceeds subtotal" | Discount | Over 100% off | Cap discount |

---

## Getting Help

1. **GitHub Issues:** [github.com/QWED-AI/qwed-ucp/issues](https://github.com/QWED-AI/qwed-ucp/issues)
2. **Documentation:** [docs.qwedai.com/ucp](https://docs.qwedai.com/docs/ucp/overview)
3. **UCP Protocol:** [developers.google.com/commerce/ucp](https://developers.google.com/commerce/ucp)
