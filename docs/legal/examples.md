---
sidebar_position: 3
title: Examples
description: Real-world contract verification scenarios with QWED-Legal
---

# Real-World Examples

## 1. Employment Contract Deadline

**Scenario:** An AI reviews an employment contract and calculates the probation end date.

```python
from qwed_legal import DeadlineGuard

guard = DeadlineGuard(country="US")

# Employment contract signed Jan 15, 2026
# Probation period: 90 days
# LLM claims probation ends: April 10, 2026

result = guard.verify(
    signing_date="2026-01-15",
    term="90 days",
    claimed_deadline="2026-04-10"
)

print(result.verified)  # False!
print(result.message)
# ❌ ERROR: Deadline mismatch. 
# Expected 2026-04-15, but LLM claimed 2026-04-10. 
# Difference: 5 days.
```

---

## 2. SaaS Liability Cap

**Scenario:** A SaaS contract limits liability to 200% of annual fees.

```python
from qwed_legal import LiabilityGuard

guard = LiabilityGuard()

# Annual contract value: $500,000
# Liability cap: 200%
# LLM claims cap is: $1,500,000

result = guard.verify_cap(
    contract_value=500_000,
    cap_percentage=200,
    claimed_cap=1_500_000
)

print(result.verified)  # False!
print(result.message)
# ❌ ERROR: Liability cap mismatch. 
# 200% of $500,000.00 = $1,000,000.00, 
# but LLM claimed $1,500,000.00.
```

---

## 3. Conflicting Termination Clauses

**Scenario:** An NDA contains multiple termination clauses.

```python
from qwed_legal import ClauseGuard

guard = ClauseGuard()

clauses = [
    "Either party may terminate this Agreement with 30 days written notice.",
    "This Agreement shall remain in effect for a minimum of 12 months.",
    "Discloser may terminate immediately if Recipient breaches confidentiality.",
]

result = guard.check_consistency(clauses)

print(result.consistent)  # False!
print(result.message)
# ⚠️ WARNING: 1 potential conflict(s) detected:
#   - Clause 1 vs Clause 2: Termination notice (30 days) conflicts 
#     with minimum term (365 days)
```

---

## 4. Verifying AI-Generated Case Citations

**Scenario:** An AI legal research assistant provides case citations. Verify them.

```python
from qwed_legal import CitationGuard

guard = CitationGuard()

# Citations provided by LLM
citations = [
    "Miranda v. Arizona, 384 U.S. 436 (1966)",          # Real case
    "Brown v. Board of Education, 347 U.S. 483 (1954)",  # Real case
    "Smith v. Jones, 123 FAKE 456 (2020)",               # FAKE!
    "Doe v. Roe, 999 X.Y.Z. 789 (2019)",                 # FAKE!
]

result = guard.verify_batch(citations)

print(f"Valid: {result.valid}/{result.total}")  # Valid: 2/4

# Check each citation
for i, cite_result in enumerate(result.citations):
    status = "✅" if cite_result.valid else "❌"
    print(f"{status} {citations[i]}")
    if not cite_result.valid:
        print(f"   Issues: {cite_result.issues}")
```

**Output:**
```
Valid: 2/4
✅ Miranda v. Arizona, 384 U.S. 436 (1966)
✅ Brown v. Board of Education, 347 U.S. 483 (1954)
❌ Smith v. Jones, 123 FAKE 456 (2020)
   Issues: ["Unknown reporter abbreviation: 'FAKE'"]
❌ Doe v. Roe, 999 X.Y.Z. 789 (2019)
   Issues: ["Unknown reporter abbreviation: 'X.Y.Z.'"]
```

---

## 5. Real Estate Contract with UK Holidays

**Scenario:** A UK property sale has completion date calculated in business days.

```python
from qwed_legal import DeadlineGuard

# UK holidays (Christmas, Boxing Day, Easter, etc.)
guard = DeadlineGuard(country="GB")

# Contract exchanged Dec 15, 2025
# Completion: 20 business days
# Agent claims: Jan 7, 2026

result = guard.verify(
    signing_date="2025-12-15",
    term="20 business days",
    claimed_deadline="2026-01-07"
)

print(result.verified)  # False!
# UK has Christmas (25), Boxing Day (26), New Year's Day (1)
# These are excluded from business days
print(result.computed_deadline)  # 2026-01-14 (approximately)
```

---

## 6. Multi-Tier Indemnity

**Scenario:** A vendor contract has tiered indemnity limits.

```python
from qwed_legal import LiabilityGuard

guard = LiabilityGuard()

# Tier 1: First $1M at 100%
# Tier 2: Next $500K at 50%
# Total claimed by LLM: $1.3M

tiers = [
    {"base": 1_000_000, "percentage": 100},  # = $1M
    {"base": 500_000, "percentage": 50},      # = $250K
]

result = guard.verify_tiered_liability(tiers, claimed_total=1_300_000)

print(result.verified)  # False!
print(result.message)
# ❌ ERROR: Tiered liability mismatch. 
# Computed total: $1,250,000.00, but LLM claimed $1,300,000.00.
```

---

## 7. Claude Desktop Integration (MCP)

**Scenario:** A lawyer uses Claude Desktop to verify contract deadlines.

When `qwed-mcp` is installed, Claude Desktop gains these tools:

- `verify_legal_deadline`
- `verify_legal_citation`
- `verify_legal_liability`

**User:** "Verify: Contract signed Jan 15, 2026 with 30 business days deadline. Is Feb 14 correct?"

**Claude (via MCP):**
```
🛑 QWED Legal: BLOCKED. 
❌ ERROR: Deadline mismatch. Expected 2026-02-27, but claimed 2026-02-14. 
Difference: 13 days.
```

---

## Next Steps

- [Troubleshooting](/docs/legal/troubleshooting) - Common issues and solutions
