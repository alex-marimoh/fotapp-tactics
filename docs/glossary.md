# Glossary

Shared vocabulary for `fotapp-tactics`. Domain terms (the football/product language) and
design terms (the [codebase-design](https://) deep-module vocabulary) live together so we
name things the same way in code, ADRs, and conversation.

## Domain terms

**Board** — a full-screen Tactics view: top bar + left rail (demographics, loans) + pitch +
right rail (news/roster) + depth-chart modal. The product's main screen.

**Board variant** — one visual treatment of the Board over the *same* data. Three exist:
_floodlight_ (dark), _chalkboard_, _telemetry_ (light, responsive, interactive). Only
_telemetry_ ships ([App.jsx](../src/App.jsx)).

**Squad** — the full roster of players ([SQUAD in shared.jsx](../src/shared.jsx)). Each
player has a primary `pos`, a `role` code, a `rating`, a nationality, and pitch
coordinates.

**Position slot** — one slot in the chosen Formation, identified by `(positionType, index)`
(e.g. `CB#1`, `CB#2`). Derived from the Formation, with pitch coordinates. Replaces the old
hand-rolled `CB2` key.

**Natural / Secondary position** — the two tiers of a player's eligibility. *Natural* = a
genuine fit; *Secondary* = can cover, flagged "out of position." Any other slot is
ineligible. Governs which re-deploys are allowed and how they read.

**Depth chart** — for one Position slot, an ordered `{ starter, backups[] }` stack. Derived
from the Squad by `getInitialDepthCharts()`. Editable in the telemetry variant.

**Starting XI** — the eleven starters, one per Position slot, read off the Depth charts.

**Starter-elsewhere rule** — invariant the depth-chart editor enforces: a player may be the
starter of at most one Position slot. The UI blocks promotions that would violate it.

**Sporting director (user role)** — the target user's stance: planning *squad composition and
depth*, not match-day tactics. Supersedes the earlier "armchair manager" framing.

**Formation (as lens)** — the shape the user picks (their team's current or preferred). It
sets the Position slots and frames the view; it is not the main activity.

**Depth (squad sense)** — how well-covered a Position slot is: a starter plus quality/young
backups. Distinct from the design-term *Depth* below. The product's core subject.

**Gap** — a Position slot with insufficient Depth: no backup, only aging cover, or a starter
who is leaving. Surfacing Gaps is the product's core feedback signal.

**What-if** — a roster change the user explores: remove a departing player, add a signing or
youth prospect, age the squad forward a season — then read the consequence to Depth and Gaps.

**Next-season planning** — the time horizon: age, who's leaving, and youth coming through are
first-class, because the user is planning forward, not setting today's XI.

**Registration category** — a coarse classification of a player for squad-rule purposes
(`homegrown/national`, `EU`, `non-EU`), derived from nationality. Buckets are configurable per
competition.

**Quota / compliance** — squad-registration limits (e.g. Greek league non-EU cap, UEFA
homegrown minimum) and the squad's standing against them. A second planning constraint
alongside Depth; reacts to what-ifs.

**Depth health** — the three-state signal per Position slot: *Solid* / *Thin* / *Gap*. The
product's live feedback. See [ADR 0008](adr/0008-depth-signal-three-state-health.md).

## Design terms (deep-module vocabulary)

**Module** — anything with an interface and an implementation (function, file, slice).

**Interface** — everything a caller must know to use a module: signatures *plus* invariants,
data shape, error modes, performance.

**Seam** — a place you can change behaviour without editing in that place; where a module's
interface lives. E.g. the import boundary at `shared.jsx` is the current data seam.

**Depth** — behaviour delivered per unit of interface a caller must learn. Deep = lots
behind a little.

**Adapter** — a concrete thing satisfying an interface at a seam (e.g. a future API-backed
data source vs. today's hardcoded constants).
