---
sidebar_position: 6
---

# Troubleshooting

Common issues and solutions when using QWED Open Responses.

---

## Installation Issues

### "No module named 'qwed_open_responses'"

**Cause:** Package not installed

**Solution:**
```bash
pip install qwed-open-responses
```

For specific integrations:
```bash
pip install qwed-open-responses[langchain]
pip install qwed-open-responses[openai]
pip install qwed-open-responses[all]
```

---

### "ImportError: langchain not found"

**Cause:** Missing optional dependency

**Solution:**
```bash
pip install qwed-open-responses[langchain]
# or
pip install langchain langchain-openai
```

---

## Guard Failures

### "SchemaGuard: Missing required field"

**Cause:** Output doesn't match expected schema

**Debug:**
```python
from jsonschema import validate, ValidationError

try:
    validate(output, schema)
except ValidationError as e:
    print(f"Field: {e.path}")
    print(f"Error: {e.message}")
```

**Common fixes:**
- Check field names (case-sensitive)
- Ensure all required fields are present
- Verify types match schema

---

### "ToolGuard: Tool in blocklist"

**Cause:** Agent tried to call a blocked tool

**Debug:**
```python
print(f"Blocked tool: {result.tool_name}")
print(f"Blocklist: {tool_guard.blocklist}")
```

**Options:**
1. Remove tool from blocklist if safe
2. Use whitelist instead
3. Create exception for specific cases

```python
# Whitelist mode
tool_guard = ToolGuard(
    whitelist=["calculator", "search", "read_file"],
    allow_unknown=False
)
```

---

### "MathGuard: Calculation mismatch"

**Cause:** LLM provided wrong calculation

**Debug:**
```python
result = math_guard.verify(output)
if not result.verified:
    print(f"Operation: {result.operation}")
    print(f"Expected: {result.expected}")
    print(f"Got: {result.actual}")
```

**This is working as intended!** The guard caught an LLM hallucination.

**Options:**
1. Return error to user
2. Retry with corrected prompt
3. Use QWED's math engine directly

---

### "SafetyGuard: PII detected"

**Cause:** Response contains personally identifiable information

**Patterns detected:**
- SSN: `\d{3}-\d{2}-\d{4}`
- Credit Card: `\d{16}`
- Email: Standard email pattern
- Phone: Various formats

**Options:**
1. **Block** (default): Return error
2. **Redact**: Replace with `[REDACTED]`
3. **Custom patterns**: Add your own

```python
safety_guard = SafetyGuard(
    block_pii=False,
    redact_pii=True,
    custom_patterns=[
        r"EMPLOYEE-\d{6}",  # Internal ID
    ]
)
```

---

### "StateGuard: Invalid transition"

**Cause:** Trying to move to invalid state

**Debug:**
```python
print(f"From: {from_state}")
print(f"To: {to_state}")
print(f"Valid transitions: {state_guard.valid_transitions[from_state]}")
```

**Fix:** Review your state machine definition.

---

## Integration Issues

### LangChain callback not triggering

**Check callback is added:**
```python
# Wrong
executor = AgentExecutor(agent=agent, tools=tools)

# Right
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    callbacks=[QWEDCallbackHandler(...)]  # Must include!
)
```

**Check tool is being called:**
```python
callback = QWEDCallbackHandler(
    log_verifications=True,  # Enable logging
    guards=[...]
)
```

---

### OpenAI wrapper not verifying

**Check you're using VerifiedOpenAI:**
```python
# Wrong - uses standard client
from openai import OpenAI
client = OpenAI()

# Right - uses verified wrapper
from qwed_open_responses.middleware.openai_sdk import VerifiedOpenAI
client = VerifiedOpenAI(guards=[...])
```

**Check tool_choice is set:**
```python
response = client.chat.completions.create(
    model="gpt-4",
    messages=[...],
    tools=tools,
    tool_choice="auto"  # Must enable tools
)
```

---

### Guards not being applied

**Check guard order:**
```python
# Guards run in order
verifier = ResponseVerifier(guards=[
    SchemaGuard(schema),  # First
    ToolGuard(blocklist), # Second
    SafetyGuard(),        # Last
])
```

**Check guard is configured:**
```python
# Empty blocklist won't block anything
tool_guard = ToolGuard(blocklist=[])  # Does nothing!

# Fix
tool_guard = ToolGuard(blocklist=["dangerous_tool"])
```

---

## Performance Issues

### Verification is slow

**Reduce guards:**
```python
# Only essential guards
verifier = ResponseVerifier(guards=[
    ToolGuard(blocklist),  # Fast
    # Skip MathGuard for non-math outputs
])
```

**Cache schemas:**
```python
# Parse schema once
from functools import lru_cache

@lru_cache
def get_schema_guard(schema_name):
    return SchemaGuard(schema=SCHEMAS[schema_name])
```

---

### Too many false positives

**Tune PII patterns:**
```python
safety_guard = SafetyGuard(
    pii_patterns=[
        r"\b\d{3}-\d{2}-\d{4}\b",  # Only SSN, not dates
    ]
)
```

**Adjust tolerance:**
```python
math_guard = MathGuard(tolerance=0.01)  # Allow 1 cent difference
```

---

## Common Errors Reference

| Error | Guard | Cause | Fix |
|-------|-------|-------|-----|
| "Missing required field" | Schema | Output missing field | Check schema |
| "Tool in blocklist" | Tool | Dangerous tool called | Review blocklist |
| "Calculation mismatch" | Math | LLM math wrong | This is intentional! |
| "PII detected" | Safety | SSN/email in output | Redact or edit prompt |
| "Invalid transition" | State | Bad state flow | Fix state machine |
| "Budget exceeded" | Safety | Too many calls | Increase limit |
| "Argument type error" | Argument | Wrong type | Fix tool schema |

---

## Getting Help

1. **GitHub Issues:** [github.com/QWED-AI/qwed-open-responses/issues](https://github.com/QWED-AI/qwed-open-responses/issues)
2. **Documentation:** [docs.qwedai.com/open-responses](https://docs.qwedai.com/docs/open-responses/overview)
3. **Examples:** [GitHub Examples](https://github.com/QWED-AI/qwed-open-responses/tree/main/examples)
