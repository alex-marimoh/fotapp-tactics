# Design — User management, persistence, multi-team & admin

- Status: **draft / plan** (will split into ADRs as pieces land)
- Date: 2026-06-27
- Supersedes the "ephemeral is fine" stance of [ADR 0010](adr/0010-persistence-ephemeral-v1.md)
  for the next phase; builds on the data seam of [ADR 0003](adr/0003-data-hardcoded-now-real-later.md),
  the domain model of [0007](adr/0007-domain-model-positions-and-depth.md), and the
  registration rules of [0009](adr/0009-registration-quota-compliance.md).

## What this phase adds

The MVP today is **one hardcoded team, no accounts, in-memory only**. This phase grows it into:

1. **Multiple teams** — **all Greek Super League** clubs, selectable on the board (home) and in the
   quiz. Rosters are **auto-generated** (generated names + synthesized stats), not scraped.
2. **An admin / power-user tool** — a per-team management page to add/edit/remove players and set
   their details (contract end, wage, market value, transfer fee, EU/non-EU registration, rating,
   positions).
3. **User accounts** — Supabase Auth (anonymous-first, upgradeable).
4. **Persistence** — each user's saved tactics (board scenarios) and quiz results, saved and
   re-displayed across sessions and devices; **and the rosters themselves**, since admins edit them.

### Decisions locked with the author (2026-06-27)

- **Backend:** Supabase (accounts + DB). **The Supabase project link is pending** — the author will
  provide it later, so everything is built behind a swappable data seam that runs on a local backend
  until the keys exist (see §7).
- **League:** Greek Super League, **all teams**.
- **Rosters:** **generated**, not scraped — synthesize plausible names + stats per team.
- **Admin:** build a per-team admin page for manual roster management.
- **Crowd votes:** **deferred** to a later phase. The quiz keeps its deterministic `crowdKeepPct`
  stub for now.

---

## 1. Rosters: generated, then editable (not scraped)

Instead of scraping, a **generator** produces a full, plausible squad for every Greek SL club:

- **Names** — drawn from a Greek-name pool plus a foreign pool (so nationality mix is realistic).
- **Nationality → registration category** — each generated player gets a nationality, and `reg`
  (`home` / `eu` / `noneu`) is **derived** from it via an EU-membership map + a "homegrown/Greek"
  rule. This keeps the compliance feature (ADR 0009) meaningful per team.
- **Per-squad nationality mix (locked):** **5–15 EU**, **3–7 non-EU**, **the rest Greek** (home),
  chosen per team from the seeded RNG, with home clamped to ≥3 so the homegrown minimum stays
  satisfiable.
- **Squad shape** — enough players per position to fill the ten formations with real depth
  (≈22–26 per club), mirroring how the current single team is built.
- **Stats** — `rating`, `age`, and the finance fields (`wage`, `market_value`, `transfer_fee`,
  `contract_end`) are synthesized from rating/age, the same approach the quiz's `data.js` already
  uses. Invented, but internally consistent.

The generator is **deterministic per team** (seeded by slug) so a club looks the same every run until
an admin edits it. It serves two roles: the **seed** that populates the database, and the **offline
fallback** before Supabase is connected.

> This changes the earlier "keep rosters in code" stance: because admins **edit** rosters, players are
> editable persisted records, not constants. The generator is the *source of the seed*, the database
> is the *source of truth* once seeded.

## 2. Data seam: one team → many (board/quiz logic unchanged)

`squad-data.js` currently exports module-level constants (`ROSTER`, `FORMATIONS`, `LIMITS`) imported
directly by `board.jsx` and the quiz. We generalize **without changing the player / slot / depth
shapes**, so all existing logic (`buildDepth`, `healthOf`, `complianceOf`, `tierFor`, the board, the
quiz) is untouched.

```
Team = { slug, name, short, league, colors, roster: Player[] }
Player = {                       // existing shape + first-class finance fields
  num, name, age, nat, reg,      // reg derived from nat
  rating, pos[], pos2[],
  wage, marketValue, transferFee, contractEnd, onLoan?
}
```

