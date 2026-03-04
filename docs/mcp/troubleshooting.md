---
sidebar_position: 4
---

# Troubleshooting

Common issues and solutions when using QWED-MCP.

---

## Installation Issues

### "qwed-mcp: command not found"

**Cause:** Package not in PATH

**Solutions:**

1. **Install globally:**
   ```bash
   pip install qwed-mcp
   ```

2. **Check installation:**
   ```bash
   pip show qwed-mcp
   python -m qwed_mcp.server
   ```

3. **Use full path in config:**
   ```json
   {
     "mcpServers": {
       "qwed-verification": {
         "command": "python",
         "args": ["-m", "qwed_mcp.server"]
       }
     }
   }
   ```

---

### "ModuleNotFoundError: No module named 'sympy'"

**Cause:** Dependencies not installed

**Solution:**
```bash
pip install qwed-mcp[all]
# or manually:
pip install sympy z3-solver
```

---

## Claude Desktop Issues

### Server Not Appearing in Claude

**Check:**

1. **Config file location:**
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. **Valid JSON:**
   ```bash
   python -c "import json; json.load(open('path/to/config.json'))"
   ```

3. **Restart Claude Desktop** (completely quit and reopen)

---

### "Failed to start MCP server"

**Debug steps:**

1. **Test manually:**
   ```bash
   qwed-mcp
   # Should start without errors
   # Press Ctrl+C to exit
   ```

2. **Check logs:**
   ```bash
   # Windows
   type %APPDATA%\Claude\logs\mcp*.log
   
   # macOS
   cat ~/Library/Logs/Claude/mcp*.log
   ```

3. **Enable debug logging:**
   ```json
   {
     "mcpServers": {
       "qwed-verification": {
         "command": "qwed-mcp",
         "env": {
           "QWED_LOG_LEVEL": "DEBUG"
         }
       }
     }
   }
   ```

---

## Tool Errors

### "Could not parse expression"

**Cause:** Invalid math syntax

**Examples:**

| Wrong | Correct |
|-------|---------|
| `2x` | `2*x` |
| `x²` | `x**2` or `x^2` |
| `√x` | `sqrt(x)` |

---

### "Z3 solver not installed"

**Solution:**
```bash
pip install z3-solver
```

**Note:** On some systems, you may need:
```bash
# Windows
pip install z3-solver --no-cache-dir

# Linux
sudo apt-get install libz3-dev
pip install z3-solver
```

---

### "Tool timeout"

**Cause:** Complex computation taking too long

**Solutions:**

1. **Increase timeout:**
   ```bash
   QWED_TIMEOUT=60 qwed-mcp
   ```

2. **Simplify expression:**
   - Break complex math into simpler steps
   - Reduce logic premise count

---

## Common Patterns

### False Positives in verify_code

Some patterns are flagged that may be intentional:

| Pattern | Why Flagged | If Intentional |
|---------|-------------|----------------|
| `open()` | File access | May be needed - document why |
| `subprocess` | Process spawning | Use with caution |
| `eval()` | Code execution | Avoid if possible |

---

### Logic Verification Failures

If valid logic fails verification:

1. **Simplify premises** - Try simpler statements
2. **Check syntax** - Use supported patterns
3. **Break into steps** - Verify sub-arguments

**Supported:**
```
"A implies B"
"if A then B"
"A and B"
"A or B"
"not A"
```

**Not yet supported:**
```
"for all X, P(X)"
"there exists X such that P(X)"
"X is greater than Y"
```

---

## Getting Help

1. **GitHub Issues:** [github.com/QWED-AI/qwed-mcp/issues](https://github.com/QWED-AI/qwed-mcp/issues)
2. **Documentation:** [docs.qwedai.com/mcp](https://docs.qwedai.com/docs/mcp/overview)
3. **MCP Protocol Docs:** [modelcontextprotocol.io](https://modelcontextprotocol.io)
