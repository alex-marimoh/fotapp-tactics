# ADR 0012 — Chosen design direction: Field hero (pitch | info split)

- Status: accepted
- Date: 2026-06-23
- Resolves the open thread in [0004](0004-design-direction-rejected-three-pane.md) and
  [0011](0011-clean-slate-from-telemetry-engine.md)

## Context

Three fresh polished directions were prototyped (see the now-deleted `PROTOTYPE-directions.jsx`):
Calm split, Depth matrix, and Field hero. The author reviewed them running locally and chose
**Field hero**, with one fix: the pitch was stretched full-width and distorted.

## Decision

The product look is **Field hero**:

- A dark, lush, playful skin (leaning into "fun, my team" — the audience from 0002/0006),
  not the analyst/data-room feel that was rejected.
- **Top region split 50/50:** an aspect-correct vertical pitch (68×105) on the left, an
  **info panel** on the right (currently a `PLACEHOLDER` "Team news" feed — to be replaced).
- **Depth drawer** spans the bottom: tap a position on the pitch to load its starter/backup
  cards; tap a card to mark a player leaving.
- Three-state **depth health** (0008) on the pitch nodes and **registration compliance**
  (0009) in the ribbon, both live.

The other two directions and all earlier skins are deleted (clean slate, 0011).

## Consequences

- Code graduated out of the prototype into the real app:
  - `squad-data.js` — the data + domain-model seam (roster, slots, depth, health,
    compliance). Single place a real data source plugs in later (0003).
  - `board.jsx` — the Field hero board UI (`TacticsBoard`), rendered by `App.jsx`.
  - Deleted: `a-floodlight.jsx`, `b-chalkboard.jsx`, `c-telemetry.jsx`, `design-canvas.jsx`,
    `shared.jsx`, and the prototype files.
- **Open follow-ups:** the info panel is a placeholder (decide its real first content); pitch
  vs info split ratio is currently even (50/50); formation selector and re-deploy are still
  stubs. These are now iteration on the real board, not design exploration.
