---
sidebar_position: 3
title: Compliance & Auditing
description: Verification receipts and regulatory proof
---

# Compliance & Auditing

QWED-Finance generates **cryptographic proof** of every verification for regulatory compliance.

> "If an AI makes a mistake, the algorithm isn't sued—the bank is. Your `input_hash` and `signature` provide **Non-Repudiation**."

## Verification Receipts

Every verification generates a tamper-proof receipt:

```python
from qwed_finance import ReceiptGenerator, VerificationEngine

receipt = ReceiptGenerator.create_receipt(
    guard_name="ComplianceGuard.verify_aml_flag",
    engine=VerificationEngine.Z3,
    llm_output="Transaction approved",
    verified=False,
    violations=["AML_CTR_THRESHOLD"]
)

print(receipt.to_json())
```

### Receipt Fields

| Field | Description | Example |
|-------|-------------|---------|
| `receipt_id` | Unique identifier | `"a1b2c3d4-..."` |
| `timestamp` | ISO 8601 UTC | `"2026-01-18T14:30:00Z"` |
| `input_hash` | SHA-256 of LLM output | `"7f83b1657..."` |
| `engine_used` | Verification engine | `"Z3"` |
| `verified` | Pass/fail | `true/false` |
| `proof_steps` | Symbolic derivation | `["amount=15000", "threshold=10000", "15000>=10000"]` |

### Cryptographic Signature

```python
# Get tamper-proof signature
signature = receipt.get_signature()
# "8f14e45f..."

# Verify hasn't been modified
expected = hashlib.sha256(json.dumps({
    "receipt_id": receipt.receipt_id,
    "timestamp": receipt.timestamp,
    "input_hash": receipt.input_hash,
    "verified": receipt.verified,
    "engine_used": receipt.engine_used.value
}, sort_keys=True).encode()).hexdigest()

assert signature == expected  # Proof of integrity
```

---

## Audit Log

Aggregate receipts for regulatory reporting:

```python
from qwed_finance import AuditLog

log = AuditLog()

# Log verifications
log.log(receipt1)
log.log(receipt2)

# Get summary
summary = log.summary()
# {
#     "total_verifications": 100,
#     "passed": 95,
#     "failed": 5,
#     "pass_rate": "95.0%",
#     "by_guard": {"ComplianceGuard": 40, "QueryGuard": 60}
# }

# Export for regulators
json_export = log.export_json()
```

### Query Failed Verifications

```python
# Get all failures for investigation
failures = log.get_failures()

for receipt in failures:
    print(f"Failed: {receipt.guard_name}")
    print(f"  Input: {receipt.input_preview}")
    print(f"  Violations: {receipt.violations}")
```

---

## Regulatory Alignment

| Regulation | QWED Feature |
|------------|--------------|
| **RBI FREE-AI** | Audit trail with receipts |
| **BSA/FinCEN CTR** | AML threshold verification |
| **OFAC** | Sanctions screening |
| **SOC 2** | Immutable verification logs |
| **ISO 27001** | Input hashing & signatures |

---

## Adversarial Defense

We test against "jailbroken" LLMs:

```python
# tests/adversarial/test_sql_jailbreaks.py

def test_delete_in_subquery():
    """DELETE hidden in subquery should be caught"""
    sql = "SELECT * FROM (DELETE FROM users RETURNING *)"
    result = guard.verify_readonly_safety(sql)
    assert result.safe == False  # ✅ Caught

def test_mixed_case_drop():
    """DrOp TaBlE should be caught"""
    result = guard.verify_readonly_safety("DrOp TaBlE users")
    assert result.safe == False  # ✅ Caught
```

### Test Suites

| Suite | Tests | Coverage |
|-------|-------|----------|
| `test_sql_jailbreaks.py` | 20+ | SQL injection, UNION, comments |
| `test_math_compliance_jailbreaks.py` | 15+ | Float precision, AML boundaries |

---

## For Compliance Officers

When a regulator asks: *"How do you verify AI decisions?"*

Show them:

1. **Input Hash** — Proof of what the LLM said
2. **Timestamp** — When verification occurred
3. **Engine Signature** — Which solver verified (Z3/SymPy)
4. **Proof Steps** — Symbolic derivation of truth
5. **Receipt Signature** — Tamper-proof integrity

```json
{
  "receipt_id": "abc-123",
  "timestamp": "2026-01-18T14:30:00Z",
  "input_hash": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
  "guard_name": "ComplianceGuard.verify_aml_flag",
  "engine_used": "Z3",
  "verified": true,
  "proof_steps": [
    "amount = 15000",
    "threshold = 10000",
    "15000 >= 10000 → flag_required = True",
    "llm_flagged = True",
    "llm_flagged == flag_required → COMPLIANT"
  ],
  "signature": "8f14e45f..."
}
```

---

## Related Pages

- **Previous:** [The 5 Guards](/docs/finance/guards) — Deep dive into each verification guard
- **Next:** [UCP Integration](/docs/finance/integrations/ucp) — Connect to Universal Commerce Protocol
- **See Also:** [Open Responses Integration](/docs/finance/integrations/open-responses) — Agentic tool call verification

---

:::info GitHub Repository
Source code and adversarial tests: [github.com/QWED-AI/qwed-finance](https://github.com/QWED-AI/qwed-finance)
:::

