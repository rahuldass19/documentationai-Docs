---
sidebar_position: 2
title: Math Engine
description: Deterministic verification of mathematical expressions using SymPy
---

# Math Engine

**Deterministic verification of mathematical expressions using SymPy.**

The Math Engine is QWED's core verification engine. It uses [SymPy](https://www.sympy.org/) for symbolic computation to provide **100% accurate** verification of mathematical claims.

---

## Capabilities

| Category | Examples | Accuracy |
|----------|----------|----------|
| **Arithmetic** | `2+2=4`, `15*3=45` | 100% |
| **Algebra** | `x^2 - 1 = (x-1)(x+1)` | 100% |
| **Calculus** | Derivatives, Integrals, Limits | 100% |
| **Trigonometry** | `sin(π/2) = 1`, `cos(0) = 1` | 100% |
| **Logarithms** | `log(e) = 1`, `ln(e^x) = x` | 100% |
| **Financial** | Compound interest, NPV, IRR | 100% |
| **Statistics** | Mean, std dev, percentiles | 100% |

---

## Quick Start

```python
from qwed_sdk import QWEDClient

client = QWEDClient(api_key="your_key")

# Verify a math claim
result = client.verify_math("15% of 200 is 30")
print(result.verified)  # True
print(result.status)    # "VERIFIED"
```

---

## Core Operations

### 1. Expression Evaluation

Verify that an expression equals a value:

```python
# Simple arithmetic
result = client.verify_math("2 * (5 + 10) = 30")
# ✓ Verified

# Complex expression
result = client.verify_math("sqrt(16) + 3^2 = 13")
# ✓ Verified

# Percentage
result = client.verify_math("15% of 200 = 30")
# ✓ Verified
```

### 2. Identity Verification

Check if two expressions are mathematically equivalent:

```python
# Algebraic identity - TRUE
result = client.verify_math("(a+b)^2 = a^2 + 2*a*b + b^2")
# ✓ Verified: Algebraic identity proven

# Algebraic identity - FALSE
result = client.verify_math("(a+b)^2 = a^2 + b^2")
# ✗ Not Verified: Missing 2ab term

# Trig identity
result = client.verify_math("sin(x)^2 + cos(x)^2 = 1")
# ✓ Verified: Pythagorean identity
```

### 3. Derivatives

Verify calculus derivatives:

```python
result = client.verify_derivative(
    expression="x^3 + 2*x^2",
    variable="x",
    expected="3*x^2 + 4*x"
)
# ✓ Verified

# Higher-order derivatives
result = client.verify_derivative(
    expression="x^4",
    variable="x",
    expected="12*x^2",
    order=2  # Second derivative
)
# ✓ Verified
```

### 4. Integrals

Verify indefinite and definite integrals:

```python
# Indefinite integral
result = client.verify_integral(
    expression="2*x",
    variable="x",
    expected="x^2"  # + C implied
)
# ✓ Verified

# Definite integral
result = client.verify_integral(
    expression="x^2",
    variable="x",
    lower=0,
    upper=1,
    expected="1/3"
)
# ✓ Verified
```

### 5. Limits

```python
result = client.verify_limit(
    expression="sin(x)/x",
    variable="x",
    point=0,
    expected=1
)
# ✓ Verified: lim(x→0) sin(x)/x = 1
```

---

## Financial Calculations

### Compound Interest

```python
result = client.verify_compound_interest(
    principal=1000,
    rate=0.05,      # 5% annual
    time=10,        # years
    n=12,           # monthly compounding
    expected=1647.01
)
# ✓ Verified
```

### Net Present Value (NPV)

```python
result = client.verify_npv(
    rate=0.10,
    cash_flows=[-1000, 300, 400, 500, 600],
    expected=388.07
)
# ✓ Verified
```

### Internal Rate of Return (IRR)

```python
result = client.verify_irr(
    cash_flows=[-1000, 400, 400, 400],
    expected=0.0985  # ~9.85%
)
# ✓ Verified
```

---

## Error Handling

When verification fails, QWED provides detailed error information:

```python
result = client.verify_math("15% of 200 = 40")

if not result.verified:
    print(result.error)
    # "Calculation incorrect: 15% of 200 = 30, not 40"
    print(result.expected)
    # 30
    print(result.actual)
    # 40
```

---

## Tolerance Settings

For floating-point comparisons:

```python
result = client.verify_math(
    "sqrt(2) = 1.41421",
    tolerance=0.00001  # 5 decimal places
)
# ✓ Verified within tolerance
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Division by zero | Returns error, not verified |
| Undefined expressions | Returns "UNDEFINED" status |
| Complex numbers | Fully supported |
| Very large numbers | Uses arbitrary precision |
| Symbolic variables | Verified algebraically |

---

## Performance

| Operation | Avg Latency | Throughput |
|-----------|-------------|------------|
| Simple arithmetic | 1.5ms | 690/sec |
| Complex expression | 5ms | 200/sec |
| Identity proof | 10ms | 100/sec |

---

## Next Steps

- [Logic Engine](./logic) - Verify logical constraints
- [Code Engine](./code) - Verify code correctness
- [API Reference](/docs/api/endpoints) - Full API documentation
