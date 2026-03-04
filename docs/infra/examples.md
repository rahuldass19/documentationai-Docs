---
sidebar_position: 3
title: Usage Examples
---

# Usage Examples

## 1. Parsing & Verifying IAM

```python
from qwed_infra import TerraformParser, IamGuard 

# Parse a real Terraform directory
parser = TerraformParser()
resources = parser.parse_directory("./terraform/prod")

# Verify IAM Policies found in Terraform
guard = IamGuard()

for policy in resources.get("policies", []):
    # Context-Aware Verification
    result = guard.verify_access(
        policy, 
        action="s3:GetObject", 
        resource="*",
        context={"aws:SourceIp": "192.168.1.5"} # Corporate VPN Only
    )
    print(f"Policy {policy['id']} allows VPN access? {result.allowed}")
```

## 2. Verifying Cloud Costs

```python
from qwed_infra import CostGuard

cost = CostGuard()

# Define resources (or parse from Terraform)
resources = {
    "instances": [
        {"id": "web-cluster", "instance_type": "t3.micro", "count": 2},
        {"id": "gpu-trainer", "instance_type": "p4d.24xlarge", "count": 1} # $32/hr!
    ]
}

# Check against budget
result = cost.verify_budget(resources, budget_monthly=500.0)

print(f"Within Budget? {result.within_budget}") # -> False
print(f"Total: ${result.total_monthly_cost:.2f}") # -> ~$23,900
print(f"Reason: {result.reason}")
```

## 3. Verifying Network Reachability

```python
from qwed_infra import NetworkGuard

net_guard = NetworkGuard()

# Graph-based Verification
# (Normally parsed from TF, here shown as dict structure)
infra = {
    "subnets": [
        {"id": "public-subnet", "security_groups": ["sg-web"]}
    ],
    "route_tables": [
        {"subnet_id": "public-subnet", "routes": {"0.0.0.0/0": "igw-main"}}
    ],
    "security_groups": {
        "sg-web": {"ingress": [{"port": 80, "cidr": "0.0.0.0/0"}]}
    }
}

# Is Web Accessible?
res = net_guard.verify_reachability(infra, "internet", "public-subnet", 80)
print(f"Internet Reachable? {res.reachable}") # -> True
```
