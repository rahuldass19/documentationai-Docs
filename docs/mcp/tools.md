---
sidebar_position: 2
---

# MCP Tools Reference

Complete reference for all QWED-MCP verification tools with detailed examples and parameters.

---

## verify_math

Verify mathematical calculations using the SymPy symbolic mathematics engine.

### Description

The `verify_math` tool performs symbolic computation to verify that a claimed mathematical result is correct. It doesn't just check numerical values - it performs the actual mathematical operation and compares the symbolic result.

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `expression` | string | Yes | - | Mathematical expression (e.g., `x^2`, `sin(x)`, `3x + 5`) |
| `claimed_result` | string | Yes | - | The result to verify |
| `operation` | enum | No | `evaluate` | One of: `derivative`, `integral`, `simplify`, `solve`, `evaluate` |

### Operations

| Operation | Description | Example |
|-----------|-------------|---------|
| `derivative` | Compute derivative with respect to x | `d/dx(x^2) = 2x` |
| `integral` | Compute indefinite integral | `∫x dx = x^2/2` |
| `simplify` | Simplify expression | `(x^2-1)/(x-1) = x+1` |
| `solve` | Solve equation for x | `x^2 - 4 = 0 → x = ±2` |
| `evaluate` | Evaluate/simplify (default) | `2+2 = 4` |

### Examples

#### Basic Derivative

```json
{
  "expression": "x^3",
  "claimed_result": "3*x^2",
  "operation": "derivative"
}
```

**Response:**
```
✅ VERIFIED
Result: Calculation verified
Expected: 3*x**2
Actual: 3*x**2
Operation: derivative
```

#### Integral Verification

```json
{
  "expression": "2*x",
  "claimed_result": "x^2",
  "operation": "integral"
}
```

**Response:**
```
✅ VERIFIED
Result: Calculation verified
Expected: x**2
Actual: x**2
Operation: integral
```

#### Wrong Calculation (Caught!)

```json
{
  "expression": "x^2",
  "claimed_result": "x",
  "operation": "derivative"
}
```

**Response:**
```
❌ FAILED
Result: Calculation incorrect
Expected: 2*x
Actual: x
Operation: derivative
```

#### Complex Expressions

```json
{
  "expression": "sin(x)^2 + cos(x)^2",
  "claimed_result": "1",
  "operation": "simplify"
}
```

**Response:**
```
✅ VERIFIED
Result: Calculation verified
Expected: 1
Actual: 1
Operation: simplify
```

### Supported Syntax

| Notation | Meaning |
|----------|---------|
| `x^2` or `x**2` | x squared |
| `sqrt(x)` | Square root |
| `sin(x)`, `cos(x)`, `tan(x)` | Trigonometric functions |
| `log(x)` | Natural logarithm |
| `exp(x)` | Exponential (e^x) |
| `pi` | π (3.14159...) |
| `e` | Euler's number (2.71828...) |

---

## verify_logic

Verify logical arguments using the Z3 SMT solver.

### Description

The `verify_logic` tool uses satisfiability modulo theories (SMT) to determine if a conclusion logically follows from given premises. It performs **proof by contradiction**: if the premises AND NOT(conclusion) is unsatisfiable, then the argument is valid.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `premises` | array[string] | Yes | List of premise statements |
| `conclusion` | string | Yes | The conclusion to verify |

### Supported Logic Formats

| Pattern | Example | Meaning |
|---------|---------|---------|
| `A implies B` | "rain implies wet" | If A then B |
| `if A then B` | "if rain then wet" | If A then B |
| `A and B` | "hot and sunny" | Both A and B |
| `A or B` | "rain or snow" | A or B or both |
| `not A` | "not cold" | Negation |
| `all X are Y` | "all humans are mortal" | For all X, X is Y |
| `X is Y` | "Socrates is human" | X has property Y |

### Examples

#### Classic Syllogism

```json
{
  "premises": [
    "all humans are mortal",
    "Socrates is human"
  ],
  "conclusion": "Socrates is mortal"
}
```

**Response:**
```
✅ VERIFIED
Message: The conclusion logically follows from the premises
Method: proof by contradiction (Z3 SMT solver)
```

#### Modus Ponens

```json
{
  "premises": [
    "A implies B",
    "A"
  ],
  "conclusion": "B"
}
```

**Response:**
```
✅ VERIFIED
Message: The conclusion logically follows from the premises
```

#### Invalid Argument (Caught!)

```json
{
  "premises": [
    "A implies B",
    "B"
  ],
  "conclusion": "A"
}
```

**Response:**
```
❌ FAILED
Message: The conclusion does not logically follow from the premises
Counterexample: A counterexample exists where premises are true but conclusion is false
```

#### Complex Reasoning

```json
{
  "premises": [
    "if raining then ground is wet",
    "if ground is wet then slippery",
    "raining"
  ],
  "conclusion": "slippery"
}
```

**Response:**
```
✅ VERIFIED
Message: The conclusion logically follows from the premises
```

---

## verify_code

Check code for security vulnerabilities using AST (Abstract Syntax Tree) analysis.

