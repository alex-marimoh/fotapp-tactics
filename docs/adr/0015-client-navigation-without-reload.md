# ADR 0015 — Client navigation without full page reload

- Status: accepted
- Date: 2026-06-27
- Decides: [#8](https://github.com/alex-marimoh/fotapp-tactics/issues/8) (router approach)
- Depends on: [0013](0013-stack-standards-js-and-inline-styles.md), Supabase store boot

## Context

Navigation today assigns `window.location.search`, causing a **full document reload** on every
team switch, admin entry, quiz entry, and back navigation. In Supabase mode that re-runs the
entire boot chain (`ensureSession` → profile → teams/players → user data) and shows a blank
loading screen — poor UX and wasted work.

Issue #8 requires client-side routing but flagged the **router library choice** as HITL.

## Decision

Use a **tiny in-app URL router** — no `react-router` (or similar) dependency.

### Mechanism

- A `useAppRoute()` hook (or equivalent module) owns route state derived from
  `URLSearchParams` on `window.location.search`.
- Navigation calls `history.pushState` / `history.replaceState` to update query params, then
  updates React state so `App` re-renders **without** reload.
- Listen to `popstate` for browser back/forward.
- **Preserve the existing URL contract:**
  - Board: `?team=<slug>` (default team if omitted)
  - Admin: `?admin=<slug>`
  - Quiz: `?quiz=squad&team=<slug>`

### Boot once

- `Root.jsx` / store `init()` runs **once per session** (already mounted at app shell).
- Route changes only swap screen components (`TacticsBoard`, `AdminPage`, `QuizFlow`); they
  read from the already-hydrated store.

### Why not react-router

- Only **three screens** and query-param routing — a library adds bundle size and API surface
  disproportionate to need.
- Current URLs are query-based, not path-segment-based; RR would either fight that or force a
  URL migration.
- If the product later adds many nested routes (voting, profiles, league browser), **revisit**
  and migrate to `react-router` with a deliberate path-based URL scheme.

## Consequences

- #8 implementation slice: add `src/navigation/` (or `src/hooks/useAppRoute.js`), replace
  all `window.location.search = …` assignments with `navigate({ … })`.
- Deep links and shareable URLs unchanged.
- Back/forward must be tested across board ↔ admin ↔ quiz.
- `QuizFlow` / prototype `goBoard` helpers use the same navigate API.

## Alternatives considered

| Option | Why not |
|--------|---------|
| react-router v7 | Overkill for 3 query-param screens; path-based routes differ from today |
| Hash routing | Worse shareable URLs; not needed for static Vite deploy |
| Keep full reloads | Unacceptable in Supabase mode post–user management |
