# ADR 0003 — Data is hardcoded now; real & accurate data is a future hard requirement

- Status: accepted
- Date: 2026-06-23
- Depends on: [0001](0001-repo-is-an-mvp-demo.md), [0002](0002-audience-armchair-manager-sandbox.md)

## Context

The "see their team" hook (0002) ultimately needs real, accurate rosters. The author's
position: for the current demo the data doesn't need to be real, but **eventually it has to
be accurate**. Today all data lives as hardcoded constants in
[shared.jsx](../../src/shared.jsx) and the boards import those constants directly.

## Decision

- **Now:** keep hardcoded data. Do not build an API, picker, or live integration for the
  demo (YAGNI).
- **But:** treat "swap the data source later" as a known, near-certain change, and keep a
  clean **data seam** so that swap is a one-place edit — not a rewrite of every board.

This is a "keep the door open" decision, not a "build the room" decision.

## Consequences

- The boards should read team data through a single source-of-truth module/interface, not
  reach into literal constant shapes scattered across files. The current direct-import-of-
  constants is acceptable only if that import point stays the *one* place data enters.
- Mixing raw data, derived structures (depth charts), and presentational primitives
  (`KitShirt`, `Stars`, `Flag`) in one `shared.jsx` weakens that seam — see follow-up ADR on
  splitting the data seam from the component primitives.
- The eventual real-data adapter (API/dataset) must satisfy the same interface the demo's
  hardcoded adapter satisfies. Defining that interface shape now (player, squad, depth chart)
  is the cheap insurance; populating it from a real source is the later work.
