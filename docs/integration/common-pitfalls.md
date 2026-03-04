---
sidebar_position: 2
title: Common Pitfalls
description: Avoid these common mistakes when integrating QWED
---

# Common Integration Pitfalls

Learn from others' mistakes! This guide covers the most common integration errors.

## ❌ Pitfall #1: Calling LLM Directly

### The Mistake:

```python
# ❌ WRONG!
import openai
from qwed import QWEDClient

# User calls LLM themselves
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "What is 2+2?"}]
)

# Then tries to verify
qwed = QWEDClient(api_key="...")
result = qwed.verify(response.content)  # TOO LATE!
```

### Why It's Wrong:

- 🚫 QWED can't control LLM prompting
- 🚫 No DSL enforcement
- 🚫 Vulnerable to prompt injection
- 🚫 Can't guarantee structured output

### The Fix:

```python
# ✅ CORRECT!
from qwed import QWEDClient

qwed = QWEDClient(api_key="...")

# Just call QWED directly
result = qwed.verify("What is 2+2?")
print(result.verified)  # True
```

**Rule:** Let QWED handle the LLM internally.

---

## ❌ Pitfall #2: Trusting LLM Output Without Verification

### The Mistake:

```python
# ❌ DANGEROUS!
llm_calculation = llm.generate("Calculate loan payment for $50k at 5%")

# Use directly without verification
charge_customer(llm_calculation)  # LAWSUIT WAITING TO HAPPEN!
```

### Why It's Wrong:

- LLMs make mistakes (12% error rate in benchmarks)
- Financial errors = legal liability
- No audit trail

### The Fix:

```python
# ✅ SAFE!
result = qwed.verify("Calculate loan payment for $50k at 5%")

if result.verified:
    charge_customer(result.value)
    log_verification(result.evidence)  # Audit trail
else:
    alert_human_review(result.reason)
```

---

## ❌ Pitfall #3: Wrong Verification Method

### The Mistake:

```python
# ❌ WRONG METHOD!
code_to_verify = """
def login(username, password):
    query = f"SELECT * FROM users WHERE name='{username}'"
"""

# Using general verify() instead of verify_code()
result = qwed.verify(code_to_verify)  # Won't detect SQL injection!
```

### Why It's Wrong:

- Different engines for different domains
- `verify()` won't analyze code security
- Misses vulnerabilities

### The Fix:

```python
# ✅ USE CORRECT METHOD!
result = qwed.verify_code(code_to_verify, language="python")

if result.blocked:
    print(f"Security issue: {result.vulnerabilities}")
```

**Available methods:**
- `verify()` - General (auto-detects domain)
- `verify_math()` - Mathematical expressions
- `verify_logic()` - Logical statements
- `verify_code()` - Code security
- `verify_sql()` - SQL injection
- `verify_fact()` - Fact checking

---

## ❌ Pitfall #4: Ignoring Verification Results

### The Mistake:

```python
# ❌ IGNORING ERRORS!
result = qwed.verify("Calculate 15% of 200")

# Using result without checking verification status
value = result.value  # Might be wrong!
process_payment(value)
```

### Why It's Wrong:

- Verification might have failed
- Using unverified data
- No error handling

### The Fix:

```python
# ✅ ALWAYS CHECK VERIFICATION STATUS!
result = qwed.verify("Calculate 15% of 200")

if result.verified:
    # Safe to use
    process_payment(result.value)
else:
    # Handle failure
    logger.error(f"Verification failed: {result.reason}")
    notify_admin(result.trace)
    use_fallback_method()
```

---

## ❌ Pitfall #5: Not Handling Errors

### The Mistake:

```python
# ❌ NO ERROR HANDLING!
result = qwed.verify("malformed input!!!@#$")
# Might crash or return unexpected result
```

### Why It's Wrong:

- Network failures happen
- API quotas exist
- Invalid input exists

### The Fix:

```python
# ✅ PROPER ERROR HANDLING!
from qwed.exceptions import (
    AuthenticationError,
    ValidationError,
    TimeoutError,
    QuotaExceededError
)

try:
    result = qwed.verify("your query")
    
    if result.verified:
        use_result(result.value)
    else:
        handle_failed_verification(result.reason)
        
except AuthenticationError:
    logger.error("Invalid API key")
    notify_admin("QWED authentication failed")
    
except QuotaExceededError:
    logger.warning("QWED quota exceeded")
    use_fallback_method()
    
except TimeoutError:
    logger.warning("QWED timeout")
    retry_with_backoff()
    
except ValidationError as e:
    logger.error(f"Invalid input: {e}")
    sanitize_and_retry()
```

