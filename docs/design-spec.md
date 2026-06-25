# Design spec — Matchday

The visual system for the Field-hero board ([ADR 0012](adr/0012-design-direction-field-hero.md)).
It is a **skin**: a single token set (`DEFAULT_SKIN` in [board.jsx](../src/board.jsx)) that the
fixed layout reads from. Changing the look means changing tokens here, not rewriting components.

## Thesis

Live **TV-broadcast graphics** for football. Rich saturated grass, crisp white pitch lines, an
electric primary, and condensed headline type — the energy of a matchday broadcast, not an
analyst's data room. It serves the audience set in [ADR 0002](adr/0002-audience-armchair-manager-sandbox.md):
casual fans playing sporting director, "this is *my* club." Bright and approachable over dense
and tool-like ([ADR 0004](adr/0004-design-direction-rejected-three-pane.md)).

## Color

Every value is a key on the skin token object. Use the token, never a raw hex, in components.

### Surfaces & brand

| Token | Hex | Role |
|---|---|---|
| `bg` | `#eef2f6` | App background, behind panels |
| `panel` | `#ffffff` | Info panel, depth drawer |
| `surface` | `#ffffff` | Menus, modal, popovers |
| `text` | `#141a22` | Primary ink |
| `accent` | `#1463ff` | Electric blue — primary actions, selection, links |
| `accentDark` | `#0b49c9` | Gradient leg / pressed accent |
| `accent2` | `#ff5a1f` | Broadcast orange — secondary highlight, wordmark `app` |
| `onAccent` | `#ffffff` | Text/icon on an accent fill |

### Semantic — depth health ([ADR 0008](adr/0008-depth-signal-three-state-health.md))

The product's core live signal. Three states, three colors, on both pitch nodes and depth cards.

| Token | Hex | State | Meaning |
|---|---|---|---|
| `solid` | `#1ba24e` | Solid | Natural starter + a natural backup |
| `thin` | `#e08a16` | Thin | Out-of-position starter, or no natural backup |
| `gap` | `#e23b34` | Gap | No one available to start |
| `oop` | `#7c3aed` | — | A player filling a non-natural role ("out of position") |

`gap` red doubles as the destructive color ("Sell"). `thin` amber doubles as the compliance
"at limit" warning; `gap` red is also "over/under" quota. Read green = good, amber = caution,
red = problem — never as decoration.

### Pitch & lines

| Token | Value | Role |
|---|---|---|
| `pitch` | `['#3aa056','#2f9249','#27823f']` | Grass gradient (top→bottom), mowing stripes alternate `soft` over it |
| `line` | `rgba(255,255,255,.85)` | Pitch markings, crisp white |

### Hairlines & fills

| Token | Value | Role |
|---|---|---|
| `hair` | `rgba(12,22,40,.10)` | Dividers, default borders |
| `hair2` | `rgba(12,22,40,.18)` | Stronger borders, inputs, menus |
| `soft` | `rgba(12,22,40,.045)` | Tint fills (tabs, news cards, ghost buttons) |
| `cardFrom`→`cardTo` | `#ffffff`→`#eef3f8` | Depth card gradient |
| `ribbon` | `['#ffffff','#eef3f8']` | Top bar gradient |

## Typography

Two families, loaded in [index.html](../index.html). No third face — if you reach for one, stop.

- **Display — Oswald** (`display` token). Condensed, broadcast. Headlines and labels only:
  wordmark, drawer position label, modal titles, legend title, depth-health word.
- **Body — DM Sans** (`font` token). Everything else: names, stats, news, table, controls, inputs.

Oswald is reserved for short display strings. It blobs at small sizes if overused as body —
keep it to headings. (`Anton` was tried and rejected for exactly this.)

### Type scale (size / weight, as used)

| px | Weight | Used for |
|---|---|---|
| 19 | 850 | Wordmark (display) |
| 18 | 800 | Depth card player name |
| 15 | 800 | Drawer position label, modal title (display) |
| 13 | 600–800 | Body copy, news headline, primary buttons, inputs |
| 12 | 700–800 | Tabs, chips, meta rows, table cells, health word |
| 10–11 | 700–800 | Eyebrows, role labels, tags (often + letter-spacing `.04–.08em`, UPPERCASE) |
| 9 | 800 | News category tag |

