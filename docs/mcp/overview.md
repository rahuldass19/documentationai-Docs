---
sidebar_position: 1
---

# QWED-MCP Overview

**Model Context Protocol (MCP) Server for QWED Verification**

[![PyPI version](https://img.shields.io/pypi/v/qwed-mcp)](https://pypi.org/project/qwed-mcp/)
[![Tests](https://github.com/QWED-AI/qwed-mcp/actions/workflows/publish.yml/badge.svg)](https://github.com/QWED-AI/qwed-mcp/actions)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

QWED-MCP brings deterministic verification to Claude Desktop, VS Code, and any MCP-compatible AI assistant. Instead of trusting LLMs to compute correctly, QWED-MCP provides verification tools that use formal methods to guarantee correctness.

---

## Why QWED-MCP?

### The Problem

LLMs are powerful but unreliable for:
- **Mathematical calculations** - They approximate, don't compute
- **Logical reasoning** - They guess patterns, don't prove
- **Code security** - They miss edge cases, don't analyze
- **SQL queries** - They don't validate, just generate

### The Solution

QWED-MCP gives AI assistants access to **deterministic verification tools**:

| Without QWED-MCP | With QWED-MCP |
|------------------|---------------|
| Claude calculates → 95% correct | Claude + `verify_math` → **100% correct** |
| Claude writes SQL → might inject | Claude + `verify_sql` → **injection detected** |
| Claude reasons → might be wrong | Claude + `verify_logic` → **formally proven** |
| Claude codes → might be unsafe | Claude + `verify_code` → **security checked** |

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    Your AI Application                       │
│  ┌─────────────────┐        ┌─────────────────────────────┐ │
│  │  Claude Desktop │        │        VS Code + Copilot    │ │
│  │  or any MCP     │        │        or any MCP Client    │ │
│  │  compatible     │        │                             │ │
│  └────────┬────────┘        └──────────────┬──────────────┘ │
└───────────┼─────────────────────────────────┼───────────────┘
            │                                 │
            │         MCP Protocol            │
            │       (JSON-RPC over stdio)     │
            ▼                                 ▼
┌──────────────────────────────────────────────────────────────┐
│                     QWED-MCP Server                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ verify_math  │  │ verify_logic │  │   verify_code    │   │
│  │    Tool      │  │    Tool      │  │      Tool        │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                 │                    │             │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌────────▼─────────┐   │
│  │    SymPy     │  │  Z3 Solver   │  │  Python AST      │   │
│  │   Engine     │  │   Engine     │  │   Analysis       │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│                                                              │
│  ┌──────────────┐                                            │
│  │ verify_sql   │                                            │
│  │    Tool      │                                            │
│  └──────┬───────┘                                            │
│         │                                                    │
│  ┌──────▼───────┐                                            │
│  │   Pattern    │                                            │
│  │   Matching   │                                            │
│  └──────────────┘                                            │
└──────────────────────────────────────────────────────────────┘
```

---

## Available Tools

| Tool | Engine | Use Case |
|------|--------|----------|
| [`verify_math`](/docs/mcp/tools#verify_math) | SymPy | Verify calculations, derivatives, integrals |
| [`verify_logic`](/docs/mcp/tools#verify_logic) | Z3 SMT | Prove logical arguments, check validity |
| [`verify_code`](/docs/mcp/tools#verify_code) | AST | Detect security vulnerabilities in code |
| [`verify_sql`](/docs/mcp/tools#verify_sql) | Pattern | SQL injection detection, query validation |

---

## Installation

### From PyPI (Recommended)

```bash
pip install qwed-mcp
```

### From Source

```bash
git clone https://github.com/QWED-AI/qwed-mcp.git
cd qwed-mcp
pip install -e .
```

### Verify Installation

```bash
qwed-mcp --version
# qwed-mcp 0.1.0
```

---

## Quick Start

### Claude Desktop Setup

1. **Find your config file:**
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux:** `~/.config/Claude/claude_desktop_config.json`

2. **Add QWED-MCP server:**

```json
{
  "mcpServers": {
    "qwed-verification": {
      "command": "qwed-mcp"
    }
  }
}
```

3. **Restart Claude Desktop**

4. **Test it!** Ask Claude:
   > "What's the derivative of x^3? Use verify_math to check."

### VS Code Setup

1. **Install MCP extension** (if not already)

2. **Add to settings.json:**

```json
{
  "mcp.servers": {
    "qwed-verification": {
      "command": "qwed-mcp"
    }
  }
}
```

3. **Restart VS Code**

### Python Client

You can also use QWED-MCP programmatically:

```python
import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    server_params = StdioServerParameters(command="qwed-mcp")
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            # List available tools
            tools = await session.list_tools()
            print(f"Available tools: {[t.name for t in tools.tools]}")
            
            # Call verify_math
            result = await session.call_tool(
                "verify_math",
                arguments={
                    "expression": "x**2",
                    "claimed_result": "2*x",
                    "operation": "derivative"
                }
            )
            print(result)

asyncio.run(main())
```

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `QWED_LOG_LEVEL` | Logging level (`DEBUG`, `INFO`, `WARNING`, `ERROR`) | `INFO` |
| `QWED_TIMEOUT` | Tool execution timeout in seconds | `30` |

### Example with Environment Variables

**Windows (PowerShell):**
```powershell
$env:QWED_LOG_LEVEL = "DEBUG"
qwed-mcp
```

**macOS/Linux:**
```bash
QWED_LOG_LEVEL=DEBUG qwed-mcp
```

---

## Use Cases

### 1. Financial Calculations

Verify that AI-generated financial calculations are correct:

```
User: Calculate compound interest for $10,000 at 5% for 3 years

Claude: The compound interest is $1,576.25
        Final amount: $11,576.25
        
        [Calling verify_math to confirm...]
        ✅ VERIFIED: 10000 * (1.05)^3 = 11576.25
```

### 2. Research Validation

Ensure scientific claims are logically valid:

```
User: If all mammals are warm-blooded, and dolphins are mammals,
      are dolphins warm-blooded?

Claude: [Calling verify_logic...]
        ✅ VERIFIED: The conclusion logically follows from the premises
        
        Dolphins are warm-blooded.
```

### 3. Secure Coding

Check AI-generated code for security issues:

```
User: Write a function to execute user commands

Claude: def run_command(cmd):
            os.system(cmd)  # Execute the command
        
        [Calling verify_code...]
        ❌ SECURITY ISSUE: os.system() is dangerous
        
        Here's a safer alternative...
```

### 4. SQL Security

Prevent SQL injection in generated queries:

```
User: Generate a query to find user "admin' OR '1'='1"

Claude: SELECT * FROM users WHERE username = 'admin'' OR ''1''=''1'
        
        [Calling verify_sql...]
        ❌ SQL INJECTION DETECTED: Suspicious tautology pattern
```

---

## Links

- **PyPI:** [pypi.org/project/qwed-mcp](https://pypi.org/project/qwed-mcp/)
- **GitHub:** [github.com/QWED-AI/qwed-mcp](https://github.com/QWED-AI/qwed-mcp)
- **MCP Protocol:** [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **QWED Core:** [QWED Verification Engine](/docs/intro)