### Description

The `verify_code` tool performs static analysis on code to detect dangerous patterns and potential security vulnerabilities. It uses AST parsing for accurate detection rather than simple string matching.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | Yes | Code to analyze |
| `language` | enum | Yes | One of: `python`, `javascript`, `sql` |

### Detected Patterns

#### Python

| Pattern | Severity | Why Dangerous |
|---------|----------|---------------|
| `eval()` | 🔴 Critical | Executes arbitrary code |
| `exec()` | 🔴 Critical | Executes arbitrary code |
| `compile()` | 🔴 Critical | Can compile malicious code |
| `__import__()` | 🟠 High | Dynamic imports |
| `os.system()` | 🔴 Critical | Shell command execution |
| `subprocess.*` | 🟠 High | Process spawning |
| `pickle.loads()` | 🔴 Critical | Arbitrary code execution |
| `open()` | 🟡 Medium | File system access |

#### JavaScript

| Pattern | Severity | Why Dangerous |
|---------|----------|---------------|
| `eval()` | 🔴 Critical | Executes arbitrary code |
| `Function()` | 🔴 Critical | Creates executable code |
| `innerHTML =` | 🟠 High | XSS vulnerability |
| `document.write()` | 🟠 High | XSS vulnerability |
| `setTimeout(string)` | 🔴 Critical | Code injection |

#### SQL

| Pattern | Severity | Why Dangerous |
|---------|----------|---------------|
| String concatenation | 🟠 High | SQL injection risk |
| `--` comments | 🟡 Medium | May indicate injection |
| `UNION SELECT` | 🔴 Critical | Data exfiltration |

### Examples

#### Dangerous Python Code

```json
{
  "code": "result = eval(user_input)",
  "language": "python"
}
```

**Response:**
```
❌ FAILED
Message: Found 1 security issue(s)
Issues: ["Dangerous function call: eval()"]
```

#### Multiple Issues

```json
{
  "code": "import os\nos.system(input())\nexec(data)",
  "language": "python"
}
```

**Response:**
```
❌ FAILED
Message: Found 3 security issue(s)
Issues: [
  "Dangerous function call: exec()",
  "Dangerous pattern: os.system",
  "Potentially dangerous pattern: subprocess"
]
```

#### Safe Code

```json
{
  "code": "def add(a, b):\n    return a + b",
  "language": "python"
}
```

**Response:**
```
✅ VERIFIED
Message: No security issues detected
Issues: []
```

#### XSS in JavaScript

```json
{
  "code": "element.innerHTML = userContent",
  "language": "javascript"
}
```

**Response:**
```
❌ FAILED
Message: Found 1 security issue(s)
Issues: ["Potential XSS: Direct innerHTML assignment"]
```

---

## verify_sql

Detect SQL injection vulnerabilities and validate queries.

### Description

The `verify_sql` tool analyzes SQL queries for injection patterns, dangerous operations, and schema compliance. It can optionally validate against a whitelist of allowed tables.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | SQL query to verify |
| `allowed_tables` | array[string] | No | Optional whitelist of allowed table names |

### Detected Patterns

#### Injection Patterns

| Pattern | Description |
|---------|-------------|
| `' OR '1'='1` | Classic always-true injection |
| `' OR 1=1` | Numeric tautology |
| `'; --` | Comment injection |
| `UNION SELECT` | Data exfiltration |
| `/*...*/` | Block comments (may hide payload) |

#### Dangerous Operations

| Pattern | Description |
|---------|-------------|
| `DROP TABLE` | Table deletion |
| `DROP DATABASE` | Database deletion |
| `TRUNCATE TABLE` | Data deletion |
| `DELETE FROM ... (no WHERE)` | Mass deletion |
| `UPDATE ... (no WHERE)` | Mass update |
| `xp_cmdshell` | SQL Server command execution |

### Examples

#### SQL Injection Detected

```json
{
  "query": "SELECT * FROM users WHERE id = '1' OR '1'='1'"
}
```

**Response:**
```
❌ FAILED
Message: Found 2 issue(s) in SQL query
Issues: [
  "Potential SQL injection: '\\s*OR\\s+'1'\\s*=\\s*'1",
  "Suspicious tautology detected: 1\\s*=\\s*1"
]
```

#### Missing WHERE Clause

```json
{
  "query": "DELETE FROM users"
}
```

**Response:**
```
❌ FAILED
Message: Found 1 issue(s) in SQL query
Issues: ["Warning: DELETE without WHERE clause"]
```

#### Table Whitelist Violation

```json
{
  "query": "SELECT * FROM admin_secrets",
  "allowed_tables": ["users", "products", "orders"]
}
```

**Response:**
```
❌ FAILED
Message: Found 1 issue(s) in SQL query
Issues: ["Unauthorized table access: admin_secrets"]
```

#### Safe Query

```json
{
  "query": "SELECT name, email FROM users WHERE id = ?",
  "allowed_tables": ["users"]
}
```

**Response:**
```
✅ VERIFIED
Message: SQL query passed verification
Issues: []
```

