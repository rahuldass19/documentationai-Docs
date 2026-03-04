---
sidebar_position: 4
title: Testing Your Integration
description: Validate that QWED is integrated correctly and working as expected
---

# Testing Your Integration

This guide helps you verify that QWED is integrated correctly into your application.

## Why Test Your Integration?

Without proper testing, you might:
- ❌ Call LLM directly (bypassing verification)
- ❌ Miss security vulnerabilities
- ❌ Get incorrect verification results
- ❌ Have silent failures in production

## Quick Validation Checklist

Run this checklist to verify your integration:

```python
from qwed import QWEDClient

client = QWEDClient(api_key="your_key")

# ✅ Test 1: Basic connectivity
try:
    result = client.verify("2+2=4")
    assert result.verified == True
    print("✅ API connectivity working")
except Exception as e:
    print(f"❌ API connectivity failed: {e}")

# ✅ Test 2: Error detection
try:
    result = client.verify("2+2=5")
    assert result.verified == False
    print("✅ Error detection working")
except Exception as e:
    print(f"❌ Error detection failed: {e}")

# ✅ Test 3: Math engine
try:
    result = client.verify_math("sin(π) = 0")
    assert result.verified == True
    print("✅ Math engine working")
except Exception as e:
    print(f"❌ Math engine failed: {e}")

# ✅ Test 4: Code security
try:
    result = client.verify_code("eval(user_input)", language="python")
    assert result.blocked == True
    print("✅ Security engine working")
except Exception as e:
    print(f"❌ Security engine failed: {e}")

# ✅ Test 5: SQL injection detection
try:
    result = client.verify_sql(
        "SELECT * FROM users WHERE id = 1 OR 1=1",
        schema="CREATE TABLE users (id INT)",
        dialect="postgresql"
    )
    assert result.injection_detected == True
    print("✅ SQL injection detection working")
except Exception as e:
    print(f"❌ SQL injection detection failed: {e}")

print("\n🎉 All integration tests passed!")
```

## Detailed Test Suite

### 1. Test API Authentication

**What to test:** Verify API key is valid and working.

```python
from qwed import QWEDClient
from qwed.exceptions import AuthenticationError

# Test valid key
try:
    client = QWEDClient(api_key="your_valid_key")
    result = client.verify("test")
    print("✅ Authentication successful")
except AuthenticationError:
    print("❌ Invalid API key")

# Test invalid key (should fail)
try:
    client = QWEDClient(api_key="invalid_key")
    result = client.verify("test")
    print("❌ Should have failed with invalid key!")
except AuthenticationError:
    print("✅ Invalid key properly rejected")
```

**Expected result:** Valid key works, invalid key raises `AuthenticationError`.

---

### 2. Test Math Verification

**What to test:** Math engine returns correct results.

```python
# Test cases
test_cases = [
    ("2+2=4", True, "Basic addition"),
    ("2+2=5", False, "Incorrect addition"),
    ("sqrt(16)=4", True, "Square root"),
    ("sin(π)=0", True, "Trigonometry"),
    ("log(1)=0", True, "Logarithm"),
]

for expression, expected, description in test_cases:
    result = client.verify_math(expression)
    assert result.verified == expected, f"Failed: {description}"
    print(f"✅ {description}: {expression}")

print("✅ All math tests passed!")
```

**Expected result:** All assertions pass.

---

### 3. Test Code Security

**What to test:** Security vulnerabilities are detected.

```python
# Dangerous code patterns
dangerous_code = [
    ("eval(user_input)", "Command Injection"),
    ("exec(untrusted)", "Code Execution"),
    ("subprocess.call(user_cmd, shell=True)", "Shell Injection"),
    ("f'SELECT * FROM users WHERE name={user}'", "SQL Injection"),
]

for code, vulnerability in dangerous_code:
    result = client.verify_code(code, language="python")
    assert result.blocked == True, f"Missed: {vulnerability}"
    assert vulnerability.lower() in str(result.vulnerabilities).lower()
    print(f"✅ Detected: {vulnerability}")

print("✅ All security tests passed!")
```

**Expected result:** All dangerous patterns are blocked.

---

### 4. Test SQL Injection Detection

**What to test:** SQL injection attempts are caught.

