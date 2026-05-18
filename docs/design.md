# SuperHero Powers Forge — Design System

Version 1.0 — May 2026

This document captures the visual language, layout grid, and component
principles used by the Powers Forge app. It exists so contributors can extend
the UI without re-introducing the size, density, and palette issues that the
first scaffold accumulated.

---

## 1. Design Principles

1. **Catalog first.** The base canon and imported pool are the primary content.
   Decorative chrome must never push them below the fold.
2. **Calm density.** Power data is rich (stats, strengths, weaknesses, tags).
   Cards use a compact 8-pt rhythm and reveal detail through hover, not size.
3. **One accent at a time.** Each card carries a single categorical accent.
   The shell stays neutral so accents read as data, not decoration.
4. **Forge feel, not arcade feel.** Industrial dark UI with a single warm
   highlight (amber) and a single cool highlight (cyan). No rainbow gradients.
5. **Workspace, not landing page.** Top nav, sticky context, and inline
   summaries — the screen behaves like a tool, not a marketing page.
6. **Accessible by default.** WCAG AA contrast on text, visible focus rings,
   reduced-motion fallback, semantic landmarks (`header`, `nav`, `main`,
   `aside`, `section[aria-labelledby]`).

---

## 2. Layout Grid

| Region        | Width                           | Notes                                            |
| ------------- | ------------------------------- | ------------------------------------------------ |
| App shell     | `min(1320px, 100% - 32px)`      | Centered, 24px gutters on mobile.                |
| Top bar       | Full bleed, sticky, 56px tall   | Backdrop blur, hairline bottom border.           |
| Hero panel    | 12-col grid, 2-col on ≥1024px   | Copy 2/3, metric 1/3. Shorter than v0.           |
| Workspace     | `240px` rail + fluid catalog    | Rail collapses to wrap on tablet, list on phone. |
| Section gap   | 24px desktop / 16px mobile      | Consistent vertical rhythm.                      |
| Card gap      | 12px                            | Grid uses `auto-fill, minmax(280px, 1fr)`.       |

Breakpoints: `≥1280` desktop, `≥900` tablet, `<900` phone, `<560` compact.

---

## 3. Spacing & Radius Scale

Spacing tokens follow a 4-pt scale:
`--space-1: 4px`, `--space-2: 8px`, `--space-3: 12px`, `--space-4: 16px`,
`--space-5: 24px`, `--space-6: 32px`, `--space-7: 48px`.

Radius:
`--radius-xs: 6px`, `--radius-sm: 10px`, `--radius-md: 14px`,
`--radius-lg: 20px`, `--radius-pill: 999px`.

Cards use `--radius-md`. Pills and chips use `--radius-pill`.
Inputs and buttons use `--radius-sm`.

---

## 4. Color System

### Surface

| Token            | Hex       | Use                                  |
| ---------------- | --------- | ------------------------------------ |
| `--bg`           | `#070a10` | Page background.                     |
| `--surface-1`    | `#0e131c` | Section panels, top bar.             |
| `--surface-2`    | `#141b27` | Cards, inputs.                       |
| `--surface-3`    | `#1b2330` | Hover / elevated.                    |
| `--surface-ink`  | `#0a0d13` | Inverted chips, code surfaces.       |

### Text

| Token         | Hex       | Use                       |
| ------------- | --------- | ------------------------- |
| `--ink`       | `#eef2f8` | Primary text.             |
| `--ink-soft`  | `#c5cdd9` | Body, descriptions.       |
| `--muted`     | `#8593a6` | Secondary labels.         |
| `--quiet`     | `#5a6779` | Captions, attribution.    |

### Borders

| Token            | Hex                  | Use                            |
| ---------------- | -------------------- | ------------------------------ |
| `--line`         | `rgba(255,255,255,.08)` | Default hairline.           |
| `--line-strong`  | `rgba(255,255,255,.16)` | Active / focused borders.   |

### Brand & Status

| Token         | Hex       | Use                                       |
| ------------- | --------- | ----------------------------------------- |
| `--brand`     | `#34d2ff` | Primary action, focus ring.               |
| `--brand-2`   | `#ffb020` | Single warm highlight (counts, accents).  |
| `--success`   | `#5ddb8d` | Active states.                            |
| `--danger`    | `#ff6079` | Risk, destructive.                        |
| `--info`      | `#9b8cff` | Tags, secondary chips.                    |