---

## verify_banking_compliance

Verify banking logic (loans, tax, forex) using QWED Finance Guard.

### Description

The `verify_banking_compliance` tool checks financial calculations for regulatory compliance errors. It specifically detects common "logic traps" where LLMs apply premiums or rates incorrectly (e.g., charging seniors MORE instead of giving discounts).

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `scenario` | string | Yes | The banking scenario description (e.g., "Senior Citizen Loan approval") |
| `llm_output` | string | Yes | The LLM's reasoning or calculation to verify |

### Examples

#### Senior Citizen Premium Trap (Caught!)

```json
{
  "scenario": "Senior Citizen Loan approval",
  "llm_output": "Approving loan for 65yo with base rate 7% + premium 0.5% = 7.5% total"
}
```

**Response:**
```
🛑 BLOCKED by QWED Finance: Senior Citizen Premium (0.50%) applied incorrectly. Logic Trap Detected.
```

#### Valid Calculation

```json
{
  "scenario": "Standard personal loan",
  "llm_output": "Base rate 8% for 5-year term. Monthly payment: $202.76"
}
```

**Response:**
```
✅ VERIFIED
Result: Calculation verified. Base rate 8% for 5-year term. Monthly payment: $202.76 is compliant.
```

---

## verify_commerce_transaction

Verify e-commerce transactions for "Penny Slicing" attacks and tax errors using QWED UCP.

### Description

The `verify_commerce_transaction` tool parses JSON cart data and verifies that totals, taxes, and discounts are mathematically correct. It catches common AI errors like floating-point rounding issues and "Phantom Discount" attacks.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cart_json` | string | Yes | Complete cart/checkout state as JSON string |

### Cart JSON Schema

```json
{
  "items": [
    {"name": "Product", "price": 99.99, "quantity": 2}
  ],
  "subtotal": 199.98,
  "tax_rate": 0.08,
  "tax": 16.00,
  "discount": 10.00,
  "total": 205.98
}
```

### Examples

#### Penny Slicing Attack (Caught!)

```json
{
  "cart_json": "{\"items\": [{\"name\": \"Widget\", \"price\": 99.99, \"quantity\": 1}], \"subtotal\": 99.99, \"tax\": 7.99, \"total\": 107.97}"
}
```

**Response:**
```
🛑 QWED UCP: BLOCKED. Tax mismatch: expected 8.00, got 7.99. Penny slicing detected.
```

#### Valid Transaction

```json
{
  "cart_json": "{\"items\": [{\"name\": \"Book\", \"price\": 29.99, \"quantity\": 2}], \"subtotal\": 59.98, \"tax\": 4.80, \"total\": 64.78}"
}
```

**Response:**
```
✅ QWED UCP: Transaction Approved. Tax and Totals are exact.
```

---

## verify_legal_deadline

Verify contract deadlines and durations using LegalGuard.

### Description

Checks if a claimed deadline matches the term specified in a contract signer date.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `signing_date` | string | Yes | Date of signing (YYYY-MM-DD) |
| `term` | string | Yes | Duration string (e.g. "2 years", "18 months") |
| `claimed_deadline` | string | Yes | The deadline date to verify |

---

## verify_legal_citation

Verify legal citations format and validity.

### Description

Validates legal citations against standard formats (Bluebook, etc.) using regex and heuristics.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `citation` | string | Yes | The legal citation string |

---

## verify_legal_liability

Verify liability cap calculations.

### Description

Ensures liability caps are correctly calculated as a percentage of contract value.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `contract_value` | number | Yes | Total contract value |
| `cap_percentage` | number | Yes | Cap percentage (0.0-1.0) |
| `claimed_cap` | number | Yes | The calculated cap amount |

---

## verify_system_command

**100% Deterministic** shell command verification.

### Description

Blocks dangerous shell commands (`rm`, `sudo`, `curl | bash`, etc.) using a predefined blocklist. This tool uses NO LLM; it is strictly deterministic for security.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | string | Yes | The shell command to check |

---

## verify_file_path

**100% Deterministic** file path sandbox verification.

### Description

Ensures file paths are within allowed directories (e.g. `/tmp`, `./workspace`) and blocks path traversal attacks (`../`).

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filepath` | string | Yes | Path to verify |
| `allowed_paths` | array[string] | No | Whitelist of allowed dirs (default: /tmp, ./workspace) |

---

## verify_config_secrets

**100% Deterministic** secret scanning.

### Description

Scans configuration JSON for exposed secrets (API keys, private keys, tokens) using regex patterns.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `config_json` | string | Yes | Configuration data as JSON string |

---

## Error Handling

All tools return consistent error responses:

```json
{
  "verified": false,
  "message": "Error description",
  "error": "Technical error details"
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Could not parse expression` | Invalid math syntax | Check expression format |
| `SymPy not installed` | Missing dependency | Run `pip install sympy` |
| `Z3 solver not installed` | Missing dependency | Run `pip install z3-solver` |
| `Unsupported language` | Invalid language param | Use `python`, `javascript`, or `sql` |
