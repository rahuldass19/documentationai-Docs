---
sidebar_position: 10
title: FAQ
description: Frequently asked questions about QWED integration
---

# Frequently Asked Questions

## General

### What is QWED?

QWED is a deterministic verification protocol for Large Language Models (LLMs). It treats LLMs as "untrusted translators" and verifies their outputs using formal methods (SymPy, Z3, AST, SQLGlot).

### How is QWED different from other LLM tools?

| Feature | QWED | RAG | Fine-tuning | Guardrails |
|---------|------|-----|-------------|------------|
| **Deterministic** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Mathematically Proven** | ✅ Yes | ❌ No | ❌ No | ⚠️ Limited |
| **No Training Required** | ✅ Yes | ⚠️ Needs docs | ❌ No | ✅ Yes |
| **Works Offline** | ❌ API-based | ✅ Yes | ✅ Yes | ✅ Yes |

**QWED complements these tools** - use RAG for knowledge, QWED for verification.

---

## Integration

### Do I need to run a backend server?

**Yes!** QWED requires a backend server with YOUR LLM API keys configured.

**Architecture:**
```
Your App → SDK → Backend Server (YOU run) → LLM (YOUR key) → Verifiers
```

**Setup:**
```bash
# Step 1: Configure your LLM
cp .env.example .env
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env

# Step 2: Run backend
python -m qwed_api

# Step 3: Use SDK
python your_app.py
```

See [Getting Started](./integration/getting-started) for full setup.

### Do I need to call my LLM first?

**No!** This is the most common mistake.

❌ **Wrong:**
```python
llm_result = openai.chat(...)  # Don't do this
qwed.verify(llm_result)  # Too late!
```

✅ **Correct:**
```python
# Let QWED backend handle LLM call
result = qwed.verify("your question")
```

The backend server (that YOU run) calls the LLM using YOUR API key.

### What LLM providers does QWED support?

You configure YOUR LLM provider in the backend's `.env` file:

**Supported providers:**
- OpenAI (direct API)
- Anthropic Claude  
- Azure OpenAI
- AWS Bedrock
- Google Gemini

**Example `.env`:**
```bash
ACTIVE_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

See [LLM Configuration](https://github.com/QWED-AI/qwed-verification/blob/main/docs/LLM_CONFIGURATION.md) for all providers.

### Can I use my own LLM API key?

**Yes!** You MUST use your own LLM API key. QWED is open source - you run the backend server with YOUR credentials.

**You provide:**
- Your own LLM API key (in `.env`)
- Your own backend server (run locally)

**You control:**
- Which LLM provider to use
- All your data and keys

---

## Costs

### How much does QWED cost?

**Open Source:** FREE! ✅
- You just pay for your own LLM API usage
- No QWED subscription needed
- Run backend server yourself

**Costs you pay:**
- Your LLM provider (OpenAI, Anthropic, etc)
- Your hosting (if deploying backend)

**Example:**
If using Anthropic Claude:
- Input: $3 per million tokens
- Output: $15 per million tokens
- (See your LLM provider's pricing)

### What are my rate limits?

**QWED itself:** No limits! It's open source.

**Your LLM provider:** Check their limits:
- OpenAI: Tier-based (see dashboard)
- Anthropic: Based on plan
- Azure: Based on deployment

If you hit your LLM provider's rate limit, implement retries:

```python
import time

try:
    result = qwed.verify(query)
except Exception as e:
    if "rate_limit" in str(e):
        time.sleep(60)  # Wait and retry
        result = qwed.verify(query)