### Categorical Accents

Defined per category in `src/data/superpowers.js`. They are used **only** on
the left edge of a skill card, the icon tile, and the stat bar fills. Never on
text or buttons — that's reserved for the global brand color.

---

## 5. Typography

- **Display font:** `Space Grotesk` (cards, headings).
- **UI font:** `Inter` (body, controls, tables).
- **Mono font:** `JetBrains Mono` (counts, IDs).

### Scale

| Token       | Size  | Line | Weight | Use                       |
| ----------- | ----- | ---- | ------ | ------------------------- |
| `--fz-xs`   | 11px  | 1.4  | 600    | Eyebrow / pill labels.    |
| `--fz-sm`   | 13px  | 1.5  | 500    | Captions, table cells.    |
| `--fz-md`   | 15px  | 1.55 | 500    | Body.                     |
| `--fz-lg`   | 17px  | 1.4  | 600    | Card titles.              |
| `--fz-xl`   | 22px  | 1.25 | 700    | Section headings.         |
| `--fz-2xl`  | 28px  | 1.15 | 700    | Builder summary.          |
| `--fz-3xl`  | `clamp(2rem, 2.4vw + 1rem, 3.25rem)` | 1.05 | 700 | Hero title. |

The previous app used `clamp(2.4rem, 5.4vw, 5rem)` for the hero title which
overflowed on tablet — capped to 52px max.

---

## 6. Components

### 6.1 Top Bar

Sticky 56px bar with the logomark on the left and section links on the right.
Active section is underlined with the brand color. On phones the links scroll
horizontally.

### 6.2 Hero Panel

Compact two-column intro (max 200px tall). Left: eyebrow + title + 1-sentence
description + two CTA chips that jump to the catalog and pool. Right: a single
stat tile (base power count). No giant diagonal ribbon.

### 6.3 Unified Power Card

```
┌────────────────────────────────────────┐
│ ▎[icon] CANON · PHYSICAL        + Add │
│        Super Strength                  │
│        Amplified muscular output …     │
│   Core   Brawler   Best as Primary     │
├────────────────────────────────────────┤
│ OFF 9 ▓▓▓▓▓▓▓▓▓░    DEF 5 ▓▓▓▓▓░░░░░ │  ← stats in 2 cols
│ MOB 4 ▓▓▓▓░░░░░░    UTL 6 ▓▓▓▓▓▓░░░░ │
│ CTL 3 ▓▓▓░░░░░░░    RSK 7 ▓▓▓▓▓▓▓░░░ │  ← risk uses --danger color
├────────────────────────────────────────┤
│ Counters                  Telekinesis │
└────────────────────────────────────────┘
```

Canon powers and imported powers must use the same `power-card` visual grammar:

- same header layout
- same source badge position
- same title/body hierarchy
- same add/added button placement
- same metadata chip row
- same footer rhythm

The source is allowed to change the content, not the component language:

- Canon cards show category, tier, role, slot fit, scope, stat bars, and counters.
- Imported cards show source state, tier, slot fit, scope, normalized stats, description, and tags.

Key constraints:

- Never create a separate visual card family for imported powers.
- Imported pool cards use inferred stat bars, but the UI labels those rankings as guidance rather than universal truth.
- Risk bar is tinted red to make tradeoffs obvious on canon cards.

### 6.4 Pool Card (imported power)

Same shell as the canon power card. Import source and confidence signals are
shown in the metadata row. Tags render in the same footer region where canon
cards show counters.

### 6.5 Hero Builder

Builder layout: **Power Origin** + **Selected powers** (grouped by primary,
secondary, and utility) + **Profile** (generated identity, stats, strengths,
derived limits, tags, synergy, and story hook). The origin picker explains how
powers were gained and biases recommendations. The slot strip above the catalog
controls where the next selected power goes. When zero powers are selected the
Builder shows an empty state that tells the user to pick an origin or power slot,
then assign powers from the library.

Rules:

- Primary power drives the alias and aggregate role more than secondary powers.
- Utility powers increase readiness because they make a hero more usable in the
  field. Derived limits increase balance because they expose costs, range
  problems, risks, counters, or story constraints from the selected powers.
