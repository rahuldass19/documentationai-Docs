---
sidebar_position: 4
title: OpenAI Integration
description: Verify OpenAI Responses API outputs with QWED
---

# OpenAI Integration

QWED Open Responses provides a verified wrapper for the OpenAI SDK.

---

## Installation

```bash
pip install qwed-open-responses[openai]
```

---

## Quick Start

```python
from qwed_open_responses.middleware.openai_sdk import VerifiedOpenAI
from qwed_open_responses import ToolGuard, SchemaGuard

# Create verified client
client = VerifiedOpenAI(
    api_key="sk-...",
    guards=[ToolGuard(), SchemaGuard(schema=my_schema)],
)

# Responses are automatically verified
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello"}],
)

# Check verification result
print(response._qwed_verification.verified)
```

---

## Structured Outputs

```python
from qwed_open_responses import SchemaGuard

# Define expected schema
order_schema = {
    "type": "object",
    "properties": {
        "product": {"type": "string"},
        "quantity": {"type": "integer", "minimum": 1},
        "price": {"type": "number", "minimum": 0},
    },
    "required": ["product", "quantity", "price"]
}

client = VerifiedOpenAI(
    api_key="sk-...",
    guards=[SchemaGuard(schema=order_schema)],
)

response = client.chat.completions.create(
    model="gpt-4",
    messages=[...],
    response_format={"type": "json_object"},
)
# If output doesn't match schema: ResponseBlocked exception
```

---

## Tool Calling Verification

```python
from qwed_open_responses import ToolGuard

client = VerifiedOpenAI(
    api_key="sk-...",
    guards=[
        ToolGuard(
            allowed_tools=["get_weather", "search"],
            blocked_tools=["execute_code"],
        )
    ],
)

response = client.chat.completions.create(
    model="gpt-4",
    messages=[...],
    tools=[...],
)
# Tool calls are verified before returning
```

---

## Handling Blocked Responses

```python
from qwed_open_responses.middleware.openai_sdk import ResponseBlocked

try:
    response = client.chat.completions.create(...)
except ResponseBlocked as e:
    print(f"Response blocked: {e.result.block_reason}")
    
    # Access the original response
    original = e.response
    
    # Access verification details
    for guard_result in e.result.guard_results:
        if not guard_result.passed:
            print(f"  - {guard_result.guard_name}: {guard_result.message}")
```

---

## Non-Blocking Mode

```python
# Don't raise exceptions, just mark results
client = VerifiedOpenAI(
    api_key="sk-...",
    guards=[ToolGuard()],
    block_on_failure=False,  # Don't raise exceptions
)

response = client.chat.completions.create(...)

# Check verification manually
if response._qwed_verification.verified:
    process(response)
else:
    handle_failure(response._qwed_verification)
```

---

## Responses API (Preview)

```python
# For the new OpenAI Responses API (when available)
client = VerifiedOpenAI(api_key="sk-...")

response = client.responses.create(
    model="gpt-4",
    input="Search for weather in NYC",
    tools=[{"type": "web_search"}],
)
# Automatically verified
```

---

## Full Example

```python
from qwed_open_responses.middleware.openai_sdk import VerifiedOpenAI, ResponseBlocked
from qwed_open_responses import ToolGuard, SchemaGuard, SafetyGuard

# Create client with multiple guards
client = VerifiedOpenAI(
    api_key="sk-...",
    guards=[
        ToolGuard(blocked_tools=["execute_shell"]),
        SchemaGuard(schema=output_schema),
        SafetyGuard(check_pii=True),
    ],
)

try:
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "user", "content": "Process this order"}
        ],
        tools=available_tools,
    )
    
    print("✅ Response verified!")
    print(f"Guards passed: {response._qwed_verification.guards_passed}")
    
except ResponseBlocked as e:
    print(f"❌ Blocked: {e.result.block_reason}")
```
