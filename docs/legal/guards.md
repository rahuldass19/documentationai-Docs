---
sidebar_position: 2
title: The 6 Guards
description: Deep dive into all verification guards including JurisdictionGuard and StatuteOfLimitationsGuard
---

# The 6 Guards of QWED-Legal

Each guard uses a deterministic engine to verify a specific aspect of legal documents.

## 1. DeadlineGuard 📅

**Purpose:** Verify date calculations in contracts.

### The Problem

LLMs frequently miscalculate deadlines:
- Confuse **business days** vs **calendar days**
- Ignore **leap years**
- Forget **jurisdiction-specific holidays**

### The Solution

```python
from qwed_legal import DeadlineGuard

guard = DeadlineGuard(country="US", state="CA")

result = guard.verify(
    signing_date="2026-01-15",
    term="30 business days",
    claimed_deadline="2026-02-14"
)

print(result.verified)           # False
print(result.computed_deadline)  # 2026-02-27
print(result.difference_days)    # 13
```

### Features

| Feature | Description |
|---------|-------------|
| **Business vs Calendar** | Automatically detects "business days" vs "days" |
| **Holiday Support** | 200+ countries via `python-holidays` |
| **Leap Years** | Handles Feb 29 correctly |
| **Natural Language** | Parses "2 weeks", "3 months", "1 year" |

---

## 2. LiabilityGuard 💰

**Purpose:** Verify liability cap and indemnity calculations.

### The Problem

LLMs get percentage math wrong:
- "200% of $5M = $15M" ❌ (Should be $10M)
- Float precision errors on large amounts
- Tiered liability miscalculations

### The Solution

```python
from qwed_legal import LiabilityGuard

guard = LiabilityGuard()

result = guard.verify_cap(
    contract_value=5_000_000,
    cap_percentage=200,
    claimed_cap=15_000_000
)

print(result.verified)      # False
print(result.computed_cap)  # 10,000,000
print(result.difference)    # 5,000,000
```

### Additional Methods

```python
# Tiered liability
result = guard.verify_tiered_liability(
    tiers=[
        {"base": 1_000_000, "percentage": 100},
        {"base": 500_000, "percentage": 50},
    ],
    claimed_total=1_250_000  # ✅ Correct: 1M + 250K
)

# Indemnity limit (3x annual fee)
result = guard.verify_indemnity_limit(
    annual_fee=100_000,
    multiplier=3,
    claimed_limit=300_000  # ✅ Correct
)
```

---

## 3. ClauseGuard ⚖️

**Purpose:** Detect contradictory clauses using formal logic.

### The Problem

LLMs miss logical contradictions:
- "Seller may terminate with 30 days notice"
- "Neither party may terminate before 90 days"

These clauses **conflict** for days 30-90!

### The Solution

```python
from qwed_legal import ClauseGuard

guard = ClauseGuard()

result = guard.check_consistency([
    "Seller may terminate with 30 days notice",
    "Neither party may terminate before 90 days",
    "Seller may terminate immediately upon breach"
])

print(result.consistent)  # False
print(result.conflicts)
# [(0, 1, "Termination notice (30 days) conflicts with minimum term (90 days)")]
```

### Detection Types

| Conflict Type | Description |
|---------------|-------------|
| **Termination** | Notice period vs minimum term |
| **Permission/Prohibition** | "May" vs "May not" |
| **Exclusivity** | Multiple exclusive rights |

---

## 4. CitationGuard 📚

**Purpose:** Verify legal citations are properly formatted and potentially real.

### The Problem

The **Mata v. Avianca** scandal: Lawyers used ChatGPT, which cited **6 fake court cases**. They were fined $5,000 and sanctioned.

### The Solution

```python
from qwed_legal import CitationGuard

guard = CitationGuard()

# Valid citation
result = guard.verify("Brown v. Board of Education, 347 U.S. 483 (1954)")
print(result.valid)  # True
print(result.parsed_components)
# {'plaintiff': 'Brown', 'defendant': 'Board of Education', 
#  'volume': 347, 'reporter': 'U.S.', 'page': 483, 'year': 1954}

# Invalid citation (fake reporter)
result = guard.verify("Smith v. Jones, 999 FAKE 123 (2020)")
print(result.valid)   # False
print(result.issues)  # ["Unknown reporter abbreviation: 'FAKE'"]
```