- `FORMATIONS`, `POSITION_TYPES`, `tierFor`, `buildDepth`, `healthOf`, `complianceOf` stay shared and
  team-agnostic.
- **`LIMITS` moves to the league** (all Greek SL teams share one rule set):
  `complianceOf(roster, leaving, rules)` takes the rule set as a parameter.
- Finance fields (`wage`, `marketValue`, `transferFee`, `contractEnd`) become **first-class on the
  player** rather than derived in the quiz's `data.js`, because the admin page edits them directly.
  The quiz's derivation functions become the *generator defaults*.
- The data layer (`store.js`, §7) exposes `getTeams()`, `getTeam(slug)`, `getLeagueRules(league)`.

## 3. Routing / navigation

Still query-param based (no router library):

- Board (home): `?team=<slug>` — defaults to a chooser or a default club.
- Quiz: `?quiz=squad&team=<slug>`.
- Admin: `?admin=<slug>` (team management page), gated by role (§5).
- A **team picker** on the home page (the backlog's "club picker").

## 4. The admin / power-user page

A per-team management screen (`?admin=<slug>`) for users with admin / power-user rights:

- **Roster table** with add / edit / remove player.
- **Editable fields per player:** name, positions (`pos` / `pos2`), age, nationality (and the derived
  `reg`, with a manual override), rating, **wage**, **market value**, **transfer fee**, **contract
  end year**, on-loan flag.
- **Validation:** position values restricted to `POSITION_TYPES`; numbers bounded; squad-number
  uniqueness within a team.
- **Save model:** edits write through the data seam (§7) — to the local backend now, to Supabase once
  connected. Optimistic UI with a saved indicator.
- A "regenerate squad" action (re-seed a team from the generator) for quick resets during the demo.

This is the manual-curation path that makes generated data accurate over time without scraping.

## 5. Auth, roles & identity (Supabase)

**Anonymous-first, upgrade later.** First visit silently creates a Supabase anonymous session, so
board edits and quiz results already save against a real `user_id`. Upgrading to email magic-link
(and/or Google OAuth) keeps the same `user_id`, so nothing is lost.

**Roles.**
- A global `is_admin` flag on the profile (full access to every team's admin page).
- A `team_admins(user_id, team_slug)` grant table for **per-team power users** (manage one club).
- Everyone else is a normal user: read rosters, build boards, take quizzes — no roster editing.

## 6. Data model (Postgres / Supabase)

```
profiles
  id           uuid pk references auth.users(id)
  display_name text
  is_admin     boolean not null default false
  created_at   timestamptz default now()

teams
  slug         text pk
  name         text not null
  short        text
  league       text not null default 'greek-super-league'
  colors       jsonb
  created_at   timestamptz default now()

players                                  -- editable roster (admin CRUD target)
  id           uuid pk default gen_random_uuid()
  team_slug    text not null references teams(slug) on delete cascade
  num          int  not null
  name         text not null
  age          int
  nat          text
  reg          text not null             -- 'home' | 'eu' | 'noneu' (derived, overridable)
  rating       int
  pos          text[] not null
  pos2         text[] not null default '{}'
  wage         numeric                   -- € k / week
  market_value numeric                   -- € millions
  transfer_fee numeric                   -- € millions (asking price)
  contract_end int                       -- season year
  on_loan      boolean not null default false
  updated_at   timestamptz default now()
  unique (team_slug, num)

team_admins                              -- per-team power users
  user_id      uuid references auth.users(id)
  team_slug    text references teams(slug) on delete cascade
  primary key (user_id, team_slug)

board_scenarios                          -- saved tactics, autosaved per user+team
  id           uuid pk default gen_random_uuid()
  user_id      uuid not null references auth.users(id)
  team_slug    text not null
  name         text not null default 'current'
  state        jsonb not null            -- { formation, depthMap, leaving[], added[] }
  updated_at   timestamptz default now()
  unique (user_id, team_slug, name)

quiz_results                             -- kept as history
  id           uuid pk default gen_random_uuid()
  user_id      uuid not null references auth.users(id)
  team_slug    text not null
  decisions    jsonb not null            -- { [num]: { verdict, price } }
  summary      jsonb not null
  archetype    text
  created_at   timestamptz default now()
```

**RLS (row-level security):**
- `teams`, `players`: **public read**; **write** only by `is_admin` users or a matching
  `team_admins` row.
- `board_scenarios`, `quiz_results`: read/write only where `user_id = auth.uid()`.
- `profiles`: a user reads/writes their own row; `is_admin` is not self-settable (set by a trusted
  path / SQL).

**Crowd votes:** deferred. When it lands, it derives keep/sell rates from `quiz_results.decisions`
via an anonymized aggregate view/RPC.

## 7. Client integration — the swappable seam (so the Supabase link can come later)

A single data module with two interchangeable backends so we **build the whole app now and flip the
backend later**:

- `src/data/generator.js` — deterministic roster generator (names, nationalities → `reg`, stats).
- `src/data/store.js` — the interface every screen uses:
  - `getTeams()`, `getTeam(slug)`, `getLeagueRules(league)`
  - `upsertPlayer(slug, player)`, `deletePlayer(slug, id)`, `regenerateTeam(slug)`  (admin)
  - `loadScenario(slug)`, `saveScenario(slug, state)`  (board autosave, debounced)
  - `saveQuizResult(slug, result)`, `listQuizResults(slug)`
  - `currentUser()`, `signInAnonymously()`, `upgradeAccount(...)`, `isAdminFor(slug)`
- **Backends:**
  - `localBackend` — in-memory + `localStorage`, seeded from the generator. **Default until Supabase
    keys exist.** Lets board, quiz, and the admin page all work and persist per-device today.
  - `supabaseBackend` — `@supabase/supabase-js` against the tables in §6, selected when
    `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are present (gitignored `.env`).
- Screens never import a backend directly — only `store.js`. Flipping to Supabase is a one-file
  change plus running the migration + seed.

---

## 8. Implementation plan (sequenced)

Each phase is shippable on its own; only Phase 4 needs the Supabase link.

- **Phase 0 — Multi-team seam + generator. ✅ done.** Generalize `squad-data.js`; build the roster
  generator for all Greek SL clubs; move `LIMITS` to the league; add finance fields to the player.
  Board + quiz read `getTeam(slug)`; add the team picker and `?team=` routing. *No backend.*
- **Phase 1 — Persistence seam (local backend). ✅ done.** `src/data/store.js` over `localStorage`.
  Board autosaves its scenario (`saveScenario`/`loadScenario`, debounced) with a Reset control; the
  quiz saves each result and shows the last one on its intro (`saveQuizResult`/`listQuizResults`).
  Reads stay synchronous so Supabase can hydrate-then-serve later without rewiring screens.
- **Phase 2 — Admin page. ✅ done.** `?admin=<slug>` roster management — add/edit/remove players with
  contract, wage, market value, transfer fee, nationality→registration (overridable), rating and
  positions, plus regenerate-from-seed. Writes overlay the generated roster through `store.js`;
  `isAdminFor` returns true on the local backend (real gating arrives with Phase 3).
- **Phase 3 — Supabase wiring (needs the link).** Add `supabaseBackend`, auth (anonymous-first +
  upgrade), migrations for §6, RLS, roles; run the generator once as the seed. Flip the store backend
  via env. No screen changes.
- **Phase 4 — Crowd votes (deferred).** Aggregate `quiz_results` into real keep/sell rates; replace
  the `crowdKeepPct` stub behind the same call.

## 9. Remaining open questions (small)

1. **Admin access in the live build before roles exist** — for Phase 0–2 the local backend treats the
   current device user as an admin so the page is usable. Confirm that's fine for the demo (real
   gating arrives with Supabase in Phase 3).
2. **Nationality realism** — how much do you care that generated nationalities/league quotas look
   right vs. just plausible? Affects how rich the name/nationality pools need to be.
3. **Squad size per club** — fixed (~24) or varied per team? Default: ~24 with small variation.
4. **Team list** — auto-generate names for clubs too, or use the real ~14 Greek SL club names
   (Olympiacos, Panathinaikos, AEK, PAOK, …) with generated *players*? Real club names read better;
   recommend real club names + generated rosters.
