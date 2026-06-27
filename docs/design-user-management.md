# Design — User management, persistence & multi-team

- Status: **draft for review** (will split into ADRs once decisions settle)
- Date: 2026-06-27
- Supersedes the "ephemeral is fine" stance of [ADR 0010](adr/0010-persistence-ephemeral-v1.md)
  for the next phase; builds on the data seam of [ADR 0003](adr/0003-data-hardcoded-now-real-later.md),
  the domain model of [0007](adr/0007-domain-model-positions-and-depth.md), and the
  registration rules of [0009](adr/0009-registration-quota-compliance.md).

## What this phase adds

The MVP today is **one hardcoded team, no accounts, in-memory only**. This phase grows it into:

1. **Multiple teams** — Greek Super League clubs — selectable on the board (home) and in the quiz.
2. **User accounts** — Supabase Auth.
3. **Persistence** — each user's saved tactics (board scenarios) and quiz results, saved and
   re-displayed across sessions and devices.
4. **Real crowd votes** — the quiz's "% of fans would keep/sell" stops being a stub and becomes
   an aggregate of real user decisions.

Decisions locked with the author: **Supabase** (accounts + DB), **Greek Super League** for rosters.

---

## 1. Data seam: one team → many (no change to board/quiz logic)

`squad-data.js` currently exports module-level constants (`ROSTER`, `FORMATIONS`, `LIMITS`) that
`board.jsx` and the quiz import directly. We generalize the seam **without changing the player /
slot / depth shapes**, so all the existing logic (`buildDepth`, `healthOf`, `complianceOf`,
`tierFor`, the whole board and quiz) is untouched.

Introduce a `Team` record:

```
Team = {
  slug,        // stable id, e.g. 'olympiacos'
  name,        // 'Olympiacos FC'
  short,       // 'OLY'
  league,      // 'greek-super-league'
  colors,      // { primary, secondary } for kit/skin accents
  roster,      // Player[]  — the existing player shape, unchanged
}
```

- `FORMATIONS`, `POSITION_TYPES`, `tierFor`, `buildDepth`, `healthOf`, `complianceOf` stay shared
  and team-agnostic.
- **`LIMITS` moves to the league**, not the module. All Greek SL teams share one rule set, so the
  rules live on the league and `complianceOf(roster, leaving, rules)` takes the rule set as a
  parameter instead of importing the global `LIMITS`. (This is also the seam the backlogged
  "multi-competition quota rule sets" plugs into later.)
- New accessors — **the one place real data enters** (the ADR 0003 seam):
  - `getTeams()` → lightweight list (slug, name, short, colors) for pickers.
  - `getTeam(slug)` → full `Team` with roster.
  - `getLeagueRules(league)` → the registration rule set.

Hardcoded Greek SL teams now → scraped dataset later → live API even later, all behind the same
interface. Board and quiz call `getTeam(slug)` and otherwise don't change.

## 2. Routing / team selection

Routing today is a single `?quiz=squad` query param. We extend it minimally (still query-param
based, no router library):

- Board (home): `?team=<slug>` — defaults to a chooser or a default club.
- Quiz: `?quiz=squad&team=<slug>`.
- A **team picker** on the home page (the "club picker" deferred in the backlog). The quiz inherits
  the selected team or offers its own picker.

## 3. Auth & user identity (Supabase)

**Anonymous-first, upgrade later.** Keep the friction-free MVP feel: on first visit the user gets a
Supabase **anonymous session** automatically, so their board edits and quiz results are already being
saved against a real `user_id`. When they want cross-device sync / a name on the leaderboard, they
**upgrade the anonymous user** to email magic-link (and/or Google OAuth) — Supabase carries the same
`user_id` and all their data comes with them. No "lost my work because I didn't sign up" moment.

## 4. What we persist

Keep **team/roster reference data in code** (the data seam), and put only **user-generated data** in
Postgres, keyed by `team_slug` (a string reference into the seam). Rationale: rosters will churn as
we scrape/refine them; we don't want a migration every time. If we later want server-authoritative
rosters, the seam can read from `teams`/`players` tables behind the *same* `getTeam()` interface.

### Board scenarios (the saved tactics)
Per `(user, team)`, the what-if state — this is the "scenario state shape" ADR 0010 anticipated:

```
state = {
  formation,                 // e.g. '4-3-3'
  depthMap,                  // { [formation]: { [slotId]: { starter, backups } } }
  leaving:  [num, ...],      // players marked as leaving
  added:    [Player, ...],   // hypothetical signings/youth (when that feature lands)
}
```

v1: **one autosaved "current" scenario per (user, team)** (debounced autosave). Named/multiple saved
scenarios stay backlogged, but the schema (a `name` column) already allows them.

### Quiz results
Per `(user, team, attempt)`, kept as **history** so we can re-display past runs:

```
{ decisions: { [num]: { verdict, price } }, summary, archetype, created_at }
```

### Crowd votes (the real payoff)
The quiz screen already promises "this is where real fan votes plug in." Every saved quiz decision is
a vote. We aggregate real keep/sell rates per `(team, player)` and feed them back into the result
screen, replacing the deterministic `crowdKeepPct` stub (which stays as the fallback when a player has
too few votes).

## 5. Data model (Postgres / Supabase)

```
profiles
  id            uuid pk references auth.users(id)
  display_name  text
  created_at    timestamptz default now()

board_scenarios
  id            uuid pk default gen_random_uuid()
  user_id       uuid not null references auth.users(id)
  team_slug     text not null
  name          text not null default 'current'
  state         jsonb not null
  updated_at    timestamptz default now()
  unique (user_id, team_slug, name)          -- the autosave "current" row upserts here

quiz_results
  id            uuid pk default gen_random_uuid()
  user_id       uuid not null references auth.users(id)
  team_slug     text not null
  decisions     jsonb not null
  summary       jsonb not null
  archetype     text
  created_at    timestamptz default now()
```

**Crowd aggregation:** start with a view derived from `quiz_results.decisions`
(`player_keep_rates(team_slug, player_num, keep_pct, n)`); normalize into a `quiz_votes` table only
if aggregation gets slow.

**RLS (row-level security):**
- `board_scenarios` / `quiz_results`: a user can read/write **only their own rows**
  (`user_id = auth.uid()`).
- Crowd aggregates are exposed via a `security definer` view / RPC that returns **only anonymized
  counts** — never another user's individual decisions.

## 6. Client integration

- `src/supabaseClient.js` — Supabase client from `import.meta.env.VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` (in a gitignored `.env`).
- `src/store.js` — the persistence module, the single seam for saved data:
  - `loadScenario(teamSlug)` / `saveScenario(teamSlug, state)` (debounced) — board autosave.
  - `saveQuizResult(teamSlug, result)` / `listQuizResults(teamSlug)`.
  - `crowdKeepPct(teamSlug, num)` — now real, falls back to the deterministic stub below a vote
    threshold.
- Wiring: `board.jsx` autosaves on state change and loads on mount; the quiz saves on finish and
  reads real crowd numbers on the result screen.

Per ADR 0010 this stays "a clean addition behind the same scenario state shape" — the in-memory board
keeps working; persistence is layered on, not woven through.

---

## Open questions / gaps to resolve before building

1. **Greek SL roster sourcing.** Scraping real rosters is brittle, and the registration category
   (`home` / `eu` / `noneu`) must be **derived from nationality** — we need a nationality→category
   map (EU membership list + a "homegrown" definition for Greece). Proposal: scrape only
   **name / nationality / age / position** and **synthesize rating & market value** (exactly as the
   current single team does). Accept that ratings are invented for the demo.
2. **How many teams to start.** All ~14 Super League clubs, or begin with the big four
   (Olympiacos, Panathinaikos, AEK, PAOK) and expand? Recommend **~4–6 first**, then widen — proves
   multi-team without a large data job up front.
3. **Crowd votes now or later.** Ship real aggregation in this phase, or persist user data first and
   keep the crowd stub one more iteration? Real crowd adds an RLS-safe aggregate view/RPC and an
   anon-read path.
4. **Auth UX.** Confirm **anonymous-first → upgrade** (recommended) vs. forcing login up front.
5. **Supabase provisioning.** Need a project + anon key in `.env`. Decide: create a fresh project via
   the Supabase tooling, or point at an existing one. (Listing was declined in this session, so this
   is an explicit setup step, not assumed.)
6. **Scenario vs. season.** Board scenarios are per-team "current" autosave for v1; named/multiple
   scenarios and the "age forward a season" what-if remain backlogged but the schema leaves room.
```