- A power can appear in only one slot at a time. Reassigning moves it.
- Secondary powers are capped at three to avoid turning the draft into a loose
  inventory.
- Powers are reviewed by scope: Focused, Versatile, or Expansive. Expansive
  powers such as time, reality, dimensional, probability, or force-level control
  need a visible cost, range, cooldown, or limitation before they should anchor a
  primary build.

### 6.6 Compare Tray

Users can pin up to four powers from the library to compare stat blocks before
assigning one to the active hero slot. The tray sits between slot selection and
sorting so it remains close to the decision point.

Cards expose direct role assignment buttons for Primary, Secondary, and Utility.
Origin is selected from the origin picker, not from power cards. The recommended
slot is visually marked, but the user can override it without changing the active
slot strip.

### 6.7 Sticky Selection Pill

When `selectedPowers.length > 0`, a floating pill anchors to the bottom right
with the count and a "Review draft" link to `#builder`. It is the single
persistent reminder that work-in-progress exists.

### 6.8 Filters

- **Search** owns the full row on mobile, shares the row with tier pills on
  desktop.
- **Pill groups** (tier, state, sort, tags) use the same `pill-group`
  component for consistency.
- The active pill uses the brand color background with inverted text.
- Sorting supports global quality and stat-specific high-to-low views so the
  large imported pool can be explored by intent, not only by name.
- Recommended sorting is slot-aware. It scores powers differently for Primary,
  Secondary, and Utility so the library changes with the active build task.
  Origin category fit is a separate boost layered on top of the current sort.
- Recommended-slot filtering is separate from active-slot sorting. It narrows
  the pool to powers best used as Primary, Secondary, or Utility while keeping
  the same recommendation rules shown on each card.
- Pagination is mandatory for the library. Never strand users on the first
  result slice; show page count, next/previous, and page size.
- Stat filters support minimum offense, defense, mobility, utility, and control,
  plus maximum risk.

### 6.9 Category Rail

Single-column nav with icon, name, and count chip. Sticky on desktop. On
tablet it becomes a horizontal scroll strip above the catalog.

### 6.10 Subcategory Rail

When a category is active, show a second-level chip row for theme-level filters.
Examples: Mobility exposes Speed, Flight, Teleportation, Portals, Phasing, Time
Travel, Dimensional, and Jumping. Chips include counts and reset to All when the
parent category changes.

### 6.11 Data Source Cards

Vertical cards with a left status edge (active / recommended / candidate /
planned / deferred). Status uses the global brand/status colors — no extra
hues are introduced.

### 6.12 Base Power Table

Reference grid at the bottom of the page. Striped rows, sticky header, with
the risk column color-coded against `--danger`.

---

## 7. Interaction & Motion

- **Hover:** Card lifts 2px with a slightly stronger border. 150ms ease.
- **Focus:** 2px brand-color ring with 3px offset. Always visible on keyboard.
- **Selection:** "Add to hero" pill swaps to a filled green check; the card
  border picks up the success color.
- **Reduced motion:** Transforms are suppressed; only opacity transitions
  remain.

---

## 8. Accessibility

- All interactive elements ≥ 36px tap target.
- All icons inside buttons have `aria-hidden="true"` with a text or
  `aria-label` sibling.
- Section headings use `h2` and are linked via `aria-labelledby`.
- The sticky selection pill announces count via `aria-live="polite"`.
- Color is never the sole signal — text labels accompany state pills, tier
  chips, and the risk bar.

---

## 9. Content Guidelines

- **Power names** are Title Case, max 3 words.
- **Descriptions** are 1 sentence, present-tense, action-focused.
- **Strengths / weaknesses / counters** are noun phrases, max 4 words.
- **Tags** are lowercase, hyphen-separated.
- **Hero copy** avoids superlatives ("ultimate", "most powerful"); it should
  read like a product spec, not a comic blurb.

---

## 10. Roadmap

- [ ] Radar chart visualization for hero draft stats.
- [ ] Light theme using the same tokens (only surface + ink swap).
- [ ] Per-category color theming on the pool grid once imported records are
      classified.
- [ ] Keyboard shortcut layer (`/` to focus search, `b` to open builder).
