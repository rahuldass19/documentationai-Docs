---
title: Introduction to QWED
sidebar_position: 1
---
# Introduction to QWED

**QWED** (Query With Evidence & Determinism) is a **model-agnostic verification protocol** for Large Language Models.

:::tip Model Agnostic = Your Choice
QWED works with **ANY LLM** - OpenAI, Anthropic, Gemini, Llama (via Ollama), or any local model. **Your LLM, Your Choice, Our Verification.**
:::

## 🌐 Why Model Agnostic?

> **"Trust, but Verify."** — QWED treats LLMs as untrusted translators and uses symbolic engines as trusted verifiers.

**QWED is neutral.** We verify ALL models equally - no favoritism, no vendor lock-in.

### Cost Flexibility

Choose your LLM based on your needs:

| Tier        | Monthly Cost | LLM Options                  | Best For                  |
| ----------- | ------------ | ---------------------------- | ------------------------- |
| **Local**   | $0           | Ollama (Llama, Mistral, Phi) | Students, Privacy-focused |
| **Budget**  | \~$5-10      | GPT-4o-mini, Gemini Flash    | Startups, Prototypes      |
| **Premium** | \~$50-100    | GPT-4, Claude Opus           | Enterprises, Production   |

**Same verification quality, your choice of cost.**

### Privacy & Compliance

- **Local LLMs** = Data never leaves your infrastructure

- Perfect for: Healthcare (HIPAA), Finance (PCI-DSS), Government

- Run on-premise, maintain full control

---

## What is QWED?

**QWED** (Query-Wise Engine for Determinism) is the **verification protocol for AI**. It provides deterministic verification of LLM outputs using symbolic engines like Z3, SymPy, and AST analysis.

```
┌─────────────────────────────────────────────────────────────┐
│                    QWED VERIFICATION FLOW                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Query ──▶ LLM (Translator) ──▶ QWED (Verifier) ──▶ ✅ │
│                     ↓ (Probabilistic)    ↓ (Deterministic)  │
│                  "2+2=5"              "CORRECTED: 4"        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Why QWED?

| Problem                    | QWED Solution                    |
| -------------------------- | -------------------------------- |
| LLMs hallucinate math      | Symbolic verification with SymPy |
| LLMs break logic           | SAT solving with Z3              |
| LLMs generate unsafe code  | AST analysis + pattern detection |
| LLMs produce SQL injection | Query parsing + validation       |

## Quick Start

```bash
# Install the Python SDK
pip install qwed

# Verify math
qwed verify "Is 2+2=5?"
# → ❌ CORRECTED: The answer is 4, not 5.

# Verify logic
qwed verify-logic "(AND (GT x 5) (LT y 10))"
# → ✅ SAT: {x=6, y=9}
```

## Features

- **11 Verification Engines** — Math, Logic, Reasoning, Stats, Fact, Graph Fact, Code, SQL, Taint, Image, Schema

- **4 SDKs** — Python, TypeScript, Go, Rust

- **3 Framework Integrations** — LangChain, LlamaIndex, CrewAI

- **Cryptographic Attestations** — JWT-based verification proofs

- **Agent Verification** — Pre-execution checks for AI agents

## 🆕 What's New in v3.0.1: Ironclad Update

The **v3.0.1 Ironclad Release** focuses on **Security Hardening** and **Enterprise Compliance**.

### 🛡️ Critical Security Hardening

- **CodeQL Remediation**: Resolved 50+ security alerts including ReDoS, Clear-text Logging, and Exception Exposure.

- **Workflow Lockdown**: Enforced **Least Privilege (****`permissions: contents: read`****)** across all CI/CD pipelines.

- **PII Protection**: Implemented robust `redact_pii` logic in all API endpoints and exception handlers.

### 📝 Compliance & Governance

- **Snyk Partner Program**: Official Snyk attribution added for secured dependencies.

- **Advanced CodeQL**: Upgraded security scanning to Advanced mode (Python, Go, TS, Rust).

## Next Steps

- [Installation Guide](/docs/getting-started/installation)

- [Quick Start Tutorial](/docs/getting-started/quickstart)

- [SDK Documentation](/docs/sdks/overview)

- [Protocol Specifications](/docs/specs/overview)

