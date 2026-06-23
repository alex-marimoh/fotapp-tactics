# ADR 0004 — Reject the three-pane dashboard; aim for a polished consumer app

- Status: accepted
- Date: 2026-06-23
- Depends on: [0002](0002-audience-armchair-manager-sandbox.md)
- Supersedes the implicit "ship variant C" choice in code

## Context

All three existing board variants (floodlight, chalkboard, telemetry) share one frame: a
dense, fixed three-column desktop "manager dashboard" (left rail + pitch + right rail). Asked
to pick one, the author rejected all three. The specific critique:

> "None of them looked like an app you would see online. It had three columns but looked
> empty… a lot of wasted space… not a polished app."

So the problem is not the colour skin. It is the **frame and the finish**: the layout reads
empty and tool-like, and the craft doesn't reach "real shipping product."

## Decision

The design direction is a **polished, modern consumer web app**, with these properties as the
north star:

1. **Looks shipped.** Production-grade craft — spacing, type scale, hierarchy, intentional
   density. The bar is "an app you'd actually see online," not a wireframe.
2. **No dead space.** Every region earns its place; no empty rails padding out a grid.
3. **Pitch-forward and playful.** The pitch / the act of arranging your team is the hero,
   not a panel squeezed between two data rails. Fun over data-room density (per 0002).

The fixed three-pane desktop dashboard is **rejected** as the organising layout. The next
iteration starts from the experience ("see my team, move players, try a scenario"), not from
the rail grid.

## Consequences

- This is a redesign, not a re-skin. Re-coloring an existing variant does not satisfy it.
- Form factor (mobile-first vs responsive desktop) is now the gating structural question —
  see [0005](0005-form-factor.md).
- Variant C's *engineering* (responsive pitch, draggable XI, working depth-chart editor) is
  still the most reusable asset; its *layout and styling* are not the target.
- Worth generating 1-2 genuinely fresh directions to react to, rather than iterating the
  rejected frame.
