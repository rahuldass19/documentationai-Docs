---
sidebar_position: 2
title: Verification Guards
---

# Verification Guards

`qwed-infra` provides three primary guards to verify different aspects of your infrastructure.

## 1. 🛡️ IamGuard

**Engine:** Z3 Theorem Prover

IamGuard converts AWS IAM Policies into First-Order Logic formulas to prove or disprove access. This is superior to regex-based policy checks because it reasons about logic (AND, OR, NOT, Conditions).

### Capabilities
- **Wildcard Logic:** Correctly handles `s3:*`, `bucket/*` expansion.
- **Conditions:** Supports context keys like `aws:SourceIp` (CIDR blocks), `aws:CurrentTime` (Date), and `StringEquals`.
- **Deny Overrides:** Mathematically proves that an explicit `Deny` always overrides an `Allow`, regardless of statement order.
- **Least Privilege Analysis:** Proves if a policy allows stronger permissions than intended (e.g., proves `Admin` access is NOT possible).

## 2. 🌐 NetworkGuard

**Engine:** NetworkX (Graph Theory)

NetworkGuard builds a directed graph of your network topology (VPCs, Subnets, Route Tables, Security Groups, NACLs, Internet Gateways). It then uses graph traversal algorithms to verify reachability.

### Capabilities
- **Public Access Check:** Validates if a path exists from `Internet` to a specific `Instance`.
  - Path: `Internet -> IGW -> Route Table -> Subnet -> NACL -> Security Group -> Instance`.
- **Port Verification:** Ensures critical management ports (22 SSH, 3389 RDP) are not exposed to `0.0.0.0/0`.
- **Segmentation Verification:** Proves that sensitive subnets (e.g., Database) are isolated from public subnets.

## 3. 💰 CostGuard

**Engine:** Deterministic Arithmetic & Pricing Catalog

CostGuard estimates the monthly cost of your infrastructure definition *before* deployment. It uses an embedded, static pricing catalog for standard cloud resources.

### Capabilities
- **Budget Enforcement:** Blocks deployment if `estimated_cost > budget`.
- **Anomaly Detection:** Detects and flags expensive instance types (e.g., `p4d.24xlarge` GPU instances) that might be hallucinations.
- **Granular Breakdown:** Provides cost breakdown by resource type (Compute, Storage, Database).
