---
sidebar_position: 10
title: Troubleshooting
description: Common issues and solutions for QWED verification
---

# Troubleshooting Guide

Common issues and how to resolve them.

---

## Authentication Errors

### API Key Invalid

```
Error: 401 Unauthorized - Invalid API key
```

**Solution:**
1. Check your API key is correct: `echo $QWED_API_KEY`
2. Regenerate key at [cloud.qwedai.com](https://cloud.qwedai.com)
3. Ensure no extra spaces or newlines

```python
# Correct
client = QWEDClient(api_key="qwed_live_abc123...")

# Wrong - has newline
client = QWEDClient(api_key="qwed_live_abc123...\n")
```

### Rate Limit Exceeded

```
Error: 429 Too Many Requests
```

**Solution:**
- Free tier: 100 requests/minute
- Pro tier: 1,000 requests/minute
- Enterprise: Unlimited

```python
from qwed_sdk import QWEDClient
import time

client = QWEDClient()

# Implement backoff
for attempt in range(3):
    try:
        result = client.verify("2+2=4")
        break
    except RateLimitError:
        time.sleep(2 ** attempt)
```

---

## Verification Failures

### Math: Floating Point Precision

```python
# Fails due to floating point
result = client.verify_math("0.1 + 0.2 = 0.3")
# False! (0.1 + 0.2 = 0.30000000000000004)
```

**Solution:** Use tolerance parameter:

```python
result = client.verify_math("0.1 + 0.2 = 0.3", tolerance=1e-10)
# True
```

### Logic: Unsatisfiable Constraints

```
Error: No satisfying assignment found
```

**Solution:** Check for contradictions:

```python
# This is unsatisfiable
"(AND (GT x 10) (LT x 5))"  # x > 10 AND x < 5 - impossible!

# Check satisfiability first
result = client.check_satisfiability("(AND (GT x 10) (LT x 5))")
print(result.satisfiable)  # False
```

### Code: Timeout

```
Error: Verification timeout after 30s
```

**Solution:**
1. Increase timeout: `client.verify_code(code, timeout=60)`
2. Simplify code (reduce loops, recursion)
3. Use bounded verification

---

## SDK Issues

### Import Error

```
ModuleNotFoundError: No module named 'qwed_sdk'
```

**Solution:**
```bash
pip install qwed
# or
pip install qwed-sdk
```

### Async Not Working

```python
# Wrong - missing await
result = client.verify("2+2=4")  # Returns coroutine, not result
```

**Solution:**
```python
# Sync client
from qwed_sdk import QWEDClient
client = QWEDClient()
result = client.verify("2+2=4")

# Async client
from qwed_sdk import QWEDAsyncClient
async with QWEDAsyncClient() as client:
    result = await client.verify("2+2=4")  # Must await!
```

---

## DSL Syntax Errors

### Unknown Operator

```
SECURITY BLOCK: Unknown operator 'CHECK_IF_VALID'
```

**Solution:** Only use allowed operators:

| Allowed | Not Allowed |
|---------|-------------|
| AND, OR, NOT | CHECK, VALIDATE |
| GT, LT, EQ | GREATER, LESS |
| IMPLIES, IFF | IF, THEN |
| FORALL, EXISTS | ALL, ANY |

```python
# Wrong
"(CHECK_IF_VALID x)"

# Correct
"(GT x 0)"
```

### Missing Parentheses

```
SyntaxError: Missing closing ')'
```

**Solution:** Count your parentheses:

```python
# Wrong - 3 open, 2 close
"(AND (GT x 5) (LT y 10)"

# Correct - 3 open, 3 close
"(AND (GT x 5) (LT y 10))"
```

---

## Performance Issues

### Slow Verification

**Possible causes:**
1. Complex expressions with many variables
2. Large code files
3. Deep recursion in symbolic execution

**Solutions:**

```python
# 1. Use caching
from qwed_sdk import QWEDClient
client = QWEDClient(cache=True)

# 2. Batch requests
results = client.verify_batch([
    {"query": "2+2=4"},
    {"query": "3+3=6"},
])

# 3. Use async for parallel requests
async def verify_many(queries):
    async with QWEDAsyncClient() as client:
        tasks = [client.verify(q) for q in queries]
        return await asyncio.gather(*tasks)
```

### High Memory Usage

**Solution:** Stream large results:

```python
# For large batch operations
for result in client.verify_batch_stream(large_list):
    process(result)
    # Processes one at a time, not all in memory
```

---

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `E001` | Invalid expression | Check syntax |
| `E002` | Type mismatch | Check variable types |
| `E003` | Division by zero | Add guards |
| `E004` | Timeout | Simplify query |
| `E005` | Rate limit | Implement backoff |
| `E401` | Auth failed | Check API key |
| `E500` | Server error | Contact support |

---

## Getting Help

1. **Documentation:** [docs.qwedai.com](https://docs.qwedai.com)
2. **GitHub Issues:** [github.com/QWED-AI/qwed-verification/issues](https://github.com/QWED-AI/qwed-verification/issues)
3. **Email:** support@qwedai.com
4. **Intercom:** Chat widget on docs site

---

## Debug Mode

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

from qwed_sdk import QWEDClient
client = QWEDClient()

# Now you'll see detailed request/response logs
result = client.verify("2+2=4")
```
