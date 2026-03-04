---
sidebar_position: 4
title: Troubleshooting
description: Common issues and solutions for QWED-Legal
---

# Troubleshooting QWED-Legal

## Installation Issues

### Z3 Solver Not Found

**Error:**
```
ImportError: No module named 'z3'
```

**Solution:**
```bash
pip install z3-solver
```

Note: The package is `z3-solver`, not `z3`.

### Holidays Package Version

**Error:**
```
AttributeError: module 'holidays' has no attribute 'country_holidays'
```

**Solution:**
```bash
pip install --upgrade holidays>=0.40
```

---

## DeadlineGuard Issues

### Unexpected Holiday Calculation

**Problem:** Deadline seems off by a few days.

**Cause:** Different jurisdictions have different holidays.

**Solution:**
```python
# Be explicit about jurisdiction
guard = DeadlineGuard(country="US", state="CA")  # California holidays
guard = DeadlineGuard(country="GB")              # UK holidays
guard = DeadlineGuard(country="IN")              # India holidays
```

### "Failed to parse dates" Error

**Problem:**
```
Failed to parse dates: Unknown string format
```

**Solution:** Use ISO format or unambiguous dates:
```python
# ✅ Good
guard.verify("2026-01-15", "30 days", "2026-02-14")

# ❌ Bad (ambiguous)
guard.verify("01/02/2026", ...)  # Is this Jan 2 or Feb 1?
```

---

## LiabilityGuard Issues

### Float Precision Errors

**Problem:** Small differences in large calculations.

**Cause:** Floating-point precision.

**Solution:** LiabilityGuard uses `Decimal` internally. The default tolerance is 0.01%. Adjust if needed:
```python
guard = LiabilityGuard(tolerance_percent=0.001)  # Stricter
guard = LiabilityGuard(tolerance_percent=0.1)    # More lenient
```

---

## ClauseGuard Issues

### No Conflicts Detected (False Negative)

**Problem:** You expect a conflict but ClauseGuard doesn't find it.

**Cause:** ClauseGuard uses heuristic pattern matching, not full NLP.

**Current Limitations:**
- Only detects termination-related conflicts
- Limited to English text
- Requires specific keyword patterns

**Workaround:** For complex contracts, extract key terms manually:
```python
clauses = [
    "Termination allowed after 30 days notice",  # Clear pattern
    "Minimum term 90 days",                       # Clear pattern
]
```

---

## CitationGuard Issues

### Valid Citation Marked Invalid

**Problem:** A real citation is flagged as invalid.

**Cause:** The reporter isn't in our list.

**Solution:** Check if the reporter is a valid Bluebook abbreviation. If it's a less common reporter, it may not be in our list. File an issue to add it:
[https://github.com/QWED-AI/qwed-legal/issues](https://github.com/QWED-AI/qwed-legal/issues)

### Statute Citation Format

**Problem:** `42 USC 1983` doesn't validate.

**Solution:** Use proper formatting with section symbol:
```python
# ✅ Correct
guard.check_statute_citation("42 U.S.C. § 1983")

# ❌ Missing section symbol
guard.check_statute_citation("42 USC 1983")
```

---

## General Issues

### Import Errors

**Problem:**
```
ImportError: cannot import name 'LegalGuard' from 'qwed_legal'
```

**Solution:**
```bash
pip install --upgrade qwed-legal
```

### Version Mismatch with MCP

**Problem:** MCP tools don't show legal verification options.

**Solution:** Reinstall qwed-mcp after installing qwed-legal:
```bash
pip install qwed-legal
pip install --upgrade qwed-mcp
```

---

## Still Stuck?

- [GitHub Issues](https://github.com/QWED-AI/qwed-legal/issues)
- [Discord Community](https://discord.gg/qwed)
- Email: support@qwedai.com
