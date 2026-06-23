# fotapp-tactics — design docs

Produced during a grilling session (2026-06-23) to pin down the repo's purpose and design.
Start with the [glossary](glossary.md), then the ADRs in order.

## What this is

A **desktop MVP demo** of a **squad-depth & gap-planning sandbox** for football fans, who act
as a **sporting director** (not a match-day manager). Pick your formation as a lens; see your
squad's depth per position; run what-ifs — mark a player leaving, re-deploy others to cover —
and watch each position's **depth health** (Solid / Thin / Gap) and **registration compliance**
(non-EU / homegrown quotas) react live.

## Architecture Decision Records

| # | Decision |
|---|----------|
| [0001](adr/0001-repo-is-an-mvp-demo.md) | This repo is an MVP demo, not production |
| [0002](adr/0002-audience-armchair-manager-sandbox.md) | Audience: casual fans, fun > rigor |
| [0003](adr/0003-data-hardcoded-now-real-later.md) | Data hardcoded now, real later → keep a data seam |
| [0004](adr/0004-design-direction-rejected-three-pane.md) | Reject the 3-pane dashboard; aim for a polished consumer app |
| [0005](adr/0005-form-factor.md) | Form factor: desktop only |
| [0006](adr/0006-concept-squad-depth-planning.md) | Concept: squad-depth & gap planning (director's lens) |
| [0007](adr/0007-domain-model-positions-and-depth.md) | Domain model: position eligibility, slots, depth |
| [0008](adr/0008-depth-signal-three-state-health.md) | Feedback: three-state slot health |
| [0009](adr/0009-registration-quota-compliance.md) | Registration & quota compliance is first-class |
| [0010](adr/0010-persistence-ephemeral-v1.md) | Persistence: ephemeral for v1 |
| [0011](adr/0011-clean-slate-from-telemetry-engine.md) | Clean slate: rebuild from variant C's engine |
| [0012](adr/0012-design-direction-field-hero.md) | Chosen look: Field hero (pitch \| info split) |

## Deferred

See [backlog.md](backlog.md) for explicitly post-v1 ideas (news aggregator, real data, club
picker, add-signing/age-forward what-ifs, multi-competition quotas, mobile, persistence).

## Where the code lives

- `src/squad-data.js` — data + domain model seam (roster, slots, depth, health, compliance).
- `src/board.jsx` — the Field hero board (`TacticsBoard`), the whole UI.
- `src/App.jsx` → renders `TacticsBoard`.

## Open follow-ups (iteration on the real board)

- The info panel (right half) is a `PLACEHOLDER` — decide its real first content.
- Pitch vs info split ratio is even (50/50) — may want pitch wider.
- Formation selector and re-deploy are still stubs.