### Supported Reporters

| Category | Examples |
|----------|----------|
| **Supreme Court** | U.S., S.Ct., L.Ed., L.Ed.2d |
| **Federal** | F., F.2d, F.3d, F.4th, F.Supp. |
| **State** | Cal., N.Y., Tex., Ill., Pa. |
| **Regional** | A., N.E., N.W., P., S.E., S.W., So. |

### Batch Verification

```python
result = guard.verify_batch([
    "Brown v. Board, 347 U.S. 483 (1954)",
    "Fake v. Case, 999 X.Y.Z. 123",
])

print(result.total)    # 2
print(result.valid)    # 1
print(result.invalid)  # 1
```

### Statute Citations

```python
result = guard.check_statute_citation("42 U.S.C. § 1983")
print(result.valid)  # True
print(result.parsed_components)
# {'title': 42, 'code': 'U.S.C.', 'section': '1983'}
```

---

## 5. JurisdictionGuard 🌍

**Purpose:** Verify choice of law and forum selection clauses.

### The Problem

LLMs miss jurisdiction conflicts:
- Governing law in one country, forum in another
- Missing CISG applicability warnings
- Cross-border legal system mismatches

### The Solution

```python
from qwed_legal import JurisdictionGuard

guard = JurisdictionGuard()

result = guard.verify_choice_of_law(
    parties_countries=["US", "UK"],
    governing_law="Delaware",
    forum="London"
)

print(result.verified)   # False - mismatch detected
print(result.conflicts)  # ["Governing law 'Delaware' (US state) but forum 'London' is non-US..."]
```

### Features

| Feature | Description |
|---------|-------------|
| **Choice of Law** | Validates governing law makes sense for parties |
| **Forum Selection** | Checks forum vs governing law alignment |
| **CISG Detection** | Warns about international sale of goods conventions |
| **Convention Check** | Verifies Hague, NY Convention applicability |

### Convention Check

```python
result = guard.check_convention_applicability(
    parties_countries=["US", "DE"],
    convention="CISG"
)
print(result.verified)  # True - both are CISG members
```

---

## 6. StatuteOfLimitationsGuard ⏰

**Purpose:** Verify claim limitation periods by jurisdiction.

### The Problem

LLMs don't track jurisdiction-specific limitation periods:
- California breach of contract: 4 years
- New York breach of contract: 6 years
- Different periods for negligence, fraud, etc.

### The Solution

```python
from qwed_legal import StatuteOfLimitationsGuard

guard = StatuteOfLimitationsGuard()

result = guard.verify(
    claim_type="breach_of_contract",
    jurisdiction="California",
    incident_date="2020-01-15",
    filing_date="2026-06-01"
)

print(result.verified)          # False - 4 year limit exceeded!
print(result.expiration_date)   # 2024-01-15
print(result.days_remaining)    # -867 (negative = expired)
```

### Supported Jurisdictions

| Jurisdiction | Breach of Contract | Negligence | Fraud |
|--------------|-------------------|------------|-------|
| California | 4 years | 2 years | 3 years |
| New York | 6 years | 3 years | 6 years |
| Texas | 4 years | 2 years | 4 years |
| UK/England | 6 years | 6 years | 6 years |
| Germany | 3 years | 3 years | 10 years |
| India | 3 years | 3 years | 3 years |

### Compare Jurisdictions

```python
comparison = guard.compare_jurisdictions(
    "breach_of_contract",
    ["California", "New York", "Delaware"]
)
# {'California': 4.0, 'New York': 6.0, 'Delaware': 3.0}
```

---

## All-in-One: LegalGuard

For convenience, use the unified `LegalGuard` class:

```python
from qwed_legal import LegalGuard

guard = LegalGuard()

# All 6 guards available
guard.verify_deadline(...)
guard.verify_liability_cap(...)
guard.check_clause_consistency(...)
guard.verify_citation(...)
guard.verify_jurisdiction(...)               # NEW in v0.2.0
guard.verify_statute_of_limitations(...)     # NEW in v0.2.0
```

---

## Next Steps

- [Examples](/docs/legal/examples) - Real-world scenarios
- [Troubleshooting](/docs/legal/troubleshooting) - Common issues
