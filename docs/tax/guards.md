---
sidebar_position: 2
title: The Guards
description: Detailed breakdown of Classification, Nexus, and Payroll Guards
---

# The Guards

QWED-Tax verifies logic deterministically. No probabilities, just rules.

## 🇺🇸 United States (IRS)

### 1. ClassificationGuard (IRS Common Law)
**Goal:** Prevent "Employee Misclassification" lawsuits.
**Logic:** Uses the IRS Common Law test to determine if a worker is a W-2 Employee or 1099 Contractor.
*   **Behavioral Control:** Does the employer provide tools/instructions?
*   **Financial Control:** Does the employer reimburse expenses?
*   **Relationship:** Is it indefinite?

**Rule:** If you control *how* they work and *pay* their expenses, they are an Employee (W-2), even if the AI says "1099".

### 2. NexusGuard (Economic Nexus)
**Goal:** Prevent Sales Tax Evasion.
**Logic:** Checks local state thresholds for 2025.
*   **NY/TX/CA:** > $500,000 Sales
*   **FL/IL/PA:** > $100,000 Sales
**Rule:** If YTD Sales > Threshold and AI says "No Tax", **BLOCK**.

### 3. PayrollGuard (FICA Limits)
**Goal:** Verify Paycheck Math.
**Logic:**
*   **Gross-to-Net:** `Gross - Taxes - Deductions == Net` (Exact Decimal match).
*   **Soical Security Cap:** Enforces 2025 Wage Base Limit ($176,100). Tax stops after this amount.

## 🇮🇳 India (CBDT)

### 1. CryptoTaxGuard (Sec 115BBH)
**Rule:** Losses from Virtual Digital Assets (VDA) cannot be set off against any other income (including other VDA gains).
**Verdict:** Blocks any AI attempt to reduce tax liability using crypto losses.

### 2. GSTGuard (RCM)
**Rule:** Certain services (GTA, Legal) require **Reverse Charge Mechanism** (Recipient pays tax).
**Verdict:** Blocks invoices where AI failed to apply RCM logic.

### 3. InvestmentGuard (Trading)
**Goal:** Prevent Set-Off Errors.
**Logic:**
*   **SpeculationGuard:** Intraday Equity losses are "Speculative". They cannot be set off against F&O (Non-speculative) or Salary income.
*   **CapitalGainsGuard:** Enforces strictly defined holding periods (e.g. Equity > 12m = LTCG).
**Verdict:** Blocks "Illegal Set-Off" claims.

### 4. CorporateGuard (Loans & Valuation)
**Goal:** Corporate Governance (Sec 185/Valuation).
**Logic:**
*   **RelatedPartyGuard:** Prohibits loans to Directors/Relatives/Holding-Co-Directors unless specific exemptions apply.
*   **ValuationGuard:** Deterministically calculates Convertible Note conversion prices (`min(Cap, Discount)`).
**Verdict:** Blocks loans that risk "Deemed Dividend" or Section 185 violation.

### 5. RemittanceGuard (FEMA/LRS)
**Goal:** Prevent Forex Violations.
**Logic:**
*   **LRS Limit:** Enforces $250,000 annual limit per PAN.
*   **Prohibited List:** Blocks Gambling, Lottery, Racing, and **Margin Trading**.
*   **TCS Logic:** Applies 20% Tax for generic remittance, 5% for Education/Medical.
**Verdict:** Blocks prohibited remittances and miscalculated TCS.

### 6. Accounts Payable Guards (Indirect Tax)
**Goal:** Automate GST/VAT and TDS compliance.
**Logic:**
*   **InputCreditGuard:** Checks Section 17(5) "Blocked List".
    *   *Food/Beverages:* Blocked.
    *   *Motor Vehicles:* Blocked (unless transport biz).
*   **TDSGuard:** Calculates withholding based on service type.
    *   *Professional Fees:* 10% (Sec 194J).
    *   *Contractors:* 1% or 2% (Sec 194C).
**Verdict:** Blocks ITC claims on personal items and ensures vendor payments have TDS deducted.
