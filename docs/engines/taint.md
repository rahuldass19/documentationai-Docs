---
sidebar_position: 9
---

# Taint Analysis Engine

The **Taint Analysis Engine** creates a security firewall by tracking "tainted" (untrusted) user input as it flows through generated code. It ensures that untrusted data never reaches sensitive "sinks" like file system access, network calls, or SQL execution without proper sanitization.

## How It Works

1.  **Source Identification:** Marks all variables derived from user input as `tainted`.
2.  **Flow Propagation:** Tracks these variables through assignments, function calls, and string operations.
3.  **Sink Validation:** If a `tainted` variable reaches a critical function (e.g., `subprocess.call` or `db.execute`) without passing through a sanitizer, it blocks execution.

## Usage

```python
response = client.verify_taint(
    code="""
    user_input = get_query_param("id")
    # Vulnerable!
    query = "SELECT * FROM users WHERE id = " + user_input
    db.execute(query)
    """
)
# -> ❌ TAINT DETECTED: Untrusted input reaches SQL sink.
```

## When to use

-   **Code Generation:** Verifying code written by LLMs for security vulnerabilities.
-   **RCE Prevention:** Ensuring generated agents don't execute malicious shell commands.
-   **XSS Prevention:** Ensuring web outputs are properly encoded.
