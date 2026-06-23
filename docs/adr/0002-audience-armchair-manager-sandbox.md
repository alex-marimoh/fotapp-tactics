# ADR 0002 — Concept & audience: an armchair-manager sandbox for casual fans

- Status: accepted
- Date: 2026-06-23
- Depends on: [0001](0001-repo-is-an-mvp-demo.md)

## Context

With the repo framed as an MVP demo (0001), the next question is *what concept* it
demonstrates and *for whom*. The code's heaviest investment is the interactive depth-chart
editor, which suggested an analyst/FM-hardcore framing. The author corrected this.

## Decision

The concept is a **fun, low-friction web app for everyday football fans** to look at their
team and *play manager* — drag the XI around, try different scenarios, run what-ifs. It is
**not** a game with a match engine, and **not** an analyst/coach data tool. The emotional
hook is "this is *my* club, and I'm in the manager's chair."

Primary audience: casual fans. Success feeling: playful, approachable, "oh, fun."

## Consequences

- **Aesthetic is now a question, not a given.** The shipping variant (telemetry) is the most
  analyst-looking of the three (monospace data, tabular nums, "telemetry" framing). That may
  fight the "fun for everyday people" goal. Revisit in a later ADR.
- **Rigor that doesn't serve fun is suspect.** The synthetic `CB2` slot and the
  starter-elsewhere rule add correctness the casual user may neither notice nor want. Weigh
  cognitive cost vs. payoff.
- **"Their team" is doing a lot of work.** Whether the demo must feel like the user's *own*
  real club (vs. one preset fictional club) is the next decision and gates the data story.
- **What-if scenarios are core, not decoration.** The drag/edit interactions are the product,
  so they must feel good and probably survive a reload during a demo.
