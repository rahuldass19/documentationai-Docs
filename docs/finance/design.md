---
sidebar_position: 5
title: Design & Architecture
description: Deep dive into QWED-Finance internal design
---

# Design & Architecture

This page provides a deep dive into the internal design of QWED-Finance.

## System Overview

```mermaid
C4Context
    title QWED-Finance System Context
    
    Person(user, "Banking Customer", "Interacts with banking services")
    Person(agent, "Banking Agent", "LLM-powered assistant")
    
    System(qwed, "QWED-Finance", "Deterministic verification middleware")
    
    System_Ext(bank, "Core Banking", "Transaction processing")
    System_Ext(swift, "SWIFT Network", "International payments")
    System_Ext(regulator, "Regulators", "RBI, FinCEN, OFAC")
    
    Rel(user, agent, "Requests")
    Rel(agent, qwed, "Verifies outputs")
    Rel(qwed, bank, "Approved transactions")
    Rel(qwed, swift, "Verified messages")
    Rel(qwed, regulator, "Audit receipts")
```

## Guard Architecture

### Component Diagram

```mermaid
graph TB
    subgraph "qwed_finance/"
        direction TB
        
        subgraph "Guards (Domain Logic)"
            CG["compliance_guard.py<br/>AML/KYC/Sanctions"]
            CAL["calendar_guard.py<br/>Day Count Conventions"]
            DG["derivatives_guard.py<br/>Black-Scholes"]
            MG["message_guard.py<br/>ISO 20022 / SWIFT"]
            QG["query_guard.py<br/>SQL Safety"]
            XG["cross_guard.py<br/>Multi-layer"]
        end
        
        subgraph "Models (Data Structures)"
            Receipt["models/receipt.py<br/>VerificationReceipt"]
            Schemas["schemas.py<br/>LoanSchema, etc."]
        end
        
        subgraph "Integrations (External APIs)"
            OR["integrations/open_responses.py"]
            UCP["integrations/ucp.py"]
        end
        
        subgraph "Core"
            FV["finance_verifier.py<br/>NPV, IRR, Loans"]
        end
    end
    
    subgraph "External Engines"
        Z3["Z3 SMT Solver"]
        SymPy["SymPy"]
        SQLGlot["SQLGlot"]
    end
    
    CG --> Z3
    CAL --> SymPy
    DG --> SymPy
    QG --> SQLGlot
    
    CG --> Receipt
    CAL --> Receipt
    DG --> Receipt
    MG --> Receipt
    QG --> Receipt
```

## Verification Flow

### State Machine

```mermaid
stateDiagram-v2
    [*] --> Received: LLM Output
    
    Received --> Parsing: Extract Data
    Parsing --> GuardSelection: Detect Type
    
    GuardSelection --> ComplianceCheck: Financial Amount
    GuardSelection --> CalendarCheck: Date Calculation
    GuardSelection --> DerivativesCheck: Options/Greeks
    GuardSelection --> MessageCheck: XML/SWIFT
    GuardSelection --> QueryCheck: SQL Query
    
    ComplianceCheck --> SymbolicProof
    CalendarCheck --> SymbolicProof
    DerivativesCheck --> SymbolicProof
    MessageCheck --> SchemaValidation
    QueryCheck --> ASTAnalysis
    
    SymbolicProof --> ReceiptGeneration
    SchemaValidation --> ReceiptGeneration
    ASTAnalysis --> ReceiptGeneration
    
    ReceiptGeneration --> Approved: verified=True
    ReceiptGeneration --> Rejected: verified=False
    ReceiptGeneration --> PendingReview: needs_review=True
    
    Approved --> [*]
    Rejected --> [*]
    PendingReview --> [*]
```

## Data Flow

### Verification Receipt Lifecycle

```mermaid
flowchart LR
    subgraph Input
        LLM["LLM Output"]
    end
    
    subgraph Processing
        Hash["SHA-256<br/>Input Hash"]
        Guard["Guard<br/>Verification"]
        Proof["Symbolic<br/>Proof Steps"]
    end
    
    subgraph Output
        Receipt["Verification<br/>Receipt"]
        Log["Audit<br/>Log"]
    end
    
    LLM --> Hash
    LLM --> Guard
    Guard --> Proof
    Hash --> Receipt
    Proof --> Receipt
    Receipt --> Log
```

### Cross-Guard Pipeline

