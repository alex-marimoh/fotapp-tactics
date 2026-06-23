# Backlog — explicitly deferred (post-demo / v2+)

Ideas raised during grilling that are **out of scope for the v1 demo** but worth keeping.
Each links the ADR where it was set aside.

- **Per-player news / rumor aggregator** — click a player, see news, transfer/trade rumors.
  A "come back to check on it" hook. Deferred from [0009](adr/0009-registration-quota-compliance.md).
- **Real & accurate squad data** — live rosters for many real clubs via API/dataset; the
  "see *my* team" hook at full strength. Door kept open by [0003](adr/0003-data-hardcoded-now-real-later.md).
- **Club picker** — choose from several real clubs at start. Considered, set aside in 0003.
- **"Add signing / youth prospect" what-if** — fill a gap by bringing someone in (not just
  re-deploying). Considered for the core loop, not chosen for the demo
  ([0006](adr/0006-concept-squad-depth-planning.md)).
- **"Age forward a season" what-if** — advance everyone +1 year, youth develop, veterans
  decline; the full next-season payoff. Deferred from 0006.
- **Age in the depth-health formula** — a slot covered only by veterans reads as a future
  gap. Out of the v1 signal to keep it legible ([0008](adr/0008-depth-signal-three-state-health.md)).
- **Multi-competition quota rule sets** — league vs Champions League registration rules.
  v1 ships one rule set ([0009](adr/0009-registration-quota-compliance.md)).
- **Mobile / responsive / installable** — v1 is desktop-only
  ([0005](adr/0005-form-factor.md)).
- **Out-on-loan / returning players** — relevant to future depth, deferred from v1 (0009).
