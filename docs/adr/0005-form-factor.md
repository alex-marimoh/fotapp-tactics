# ADR 0005 — Form factor: desktop only (for the demo)

- Status: accepted
- Date: 2026-06-23
- Depends on: [0004](0004-design-direction-rejected-three-pane.md)

## Context

The redesign (0004) needs a target form factor before layout work. The audience is everyday
fans, which argued for mobile-first, but the demo will be presented on a laptop and the
content is information-dense.

## Decision

Target **desktop only** for the demo. One polished laptop-sized screen. Mobile/responsive
and any installable/PWA framing are explicitly **out of scope** for now.

## Consequences

- Layout work optimises a single large viewport. No need to solve reflow, bottom sheets, or
  touch ergonomics yet.
- The "wasted space / looks empty" critique (0004) must still be fixed *within* a desktop
  layout: the answer is better composition and editing-out weak panels, not more columns.
- Because we're not committing to responsive, avoid hard-coding a single fixed pixel canvas
  (variants A/B were locked to 1440×920) where cheap to avoid — but pixel-perfecting one
  desktop size is acceptable for the demo.
- A later "make it mobile" effort is a known future change, not a current constraint.
