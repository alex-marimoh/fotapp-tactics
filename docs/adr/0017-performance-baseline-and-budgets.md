# ADR 0017 — Performance baseline & budgets (tactics board)

- Status: accepted
- Date: 2026-06-28
- Decides: [#38](https://github.com/alex-marimoh/fotapp-tactics/issues/38)
- Depends on: [0013](0013-stack-standards-js-and-inline-styles.md), perf slices #33–#37

## Context

Issue #38 asked for interaction-performance baselines and ratified budgets before further perf
work. We had build-size numbers (~127 KB gzip first paint in Supabase mode) but no documented
interaction targets or enforcement strategy.

Recent slices (#33 lazy rosters, #34 imperative resize, #35 panel memoization, #37 shared
viewport listener) improved boot and render cost; this ADR locks thresholds and how we measure.

## Decision

### Tooling

| Metric | Tool | CI |
|--------|------|-----|
| Board-route initial JS (gzip) | `npm run build` + `scripts/check-bundle-budget.mjs` | **Yes** |
| Formation switch commit time | React DevTools Profiler (manual) | No |
| Info-panel resize mid-drag commits | React DevTools Profiler (manual) | No |
| Boot-to-interactive (Supabase) | Lighthouse on preview deploy (manual, quarterly) | No |

Profiler and Lighthouse stay in the maintainer/PR checklist for perf-touching changes; only
bundle size is automated — interaction timing is too environment-sensitive for CI in this MVP.

### Budgets (ratified)

| Metric | Budget | Notes |
|--------|--------|-------|
| Board-route initial JS | **< 150 KB gzip** | Sum of non-lazy JS chunks (see `docs/perf-budgets.md`) |
| Formation switch | **< 16 ms** (~1 frame) | Profiler: record commit duration switching 4-3-3 ↔ 4-4-2 |
| Info-panel resize drag | **60 fps feel; 0 full-board commits mid-drag** | Achieved post-#34; regressions fail review |
| Boot-to-interactive (Supabase, 4G) | **< 2 s** | Lighthouse TTI on preview; advisory until we add synthetic CI |

### Where budgets live

- **Operational doc:** [docs/perf-budgets.md](../perf-budgets.md) — baselines, repro steps, update cadence.
- **Enforcement:** `scripts/check-bundle-budget.mjs` run in GitHub Actions on every PR; fails if board-route JS exceeds 150 KB gzip.

### Baseline snapshot (2026-06-28, post #33–#37)

Captured by `npm run check:budget` after merge of perf slices — **129.29 KB gzip** board-route JS (budget 150 KB).

## Consequences

- Perf PRs that grow board-entry JS must stay under 150 KB or justify an ADR budget change.
- Interaction regressions rely on Profiler evidence in PR descriptions (same pattern as #34/#35).
- Lighthouse TTI is tracked manually; promote to CI only if we add a stable preview + throttling job.
