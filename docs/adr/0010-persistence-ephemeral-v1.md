# ADR 0010 — Persistence: ephemeral is fine for v1

- Status: accepted
- Date: 2026-06-23
- Depends on: [0001](0001-repo-is-an-mvp-demo.md)

## Context

What-if edits currently live in React state and reset on reload. Asked whether they must
survive a refresh, the author: doesn't matter for the internal demo phase — "whatever is
easier."

## Decision

**In-memory only for v1.** No backend, no accounts. A page reload resetting to the base squad
is acceptable. If/when convenient, add silent **localStorage autosave** of the single current
scenario — it's a few lines and buys refresh-safety — but it is optional, not a requirement.

Named/multiple saved scenarios are out of v1 (see [backlog](../backlog.md)).

## Consequences

- No persistence layer to design or test for the demo.
- The product board must **not** depend on the `window.omelette` host that
  [design-canvas.jsx](../../src/design-canvas.jsx) uses for its state file — that's a design
  tool's host integration, not part of the product.
- Moving to real persistence later is a clean addition behind the same scenario state shape.
