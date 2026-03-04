---
sidebar_position: 6
---

# Determinism Guarantee

> **TL;DR:** QWED uses **deterministic solvers** (SymPy, Z3, AST, SQLGlot) wherever possible. When LLM fallback is required, the response is explicitly marked as `HEURISTIC`.

---

## Engine Classification

Every QWED verification engine falls into one of three categories:

| Category | Engines | Technology | Reproducible? |
|----------|---------|------------|---------------|
| **100% Symbolic** | Math, Logic, Code, SQL, Schema, Taint | SymPy, Z3, AST, SQLGlot | ✅ Yes |
| **Hybrid** | Fact, Stats | TF-IDF / Sandbox → LLM fallback | ⚠️ Conditional |
| **Heuristic** | Image, Consensus, Reasoning | VLM / Multi-LLM voting | ❌ No |

### Detailed Breakdown

| Engine | Mode | Primary Technology | LLM Fallback? |
|--------|------|-------------------|---------------|
| **Math** | Symbolic | SymPy (symbolic algebra) | ❌ Never |
| **Logic** | Symbolic | Z3 Theorem Prover (SMT) | ❌ Never |
| **Code** | Symbolic | Python AST + Bandit | ❌ Never |
| **SQL** | Symbolic | SQLGlot AST parser | ❌ Never |
| **Schema** | Symbolic | Pydantic + SymPy | ❌ Never |
| **Taint** | Symbolic | Data Flow Analysis (AST) | ❌ Never |
| **Fact** | Hybrid | TF-IDF similarity | ✅ When TF-IDF confidence < threshold |
| **Stats** | Hybrid | Wasm/Docker sandbox | ✅ When sandbox execution fails |
| **Image** | Heuristic | Vision LLM (GPT-4V, Claude) | ✅ Always |
| **Consensus** | Heuristic | Multi-LLM voting | ✅ Always |
| **Reasoning** | Heuristic | Chain-of-thought LLM | ✅ Always |

---

## How to Know Which Mode Was Used

Every API response includes a `verification_mode` field:

```json
{
  "status": "VERIFIED",
  "verified": true,
  "engine": "math",
  "verification_mode": "SYMBOLIC",
  "result": { ... }
}
```

### `verification_mode` Values

| Value | Meaning | Trust Level |
|-------|---------|-------------|
| `SYMBOLIC` | Result proven by deterministic solver (SymPy/Z3/AST) | 🟢 **100% reproducible** |
| `HEURISTIC` | Result from LLM fallback or multi-model voting | 🟡 **Best-effort, not guaranteed** |

---

## Why This Matters

### For Regulated Industries

Banks, healthcare, and legal systems require **audit trails** and **reproducibility**:

- ✅ `SYMBOLIC` results can be independently verified
- ⚠️ `HEURISTIC` results should be flagged for human review

### For Production Systems

```python
result = client.verify_math("2+2=4")

if result.verification_mode == "SYMBOLIC":
    # Safe to use without human review
    process_result(result)
elif result.verification_mode == "HEURISTIC":
    # Flag for human review or additional validation
    queue_for_review(result)
```

---

## Design Philosophy

> **"Probabilistic systems should not be trusted with deterministic tasks."**

QWED treats LLMs as **untrusted translators**:

1. LLM converts natural language → formal specification
2. **Deterministic solver** verifies the formal specification
3. If solver cannot verify, result is marked `HEURISTIC`

```
┌─────────────────────────────────────────────────────────┐
│                    QWED Protocol                        │
├─────────────────────────────────────────────────────────┤
│  User Query → LLM (Translator) → DSL → Solver → Result │
│                                                         │
│  Solver = SymPy/Z3/AST  →  SYMBOLIC                     │
│  Solver = LLM Fallback  →  HEURISTIC                    │
└─────────────────────────────────────────────────────────┘
```

---

## Frequently Asked Questions

### Q: Can I filter responses by verification_mode?

**A:** Yes! Use the `require_symbolic` option in your request:

```python
result = client.verify(
    query="Calculate NPV",
    options={"require_symbolic": True}
)
# Fails if solver cannot verify deterministically
```

### Q: Why is Fact verification sometimes HEURISTIC?

**A:** Fact verification uses TF-IDF (deterministic) to find evidence. If TF-IDF confidence is below threshold, it falls back to NLI (LLM-based), marking the result as `HEURISTIC`.

### Q: Is Consensus useful if it's HEURISTIC?

**A:** Yes! Consensus detects **disagreement** between multiple LLMs. While not deterministic, it catches cases where models are uncertain — useful as a safety net, not a formal verifier.

---

## See Also

- [Engines Overview](/docs/engines/overview) — Full engine documentation
- [API Endpoints](/docs/api/endpoints) — Response schema reference
- [Whitepaper](/docs/whitepaper) — Academic justification for neurosymbolic approach
