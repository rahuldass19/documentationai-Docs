---
sidebar_position: 5
---

# Examples & Use Cases

Real-world examples of using QWED Open Responses for agent verification.

---

## Example 1: Financial Calculator Agent

### Scenario

An AI agent helps users with financial calculations. Need to verify math before returning results.

### Setup

```python
from qwed_open_responses import ResponseVerifier
from qwed_open_responses.guards import MathGuard, SchemaGuard

verifier = ResponseVerifier()

# Schema for calculation results
calc_schema = {
    "type": "object",
    "required": ["operation", "operands", "result"],
    "properties": {
        "operation": {"enum": ["add", "subtract", "multiply", "divide", "percentage"]},
        "operands": {"type": "array", "items": {"type": "number"}},
        "result": {"type": "number"}
    }
}

math_guard = MathGuard()
schema_guard = SchemaGuard(schema=calc_schema)
```

### Verification

```python
# Agent output: "25% of 200 is 50"
agent_output = {
    "operation": "percentage",
    "operands": [25, 200],
    "result": 50
}

result = verifier.verify_structured_output(
    output=agent_output,
    guards=[schema_guard, math_guard]
)

# ✅ VERIFIED: 25% of 200 = 50 is correct
```

### Catching Errors

```python
# Agent makes mistake: "25% of 200 is 60"
bad_output = {
    "operation": "percentage",
    "operands": [25, 200],
    "result": 60  # Wrong!
}

result = verifier.verify_structured_output(
    output=bad_output,
    guards=[schema_guard, math_guard]
)

# ❌ FAILED: MathGuard
# Error: 25% of 200 = 50, not 60
```

---

## Example 2: Blocking Dangerous Tools

### Scenario

Agent has access to shell commands. Need to prevent dangerous operations.

### Setup

```python
from qwed_open_responses.guards import ToolGuard

# Create blocklist
tool_guard = ToolGuard(
    blocklist=[
        "execute_shell",
        "delete_file",
        "drop_table",
        "send_email",
        "transfer_funds"
    ],
    dangerous_patterns=[
        r"rm\s+-rf",
        r"DROP\s+TABLE",
        r"DELETE\s+FROM.*WHERE\s+1=1"
    ]
)
```

### Blocked Calls

```python
# Agent tries to call dangerous tool
result = verifier.verify_tool_call(
    tool_name="execute_shell",
    arguments={"command": "rm -rf /"},
    guards=[tool_guard]
)

# ❌ BLOCKED
# Reason: Tool 'execute_shell' is in blocklist
# Pattern matched: 'rm -rf'
```

### Allowed Calls

```python
# Safe tool call
result = verifier.verify_tool_call(
    tool_name="read_file",
    arguments={"path": "/data/report.txt"},
    guards=[tool_guard]
)

# ✅ VERIFIED: Tool not in blocklist
```

---

## Example 3: PII Detection

### Scenario

Healthcare AI generating patient summaries. Must not leak PII.

### Setup

```python
from qwed_open_responses.guards import SafetyGuard

safety_guard = SafetyGuard(
    block_pii=True,
    pii_patterns=[
        r"\b\d{3}-\d{2}-\d{4}\b",  # SSN
        r"\b\d{16}\b",              # Credit card
        r"\b[A-Z]{2}\d{6}\b",       # Passport
    ]
)
```

### PII Blocked

```python
# Agent generates summary with SSN
summary = """
Patient John Doe (SSN: 123-45-6789) presented with...
"""

result = verifier.verify({
    "content": summary
}, guards=[safety_guard])

# ❌ BLOCKED
# Reason: PII detected (SSN pattern: 123-45-6789)
```

### Redacted Output

```python
# SafetyGuard can also redact instead of block
safety_guard = SafetyGuard(
    block_pii=False,
    redact_pii=True
)

result = verifier.verify({"content": summary}, guards=[safety_guard])
# Output: "Patient John Doe (SSN: [REDACTED]) presented with..."
```

---

## Example 4: State Machine Validation

### Scenario

Order processing agent. States must follow valid transitions.

### Setup

```python
from qwed_open_responses.guards import StateGuard

# Define valid transitions
state_guard = StateGuard(
    valid_transitions={
        "pending": ["processing", "cancelled"],
        "processing": ["shipped", "failed"],
        "shipped": ["delivered", "returned"],
        "delivered": ["completed"],
        "failed": ["pending"],  # Can retry
        "cancelled": [],  # Terminal state
        "completed": [],  # Terminal state
    }
)
```

### Valid Transition

```python
result = verifier.verify_tool_call(
    tool_name="update_order_status",
    arguments={
        "order_id": "ORD-123",
        "from_state": "processing",
        "to_state": "shipped"
    },
    guards=[state_guard]
)

# ✅ VERIFIED: processing → shipped is valid
```

### Invalid Transition (Blocked)