```

---

## Security

### Is my data secure?

**Yes.** QWED:
- Uses encrypted connections (HTTPS/TLS)
- Doesn't store verification queries by default
- SOC 2 Type II compliant (Enterprise plan)
- Supports on-premise deployment (Enterprise Pro+)

### Can QWED access my database/files?

**No.** QWED only sees:
- The query you send
- SQL schema (if verifying SQL)
- Code snippet (if verifying code)

It cannot access your application database or files.

### How long is data retained?

**Default:** 30 days for audit logs  
**Enterprise:** Configurable (90 days - 7 years)  
**On-premise:** You control retention

---

## Performance

### How fast is QWED?

**Average response times:**
- Simple queries: 1-2 seconds
- Complex queries: 2-5 seconds
- Batch processing: 0.5s per item

**Factors affecting speed:**
- Query complexity
- Network latency
- Verification engine used

### Can I make QWED faster?

**Yes:**

1. **Use batch processing:**
   ```python
   results = qwed.verify_batch(items)  # Faster than individual calls
   ```

2. **Cache results:**
   ```python
   @cache
   def cached_verify(query):
       return qwed.verify(query)
   ```

3. **Use async:**
   ```python
   results = await qwed.verify_async(queries)
   ```

---

## Verification Domains

### What can QWED verify?

**Supported domains:**
1. **Math** - Calculations, equations, algebra
2. **Logic** - Propositional logic, SAT/UNSAT
3. **Code** - Security vulnerabilities, syntax
4. **SQL** - Injection attacks, tautologies
5. **Facts** - Multi-source consensus
6. **Stats** - Statistical claims
7. **Images** - Visual verification
8. **Consensus** - Multi-model agreement

### What can't QWED verify?

**Not supported:**
- Creative writing quality
- Subjective opinions
- Future predictions
- Unstructured text summaries

**Use cases:** QWED is for **objective, verifiable claims** only.

---

## Errors & Debugging

### Why is my verification failing?

**Common causes:**

1. **Malformed input:**
   ```python
   # ❌ Too vague
   result = qwed.verify("calculate something")
   
   # ✅ Specific
   result = qwed.verify("Calculate 15% of 200")
   ```

2. **Wrong verification method:**
   ```python
   # ❌ Wrong
   result = qwed.verify(code_snippet)
   
   # ✅ Correct
   result = qwed.verify_code(code_snippet, language="python")
   ```

3. **Network issues:**
   ```python
   result = qwed.verify(query, timeout=60)  # Increase timeout
   ```

### How do I debug verification failures?

**Enable verbose mode:**
```python
client = QWEDClient(api_key="...", verbose=True)
result = client.verify("2+2=4")
# Prints internal flow to console
```

**Check trace:**
```python
result = client.verify("2+2=4", return_trace=True)
print(result.trace)
# Shows LLM extraction → verification steps
```

---

## Production Deployment

### Is QWED production-ready?

**Yes.** QWED is used in production by:
- Financial institutions (loan calculations)
- Healthcare AI (drug interaction checking)
- Legal tech (contract analysis)
- EdTech (student assessment)

### How do I deploy QWED to production?

See [Production Deployment Guide](./production) for full checklist.

**Quick steps:**
1. Test thoroughly in staging
2. Deploy with feature flag
3. Start with 5% traffic (canary)
4. Monitor metrics
5. Gradually increase to 100%

### What if QWED goes down?

**Recommended:**
1. Implement fallback mechanism
2. Cache recent results
3. Graceful degradation

```python
try:
    result = qwed.verify(query, timeout=5)
except QWEDError:
    # Fallback to cached/approximate result
    logger.warning("QWED unavailable, using fallback")
    return fallback_result()
```

---

## Support

### How do I get help?

**Community (Free):**
- 📖 [Documentation](https://docs.qwedai.com)
- 💬 [GitHub Discussions](https://github.com/QWED-AI/qwed-verification/discussions)
- 🐛 [Report Bugs](https://github.com/QWED-AI/qwed-verification/issues)

**Enterprise Support:**
- 📧 Email: support@qwedai.com
- 💼 Slack Connect (Enterprise customers)
- 📞 Emergency Hotline (Enterprise Pro+)

**Response times:**
- Community: Best effort
- Pro: 24-48 hours
- Enterprise: 4-hour SLA
- Enterprise Pro+: 1-hour SLA

### Can I request new features?

**Yes!** Submit feature requests:
- GitHub: https://github.com/QWED-AI/qwed-verification/issues
- Email: features@qwedai.com

**Most requested features:**
- Real-time streaming verification (Q2 2026)
- Client-side verification (Q3 2026)
- More language SDKs (ongoing)

---

## Still Have Questions?

- 📖 [Full Documentation](https://docs.qwedai.com)
- 💬 [Community Forum](https://github.com/QWED-AI/qwed-verification/discussions)
- 📧 Contact: support@qwedai.com