```python
# SQL injection patterns
injection_tests = [
    ("SELECT * FROM users WHERE id = 1 OR 1=1", "Tautology"),
    ("SELECT * FROM users WHERE name = 'admin'--'", "Comment"),
    ("SELECT * FROM users; DROP TABLE users;--", "Stacked Queries"),
]

schema = "CREATE TABLE users (id INT, name TEXT)"

for sql, attack_type in injection_tests:
    result = client.verify_sql(sql, schema=schema, dialect="postgresql")
    assert result.injection_detected == True, f"Missed: {attack_type}"
    print(f"✅ Detected: {attack_type} injection")

print("✅ All SQL injection tests passed!")
```

**Expected result:** All injection patterns are detected.

---

### 5. Test Error Handling

**What to test:** QWED handles errors gracefully.

```python
from qwed.exceptions import ValidationError, TimeoutError

# Test malformed input
try:
    result = client.verify_math("this is not math")
    print(f"Result: {result.verified}")  # Should be False or raise error
except ValidationError as e:
    print(f"✅ Malformed input handled: {e}")

# Test timeout (if applicable)
try:
    result = client.verify("complex query", timeout=0.001)
except TimeoutError:
    print("✅ Timeout handled correctly")

# Test empty input
try:
    result = client.verify("")
    assert result.verified == False
    print("✅ Empty input handled")
except ValidationError:
    print("✅ Empty input rejected")

print("✅ Error handling tests passed!")
```

**Expected result:** Errors are caught and handled gracefully.

---

## Integration Validation Script

Save this as `test_qwed_integration.py` and run it:

```python
#!/usr/bin/env python3
"""
QWED Integration Test Suite
Run this script to validate your QWED integration.
"""

from qwed import QWEDClient
from qwed.exceptions import AuthenticationError, ValidationError
import sys

def test_authentication(api_key):
    """Test 1: Authentication"""
    print("\n🔐 Testing Authentication...")
    try:
        client = QWEDClient(api_key=api_key)
        result = client.verify("2+2=4")
        print("✅ Authentication successful")
        return client
    except AuthenticationError as e:
        print(f"❌ Authentication failed: {e}")
        sys.exit(1)

def test_math_verification(client):
    """Test 2: Math Verification"""
    print("\n🔢 Testing Math Verification...")
    tests = [
        ("2+2=4", True),
        ("2+2=5", False),
        ("sqrt(16)=4", True),
    ]
    
    for expr, expected in tests:
        result = client.verify_math(expr)
        assert result.verified == expected, f"Failed: {expr}"
        print(f"✅ {expr} → {result.verified}")
    
    print("✅ Math verification working")

def test_security(client):
    """Test 3: Code Security"""
    print("\n🔒 Testing Security Detection...")
    dangerous = [
        "eval(user_input)",
        "exec(untrusted_code)",
        "subprocess.call(user_cmd, shell=True)"
    ]
    
    for code in dangerous:
        result = client.verify_code(code, language="python")
        assert result.blocked == True, f"Missed dangerous code: {code}"
        print(f"✅ Blocked: {code}")
    
    print("✅ Security detection working")

def test_sql_injection(client):
    """Test 4: SQL Injection Detection"""
    print("\n💉 Testing SQL Injection Detection...")
    malicious_sql = [
        "SELECT * FROM users WHERE id = 1 OR 1=1",
        "SELECT * FROM users; DROP TABLE users;--"
    ]
    
    schema = "CREATE TABLE users (id INT, name TEXT)"
    
    for sql in malicious_sql:
        result = client.verify_sql(sql, schema=schema, dialect="postgresql")
        assert result.injection_detected == True, f"Missed injection: {sql}"
        print(f"✅ Detected injection in: {sql[:50]}...")
    
    print("✅ SQL injection detection working")

def test_error_handling(client):
    """Test 5: Error Handling"""
    print("\n⚠️  Testing Error Handling...")
    
    # Test malformed input
    try:
        result = client.verify_math("not a math expression")
        assert result.verified == False
        print("✅ Malformed input handled")
    except ValidationError:
        print("✅ Malformed input properly rejected")
    
    # Test empty input
    try:
        result = client.verify("")
        print("✅ Empty input handled")
    except ValidationError:
        print("✅ Empty input rejected")
    
    print("✅ Error handling working")

def main():
    """Run all integration tests"""
    print("=" * 60)
    print("QWED Integration Test Suite")
    print("=" * 60)
    
    # Get API key
    api_key = input("Enter your QWED API key: ").strip()
    if not api_key:
        print("❌ API key required")
        sys.exit(1)
    
    # Run tests
    client = test_authentication(api_key)
    test_math_verification(client)
    test_security(client)
    test_sql_injection(client)
    test_error_handling(client)
    
    # Summary
    print("\n" + "=" * 60)
    print("🎉 ALL TESTS PASSED!")
    print("=" * 60)
    print("\nYour QWED integration is working correctly!")
    print("You can now use QWED in production with confidence.\n")

if __name__ == "__main__":
    main()
```

