# ADR 0009 — Squad registration & quota compliance is a first-class dimension

- Status: accepted
- Date: 2026-06-23
- Depends on: [0006](0006-concept-squad-depth-planning.md), [0007](0007-domain-model-positions-and-depth.md)
- Reframes: the nationality "Demographics" panel in the existing variants

## Context

Asked whether the nationality table earns screen space, the author reframed it: nationality
matters in football not as flags but as **registration rules**. Greece caps non-EU players
(e.g. 5); UEFA competitions require a quota of homegrown/national players. A sporting director
plans against these limits as much as against depth.

## Decision

Add **registration classification + quota compliance** as a first-class planning dimension
alongside depth.

- Each player carries a **registration category** — a coarse classification, not raw
  nationality: e.g. `homegrown/national`, `EU`, `non-EU` (exact buckets configurable per
  league/competition).
- The app shows **squad compliance** against quota rules: counts vs limits (e.g. "Non-EU
  4/5", "Homegrown 6/8"), with an over/under-limit state.
- Compliance **reacts to what-ifs**: marking a non-EU starter as leaving frees a non-EU slot;
  re-deploying doesn't change registration but changing the registered XI can.
- For the demo: one representative rule set (Greek league non-EU cap + a homegrown note). The
  underlying flag/nationality data still exists; category is derived from it.

## Consequences

- **Screen scope settles** (the "wasted space" fix): the desktop screen is
  **pitch + full depth board + a compact registration/compliance summary**, plus the formation
  selector and leave/re-deploy controls. Nationality is *kept but repurposed* into compliance.
- **News and loans are out of v1.** News becomes a later per-player aggregator (rumors,
  trades) — see [backlog](../backlog.md). Out-on-loan players (returning depth) are deferred,
  not core.
- A player now has three planning-relevant facets: depth role (rating/age), **position
  eligibility** (0007), and **registration category** (here). The data interface (0003) grows
  to include registration.
- Multi-competition quota rule sets (league vs Champions League) are a known later
  refinement; v1 ships one rule set.
