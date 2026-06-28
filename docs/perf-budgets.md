# Performance budgets — tactics board

Ratified in [ADR 0017](adr/0017-performance-baseline-and-budgets.md). Update this doc when
re-baselining after major perf work.

## Budgets

| Metric | Budget | Enforced in CI |
|--------|--------|----------------|
| Board-route initial JS (gzip) | < 150 KB | Yes (`npm run check:budget`) |
| Formation switch commit | < 16 ms | No — manual Profiler |
| Info-panel resize (mid-drag) | 0 `TacticsBoard` commits | No — manual Profiler |
| Boot-to-interactive (Supabase, 4G) | < 2 s | No — manual Lighthouse |

## Board-route JS (automated)

**Definition:** all `dist/assets/*.js` gzip sizes **except** lazy route chunks (`AdminPage*`,
`QuizFlow*`). Matches what loads on the default board URL with no `?admin` or `?quiz`.

**Command:**

```bash
npm run check:budget
```

Re-run after perf changes; CI runs the same script on every PR.

## Baseline snapshot — 2026-06-28

Post-merge of perf slices #33–#37. Run `npm run check:budget` locally for current numbers.

| Capture | Baseline | Method |
|---------|----------|--------|
| Board-route initial JS | **129.29 KB gzip** (150 KB budget) | `npm run check:budget` — 2026-06-28 |
| Formation switch | Not yet numerically captured | Profiler: select alternate formation, note commit time for `TacticsBoard` / `PitchPanel` |
| Info-panel resize drag | **0 commits mid-drag** on `TacticsBoard` | Verified in #34 PR; re-check if resize code changes |
| Boot-to-interactive | Not yet numerically captured | Lighthouse → Performance → TTI on Vercel preview, throttled 4G |

## Manual measurement procedures

### Formation switch (< 16 ms)

1. Open board route on a Vercel preview or `npm run dev`.
2. React DevTools → Profiler → record.
3. Switch formation (e.g. 4-3-3 → 4-4-2).
4. Stop recording; note **commit duration** for the board subtree. Target < 16 ms.

### Info-panel resize (60 fps / no mid-drag commits)

1. Profiler → record.
2. Drag the info-panel divider for ~2 s.
3. Stop; confirm **no** `TacticsBoard` commits during drag (only pointer handlers / CSS var updates).
4. One commit on pointer-up is expected.

### Boot-to-interactive (< 2 s, Supabase)

1. Lighthouse on preview URL with Supabase env configured.
2. Mobile preset, simulated 4G.
3. Record **Time to Interactive**. Target < 2 s (advisory until automated).

## PR checklist (perf-touching changes)

- [ ] `npm run check:budget` passes
- [ ] If board structure or hot paths changed: Profiler notes in PR (formation and/or resize)
- [ ] If boot path changed: note Lighthouse TTI if measured
