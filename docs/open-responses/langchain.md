---
sidebar_position: 3
title: LangChain Integration
description: Verify LangChain agent actions with QWED
---

# LangChain Integration

QWED Open Responses integrates with LangChain via a callback handler.

---

## Installation

```bash
pip install qwed-open-responses[langchain]
```

---

## Quick Start

```python
from langchain.agents import create_react_agent
from qwed_open_responses.middleware.langchain import QWEDCallbackHandler
from qwed_open_responses import ToolGuard, SafetyGuard

# Create callback with guards
callback = QWEDCallbackHandler(
    guards=[ToolGuard(), SafetyGuard()],
    block_on_failure=True,
)

# Add to agent
agent = create_react_agent(
    llm=llm,
    tools=tools,
    callbacks=[callback],
)

# Agent actions are now verified!
result = agent.invoke({"input": "Search for weather"})
```

---

## Configuration

### QWEDCallbackHandler Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `guards` | list | `[]` | Guards to apply |
| `block_on_failure` | bool | `True` | Raise exception on failure |
| `on_block` | callable | `None` | Callback when blocked |
| `verbose` | bool | `False` | Print verification results |

---

## Example: Blocking Dangerous Tools

```python
from qwed_open_responses import ToolGuard

# Only allow safe tools
callback = QWEDCallbackHandler(
    guards=[
        ToolGuard(
            allowed_tools=["search", "calculator", "weather"],
            blocked_tools=["execute_shell", "write_file"],
        )
    ]
)

# If agent tries to call execute_shell:
# ToolCallBlocked: Tool call blocked: BLOCKED: Tool 'execute_shell' is not allowed
```

---

## Example: Safety Checks

```python
from qwed_open_responses import SafetyGuard

callback = QWEDCallbackHandler(
    guards=[
        SafetyGuard(
            check_pii=True,
            check_injection=True,
            max_cost=50.0,
        )
    ]
)
```

---

## Handling Blocked Actions

```python
from qwed_open_responses.middleware.langchain import ToolCallBlocked

try:
    result = agent.invoke({"input": "Delete all files"})
except ToolCallBlocked as e:
    print(f"Action blocked: {e.result.block_reason}")
    # Log the attempted action
    log_security_event(e.action, e.result)
```

---

## Verification Summary

```python
# After running agent
summary = callback.get_verification_summary()
print(f"Total verifications: {summary['total_verifications']}")
print(f"Passed: {summary['passed']}")
print(f"Failed: {summary['failed']}")
print(f"Success rate: {summary['success_rate']:.1%}")
```

---

## Full Example

```python
from langchain_openai import ChatOpenAI
from langchain.agents import create_react_agent, AgentExecutor
from langchain.tools import Tool
from qwed_open_responses.middleware.langchain import QWEDCallbackHandler
from qwed_open_responses import ToolGuard, MathGuard, SafetyGuard

# Define tools
tools = [
    Tool(name="search", func=search_func, description="Search the web"),
    Tool(name="calculator", func=calc_func, description="Do math"),
]

# Create verified callback
callback = QWEDCallbackHandler(
    guards=[
        ToolGuard(allowed_tools=["search", "calculator"]),
        MathGuard(),
        SafetyGuard(),
    ],
    verbose=True,
)

# Create agent
llm = ChatOpenAI(model="gpt-4")
agent = create_react_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, callbacks=[callback])

# Run with verification
result = executor.invoke({"input": "What is 15% of 200?"})
# [QWED] Tool: calculator -> [OK] Verified (3 guards passed)
```
