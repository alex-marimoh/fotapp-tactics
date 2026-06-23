# ADR 0001 — This repo is an MVP demo, not a production app (yet)

- Status: accepted
- Date: 2026-06-23

## Context

`fotapp-tactics` is a React 19 + Vite single-page app showing a Football-Manager-style
"Tactics" board. It contains three visual variants of the board
([a-floodlight](../../src/a-floodlight.jsx), [b-chalkboard](../../src/b-chalkboard.jsx),
[c-telemetry](../../src/c-telemetry.jsx)) over one shared dataset
([shared.jsx](../../src/shared.jsx)), plus a pan/zoom artboard harness
([design-canvas.jsx](../../src/design-canvas.jsx)) that is not wired into the running app.

The question on the table during grilling: is this a throwaway design sandbox, a product
seed, a portfolio piece, or a component-harvesting ground?

## Decision

It is an **MVP demo** — a minimum artifact built to communicate and validate a concept the
author has in mind. The bar is "convincing enough to demonstrate the idea," not
"production-grade architecture." It seeds toward a real product but is not one today.

## Consequences

- Fidelity of the *experience* matters more than purity of the *architecture*. A hardcoded
  dataset is acceptable; a flow that visibly breaks during a demo is not.
- Exactly one board variant should ship. The other variants and the artboard harness are
  scaffolding whose fate is decided in later ADRs.
- "Done" = the concept reads clearly to whoever the demo is for. Define that audience and
  the must-work flows before polishing anything.
