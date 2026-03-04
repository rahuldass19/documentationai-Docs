---
sidebar_position: 3
---

# Examples & Tutorials

Real-world examples of using QWED-MCP for verification in different scenarios.

---

## Example 1: Financial Calculations

### Scenario

You're building an AI-powered financial advisor. Users ask for compound interest calculations, and you need to ensure the AI's math is correct.

### Setup

```json
{
  "mcpServers": {
    "qwed-verification": {
      "command": "qwed-mcp"
    }
  }
}
```

### Conversation

**User:** Calculate the future value of $10,000 invested at 5% annual interest, compounded monthly, for 10 years.

**Claude's Process:**
1. Calculate: FV = P(1 + r/n)^(nt) = 10000(1 + 0.05/12)^(12×10)
2. Call `verify_math` to confirm:

```json
{
  "expression": "10000 * (1 + 0.05/12)**(12*10)",
  "claimed_result": "16470.09",
  "operation": "evaluate"
}
```

**Result:** ✅ VERIFIED

**Claude's Response:** The future value is **$16,470.09** (verified).

---

## Example 2: Legal Reasoning

### Scenario

An AI legal assistant needs to verify that conclusions follow from legal premises.

### Conversation

**User:** Under contract law: If both parties agree and consideration is exchanged, a contract is formed. Alice agreed and paid Bob. Is there a valid contract?

**Claude's Process:**
1. Formalize the logic
2. Call `verify_logic`:

```json
{
  "premises": [
    "if agreed and consideration then contract",
    "Alice agreed",
    "consideration exchanged"
  ],
  "conclusion": "contract formed"
}
```

**Result:** ✅ VERIFIED - The conclusion logically follows.

---

## Example 3: Secure Code Review

### Scenario

A developer asks AI to review their code for security issues.

### Conversation

**User:** Review this login function:

```python
def login(username, password):
    query = f"SELECT * FROM users WHERE name='{username}'"
    user = db.execute(query)
    if eval(f"'{password}' == '{user.password}'"):
        return True
    return False
```

**Claude's Process:**
1. Call `verify_code`:

```json
{
  "code": "def login(username, password):\n    query = f\"SELECT * FROM users WHERE name='{username}'\"\n    user = db.execute(query)\n    if eval(f\"'{password}' == '{user.password}'\"):\n        return True\n    return False",
  "language": "python"
}
```

**Result:**
```
❌ FAILED - Found 2 security issues
Issues:
  - Dangerous function call: eval()
  - Warning: String concatenation in SQL query detected
```

**Claude's Response:**

🚨 **Security Issues Found:**

1. **SQL Injection** - Direct string formatting in SQL query
2. **Code Injection** - Using `eval()` for password comparison

**Recommended Fix:**

```python
def login(username, password):
    query = "SELECT * FROM users WHERE name = ?"
    user = db.execute(query, (username,))
    return password == user.password
```

---

## Example 4: Research Paper Validation

### Scenario

Verifying statistical claims in AI-assisted research paper review.

### Conversation

**User:** The paper claims: "If the p-value < 0.05, we reject the null hypothesis. Our p-value was 0.03. Therefore, we reject the null hypothesis."

**Claude's Process:**

```json
{
  "premises": [
    "if p_value less than 0.05 then reject_null",
    "p_value less than 0.05"
  ],
  "conclusion": "reject_null"
}
```

**Result:** ✅ VERIFIED

---

## Example 5: SQL Query Validation

### Scenario

An AI data analyst generates SQL queries. You need to ensure they're safe before execution.

### Conversation

**User:** Get all orders for user input "admin' OR '1'='1"

**Claude's Process:**
1. Generate query
2. Call `verify_sql` before responding:

```json
{
  "query": "SELECT * FROM orders WHERE user_id = 'admin'' OR ''1''=''1'",
  "allowed_tables": ["orders", "users", "products"]
}
```

**Result:**
```
❌ FAILED - Potential SQL injection detected
Issues:
  - Suspicious tautology pattern: 1=1
  - Potential injection characters detected
```

**Claude's Response:**

⚠️ **Security Warning:** The input appears to be a SQL injection attempt. I cannot generate this query safely.

**Safe Alternative:** Use parameterized queries:
```sql
SELECT * FROM orders WHERE user_id = ?
-- Pass user_id as parameter
```

---

## Example 6: Integration with LangChain

### Python Code

```python
from langchain_anthropic import ChatAnthropic
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.tools import StructuredTool
import subprocess
import json

# Create QWED tools that call MCP server
def verify_math(expression: str, claimed_result: str, operation: str = "evaluate") -> str:
    """Verify mathematical calculations using SymPy."""
    result = subprocess.run(
        ["qwed-mcp-cli", "verify_math", 
         "--expression", expression,
         "--claimed_result", claimed_result,
         "--operation", operation],
        capture_output=True, text=True
    )
    return result.stdout

math_tool = StructuredTool.from_function(
    func=verify_math,
    name="verify_math",
    description="Verify mathematical calculations. Use after doing any math."
)

# Create agent with verification
llm = ChatAnthropic(model="claude-3-sonnet")
agent = create_tool_calling_agent(llm, [math_tool], prompt)
executor = AgentExecutor(agent=agent, tools=[math_tool])

# Use it
result = executor.invoke({
    "input": "What's the integral of 2x? Verify your answer."
})
```

---

## Best Practices

### 1. Always Verify Before Responding

```
User asks → AI calculates → AI verifies → AI responds
                            ↓ (if fails)
                        AI recalculates
```

### 2. Use Appropriate Tools

| Task | Tool |
|------|------|
| Math/calculations | `verify_math` |
| Logic/reasoning | `verify_logic` |
| Code review | `verify_code` |
| SQL queries | `verify_sql` |

### 3. Handle Verification Failures

When verification fails:
1. Acknowledge the error
2. Recalculate
3. Verify again
4. Explain the correction to user

### 4. Explain Verification to Users

```
"I calculated X. Let me verify this is correct...
✅ Verified using symbolic mathematics.
The answer is definitely X."
```
