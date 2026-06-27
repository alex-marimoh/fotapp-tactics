# ADR 0013 — Stack standards: plain JS + inline styles (formalized)

- Status: accepted
- Date: 2026-06-27
- Decides: [#9](https://github.com/alex-marimoh/fotapp-tactics/issues/9)
- Depends on: [0001](0001-repo-is-an-mvp-demo.md), [0012](0012-design-direction-field-hero.md)

## Context

Cursor rules and some contributor guidance call for **TypeScript strict mode** and **Tailwind
utility classes**. The running app is ~3k lines of **plain `.jsx`** with **inline-style
objects** on nearly every element and a hand-rolled **skin/theme object** (`DEFAULT_SKIN`,
passed as `T`) threaded through props. Vitest and ESLint are configured for JavaScript.

Agents and slices were blocked on an undecided stack (#9) while a11y work (#14) needed a
styling approach for `:focus-visible` and other pseudo-classes inline styles cannot express.

## Decision

### TypeScript — keep plain JS; optional incremental typing later

**Stay on JavaScript/JSX for this repo.** Do not rename files or enable a strict TS compiler
pass as a standalone migration.

- New and edited modules remain `.js` / `.jsx`.
- Use **JSDoc** (`@param`, `@returns`, `@typedef`) on public functions and data seams where
  types add clarity — especially `squad-data.js`, backends, and store.
- **Revisit TypeScript** when the repo crosses a complexity threshold (e.g. production voting
  schema lands, or shared types between client and Supabase RPCs become painful). If adopted
  then, migrate **incrementally**: new boundary modules as `.ts` first, `allowJs`, no big-bang
  rename.

### Styling — inline styles + skin object; small CSS for what inline cannot do

**Keep inline styles and the `T` skin object** as the primary styling system. This matches
every screen today and the [design-spec](../design-spec.md) token model.

**Do not adopt Tailwind** for this repo. A utility-class migration would fight the existing
theme prop pattern and offer little payoff at current size.

**Supplement with standalone `.css` files** only where inline styles are technically
impossible or awkward:

- Global `:focus-visible` rings and other pseudo-classes (#14)
- `@media` queries if a component truly needs them (prefer `useViewport` hooks where inline
  suffices)
- Keyframe animations already in `index.css`

New UI should continue to use `primaryBtn` / `ghostBtn` / `field` from `src/ui/styles.js` and
tokens from `DEFAULT_SKIN`, not ad-hoc hex values.

## Consequences

- Slices and agents **must not** migrate to TypeScript or Tailwind unless a future ADR
  supersedes this one.
- A11y work (#14) proceeds with a **small CSS file** — not blocked on Tailwind.
- Stale "must use TS/Tailwind" guidance in tooling rules should be treated as **aspirational /
  default for greenfield work**, not binding on this MVP codebase.
- `docs/README.md` and contributor-facing docs reflect this ADR as the source of truth.

## Alternatives considered

| Option | Why not now |
|--------|-------------|
| Strict TS everywhere | High churn, low demo value; store/board already stable in JS |
| Tailwind incremental | Duplicates skin tokens; every component already speaks `T` |
| Tailwind full migration | Multi-week rewrite with no user-visible benefit for MVP |
| CSS Modules everywhere | Same pseudo-class problem; adds build complexity without replacing `T` |
