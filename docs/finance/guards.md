---
sidebar_position: 2
title: The 5 Guards
description: Deep dive into QWED-Finance verification guards
---

# The 5 Guards

QWED-Finance uses **Neurosymbolic AI** - combining neural (LLM) outputs with symbolic (math/logic) verification.

## 1. Compliance Guard (Z3)

**Purpose:** Verify KYC/AML regulatory decisions using formal boolean logic.

```python
from qwed_finance import ComplianceGuard

guard = ComplianceGuard()

# AML Threshold Check (BSA/FinCEN)
result = guard.verify_aml_flag(
    amount=15000,
    country_code="US",
    llm_flagged=True
)
# result.compliant = True ✅
# result.proof = "amount >= 10000 → CTR required"
```

### Methods

| Method | Description |
|--------|-------------|
| `verify_aml_flag()` | Check CTR threshold ($10,000) |
| `verify_kyc_complete()` | Validate KYC document requirements |
| `verify_transaction_limit()` | Enforce daily limits |
| `verify_sanctions_check()` | OFAC sanctions screening |

### How Z3 Works

```python
# Z3 proves: IF amount >= 10000 THEN flag_required
from z3 import *
amount = Real('amount')
flag = Bool('flag')
solver = Solver()
solver.add(Implies(amount >= 10000, flag == True))
```

---

## 2. Calendar Guard (SymPy)

**Purpose:** Deterministic day count conventions for interest calculations.

```python
from qwed_finance import CalendarGuard, DayCountConvention
from datetime import date

guard = CalendarGuard()

# Verify 30/360 day count
result = guard.verify_day_count(
    start_date=date(2026, 1, 1),
    end_date=date(2026, 7, 1),
    llm_days=180,
    convention=DayCountConvention.THIRTY_360
)
# result.verified = True ✅
```

### Supported Conventions

| Convention | Use Case |
|------------|----------|
| `ACTUAL_ACTUAL` | US Treasury bonds |
| `ACTUAL_360` | T-Bills, Commercial paper |
| `ACTUAL_365` | UK Gilts |
| `THIRTY_360` | Corporate bonds |
| `THIRTY_E_360` | Eurobonds |

---

## 3. Derivatives Guard (Black-Scholes)

**Purpose:** Options pricing and margin verification using pure calculus.

```python
from qwed_finance import DerivativesGuard, OptionType

guard = DerivativesGuard()

# Verify Black-Scholes call price
result = guard.verify_black_scholes(
    spot_price=100,
    strike_price=105,
    time_to_expiry=0.25,
    risk_free_rate=0.05,
    volatility=0.20,
    option_type=OptionType.CALL,
    llm_price="$3.50"
)
# result.greeks = {"delta": 0.4502, "gamma": 0.0389, ...}
```

### Methods

| Method | Description |
|--------|-------------|
| `verify_black_scholes()` | Options pricing with Greeks |
| `verify_delta()` | Delta calculation |
| `verify_margin_call()` | Margin call decision |
| `verify_put_call_parity()` | Arbitrage detection |

---

## 4. Message Guard (XML Schema)

**Purpose:** Validate ISO 20022 and SWIFT messages before transmission.

```python
from qwed_finance import MessageGuard, MessageType

guard = MessageGuard()

# Verify pacs.008 payment message
result = guard.verify_iso20022_xml(
    xml_string=pacs008_xml,
    msg_type=MessageType.PACS_008
)
# result.valid = True/False
# result.errors = ["Missing required element: GrpHdr"]
```

### Supported Formats

| Format | Description |
|--------|-------------|
| `PACS_008` | Customer Credit Transfer |
| `CAMT_053` | Bank Statement |
| `PAIN_001` | Payment Initiation |
| `MT103` | SWIFT Single Transfer |
| `MT202` | SWIFT Bank Transfer |

### SWIFT MT Validation

