---
sidebar_position: 4
title: Express.js Middleware
description: Integrate QWED-UCP with Express.js applications
---

# Express.js Middleware

Add automatic verification to your Express.js UCP merchant server.

---

## Installation

Copy the middleware file from the GitHub repository:

```bash
# Clone or download
curl -O https://raw.githubusercontent.com/QWED-AI/qwed-ucp/main/middleware/express/qwed-ucp-middleware.js
```

---

## Basic Usage

```javascript
const express = require('express');
const { createQWEDUCPMiddleware } = require('./qwed-ucp-middleware');

const app = express();
app.use(express.json());

// Add middleware
app.use(createQWEDUCPMiddleware());

app.post('/checkout-sessions', (req, res) => {
  // If we get here, checkout is already verified!
  res.status(201).json({ status: 'created' });
});

app.listen(8182);
```

---

## Configuration Options

```javascript
const middleware = createQWEDUCPMiddleware({
  verifyPaths: ['/checkout-sessions', '/checkout'],
  verifyMethods: ['POST', 'PUT', 'PATCH'],
  blockOnFailure: true,
  onVerified: (result, req) => {
    console.log(`✅ Verified: ${result.guardsPassed} guards passed`);
  },
  onFailed: (result, req) => {
    console.log(`❌ Failed: ${result.error}`);
  }
});

app.use(middleware);
```

---

## Response Headers

| Header | Value | Description |
|--------|-------|-------------|
| `X-QWED-Verified` | `true` / `false` | Verification result |
| `X-QWED-Guards-Passed` | `4` | Number of guards passed |
| `X-QWED-Error` | Error message | Only on failure |

---

## Error Response

When verification fails:

```json
{
  "error": "QWED-UCP Verification Failed",
  "message": "Total mismatch: calculated 98.25, declared 100.00",
  "code": "VERIFICATION_FAILED",
  "details": [
    {"guard": "Currency Guard", "verified": true, "error": null},
    {"guard": "Money Guard", "verified": false, "error": "Total mismatch..."}
  ]
}
```

---

## Available Guards (JavaScript)

The Express.js middleware includes local JavaScript implementations:

```javascript
const {
  verifyCurrency,
  verifyTotalsMath,
  verifyState,
  verifyLineItems
} = require('./qwed-ucp-middleware');

// Use individually
const result = verifyCurrency({ currency: 'USD' });
console.log(result.verified); // true
```

---

## Complete Example

```javascript
const express = require('express');
const { createQWEDUCPMiddleware } = require('./qwed-ucp-middleware');

const app = express();
app.use(express.json());

// QWED-UCP middleware
app.use(createQWEDUCPMiddleware({
  blockOnFailure: true,
  onVerified: (result) => console.log('✅ QWED Verified'),
  onFailed: (result) => console.log('❌ QWED Failed:', result.error)
}));

// In-memory store
const checkouts = new Map();
let counter = 1;

app.post('/checkout-sessions', (req, res) => {
  const { currency = 'USD', line_items = [] } = req.body;
  
  const subtotal = line_items.reduce((sum, item) => {
    return sum + (item.price * (item.quantity || 1));
  }, 0);
  
  const tax = Math.round(subtotal * 0.0825 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  
  const checkout = {
    id: `checkout_${counter++}`,
    currency,
    line_items,
    totals: [
      { type: 'subtotal', amount: subtotal },
      { type: 'tax', amount: tax },
      { type: 'total', amount: total }
    ]
  };
  
  checkouts.set(checkout.id, checkout);
  res.status(201).json(checkout);
});

app.listen(8182, () => {
  console.log('🚀 UCP Merchant running on http://localhost:8182');
  console.log('✅ QWED-UCP verification ENABLED');
});
```
