---
sidebar_position: 4
title: Code Engine
description: Verify Python code correctness using symbolic execution
---

# Code Engine

**Verify Python code using CrossHair symbolic execution.**

The Code Engine uses [CrossHair](https://github.com/pschanely/crosshair), a symbolic execution tool for Python, to verify code correctness without running it.

---

## Capabilities

| Feature | Description |
|---------|-------------|
| **Property Verification** | Verify pre/post conditions |
| **Safety Checks** | Division by zero, null checks |
| **Vulnerability Detection** | SQL injection, XSS |
| **Type Checking** | Runtime type violations |
| **Boundary Analysis** | Edge case detection |

---

## Quick Start

```python
from qwed_sdk import QWEDClient

client = QWEDClient()

code = '''
def divide(a: int, b: int) -> float:
    return a / b
'''

result = client.verify_code(code)
print(result.verified)      # False
print(result.issues[0])     # "Division by zero possible when b=0"
```

---

## Safety Verification

### Division by Zero

```python
# UNSAFE - can crash
def divide(a: int, b: int) -> float:
    return a / b

# SAFE - guarded
def divide_safe(a: int, b: int) -> float:
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b
```

```python
result = client.verify_code(unsafe_code)
# Issues: ["Division by zero when b=0"]

result = client.verify_code(safe_code)
# Verified: True, Issues: []
```

### Null Pointer / None Access

```python
# UNSAFE
def get_name(user: Optional[User]) -> str:
    return user.name  # May crash if user is None

# SAFE
def get_name_safe(user: Optional[User]) -> str:
    if user is None:
        return "Guest"
    return user.name
```

### Index Out of Bounds

```python
# UNSAFE
def first_element(items: List[int]) -> int:
    return items[0]  # Crashes on empty list

# SAFE
def first_element_safe(items: List[int]) -> int:
    if not items:
        raise ValueError("List is empty")
    return items[0]
```

---

## Contract Verification

### Preconditions

```python
code = '''
def sqrt(x: float) -> float:
    """
    pre: x >= 0
    """
    return x ** 0.5
'''

result = client.verify_code(code)
# Verifies that callers must pass x >= 0
```

### Postconditions

```python
code = '''
def abs_value(x: int) -> int:
    """
    post: __return__ >= 0
    """
    return x if x >= 0 else -x
'''

result = client.verify_code(code)
# Verifies result is always >= 0
```

### Full Contract

```python
code = '''
def binary_search(arr: List[int], target: int) -> int:
    """
    pre: arr == sorted(arr)  # Array must be sorted
    post: __return__ == -1 or arr[__return__] == target
    """
    # implementation...
'''

result = client.verify_code(code)
```

---

## Security Scanning

### SQL Injection

```python
code = '''
def get_user(username: str) -> str:
    query = f"SELECT * FROM users WHERE name = '{username}'"
    return execute(query)
'''

result = client.verify_code(code, check_security=True)
# Issues: ["SQL Injection vulnerability: unsanitized input in query"]
```

### Command Injection

```python
code = '''
def run_command(user_input: str):
    os.system(f"echo {user_input}")
'''

result = client.verify_code(code, check_security=True)
# Issues: ["Command injection vulnerability"]
```

---

## Complexity Analysis

```python
code = '''
def bubble_sort(arr: List[int]) -> List[int]:
    n = len(arr)
    for i in range(n):
        for j in range(n-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr
'''

result = client.analyze_complexity(code)
print(result.complexity)      # "O(n²)"
print(result.loop_depth)      # 2
print(result.recursive)       # False
```

---

## Language Support

| Language | Support Level |
|----------|---------------|
| Python | Full |
| JavaScript | Basic (coming) |
| TypeScript | Basic (coming) |
| SQL | Via SQL Engine |

---

## Configuration

```python
result = client.verify_code(
    code,
    timeout=30,              # Max verification time
    check_security=True,     # Enable security checks
    check_types=True,        # Enable type checking
    max_iterations=100       # Bounded model checking limit
)
```

---

## Performance

| Code Size | Avg Latency |
|-----------|-------------|
| < 50 lines | 200ms |
| 50-200 lines | 500ms |
| > 200 lines | 1-5s |

---

## Next Steps

- [SQL Engine](./sql) - Verify SQL queries
- [Logic Engine](./logic) - Verify logical constraints
- [Architecture](/docs/architecture) - System overview