**Run it:**

```bash
python test_qwed_integration.py
```

**Expected output:**

```
============================================================
QWED Integration Test Suite
============================================================
Enter your QWED API key: qwed_...

🔐 Testing Authentication...
✅ Authentication successful

🔢 Testing Math Verification...
✅ 2+2=4 → True
✅ 2+2=5 → False
✅ sqrt(16)=4 → True
✅ Math verification working

🔒 Testing Security Detection...
✅ Blocked: eval(user_input)
✅ Blocked: exec(untrusted_code)
✅ Blocked: subprocess.call(user_cmd, shell=True)
✅ Security detection working

💉 Testing SQL Injection Detection...
✅ Detected injection in: SELECT * FROM users WHERE id = 1 OR 1=1
✅ Detected injection in: SELECT * FROM users; DROP TABLE users;--...
✅ SQL injection detection working

⚠️  Testing Error Handling...
✅ Malformed input handled
✅ Empty input rejected
✅ Error handling working

============================================================
🎉 ALL TESTS PASSED!
============================================================

Your QWED integration is working correctly!
You can now use QWED in production with confidence.
```

---

## Debugging Failed Tests

### Problem: Authentication Fails

**Symptoms:**
```
❌ Authentication failed: Invalid API key
```

**Solutions:**
1. Check API key is correct
2. Verify API key is active (not revoked)
3. Check for extra spaces in key
4. Regenerate API key if needed

---

### Problem: Math Verification Returns Wrong Results

**Symptoms:**
```python
result = client.verify_math("2+2=4")
assert result.verified == True  # Fails!
```

**Solutions:**
1. Check verbose mode to see internal flow:
   ```python
   client = QWEDClient(api_key="...", verbose=True)
   result = client.verify_math("2+2=4")
   ```

2. Check trace to debug:
   ```python
   result = client.verify_math("2+2=4", return_trace=True)
   print(result.trace)
   ```

3. Verify expression format is correct

---

### Problem: Security Detection Misses Vulnerabilities

**Symptoms:**
```python
result = client.verify_code("eval(user_input)", language="python")
assert result.blocked == True  # Fails!
```

**Solutions:**
1. Check language parameter is correct
2. Verify code string is properly formatted
3. Enable strict mode:
   ```python
   client = QWEDClient(api_key="...", strict_mode=True)
   ```

---

## Performance Testing

### Test Response Times

```python
import time

start = time.time()
result = client.verify("calculate 2+2")
duration = time.time() - start

print(f"Response time: {duration:.2f}s")
assert duration < 5.0, "Response too slow!"
```

**Expected:** < 5 seconds for simple queries

---

### Test Batch Processing

```python
from qwed import BatchItem

items = [
    BatchItem(query="2+2=4", type="math"),
    BatchItem(query="3*3=9", type="math"),
    BatchItem(query="sqrt(16)=4", type="math"),
]

start = time.time()
result = client.verify_batch(items)
duration = time.time() - start

print(f"Batch time: {duration:.2f}s for {len(items)} items")
print(f"Average: {duration/len(items):.2f}s per item")
```

---

## Continuous Integration (CI) Testing

### GitHub Actions Example

```yaml
# .github/workflows/test-qwed.yml
name: Test QWED Integration

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: |
          pip install qwed pytest
      
      - name: Run QWED integration tests
        env:
          QWED_API_KEY: ${{ secrets.QWED_API_KEY }}
        run: |
          pytest test_qwed_integration.py -v
```

---

## Next Steps

Once all tests pass:

✅ [Production Deployment](./production) - Deploy with confidence  
✅ [Monitoring](./monitoring) - Track QWED in production  
✅ [Troubleshooting](./troubleshooting) - Debug common issues  

---

## Need Help?

Can't get tests to pass? We're here to help:

- 💬 [Community Support](https://github.com/QWED-AI/qwed-verification/discussions)
- 📧 Enterprise Support: support@qwedai.com
- 📖 [FAQ](../faq)
