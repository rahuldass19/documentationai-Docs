---
sidebar_position: 6
---

# Graph Fact Engine

The **Graph Fact Engine** verifies claims by checking them against detailed **Knowledge Graph (KG)** structures, rather than just unstructured text. This provides structured fact-checking for complex relationships.

## How It Works

It decomposes claims into Subject-Predicate-Object (SPO) triples and queries a connected Knowledge Graph (like Neo4j or NetworkX) to verify the relationship exists.

1.  **Triple Extraction:** Extract `(Paris, is_capital_of, France)` from "Paris is the capital of France".
2.  **Pathfinding:** Search the KG for a path between `Paris` and `France` with edge `is_capital_of`.
3.  **Transitive Verification:** Verify implicit relationships (e.g., if A is in B, and B is in C, is A in C?).

## Usage

```python
response = client.verify_graph(
    claim="Elon Musk is the CEO of Tesla",
    graph_id="tech_leaders_kg"
)
```

## When to use

-   **Complex Relationships:** Family trees, corporate hierarchies, supply chains.
-   **Multi-hop Reasoning:** "Is the CEO of the acquisition target verified?"
-   **Structured Data:** When your source of truth is a Database or Graph, not a document.
