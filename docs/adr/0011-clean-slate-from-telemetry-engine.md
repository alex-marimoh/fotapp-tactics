# ADR 0011 — Clean slate: rebuild from variant C's engine

- Status: accepted
- Date: 2026-06-23
- Depends on: [0004](0004-design-direction-rejected-three-pane.md), [0007](0007-domain-model-positions-and-depth.md), [0010](0010-persistence-ephemeral-v1.md)

## Context

The redesign (0004) supersedes all three existing skins. Variant C (telemetry) is the only one
that is responsive, has working drag, and a working depth-chart editor; A and B are static
mockups and both carry the same broken depth-chart import (`DEPTH_CHART` singular, never
exported; `player.form` undefined). `design-canvas.jsx` is a generic artboard/design-review
tool, unused by the app and coupled to a `window.omelette` host.

## Decision

**Start clean from variant C's engineering.**

- **Delete** `a-floodlight.jsx`, `b-chalkboard.jsx`, and `design-canvas.jsx` (git retains
  history). The broken-import bugs die with A/B; no need to fix them.
- **Keep** variant C's reusable logic as the technical basis: responsive pitch sizing
  (`ResizeObserver`), pointer-drag, and the depth-chart editing reducers
  (promote/reorder/eligibility checks).
- **Split `shared.jsx`** into (a) a single **data seam** — the source-of-truth squad/formation
  data behind one interface (per [0003](0003-data-hardcoded-now-real-later.md)) — and (b) **UI
  primitives** (`KitShirt`, `Stars`, `Flag`). Data and presentation should not share a module.
- **Build the new desktop layout** (pitch + full depth board + compliance summary + formation
  selector + leave/re-deploy controls) against the sharpened domain model (0007–0009).

## Consequences

- This ADR is a decision, not yet an edit — deletion/refactor happens when implementation
  starts. Nothing is removed during the design/grilling phase.
- The Player data shape is rebuilt to the locked interface: `{ id, name, num, age, nat,
  rating, natural[], secondary[], registration }`; depth is derived, formation drives slots.
- The one thing still undefined is the actual **visual design** of the new screen — the north
  star (0004) is set, but the look itself needs to be designed/prototyped, since the author
  rejected all three existing skins and "needs to see it."
