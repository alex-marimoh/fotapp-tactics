# ADR 0016 — Production DB schema & voting engine (v1 direction)

- Status: accepted
- Date: 2026-06-27
- Decides: [#2](https://github.com/alex-marimoh/fotapp-tactics/issues/2)
- Depends on: [0003](0003-data-hardcoded-now-real-later.md), [0001](0001-repo-is-an-mvp-demo.md)

## Context

Issue #2 captured a **suggested** production Postgres schema for the crowdsourced football DB:
delta voting with a moving 1–20 baseline, time-locked rating windows, squad-plan persistence,
and fan-vs-neutral sentiment analytics. The issue explicitly required maintainer sign-off before
any migrations.

The current Vite MVP uses Supabase for user management and rosters (Phase 3). The ratings engine
and reference football world are **not** implemented yet.

## Decision

**Accept the issue #2 design as the v1 direction.** Implementation is deferred to future
vertical slices (migrations + RPCs + UI), not a single big-bang. The issue body remains the
detailed reference; this ADR records sign-off on the open checklist.

### Review checklist — resolved

| Item | Decision |
|------|----------|
| Baseline move rule | **±1 per window** with threshold on net ratio `(up−down)/T`; magnitude does **not** scale with consensus strength |
| Tunables (initial) | `min_sample=50`, `move_threshold=0.15`, `scout_min_sample=30`, `max_step=1` — tune after traffic data |
| Raw vote visibility | **Private** — users see own votes only; prevents coordination |
| 1–20 ↔ stars | `overall = round(avg(attribute values))`; display stars `= ceil(overall / 4)` (1–5) |
| Finance fields v1 | **Seeded columns** on `players` (`market_value`, `wage`, `contract_end`) — same field names as demo seam |
| Window cadence | **2 windows/year**, **2 weeks** each; state machine via **`pg_cron`** in Postgres (not Edge Function scheduler) |
| Key strategy | **`uuid`** primary keys throughout (Supabase convention) |
| Scope | **v1:** schema in issue #2 body; **deferred:** news aggregator, stints, per-competition quota rules as data, notifications, reputation-weighted votes |
| Attribute catalog | Seed a **core FM-style set** (~12 attrs: pace, acceleration, stamina, strength, finishing, passing, vision, dribbling, tackling, positioning, composure, work rate) — expand in a follow-up migration if needed |

### Unchanged from #2 proposal

- Table groups A–D, RLS model, RPC split (`cast_vote` invoker vs `apply_rating_window` definer),
  anti-brigade `UNIQUE(user_id, window_id, player_id, attribute_id)`, `player_sentiment`
  materialized view, depth/compliance stay app-side per ADR 0003.

## Consequences

- #2 is **approved for planning**; no agent should write production ratings migrations until
  broken into `/to-issues` slices with explicit dependencies on roster/auth schema.
- First implementation slice likely: reference tables + seed + read path before voting UI.
- Tunables are **initial guesses** — revisit after first real voting window.

## Alternatives rejected

- **Public raw votes** — rejected (coordination risk)
- **Scaling delta magnitude with vote strength** — rejected (brigade-friendly)
- **bigint reference keys** — rejected (inconsistent with existing Supabase migrations)