---

## ❌ Pitfall #6: Missing API Key Configuration

### The Mistake:

```python
# ❌ HARDCODED API KEY!
client = QWEDClient(api_key="qwed_1234567890abcdef")  # Committed to Git!
```

### Why It's Wrong:

- Security risk (API key exposed)
- Can't change keys without code changes
- Different keys for dev/prod

### The Fix:

```python
# ✅ ENVIRONMENT VARIABLE!
import os
from qwed import QWEDClient

api_key = os.getenv("QWED_API_KEY")
if not api_key:
    raise ValueError("QWED_API_KEY environment variable not set")

client = QWEDClient(api_key=api_key)
```

**Or use config file:**

```python
# config.py
from dotenv import load_dotenv
import os

load_dotenv()  # Load from .env file

QWED_API_KEY = os.getenv("QWED_API_KEY")
```

---

## ❌ Pitfall #7: Not Using Batch Processing

### The Mistake:

```python
# ❌ SLOW! (N individual API calls)
results = []
for query in queries:  # 100 queries
    result = qwed.verify(query)  # 100 API calls!
    results.append(result)
```

### Why It's Wrong:

- Slow (sequential API calls)
- Expensive (more API credits)
- Poor user experience

### The Fix:

```python
# ✅ FAST! (1 batch API call)
from qwed import BatchItem

items = [
    BatchItem(query=q, type="math") 
    for q in queries
]

result = qwed.verify_batch(items)  # Single API call!

for item_result in result.items:
    if item_result.verified:
        process(item_result.value)
```

**Performance comparison:**
- Individual: 100 queries × 2s = 200s
- Batch: 1 request × 5s = 5s
- **40x faster!**

---

## ❌ Pitfall #8: Wrong Timeout Settings

### The Mistake:

```python
# ❌ TOO SHORT!
client = QWEDClient(api_key="...", timeout=1)  # 1 second!

result = client.verify("complex calculation")  # Likely to timeout
```

### Why It's Wrong:

- Complex queries need time
- Causes unnecessary failures
- Poor user experience

### The Fix:

```python
# ✅ REASONABLE TIMEOUT!
client = QWEDClient(
    api_key="...",
    timeout=30  # 30 seconds (default)
)

# Or per-request timeout
result = client.verify(
    "complex query",
    timeout=60  # Override for this request
)
```

**Recommended timeouts:**
- Simple queries: 10-15s
- Complex queries: 30-60s
- Batch processing: 60-120s

---

## ❌ Pitfall #9: Not Running Backend Server

### The Mistake:

```python
# ❌ WRONG - SDK without backend!
from qwed import QWEDClient

# Trying to use SDK directly
client = QWEDClient(api_key="qwed_123")
result = client.verify("2+2=4")  # Connection refused!
```

### Why It's Wrong:

- QWED requires a backend server
- SDK is just a client that connects to backend
- Backend needs YOUR LLM API keys

### The Fix:

```bash
# ✅ Terminal 1: Run backend first
cd qwed-verification
cp .env.example .env
# Add your LLM API key to .env
python -m qwed_api

# ✅ Terminal 2: Then use SDK
python your_app.py
```

**Correct SDK usage:**
```python
from qwed import QWEDClient

# Connect to local backend
client = QWEDClient(
    api_key="qwed_local",
    base_url="http://localhost:8000"  # Your running backend!
)

result = client.verify("2+2=4")
```

**Architecture:**
```
Your App → SDK → Backend Server (YOU run) → LLM (YOUR key) → Verifiers
```

**See:** [Getting Started](./getting-started) for full backend setup

---

## ✅ Integration Checklist

Before deploying to production, verify:

- [ ] **Backend server is running** with your LLM API key configured
- [ ] Not calling LLM directly (QWED handles it)
- [ ] Using correct verification methods for each domain
- [ ] Checking `result.verified` before using output
- [ ] Proper error handling (try/except blocks)
- [ ] API key in environment variable (not hardcoded)
- [ ] Using batch processing for multiple queries
- [ ] Reasonable timeout settings
- [ ] Logging verification results for audit trails  
- [ ] Testing integration (see [Testing Guide](./testing))
- [ ] Monitoring QWED in production (see [Monitoring](./monitoring))

---

## Need Help?

Still stuck? We're here to help:

- 📖 [Testing Guide](./testing) - Validate your integration
- 💬 [Community Support](https://github.com/QWED-AI/qwed-verification/discussions)
- 📧 Enterprise Support: support@qwedai.com
