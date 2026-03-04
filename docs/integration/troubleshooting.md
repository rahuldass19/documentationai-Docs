---
sidebar_position: 7
title: Troubleshooting
description: Debug common QWED integration issues
---

# Troubleshooting Guide

Common issues and how to fix them.

## Authentication Errors

### Problem: "Invalid API Key"

**Symptoms:**
```python
AuthenticationError: Invalid API key
```

**Solutions:**

1. **Check API key is correct:**
   ```bash
   echo $QWED_API_KEY
   ```

2. **Verify key is active:**
   - Log into dashboard
   - Check API keys page
   - Regenerate if needed

3. **Check for whitespace:**
   ```python
   api_key = os.getenv("QWED_API_KEY").strip()
   ```

---

## Verification Failures

### Problem: Unexpected Verification Failures

**Symptoms:**
```python
result.verified == False  # But should be True
```

**Debug steps:**

1. **Enable verbose mode:**
   ```python
   client = QWEDClient(api_key="...", verbose=True)
   result = client.verify("2+2=4")
   ```

2. **Check trace:**
   ```python
   result = client.verify("2+2=4", return_trace=True)
   print(json.dumps(result.trace, indent=2))
   ```

3. **Verify input format:**
   ```python
   # Ensure input is well-formed
   query = "Calculate 2+2"  # Natural language
   # Not: "2 + 2"  # Might fail
   ```

---

## Performance Issues

### Problem: Slow Response Times

**Symptoms:**
Response time > 5 seconds

**Solutions:**

1. **Use batch processing:**
   ```python
   # ❌ Slow
   for q in queries:
       result = client.verify(q)
   
   # ✅ Fast
   results = client.verify_batch([
       BatchItem(query=q) for q in queries
   ])
   ```

2. **Increase timeout:**
   ```python
   client = QWEDClient(api_key="...", timeout=60)
   ```

3. **Check network latency:**
   ```bash
   ping api.qwedai.com
   ```

---

## Quota Issues

### Problem: "Quota Exceeded"

**Symptoms:**
```python
QuotaExceededError: API quota exceeded
```

**Solutions:**

1. **Check quota status:**
   ```python
   status = client.get_quota_status()
   print(f"Used: {status.used}, Remaining: {status.remaining}")
   ```

2. **Upgrade plan:**
   - Visit https://qwedai.com/pricing
   - Contact sales for enterprise

3. **Implement rate limiting:**
   ```python
   from time import sleep
   
   for query in queries:
       result = client.verify(query)
       sleep(0.1)  # 10 req/sec max
   ```

---

## Integration Issues

### Problem: Pages Still Showing 404

**症 Symptoms:**
"Page Not Found" on integration pages

**Solutions:**

1. **Use correct URL format:**
   ```
   ❌ docs.qwedai.com/integration/getting-started
   ✅ docs.qwedai.com/docs/integration/getting-started
   ```

2. **Hard refresh:**
   - Windows: Ctrl + Shift + R
   - Mac: Cmd + Shift + R

3. **Check deployment:**
   - Visit https://github.com/QWED-AI/qwed-enterprise/actions
   - Verify latest deployment succeeded

---

## Error Code Reference

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `AUTH_001` | Invalid API key | Check/regenerate key |
| `AUTH_002` | Expired key | Renew API key |
| `QUOTA_001` | Quota exceeded | Upgrade plan |
| `TIMEOUT_001` | Request timeout | Increase timeout |
| `VALIDATION_001` | Invalid input | Check input format |

---

## Getting Help

### Self-Service:

1. **Check logs:**
   ```python
   import logging
   logging.basicConfig(level=logging.DEBUG)
   ```

2. **Run test suite:**
   ```bash
   python test_qwed_integration.py
   ```

3. **Search documentation:**
   - https://docs.qwedai.com

### Community Support:

- 💬 [GitHub Discussions](https://github.com/QWED-AI/qwed-verification/discussions)
- 🐛 [Report Bug](https://github.com/QWED-AI/qwed-verification/issues)

### Enterprise Support:

- 📧 Email: support@qwedai.com
- 💼 Slack Connect (Enterprise customers)
- 📞 Emergency Hotline (Enterprise Pro+)

---

## Debug Checklist

When troubleshooting:

- [ ] Check error message carefully
- [ ] Enable verbose/debug mode
- [ ] Review logs
- [ ] Test with simple query
- [ ] Check network connectivity
- [ ] Verify API key
- [ ] Check quota status
- [ ] Review recent code changes
- [ ] Test in isolation
- [ ] Search documentation

---

**Still stuck?** Contact support@qwedai.com with:
- Error message
- Code snippet
- Steps to reproduce
- QWED SDK version
