---
sidebar_position: 5
title: Production Deployment
description: Checklist and best practices for deploying QWED to production
---

# Production Deployment Checklist

Ready to deploy QWED to production? Follow this comprehensive checklist.

## Pre-Deployment Checklist

### ✅ 1. Integration Testing Complete

- [ ] All integration tests pass (`test_qwed_integration.py`)
- [ ] Performance tests meet requirements
- [ ] Error handling tested
- [ ] Batch processing tested (if applicable)

### ✅ 2. API Key Management

- [ ] API keys stored in environment variables
- [ ] Different keys for dev/staging/production
- [ ] Key rotation plan in place
- [ ] API keys NOT in Git/version control

**Example `.env` file:**
```bash
# Production
QWED_API_KEY=qwed_prod_...

# Staging
# QWED_API_KEY=qwed_staging_...

# Development
# QWED_API_KEY=qwed_dev_...
```

### ✅ 3. Error Handling

- [ ] All QWED calls wrapped in try/except
- [ ] Fallback mechanisms in place
- [ ] Error logging configured
- [ ] Alerts for critical failures

**Example:**
```python
from qwed.exceptions import QWEDError
import logging

logger = logging.getLogger(__name__)

try:
    result = client.verify(query)
    if result.verified:
        return result.value
    else:
        logger.warning(f"Verification failed: {result.reason}")
        return fallback_value()
except QWEDError as e:
    logger.error(f"QWED error: {e}")
    alert_team(e)
    return safe_default()
```

### ✅ 4. Rate Limiting

- [ ] Understood quota limits for your plan
- [ ] Rate limiting logic implemented
- [ ] Backoff/retry logic in place
- [ ] Monitoring quota usage

### ✅ 5. Logging & Monitoring

- [ ] All QWED calls logged
- [ ] Verification results tracked
- [ ] Error rates monitored
- [ ] Performance metrics captured

---

## Deployment Strategy

### Option 1: Gradual Rollout (Recommended)

**Week 1: Canary (5% traffic)**
```python
import random

def should_use_qwed():
    return random.random() < 0.05  # 5% of requests

if should_use_qwed():
    result = qwed.verify(query)
else:
    result = legacy_method(query)
```

**Week 2-3: Increase to 25%, then 50%**
**Week 4: Full rollout (100%)**

### Option 2: Shadow Mode

Run QWED in parallel without affecting production:

```python
# Production path (existing)
prod_result = existing_llm_call()

# Shadow QWED verification (doesn't affect result)
try:
    qwed_result = qwed.verify(query)
    log_comparison(prod_result, qwed_result)
except Exception as e:
    log_error(e)  # Don't fail production

return prod_result  # Always return existing result
```

### Option 3: Feature Flag

Use feature flags (LaunchDarkly, Split.io):

```python
if feature_flags.is_enabled('qwed_verification', user_id):
    result = qwed.verify(query)
else:
    result = legacy_method(query)
```

---

## Production Configuration

### Recommended Settings

```python
from qwed import QWEDClient

client = QWEDClient(
    api_key=os.getenv("QWED_API_KEY"),
    timeout=30,           # 30 seconds
    max_retries=3,        # Retry failed requests
    strict_mode=True,     # Fail on uncertainty
    verbose=False         # Disable verbose logs in prod
)
```

### Environment-Specific Config

```python
# config.py
import os

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

QWED_CONFIG = {
    "development": {
        "api_key": os.getenv("QWED_DEV_KEY"),
        "timeout": 60,
        "verbose": True,
    },
    "staging": {
        "api_key": os.getenv("QWED_STAGING_KEY"),
        "timeout": 30,
        "verbose": True,
    },
    "production": {
        "api_key": os.getenv("QWED_PROD_KEY"),
        "timeout": 30,
        "verbose": False,
    },
}

def get_qwed_client():
    config = QWED_CONFIG[ENVIRONMENT]
    return QWEDClient(**config)
```

---

## Security Considerations

### 1. API Key Security

✅ **DO:**
- Use environment variables
- Rotate keys regularly (every 90 days)
- Use different keys per environment
- Revoke compromised keys immediately