```mermaid
flowchart TD
    Input["SWIFT MT103 Message"]
    
    subgraph "Cross-Guard Pipeline"
        Step1["1. Message Guard<br/>Validate MT103 Format"]
        Step2["2. Extract Entities<br/>Debtor/Creditor Names"]
        Step3["3. Compliance Guard<br/>Sanctions Screening"]
        Step4["4. Query Guard<br/>Database Lookup Safety"]
    end
    
    Output1["✅ All Clear"]
    Output2["❌ Sanctions Hit"]
    Output3["⚠️ Format Error"]
    
    Input --> Step1
    Step1 -->|Valid| Step2
    Step1 -->|Invalid| Output3
    Step2 --> Step3
    Step3 -->|Clear| Step4
    Step3 -->|Hit| Output2
    Step4 --> Output1
```

## Engine Selection Matrix

```mermaid
quadrantChart
    title Guard-to-Engine Mapping
    x-axis "Numeric Precision" --> "Logical Completeness"
    y-axis "Simple" --> "Complex"
    
    quadrant-1 "Formal Proofs"
    quadrant-2 "Calculations"
    quadrant-3 "Parsing"
    quadrant-4 "Validation"
    
    "Compliance (Z3)": [0.8, 0.7]
    "Calendar (SymPy)": [0.3, 0.4]
    "Derivatives (Math)": [0.2, 0.6]
    "Message (XML)": [0.6, 0.3]
    "Query (AST)": [0.7, 0.5]
```

## Class Diagram

```mermaid
classDiagram
    class FinanceVerifier {
        +verify_npv(cashflows, rate)
        +verify_irr(cashflows)
        +verify_loan_payment(principal, rate, months)
    }
    
    class ComplianceGuard {
        -z3_solver: Solver
        +verify_aml_flag(amount, country)
        +verify_kyc_complete(documents)
        +verify_sanctions_check(entity)
    }
    
    class MessageGuard {
        +verify_iso20022_xml(xml, type)
        +verify_swift_mt(message, type)
        +validate_bic(bic)
        +validate_iban(iban)
    }
    
    class QueryGuard {
        -allowed_tables: Set
        -blocked_columns: Set
        +verify_readonly_safety(sql)
        +verify_table_access(sql)
        +verify_no_injection(sql)
    }
    
    class VerificationReceipt {
        +receipt_id: str
        +timestamp: str
        +input_hash: str
        +verified: bool
        +proof_steps: List
        +to_json()
        +get_signature()
    }
    
    class CrossGuard {
        -compliance: ComplianceGuard
        -message: MessageGuard
        -query: QueryGuard
        +verify_swift_with_sanctions()
        +verify_iso_with_rules()
    }
    
    ComplianceGuard --> VerificationReceipt : generates
    MessageGuard --> VerificationReceipt : generates
    QueryGuard --> VerificationReceipt : generates
    CrossGuard --> ComplianceGuard : uses
    CrossGuard --> MessageGuard : uses
    CrossGuard --> QueryGuard : uses
```

## Deployment Architecture

```mermaid
flowchart TB
    subgraph "Production Environment"
        subgraph "API Layer"
            FastAPI["FastAPI Server"]
            Express["Express Middleware"]
        end
        
        subgraph "QWED-Finance"
            Guards["5 Guards"]
            Audit["Audit Log"]
        end
        
        subgraph "Storage"
            Redis["Redis<br/>(Receipt Cache)"]
            S3["S3/GCS<br/>(Audit Archive)"]
        end
    end
    
    subgraph "External"
        LLM["LLM API"]
        Bank["Bank API"]
    end
    
    LLM --> FastAPI
    LLM --> Express
    FastAPI --> Guards
    Express --> Guards
    Guards --> Audit
    Audit --> Redis
    Audit --> S3
    Guards --> Bank
```

---

## Design Principles

### 1. Determinism First

Every verification produces the **same result** for the same input. No randomness.

### 2. Symbolic Over Statistical

Use mathematical proofs (Z3, SymPy) instead of probabilistic confidence scores.

### 3. Audit by Default

Every verification generates a receipt. No silent failures.

### 4. Defense in Depth

Cross-Guard combines multiple guards for layered security.

---

## Related Pages

- [Overview](/docs/finance/overview) — Introduction and quick start
- [The 5 Guards](/docs/finance/guards) — Guard implementation details
- [Compliance & Auditing](/docs/finance/compliance) — Receipt and audit log details