## Shape, elevation, motion

- **Radius:** `radius: 10` (cards, panels, menus, modal), `pill: 8` (buttons, chips, tags).
  Use `Math.max(0, radius - n)` for nested elements, as the components do.
- **Fills:** `flat: false` → ribbon, pitch, cards, and the primary button use gradients
  (`ribbon`, `pitch`, `cardFrom/To`, `accent→accentDark`). `glow: false` → no node glow.
- **Borders:** 1px `hair` default, `hair2` for emphasis/inputs. Selected/health borders use the
  semantic color (e.g. starter card border = its slot's health color).
- **Elevation:** popovers/modal use soft shadow (`0 12px 32px rgba(0,0,0,.3)`); surfaces are
  otherwise flat-on-flat separated by hairlines.
- **Motion:** minimal — node scale `1.08` on select, `transition .15s`. Don't add ambient motion;
  it fights the clean broadcast read. Respect `prefers-reduced-motion` for anything new.

## Layout

Fixed three-region frame; the skin never changes it.

```
┌───────────────────────────────────────────────┐
│ ribbon  (56px)  — wordmark · tagline           │
├───────────────────────────┬───────────────────┤
│ pitch half                │ info half          │
│  control row (formation,  │  tabs: Team news / │
│  compliance chips)        │  Roster            │
│  pitch (true 105:68)      │                    │
│  legend (i)               │                    │
├───────────────────────────┴───────────────────┤
│ depth drawer  (min 158px) — selected slot stack│
└───────────────────────────────────────────────┘
```

- **Split:** wide screens (`≥1080px`) weight the pitch `1.5fr : 1fr` and rotate the pitch to
  **landscape, attack →**; narrow screens go `1fr : 1fr` with a **portrait** pitch. The pitch is
  always sized to the largest true **105:68** box that fits — never stretched.
- **Padding:** ribbon `0 26px`; pitch half `16` (gap `12`); info half `16px 20px`; drawer `14px 22px`.
- **Dividers:** regions are separated by a 1px `hair` gap, not heavy rules.

## Component rules

- **Pitch node** — circle (`42`px portrait / `46`px wide), `bg` at 80% alpha, 2.5px border in the
  slot's **health** color, jersey number inside. Below: a name pill (`bg` at 74%); when empty it
  reads "`<pos>` gap" in `gap` red. Selected node scales up and rises in z.
- **Compliance chip** — label + `n/limit`, border + number colored by state (ok=`solid`,
  at=`thin`, over/under=`gap`).
- **News card** — `soft` fill, `hair` border, `radius`. Category tag tinted from its own color at
  ~13% alpha. (Currently `PLACEHOLDER` content — flagged in-UI.)
- **Depth card** — `cardFrom/To` gradient, border = health color for the starter / `hair2` for
  backups; a "leaving" card switches to `gap` tint, line-through, 65% opacity. Eyebrow shows
  STARTER / BACKUP n and an OOP flag when not natural.
- **Pill button** — three tones: `accent` (primary), `danger` (transparent + `gap`), `ghost`
  (`soft` + `hair2`).
- **Modal** — `surface`, `hair2` border, `radius`, soft shadow, scrim `rgba(0,0,0,.55)`.
- **Wordmark** — two-tone **solid** text: `fot` in `accent`, `app` in `accent2`, Oswald 850.
  Do **not** use `-webkit-background-clip: text` (it renders as a solid bar in some browsers).

## Voice

Sentence case, active voice, plain football words. A control says what it does and keeps that
word through the flow: **Make starter**, **Sell** / **Keep**, **Add player**, **Build your season**.
No system jargon, no filler. Empty/placeholder states say what goes there next, in the app's voice.

## Quality floor

- Responsive to the `1080px` breakpoint (portrait ↔ landscape pitch); usable narrower.
- Color is never the only signal — health also carries a word ("Solid/Thin/Gap") and the legend.
- Visible keyboard focus and reduced-motion support are required for any new interactive element.

## Don'ts

- Don't hardcode hex in components — add/read a skin token.
- Don't introduce a third font family, or use Oswald for body copy.
- Don't restyle the layout to ship a new look — change tokens.
- Don't reintroduce gradient-clip text.
- Don't add decorative motion or glow (`glow: false` is intentional for this skin).
