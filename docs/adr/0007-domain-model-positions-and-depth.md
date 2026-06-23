# ADR 0007 — Domain model: position eligibility, slots, and depth

- Status: accepted
- Date: 2026-06-23
- Depends on: [0006](0006-concept-squad-depth-planning.md)
- Cleans up: the synthetic `CB2` key and ad-hoc depth derivation in
  [shared.jsx](../../src/shared.jsx)

## Context

With squad-depth planning as the core (0006) and re-deploy as a chosen what-if action, the
position model stops being incidental and becomes the product's spine. Two decisions were
taken during grilling:

1. Re-deploy is governed by **per-player position eligibility** (not free movement).
2. Eligibility has **two tiers: natural and secondary.**

The existing code expresses positions weakly: each player has a single `pos`; the second
centre-back is a hand-rolled `CB2` key; depth charts are derived in two ad-hoc passes.

## Decision

**Player positions.** Each player carries eligible positions in two tiers:
- `natural` — position(s) the player is genuinely a fit for.
- `secondary` — position(s) they can cover, flagged as out-of-role.
- Anything else is ineligible. Re-deploying into a `secondary` slot is allowed but visibly
  marked "out of position"; into an ineligible slot is disallowed (or a hard warning).
- For the demo this is authored on the fictional squad; for real data (0003) it comes from
  the source. The Player *interface* includes eligibility from now on.

**Position slots come from the formation.** The chosen Formation (the lens, 0006) defines the
set of slots and their pitch coordinates. A slot has a stable identity of
`(positionType, index)` — e.g. the two centre-backs are `CB#1` / `CB#2`, not a base `CB` plus
a magic `CB2`. Retire the `CB2` special-case.

**Depth per slot.** For each slot: an ordered `{ starter, backups[] }` of squad players,
where every occupant must be eligible (natural or secondary) for that slot's positionType.

**Starter-elsewhere rule retained.** A player may start at most one slot; promoting them to a
starter frees their previous slot (creating a gap there). This invariant — already in the
telemetry code — is exactly the "rob Peter to pay Paul" tension that makes planning real.

## Consequences

- Re-deploy and gap detection both read off eligibility + slot occupancy; they are the same
  model, not two features.
- Changing formation re-derives slots and re-maps the squad; depth/gaps recompute. The
  formation selector is now a real input to the model, not chrome.
- The data interface to lock (per 0003) is: `Player { id, name, num, age, nat, rating,
  natural[], secondary[] }` and `Formation { slots: { type, index, x, y }[] }`. Depth is
  derived, not stored as literal `CB2`-style keys.
- "Out of position" and "ineligible" are distinct states with distinct visuals.