❌ **DON'T:**
- Commit keys to Git
- Share keys via email/Slack
- Use same key across environments
- Log API keys

### 2. Input Validation

```python
def safe_verify(user_input):
    # Sanitize input
    if len(user_input) > 10000:
        raise ValueError("Input too long")
    
    if not user_input.strip():
        raise ValueError("Empty input")
    
    # Verify
    result = qwed.verify(user_input)
    return result
```

### 3. Output Sanitization

```python
def use_verified_output(result):
    if not result.verified:
        # Don't use unverified output
        raise SecurityError("Verification failed")
    
    # Sanitize even verified output
    safe_value = sanitize(result.value)
    return safe_value
```

---

## Performance Optimization

### 1. Use Batch Processing

```python
# ❌ Slow (N API calls)
for query in queries:
    result = qwed.verify(query)

# ✅ Fast (1 API call)
results = qwed.verify_batch([
    BatchItem(query=q, type="math") 
    for q in queries
])
```

### 2. Caching

```python
from functools import lru_cache

@lru_cache(maxsize=1000)
def cached_verify(query):
    result = qwed.verify(query)
    return result
```

### 3. Async Processing

```python
import asyncio
from qwed import AsyncQWEDClient

async def verify_async(queries):
    client = AsyncQWEDClient(api_key="...")
    
    tasks = [client.verify(q) for q in queries]
    results = await asyncio.gather(*tasks)
    
    return results
```

---

## Database Integration

### Storing Verification Results

```sql
CREATE TABLE verification_logs (
    id SERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    verified BOOLEAN NOT NULL,
    evidence JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id INTEGER,
    duration_ms INTEGER
);
```

**Logging example:**
```python
def verify_and_log(query, user_id):
    start = time.time()
    
    result = qwed.verify(query)
    
    duration_ms = int((time.time() - start) * 1000)
    
    db.execute("""
        INSERT INTO verification_logs 
        (query, verified, evidence, user_id, duration_ms)
        VALUES (%s, %s, %s, %s, %s)
    """, (query, result.verified, result.evidence, user_id, duration_ms))
    
    return result
```

---

## Compliance & Audit Trails

### Requirements

- [ ] All verifications logged
- [ ] Logs retained for compliance period
- [ ] Audit trail accessible
- [ ] Failed verifications flagged

### Audit Log Format

```json
{
  "timestamp": "2026-01-02T23:00:00Z",
  "user_id": "user_123",
  "query": "Calculate loan payment",
  "verified": true,
  "evidence": {
    "calculated": 500.25,
    "claimed": 500.25
  },
  "duration_ms": 234,
  "environment": "production"
}
```

---

## Deployment Checklist

### Before Deploy:

- [ ] All tests pass
- [ ] API keys configured
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Monitoring dashboards ready
- [ ] Rollback plan documented
- [ ] Team notified

### During Deploy:

- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Check logs for errors
- [ ] Monitor metrics
- [ ] Gradual traffic ramp-up

### After Deploy:

- [ ] Verify no error rate increase
- [ ] Check performance metrics
- [ ] Review audit logs
- [ ] Update documentation
- [ ] Team retrospective

---

## Rollback Plan

If issues occur:

**1. Immediate Rollback:**
```python
# Feature flag
feature_flags.disable('qwed_verification')

# Or: Revert deployment
git revert HEAD
git push
```

**2. Investigate:**
- Check error logs
- Review verification failures
- Analyze performance metrics

**3. Fix & Redeploy:**
- Patch issue
- Test thoroughly
- Gradual re-rollout

---

## Go-Live Checklist

**Final checks before 100% rollout:**

- [ ] 7 days of stable canary deployment
- [ ] Error rate < 0.1%
- [ ] Performance acceptable (p95 < 3s)
- [ ] No security incidents
- [ ] Team trained on troubleshooting
- [ ] Monitoring dashboards operational
- [ ] Runbook documented

---

## Next Steps

Once deployed:

- 📊 [Monitor QWED](./monitoring) - Track performance
- 🐛 [Troubleshoot Issues](./troubleshooting) - Debug problems
- 📈 [Optimize Performance](./optimization) - Improve speed

---

**Questions?** Contact support@qwedai.com
