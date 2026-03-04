---
sidebar_position: 11
---

# Schema Verifier

The **Schema Verifier** goes beyond standard JSON validation. It combines **Pydantic** structure enforcement with **Symbolic Math** checks deeply embedded within the schema.

## How It Works

It validates that:
1.  **Structure:** The output matches the required JSON keys and types.
2.  **Logic:** The numeric values *inside* the JSON are mathematically consistent (e.g., `total == sum(items)`).

## Usage

```python
schema = {
    "type": "object",
    "properties": {
        "items": {"type": "array", "items": {"type": "number"}},
        "total": {"type": "number"}
    },
    # QWED Extension: Math Logic
    "qwed:constraints": [
        "total == sum(items)"
    ]
}

response = client.verify_schema(
    obj={"items": [10, 20], "total": 30},
    schema=schema
)
# -> ✅ Verified

response = client.verify_schema(
    obj={"items": [10, 20], "total": 300}, # LLM hallucinations
    schema=schema
)
# -> ❌ MATH ERROR: total (300) != sum(items) (30)
```

## When to use

-   **Invoice Processing:** Ensure line items sum to the total.
-   **Financial Reports:** Ensure balance sheets balance.
-   **Tax Forms:** Ensure calculated fields match underlying data.
