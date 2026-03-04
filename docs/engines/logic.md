---
sidebar_position: 3
title: Logic Engine
description: Verify logical constraints and satisfiability using Z3 SMT solver
---

# Logic Engine

**Verify logical constraints using the Z3 SMT Solver.**

The Logic Engine uses [Z3](https://github.com/Z3Prover/z3), Microsoft's industry-leading Satisfiability Modulo Theories (SMT) solver, to verify logical constraints with mathematical precision.

---

## Capabilities

| Feature | Description |
|---------|-------------|
| **Satisfiability** | Check if constraints have a solution |
| **Model Finding** | Find values that satisfy constraints |
| **Proof Generation** | Prove tautologies |
| **Quantifiers** | FORALL, EXISTS support |
| **Arithmetic** | Integer and real arithmetic |

---

## Quick Start

```python
from qwed_sdk import QWEDClient

client = QWEDClient()

# Check if constraints are satisfiable
result = client.verify_logic("(AND (GT x 5) (LT x 10))")
print(result.satisfiable)  # True
print(result.model)        # {"x": 7}
```

---

## QWED-Logic DSL

QWED uses a secure S-expression DSL for logic expressions.

### Operators

| Category | Operators | Example |
|----------|-----------|---------|
| **Logic** | AND, OR, NOT | `(AND a b)` |
| **Comparison** | GT, LT, EQ, GTE, LTE, NEQ | `(GT x 5)` |
| **Implication** | IMPLIES, IFF | `(IMPLIES a b)` |
| **Quantifiers** | FORALL, EXISTS | `(FORALL x (GT x 0))` |
| **Arithmetic** | PLUS, MINUS, MULT, DIV | `(PLUS x y)` |

### Examples

```python
# Simple constraint
"(GT x 5)"                      # x > 5

# Compound constraint  
"(AND (GT x 5) (LT y 10))"      # x > 5 AND y < 10

# Implication
"(IMPLIES (GT age 18) adult)"   # age > 18 implies adult

# Nested logic
"(AND (OR a b) (NOT c))"        # (a OR b) AND NOT c
```

---

## Satisfiability Checking

### Basic Check

```python
# Satisfiable - has solution
result = client.verify_logic("(AND (GT x 0) (LT x 100))")
print(result.satisfiable)  # True
print(result.model)        # {"x": 50}

# Unsatisfiable - no solution
result = client.verify_logic("(AND (GT x 10) (LT x 5))")
print(result.satisfiable)  # False (x can't be > 10 AND < 5)
```

### Finding All Solutions

```python
result = client.find_all_models(
    "(AND (GTE x 1) (LTE x 3))",
    max_models=10
)
# [{"x": 1}, {"x": 2}, {"x": 3}]
```

---

## Business Rules

### Age Verification

```python
rule = """
(IMPLIES 
    (AND (GTE age 18) (EQ has_id True))
    (EQ can_purchase True)
)
"""
result = client.verify_logic(rule)
```

### Discount Eligibility

```python
rule = """
(AND
    (IMPLIES (GT total 100) (EQ discount 10))
    (IMPLIES (AND (EQ member True) (GT total 50)) (EQ discount 15))
)
"""
result = client.verify_logic(rule)
```

### Approval Workflow

```python
rule = """
(IMPLIES 
    (GT amount 10000)
    (AND (EQ requires_approval True) 
         (GTE approvers 2))
)
"""
result = client.verify_logic(rule)
```

---

## Quantifiers

### Universal (FORALL)

```python
# All items must have positive quantity
result = client.verify_logic(
    "(FORALL item (GT (quantity item) 0))"
)
```

### Existential (EXISTS)

```python
# At least one item must be in stock
result = client.verify_logic(
    "(EXISTS item (GT (stock item) 0))"
)
```

---

## Security: Operator Whitelist

The DSL uses a **strict whitelist** - only approved operators are allowed:

```python
# ALLOWED
"(AND (GT x 5) (LT y 10))"  ✓

# BLOCKED - unknown operator
"(IMPORT os)"               ✗
# Error: SECURITY BLOCK: Unknown operator 'IMPORT'

# BLOCKED - eval attempt
"(EVAL 'print(1)')"         ✗
# Error: SECURITY BLOCK: Unknown operator 'EVAL'
```

---

## Error Handling

```python
result = client.verify_logic("(AND (GT x 5) (LT x 0))")

if not result.satisfiable:
    print("No solution exists")
    print(f"Reason: {result.reason}")
    # "Constraints are contradictory: x > 5 conflicts with x < 0"
```

---

## Performance

| Operation | Avg Latency |
|-----------|-------------|
| Simple constraint | 5ms |
| Complex (10+ clauses) | 20ms |
| Quantified | 50ms |

---

## Next Steps

- [DSL Reference](/docs/api/dsl-reference) - Complete operator documentation
- [Code Engine](./code) - Verify code correctness
- [SQL Engine](./sql) - Verify SQL queries
