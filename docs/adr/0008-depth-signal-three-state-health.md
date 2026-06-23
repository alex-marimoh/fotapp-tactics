# ADR 0008 — Depth feedback: three-state slot health

- Status: accepted
- Date: 2026-06-23
- Depends on: [0007](0007-domain-model-positions-and-depth.md)

## Context

The prototypes felt empty partly because nothing reacted to the user's moves (0006). The
product needs a per-position feedback signal that changes live as the user marks players
leaving or re-deploys them. Options ranged from a binary covered/gap flag to a numeric depth
score with a tunable formula.

## Decision

Each Position slot has a **three-state depth health**:

- **Solid** — natural starter *and* at least one natural backup.
- **Thin** — a starter, but cover is only secondary (out-of-position) or absent.
- **Gap** — no natural starter (e.g. the starter is leaving and only secondary cover remains)
  or the slot is uncovered.

Health is **derived** from eligibility tiers (0007) + slot occupancy + leaving flags, and is
**color-coded** on both the pitch and the depth view. It recomputes live on every what-if.

No numeric score (too analyst, needs a defended formula, fights the casual tone) and no
squad-wide rollup for now (can add later if the demo wants a headline).

## Consequences

- This is the spark: marking a starter as leaving flips their slot toward Thin/Gap instantly;
  a valid re-deploy can restore Solid — but may turn the donor slot Thin (the planning
  tension).
- Age/youth is shown per player but is **not** in the health formula for the demo (keeps the
  rule legible). A position covered only by veterans is a known future refinement.
- Three states map cleanly to three colors; pick a palette that reads as
  good / caution / problem without looking like a spreadsheet.