```python
result = verifier.verify_tool_call(
    tool_name="update_order_status",
    arguments={
        "order_id": "ORD-123",
        "from_state": "delivered",
        "to_state": "pending"  # Can't go back!
    },
    guards=[state_guard]
)

# ❌ BLOCKED
# Reason: Invalid transition: delivered → pending
# Valid transitions from 'delivered': ['completed']
```

---

## Example 5: LangChain Integration

### Full Agent with Verification

```python
from langchain_openai import ChatOpenAI
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.tools import StructuredTool
from qwed_open_responses.middleware.langchain import QWEDCallbackHandler
from qwed_open_responses.guards import ToolGuard, MathGuard, SafetyGuard

# Define tools
def calculate(expression: str) -> str:
    """Calculate a mathematical expression."""
    return str(eval(expression))  # In production, use safe eval!

def send_email(to: str, subject: str, body: str) -> str:
    """Send an email."""
    return f"Email sent to {to}"

tools = [
    StructuredTool.from_function(calculate),
    StructuredTool.from_function(send_email),
]

# Create verification callback
callback = QWEDCallbackHandler(
    guards=[
        ToolGuard(blocklist=["send_email"]),  # Block email for now
        MathGuard(),
        SafetyGuard(block_pii=True),
    ],
    block_on_failure=True,
    log_verifications=True
)

# Create agent
llm = ChatOpenAI(model="gpt-4")
agent = create_tool_calling_agent(llm, tools, prompt)
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    callbacks=[callback],
    verbose=True
)

# Run agent
result = executor.invoke({
    "input": "Calculate 15% tip on $85.50"
})

# Output:
# ToolGuard: ✅ 'calculate' not in blocklist
# MathGuard: ✅ 0.15 × 85.50 = 12.825 verified
# Result: "The 15% tip on $85.50 is $12.83"
```

---

## Example 6: Budget Control

### Scenario

Prevent runaway API costs from agent loops.

### Setup

```python
from qwed_open_responses.guards import SafetyGuard

# Per-session budget
safety_guard = SafetyGuard(
    max_budget=10.0,  # $10 per session
    cost_per_call={
        "gpt-4": 0.03,
        "gpt-3.5": 0.002,
        "dall-e-3": 0.04,
    }
)
```

### Budget Enforcement

```python
# After many calls...
result = verifier.verify_tool_call(
    tool_name="generate_image",
    arguments={"prompt": "A cat"},
    guards=[safety_guard]
)

# If budget exceeded:
# ❌ BLOCKED
# Reason: Budget exceeded ($10.24 > $10.00 limit)
# Session cost breakdown:
#   - 200 × gpt-3.5: $0.40
#   - 50 × gpt-4: $1.50
#   - 200 × dall-e-3: $8.00
#   - This call: $0.04
#   - Total: $10.24
```

---

## Example 7: Argument Type Validation

### Scenario

Ensure tool arguments match expected types.

### Setup

```python
from qwed_open_responses.guards import ArgumentGuard

# Define expected argument types
arg_guard = ArgumentGuard(
    tool_schemas={
        "transfer_money": {
            "from_account": {"type": "string", "pattern": r"^ACC-\d{8}$"},
            "to_account": {"type": "string", "pattern": r"^ACC-\d{8}$"},
            "amount": {"type": "number", "minimum": 0.01, "maximum": 10000},
            "currency": {"type": "string", "enum": ["USD", "EUR", "GBP"]}
        }
    }
)
```

### Validation

```python
# Invalid amount
result = verifier.verify_tool_call(
    tool_name="transfer_money",
    arguments={
        "from_account": "ACC-12345678",
        "to_account": "ACC-87654321",
        "amount": "one hundred",  # Should be number!
        "currency": "USD"
    },
    guards=[arg_guard]
)

# ❌ BLOCKED
# Reason: Argument 'amount' must be number, got string
```

---

## Best Practices

### 1. Layer Multiple Guards

```python
# Defense in depth
verifier = ResponseVerifier(guards=[
    SchemaGuard(schema),      # Structure valid?
    ToolGuard(blocklist),     # Tool allowed?
    ArgumentGuard(schemas),   # Args valid?
    MathGuard(),              # Math correct?
    SafetyGuard(block_pii=True),  # Safe content?
])
```

### 2. Fail Fast, Log Everything

```python
callback = QWEDCallbackHandler(
    block_on_failure=True,
    log_verifications=True,
    on_block=lambda r: logger.error(f"Blocked: {r.block_reason}")
)
```

### 3. Environment-Specific Guards

```python
if os.getenv("ENV") == "production":
    guards = [ToolGuard(blocklist=PROD_BLOCKLIST), SafetyGuard(strict=True)]
else:
    guards = [ToolGuard(allow_unknown=True)]  # More lenient in dev
```

### 4. Test Your Guards

```python
import pytest

def test_tool_guard_blocks_dangerous():
    guard = ToolGuard(blocklist=["delete_all"])
    result = guard.verify(tool_name="delete_all", arguments={})
    assert not result.verified
    assert "blocklist" in result.block_reason
```
