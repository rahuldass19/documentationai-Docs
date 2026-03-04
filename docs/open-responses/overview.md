---
sidebar_position: 1
title: Overview
description: QWED Open Responses - Verification guards for AI agent outputs
---

# QWED Open Responses

**Verify AI agent outputs before execution.**

[![PyPI version](https://img.shields.io/pypi/v/qwed-open-responses)](https://pypi.org/project/qwed-open-responses/)
[![Tests](https://github.com/QWED-AI/qwed-open-responses/actions/workflows/ci.yml/badge.svg)](https://github.com/QWED-AI/qwed-open-responses/actions)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

---

## What is QWED Open Responses?

QWED Open Responses provides **deterministic verification guards** for AI agent outputs. It works with:

- OpenAI Responses API
- LangChain agents  
- LlamaIndex
- Any AI framework

### The Problem

When AI agents execute tools or generate structured outputs, they can:
- 🔧 **Call dangerous functions** - `rm -rf /`, `DROP TABLE`
- 🧮 **Produce incorrect calculations** - Financial errors, wrong totals
- 📋 **Violate business rules** - Invalid state transitions
- 🔐 **Leak sensitive data** - PII, API keys in responses
- 💰 **Exceed budgets** - Unlimited API calls

### The Solution

QWED Open Responses intercepts and verifies every agent output before execution:

```
AI Agent Output → Guards → Verified? → Execute
                           │
                    YES ───┘
                    NO ────→ Block + Error
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Agent (GPT, Claude, etc.)                  │
│                                                                  │
│  "Call calculator with x=150, y=10, result=1600"                 │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ Tool Call / Structured Output
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                QWED Open Responses Verifier                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────────────┐│
│  │ SchemaGuard │  │  ToolGuard  │  │       MathGuard          ││
│  │  JSON Valid │  │  Blocklist  │  │  150 × 10 ≠ 1600 ❌      ││
│  └─────────────┘  └─────────────┘  └───────────────────────────┘│
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────────────┐│
│  │ StateGuard  │  │ArgumentGuard│  │      SafetyGuard         ││
│  │ Transitions │  │ Type Check  │  │  PII, Injection, Budget  ││
│  └─────────────┘  └─────────────┘  └───────────────────────────┘│
│                                                                  │
│               MathGuard Failed: 150 × 10 = 1500, not 1600       │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  ❌ BLOCKED     │
                  │  Return error   │
                  └─────────────────┘
```

---

## The 6 Guards

| Guard | What It Verifies | Example Catch |
|-------|------------------|---------------|
| **SchemaGuard** | JSON Schema compliance | Missing required field |
| **ToolGuard** | Block dangerous tool calls | `execute_shell` blocked |
| **MathGuard** | Verify calculations | `150 × 10 ≠ 1600` |
| **StateGuard** | Valid state transitions | `completed → pending` invalid |
| **ArgumentGuard** | Tool argument validation | `amount: "abc"` not a number |
| **SafetyGuard** | PII, injection, budget | SSN detected in output |

---

## Installation

### Basic

```bash
pip install qwed-open-responses
```

### With Framework Integrations

```bash
# OpenAI
pip install qwed-open-responses[openai]

# LangChain
pip install qwed-open-responses[langchain]

# All integrations
pip install qwed-open-responses[all]
```

---

## Quick Start

### Basic Verification

```python
from qwed_open_responses import ResponseVerifier
from qwed_open_responses.guards import ToolGuard, MathGuard, SafetyGuard

verifier = ResponseVerifier()

# Verify a tool call before execution
result = verifier.verify_tool_call(
    tool_name="calculator",
    arguments={
        "operation": "multiply",
        "x": 150,
        "y": 10,
        "result": 1500  # Correct!
    },
    guards=[ToolGuard(), MathGuard(), SafetyGuard()]
)

if result.verified:
    print("✅ Safe to execute")
    execute_tool(result.tool_name, result.arguments)
else:
    print(f"❌ Blocked: {result.block_reason}")
    print(f"   Failed guard: {result.failed_guard}")
```

### Verify Structured Output

```python
from qwed_open_responses.guards import SchemaGuard

# Define expected schema
order_schema = {
    "type": "object",
    "required": ["order_id", "total", "items"],
    "properties": {
        "order_id": {"type": "string"},
        "total": {"type": "number", "minimum": 0},
        "items": {"type": "array", "minItems": 1}
    }
}

result = verifier.verify_structured_output(
    output={
        "order_id": "ORD-123",
        "total": 99.99,
        "items": [{"name": "Widget", "price": 99.99}]
    },
    guards=[SchemaGuard(schema=order_schema)]
)
```

---

## Framework Integration

### LangChain

```python
from langchain_openai import ChatOpenAI
from langchain.agents import create_tool_calling_agent, AgentExecutor
from qwed_open_responses.middleware.langchain import QWEDCallbackHandler

# Create callback with guards
callback = QWEDCallbackHandler(
    guards=[ToolGuard(), SafetyGuard()],
    block_on_failure=True,  # Stop execution if guard fails
)

# Add to agent
llm = ChatOpenAI(model="gpt-4")
agent = create_tool_calling_agent(llm, tools, prompt)
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    callbacks=[callback]
)

# Every tool call is now verified!
result = executor.invoke({"input": "Calculate 25% of 500"})
```

### OpenAI SDK

```python
from qwed_open_responses.middleware.openai_sdk import VerifiedOpenAI
from qwed_open_responses.guards import SchemaGuard, SafetyGuard

# Create verified client
client = VerifiedOpenAI(
    api_key="sk-...",
    guards=[
        SchemaGuard(schema=my_schema),
        SafetyGuard(block_pii=True)
    ]
)

# Use normally - verification is automatic
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Generate an order"}],
    tools=my_tools
)

# Tool calls are verified before returning
for tool_call in response.choices[0].message.tool_calls:
    print(f"Verified tool call: {tool_call.function.name}")
```

---

## Why QWED Open Responses?

### Security Comparison

| Threat | Without Verification | With QWED |
|--------|---------------------|-----------|
| Agent calls `rm -rf /` | 💀 System destroyed | ✅ **BLOCKED** |
| SQL injection in query | 💀 Data breach | ✅ **BLOCKED** |
| Wrong calculation | 💸 Financial loss | ✅ **CAUGHT** |
| PII in API response | 📋 Compliance violation | ✅ **DETECTED** |
| Infinite tool loop | 💰 $10,000 API bill | ✅ **BUDGET GUARD** |

### Real-World Impact

- **Finance:** Prevent wrong calculations in trading bots
- **Healthcare:** Block PII leaks in patient summaries
- **E-commerce:** Verify order totals before payment
- **DevOps:** Prevent dangerous shell commands

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `QWED_OR_LOG_LEVEL` | Logging level | `INFO` |
| `QWED_OR_STRICT` | Fail on any guard failure | `true` |
| `QWED_OR_MAX_BUDGET` | Maximum API cost allowed | `100.0` |

### Custom Guard Configuration

```python
from qwed_open_responses.guards import ToolGuard, SafetyGuard

# Custom tool blocklist
tool_guard = ToolGuard(
    blocklist=["execute_shell", "delete_database", "send_email"],
    allow_unknown=False  # Block tools not in whitelist
)

# Custom safety settings
safety_guard = SafetyGuard(
    block_pii=True,
    block_injection=True,
    max_budget=50.0,  # $50 limit
    harmful_patterns=["password", "secret", "token"]
)

verifier = ResponseVerifier(guards=[tool_guard, safety_guard])
```

---

## Next Steps

- [Guards Reference](./guards) - Deep dive into each guard
- [Examples](./examples) - Real-world use cases
- [LangChain Integration](./langchain) - Agent verification
- [OpenAI Integration](./openai) - Responses API
- [Troubleshooting](./troubleshooting) - Common issues

---

## Links

- **GitHub:** [QWED-AI/qwed-open-responses](https://github.com/QWED-AI/qwed-open-responses)
- **PyPI:** [qwed-open-responses](https://pypi.org/project/qwed-open-responses/)
- **npm:** [qwed-open-responses](https://www.npmjs.com/package/qwed-open-responses)