```python
# Validate MT103 fields
result = guard.verify_swift_mt(
    mt_string=mt103_message,
    mt_type=SwiftMtType.MT103
)
# Checks Field 20, 32A, 50K, 59, etc.
```

---

## 5. ISOGuard (JSON Schema)

**Purpose:** Enforce ISO 20022 compliance for JSON-based Agentic Banking.

```python
from qwed_finance import ISOGuard

guard = ISOGuard()

# Verify pacs.008 (JSON format)
result = guard.verify_payment_message(
    message={
        "MsgId": "1234AB",
        "CreDtTm": "2026-01-28T10:00:00",
        "NbOfTxs": 1,
        "TtlIntrBkSttlmAmt": {"amount": 100.50, "currency": "USD"}
    },
    msg_type="pacs.008"
)
# result.verified = True ✅
```

### Why JSON vs XML?
While `MessageGuard` handles traditional XML SWIFT messages, `ISOGuard` enables **Modern Banking Agents** to speak the same standard using lightweight JSON.

---

## 6. Query Guard (SQLGlot)

**Purpose:** Prevent SQL injection and unauthorized data access.

```python
from qwed_finance import QueryGuard

guard = QueryGuard(allowed_tables={"transactions", "accounts"})

# Check read-only safety
result = guard.verify_readonly_safety(
    "DELETE FROM users WHERE id=1"
)
# result.safe = False ❌
# result.violations = ["Mutation detected: DELETE statement"]
```

### Methods

| Method | Description |
|--------|-------------|
| `verify_readonly_safety()` | Block INSERT/UPDATE/DELETE/DROP |
| `verify_table_access()` | Whitelist allowed tables |
| `verify_column_access()` | Block PII columns |
| `verify_no_injection()` | Detect injection patterns |

### Why AST, Not Regex?

```sql
-- Regex might miss this:
SELECT * FROM (DELETE FROM users RETURNING *) AS x

-- SQLGlot AST catches it by parsing the tree structure
```

---

## Cross-Guard (Multi-Layer)

**Purpose:** Combine multiple guards for comprehensive verification.

```python
from qwed_finance import CrossGuard

guard = CrossGuard()

# SWIFT + Sanctions in one call
result = guard.verify_swift_with_sanctions(
    mt_string=swift_message,
    sanctions_list=["ACME Corp", "Bad Bank LLC"]
)
# Validates SWIFT format AND screens entities
```

---

## 7. Bond Guard (Yield Analytics)

**Purpose:** Verify fixed income calculations like Yield to Maturity (YTM) and duration using Newton-Raphson.

```python
from qwed_finance import BondGuard

guard = BondGuard()

# Verify YTM calculation
result = guard.verify_ytm(
    face_value=1000,
    coupon_rate=0.05,
    price=950,
    years_to_maturity=10,
    llm_output="5.66%"
)
# result.verified = True ✅
# result.computed_ytm = 0.0566...
```

---

## 8. FX Guard (Currency Arbitration)

**Purpose:** Validate cross-currency conversions and detect arbitrage opportunities.

```python
from qwed_finance import FXGuard

guard = FXGuard()

# Verify Spot Conversion
result = guard.verify_conversion(
    amount=1000,
    from_currency="USD",
    to_currency="EUR",
    rate=0.92,
    llm_output="920.00 EUR"
)
# result.verified = True ✅
```

---

## 9. Risk Guard (Portfolio Metrics)

**Purpose:** Ensure risk metrics like Sharpe Ratio and VaR (Value at Risk) are mathematically consistent.

```python
from qwed_finance import RiskGuard

guard = RiskGuard()

# Verify Sharpe Ratio
# (Return - RiskFree) / Volatility
result = guard.verify_sharpe_ratio(
    portfolio_return=0.12,
    risk_free_rate=0.03,
    volatility=0.15,
    llm_output="0.60" 
)
# result.verified = True ✅
# result.computed_sharpe = 0.60
```

---

:::tip PyPI Package
All 9 guards are available via `pip install qwed-finance`
:::

