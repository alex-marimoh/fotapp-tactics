# ADR 0006 — Sharpened concept: squad-depth & gap planning (director's lens)

- Status: accepted
- Date: 2026-06-23
- Refines: [0002](0002-audience-armchair-manager-sandbox.md)

## Context

ADR 0002 framed the user as an "armchair manager" arranging an XI. The author corrected this
to a sharper, different concept. The user is **not** in the manager's chair running match
tactics; they think like a **sporting / support director** planning the squad.

The concept in the author's words: it's about **squad depth**. Pick the formation your team
plays (or your preferred one) — a quick one/two-step framing — then *look at the depth of the
squad and visualize the roster for next season*. Run what-ifs on composition: "if this player
leaves, we have a gap in this position," "we need to bring in young players here."

## Decision

The product is a **squad-depth & gap-planning sandbox**, seen through a chosen formation.

- **User role:** sporting director / squad planner, not match-day manager.
- **Formation = lens, not the toy.** Choosing it sets the position slots; it is a frame, not
  the main activity.
- **Core canvas = depth per position.** Starter + backups for every slot, across the whole
  squad — the thing the current code hides in a modal is actually the centre of the product.
- **Core verb = what-if on the roster.** Remove a player (sold/leaving/aged out), add a
  signing or a youth prospect, and *see the consequence to depth* — especially exposed gaps
  and thin/aging positions.
- **Time horizon matters.** "Next season," "young players," "who's leaving" mean age,
  contract/availability, and this-season-vs-next are first-class, not decoration.

## Consequences

- **The hero feedback is gap/depth signal**, not a team-strength rating: positions with no
  backup, only aging cover, or a departing starter must visibly light up. This is the spark
  whose absence made the prototypes feel empty.
- **Re-rank the existing panels** (next ADR): depth chart + roster are core; nationality
  demographics, loans, and the news wire are peripheral flavour at best.
- **The position model must be correct**, since mapping the squad onto formation slots and
  counting depth is now the product — the synthetic `CB2` slot and the "starter-elsewhere"
  rule deserve real design, not a hack ([see 0007 TBD on the domain model]).
- The pitch stays valuable as the *visualization* of shape and where depth is thin, but it
  shares the stage with a depth/gap view; it is not a tactics board.
