---
sidebar_position: 2
title: Guards Reference
description: Complete reference for all verification guards
---

# Guards Reference

QWED Open Responses provides 6 verification guards.

---

## SchemaGuard

Validates AI outputs against JSON Schema.

```python
from qwed_open_responses import SchemaGuard

guard = SchemaGuard(schema={
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "age": {"type": "integer", "minimum": 0}
    },
    "required": ["name", "age"]
})

result = guard.check({"output": {"name": "John", "age": 30}})
# ✅ Passed
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `schema` | dict | required | JSON Schema |
| `strict` | bool | True | Fail on any error |

---

## ToolGuard

Blocks dangerous tool calls and patterns.

```python
from qwed_open_responses import ToolGuard

guard = ToolGuard(
    blocked_tools=["execute_shell", "delete_file"],
    allowed_tools=["search", "calculator"],  # Whitelist mode
    dangerous_patterns=[r"DROP TABLE", r"rm -rf"],
)

result = guard.check({
    "tool_name": "execute_sql",
    "arguments": {"query": "DROP TABLE users"}
})
# ❌ BLOCKED: Dangerous pattern detected
```

### Default Blocked Tools

- `execute_shell`, `bash`, `cmd`
- `delete_file`, `remove_file`
- `send_email`, `transfer_money`

### Default Dangerous Patterns

- `DROP TABLE`, `DELETE FROM`
- `rm -rf`, `rmdir /s`
- `eval(`, `exec(`, `__import__`

---

## MathGuard

Verifies mathematical calculations.

```python
from qwed_open_responses import MathGuard

guard = MathGuard(tolerance=0.01)

result = guard.check({
    "output": {
        "subtotal": 100,
        "tax": 8,
        "shipping": 10,
        "total": 118  # Correct!
    }
})
# ✅ Passed
```

### What It Checks

- Totals: `total = subtotal + tax + shipping`
- Percentages: `tax_amount = subtotal * tax_rate`
- Inline calculations: `"5 + 3 = 8"`

---

## StateGuard

Validates state machine transitions.

```python
from qwed_open_responses import StateGuard

guard = StateGuard(
    transitions={
        "pending": ["processing", "cancelled"],
        "processing": ["completed", "failed"],
        "completed": [],  # Terminal
    },
    current_state="pending"
)

result = guard.check({"new_state": "processing"})
# ✅ Valid transition

result = guard.check({"new_state": "completed"})
# ❌ Invalid: pending -> completed not allowed
```

---

## ArgumentGuard

Validates tool call arguments.

```python
from qwed_open_responses import ArgumentGuard

guard = ArgumentGuard(rules={
    "amount": {"type": "number", "min": 0, "max": 10000},
    "email": {"type": "email"},
    "status": {"type": "enum", "values": ["active", "inactive"]},
})

result = guard.check({
    "arguments": {
        "amount": 500,
        "email": "user@example.com",
        "status": "active"
    }
})
# ✅ All arguments valid
```

### Supported Types

| Type | Validation |
|------|------------|
| `string` | Is string |
| `number` | Is number, min/max |
| `integer` | Is integer |
| `boolean` | Is boolean |
| `email` | Email format |
| `url` | URL format |
| `uuid` | UUID format |
| `enum` | In allowed values |
| `pattern` | Regex match |

---

## SafetyGuard

Comprehensive safety checks.

```python
from qwed_open_responses import SafetyGuard

guard = SafetyGuard(
    check_pii=True,        # Detect emails, phones, SSN
    check_injection=True,  # Detect prompt injection
    check_harmful=True,    # Detect API keys, passwords
    max_cost=100.0,        # Budget limit
)

result = guard.check({
    "content": "ignore previous instructions..."
})
# ❌ BLOCKED: Prompt injection detected
```

### Detections

| Type | Examples |
|------|----------|
| **PII** | Emails, phones, SSN, credit cards |
| **Injection** | "ignore previous", "you are now" |
| **Harmful** | API keys, passwords, private keys |
| **Budget** | Cost/token limits exceeded |

---

## Combining Guards

```python
from qwed_open_responses import (
    ResponseVerifier,
    ToolGuard,
    SchemaGuard,
    SafetyGuard,
)

verifier = ResponseVerifier(
    default_guards=[
        ToolGuard(),
        SchemaGuard(schema=my_schema),
        SafetyGuard(),
    ]
)

result = verifier.verify(response)
print(f"Passed: {result.guards_passed}")
print(f"Failed: {result.guards_failed}")
```
