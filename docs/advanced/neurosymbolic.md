# What is Neurosymbolic AI?

**Neurosymbolic AI** is the convergence of **Neural Networks** (deep learning, LLMs) and **Symbolic Reasoning** (logic, mathematics, formal methods).

## The Two Paradigms

### 1. Neural (Subsymbolic)
- **Examples:** GPT-4, Claude, Llama
- **Strength:** Pattern recognition, language understanding, creativity
- **Weakness:** Cannot prove correctness, prone to hallucinations
- **Output:** Probabilistic (maybe correct)

### 2. Symbolic
- **Examples:** Z3 (SAT Solver), SymPy (Computer Algebra), Prolog (Logic Programming)
- **Strength:** Deterministic reasoning, mathematical proof
- **Weakness:** Cannot understand natural language
- **Output:** Deterministic (proven correct)

## The Neurosymbolic Synthesis

**QWED bridges both worlds:**

```
Natural Language Query
         ↓
    LLM (Neural)
    "Translates to formal logic"
         ↓
   Symbolic Solver
   "Proves correctness"
         ↓
   Verified Result
```

**Example:**

**User Query:** "What is the derivative of x²?"

**Neural Step (GPT-4):**
```
LLM translates to SymPy code:
>>> from sympy import symbols, diff
>>> x = symbols('x')
>>> diff(x**2, x)
```

**Symbolic Step (SymPy):**
```python
Result: 2*x  # Mathematically proven
```

**QWED verifies:** ✅ LLM said "2x", SymPy proves "2x" → **Verified!**

---

## Why Neurosymbolic Wins

### Problem: LLM-Only Systems

**Scenario:** Healthcare AI diagnoses patient

```
GPT-4: "Give aspirin (contraindicated with warfarin)"
      ↓
 NO VERIFICATION
      ↓
  ☠️ Patient harm
```

### Solution: QWED (Neurosymbolic)

```
GPT-4: "Give aspirin"
      ↓
Medical Logic Engine: Checks drug interaction database
      ↓
Z3 Solver: Proves "aspirin + warfarin = contraindicated"
      ↓
🛑 BLOCKED + Alert doctor
```

---

## Research Background

**Neurosymbolic AI** is backed by leading research:

- **Google DeepMind:** AlphaProof (math theorem proving)
- **MIT CSAIL:** Neurosymbolic programming
- **IBM Research:** Neuro-symbolic learning

**QWED** is the **first open-source implementation** focused on LLM verification.

---

## QWED's Neurosymbolic Architecture

### Neural Components (Untrusted Translators):
- OpenAI GPT-4
- Anthropic Claude
- Google Gemini
- Ollama (Local LLMs)

### Symbolic Components (Trusted Verifiers):
- **SymPy** → Math verification
- **Z3** → Logic verification
- **Python AST** → Code security verification

### The Contract:

| Component | Role | Trust Level |
|-----------|------|-------------|
| **LLM** | Translate natural language → formal logic | ⚠️ Untrusted |
| **Symbolic Solver** | Execute logic, prove result | ✅ Trusted |

---

## Comparison: Symbolic vs Neural vs **Neurosymbolic**

| Approach | Understands Language? | Proves Correctness? | QWED Uses |
|----------|----------------------|---------------------|-----------|
| **Symbolic Only** | ❌ No | ✅ Yes | Verification engines |
| **Neural Only** | ✅ Yes | ❌ No | Translation step |
| **Neurosymbolic** | ✅ Yes | ✅ Yes | ✅ **Both combined!** |

---

## Real-World Impact

### Finance Example:

**Old Way (LLM-only):**
```
GPT: "Investment return = 12.5%"
→ Trust blindly
→ $12,889 error (from benchmark)
```

**QWED Way (Neurosymbolic):**
```
GPT: "Investment return = 12.5%"
→ SymPy calculates: 11.8%
→ 🛑 Mismatch detected!
→ ✅ Corrected before loss
```

### Code Security Example:

**Old Way:**
````
GPT: "Here's the code"
```python
eval(user_input)  # Dangerous!
```
→ No check
→ 🔓 Security breach
````

**QWED Way:**
```
GPT: "Here's the code"
→ AST analyzer detects 'eval'
→ 🛑 UNSAFE CODE
→ ✅ Blocked before execution
```

---

## Why "Neurosymbolic" Matters for QWED

### Marketing Advantage:
- **Sounds cutting-edge** (attracts researchers, VCs)
- **Backed by academic research** (credibility)
- **Differentiates from competitors** (not just "another verification tool")

### Technical Accuracy:
- We **actually are** neurosymbolic (not just buzzword)
- LLMs (neural) + SymPy/Z3 (symbolic) = textbook definition

### Future-Proof:
- Neurosymbolic is the **direction** AI research is heading
- QWED is already there

---

## Further Reading

- [Neurosymbolic AI - MIT](https://arxiv.org/abs/2305.00813)
- [DeepMind AlphaProof](https://deepmind.google/discover/blog/ai-solves-imo-problems-at-silver-medal-level/)
- [IBM Neurosymbolic AI](https://research.ibm.com/topics/neurosymbolic-ai)

---

**QWED: Where Neural Networks meet Mathematical Proof.** 🧠🔬