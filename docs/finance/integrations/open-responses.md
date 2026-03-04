---
sidebar_position: 2
title: Open Responses
description: Agentic tool call verification for streaming agents
---

# Open Responses Integration

Intercept and verify LLM tool calls in your **agentic loop**.

## Quick Start

```python
from qwed_finance import OpenResponsesIntegration

qwed = OpenResponsesIntegration()

# Get OpenAI-compatible tools schema
tools = qwed.get_tools_schema()

# Handle tool call from LLM
result = qwed.handle_tool_call(
    tool_name="calculate_npv",
    arguments={"cashflows": [-1000, 300, 400], "rate": 0.1}
)

print(result.result)  # {"npv": "$180.42", "verified": True}
```

---

## Tool Call Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    LLM      │────▶│    QWED     │────▶│   Verified  │
│  Tool Call  │     │  Intercept  │     │   Result    │
└─────────────┘     └─────────────┘     └─────────────┘
```

1. LLM emits tool call with arguments
2. QWED intercepts and verifies using symbolic solver
3. Returns verified result with receipt

---

## Available Tools

| Tool | Description | Engine |
|------|-------------|--------|
| `calculate_npv` | Net Present Value | SymPy |
| `calculate_loan_payment` | Monthly loan payment | SymPy |
| `check_aml_compliance` | AML threshold check | Z3 |
| `price_option` | Black-Scholes pricing | Calculus |

---

## Item Wrapper (Streaming)

Format results for streaming compatibility:

```python
# Handle tool call
result = qwed.handle_tool_call("calculate_npv", args)

# Format as Open Responses Item
item = qwed.format_as_item(result, tool_call_id="call_abc123")
```

### Item Structure

```json
{
  "type": "tool_result",
  "id": "call_abc123",
  "tool_use_id": "calculate_npv",
  "content": {
    "mime_type": "application/json",
    "text": "{\"result\": {\"npv\": \"$180.42\"}, \"verification\": {\"verified\": true, \"engine\": \"SymPy\", \"receipt_id\": \"abc-123\"}}"
  },
  "is_error": false
}
```

---

## OpenAI Integration

```python
from openai import OpenAI

client = OpenAI()
qwed = OpenResponsesIntegration()

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Calculate NPV of $1000 investment"}],
    tools=qwed.get_tools_schema(),  # QWED verified tools
    tool_choice="auto"
)

# Intercept and verify tool calls
for tool_call in response.choices[0].message.tool_calls:
    verified = qwed.handle_tool_call(
        tool_call.function.name,
        tool_call.function.arguments
    )
    print(verified.result)
```

---

## Custom Tools

Register your own verified tools:

```python
def verify_my_calculation(args):
    # Your verification logic
    return VerifiedToolCall(
        status=ToolCallStatus.APPROVED,
        tool_name="my_tool",
        original_args=args,
        result={"value": computed_value}
    )

qwed.register_tool(
    name="my_tool",
    description="My custom calculation",
    parameters={"type": "object", "properties": {...}},
    verification_fn=verify_my_calculation
)
```

---

## Audit Trail

Access verification history:

```python
# Get all receipts
summary = qwed.audit_log.summary()

# Export for compliance
json_log = qwed.audit_log.export_json()
```
