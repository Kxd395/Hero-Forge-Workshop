# Hero Forge Workshop SSOT

Last updated: May 2026

This document is the current single source of truth for Hero Forge Workshop. If an older ADR or design note conflicts with this file, use this file for current product behavior.

## Purpose

Hero Forge Workshop is a dark-mode web app for building original superhero characters from a unified power library.

The app is not just a power list. It is a character-building workflow:

1. Choose how the hero got powers.
2. Browse and filter a large power library.
3. Assign powers into character roles.
4. Review generated identity, story pressure, strengths, limits, quality, and export text.

## Product Rules

- Origin is not a power. Origin explains how powers were gained.
- Powers are assigned to Primary, Secondary, or Utility slots.
- Limitations are not manually selected as powers. Limits are derived from the weaknesses/drawbacks of selected powers, with an optional custom story constraint.
- Imported powers are treated as inferred records. The app should avoid fake precision when ranking them.
- Numeric scores can exist internally for sorting, but user-facing ranking should prefer readable labels: rating, scope, risk, role fit, and confidence.

## Current Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Browser / React UI                                                   │
│ src/App.jsx                                                          │
│                                                                     │
│ ┌───────────────────────┐   ┌─────────────────────────────────────┐ │
│ │ Power Library          │   │ Hero Draft Panel                    │ │
│ │ search/filter/sort     │   │ origin picker, slots, story output  │ │
│ └──────────┬────────────┘   └───────────────┬─────────────────────┘ │
└────────────┼────────────────────────────────┼───────────────────────┘
             │                                │
             ▼                                ▼
┌────────────────────────────┐   ┌────────────────────────────────────┐
│ Power Library Model         │   │ Hero Builder Model                 │
│ src/utils/powerLibrary.js   │   │ src/utils/heroBuilder.js           │
│ - normalize canon/imported  │   │ - origin sources                   │
│ - infer category/stats      │   │ - slot assignment                  │
│ - subcategory filters       │   │ - draft generation                 │
│ - role fit sorting          │   │ - story/quality/synergy            │
└────────────┬───────────────┘   └──────────────┬─────────────────────┘
             │                                  │
             ▼                                  ▼
┌────────────────────────────┐   ┌────────────────────────────────────┐
│ Core Power Model            │   │ Data Source Model                  │
│ src/utils/powerModel.js     │   │ src/utils/dataSourceModel.js       │
│ - categories                │   │ - source strategy docs             │
│ - score calculation         │   │ - roadmap display                  │
│ - catalog validation        │   │                                    │
└────────────┬───────────────┘   └────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Data                                                                 │
│ src/data/superpowers.js                hand-curated canon powers     │
│ public/data/superpower-list-pool.json  imported Superpower List pool │
│ public/data/superpower-list-manifest.json import metadata            │
└─────────────────────────────────────────────────────────────────────┘
```

## Runtime Flow

```text
App boot
  │
  ├─ buildCanonLibrary()
  │    └─ normalizes src/data/superpowers.js
  │
  ├─ fetch public/data/superpower-list-pool.json
  │    └─ buildImportedLibrary()
  │         ├─ infer category from keywords
  │         ├─ infer tier from popularity/votes
  │         ├─ infer stats from category/popularity/drawbacks
  │         └─ normalize to unified power shape
  │
  ├─ mergeLibraries(canon, imported)
  │
  ├─ user selects origin
  │    └─ origin biases library ordering, does not restrict it
  │
  ├─ user assigns powers
  │    ├─ primary: one signature power
  │    ├─ secondary: up to three support powers
  │    └─ utility: one field-use power
  │
  └─ buildHeroDraft(heroBuild)
       ├─ generated name/classification
       ├─ aggregate stats
       ├─ strengths and limits
       ├─ quality metrics
       ├─ synergy notes/conflicts
       ├─ story brief
       └─ export sheet
```

## Frontend Views

| View | Purpose | Source |
| --- | --- | --- |
| Hero Forge | Main workspace for browsing powers and building a hero | `src/App.jsx` |
| Taxonomy | Category reference and counts | `src/App.jsx`, `src/data/superpowers.js` |
| Data Sources | Source strategy cards | `src/data/dataSources.js` |

## Power Categories

Power categories live in `src/data/superpowers.js`.

| ID | Name | Meaning |
| --- | --- | --- |
| `physical` | Physical | Strength, durability, combat, body-first powers |
| `elemental` | Elemental | Fire, ice, water, earth, air, weather |
| `psychic` | Psychic | Mind, emotion, memory, perception |
| `energy` | Energy | Blasts, absorption, electricity, light, magnetism |
| `mobility` | Mobility | Speed, flight, teleporting, portals, phasing |
| `biological` | Biological | Healing, mutation, adaptation, senses, toxins |
| `tech` | Tech | Armor, cybernetics, gadgets, machines, hacking |
| `mystic` | Mystic | Magic, curses, rituals, summoning, spirits |
| `cosmic` | Cosmic | Space, time, gravity, dimensions, void |
| `stealth` | Stealth | Invisibility, shadow, silence, disguise, infiltration |

Subcategories live in `POWER_SUBCATEGORIES` in `src/utils/powerLibrary.js`.

## Origin Model

Origin answers: how did the hero get powers?

Origin does not occupy a power slot and does not count toward the selected power total. It biases recommendations by preferred categories.

Current origins live in `ORIGIN_SOURCES` in `src/utils/heroBuilder.js`.

| Origin | Preferred Categories | Meaning |
| --- | --- | --- |
| Natural Born | Biological, Physical, Psychic | Species, ancestry, inherited traits |
| Mutation / Gene | Biological, Psychic, Physical, Mobility | Genetic awakening or biological mutation |
| Accident | Energy, Elemental, Biological, Physical | Radiation, chemicals, machine failure, disaster |
| Bite / Infection | Biological, Physical, Mobility, Stealth | Bite, parasite, venom, alien organism, infection |
| Experiment | Tech, Biological, Energy, Physical | Lab, serum, weapon program, procedure |
| Artifact / Relic | Mystic, Cosmic, Elemental, Tech | Relic, suit, weapon, symbol, inherited object |
| Cosmic Event | Cosmic, Energy, Mobility, Psychic | Space/time/radiation/dimensional event |
| Magic / Pact | Mystic, Cosmic, Psychic, Elemental | Spell, curse, vow, patron, ritual |
| Training | Physical, Stealth, Mobility, Tech | Discipline, combat mastery, conditioning |
| Tech Upgrade | Tech, Energy, Mobility, Physical | Cybernetics, armor, implants, AI |
| Alien / Species | Cosmic, Biological, Physical, Energy | Alien heritage or non-human biology |
| Dimensional Contact | Cosmic, Mobility, Mystic, Psychic | Contact with impossible worlds or rules |

## Hero Slots

`HERO_SLOTS` still includes `origin` because build quality/checklist needs to track it, but UI power assignment treats only Primary, Secondary, and Utility as power slots.

| Slot | Count | Meaning |
| --- | ---: | --- |
| Origin | 0/1 | How powers were gained; selected from origin picker |
| Primary | 0/1 | Signature ability readers remember |
| Secondary | 0/3 | Supporting combo powers |
| Utility | 0/1 | Movement, rescue, scouting, defense, investigation, support |

Power-slot total shown in the UI is `5`: Primary `1` + Secondary `3` + Utility `1`.

## Unified Power Shape

Canon and imported powers are normalized into one shape by `src/utils/powerLibrary.js`.

```js
{
  id: "canon:telepathy" | "imported:123",
  source: "canon" | "imported" | "generated",
  name: "Telepathy",
  category: "psychic",
  categoryId: "psychic",
  categoryName: "Psychic",
  categoryAccent: "#8e7cff",
  tier: "core" | "advanced" | "legendary",
  role: "Strategist",
  description: "Full description",
  summary: "Short card summary",
  strengths: ["Information advantage"],
  weaknesses: ["Consent and privacy risk"],
  counters: ["Mind Shielding"],
  tags: ["psychic", "advanced", "strategist"],
  stats: {
    offense: 1,
    defense: 1,
    mobility: 1,
    utility: 1,
    control: 1,
    risk: 1
  },
  score: 27,
  popularity: 0.68,
  raw: {}
}
```

## Imported Power Fields

Imported power data is generated by `scripts/import-superpower-list.mjs` from the Superpower List Database CSV.

| Field | Meaning |
| --- | --- |
| `sourceId` | Original database ID |
| `name` | Power name |
| `overview` | Short ability overview |
| `description` | Longer description |
| `pros` | Up to three listed strengths |
| `cons` | Up to three listed weaknesses/drawbacks |
| `tags` | Source tags |
| `state` | Source publication state |
| `preferenceRatio` | Community preference ratio |
| `timesPreferred` | Times chosen in comparisons |
| `timesRejected` | Times rejected in comparisons |
| `totalComparisons` | Comparison count |
| `createdAt` / `updatedAt` | Source timestamps |
| `username` | Source username |

Only records with `state === "published"` are loaded into the app.

## Current Ranking Reality

The current numeric `score` is deterministic but coarse:

```text
score = offense + defense + mobility + utility + control - risk * 0.6
```

Canon powers have hand-authored stats, so their scores are more meaningful.

Imported powers have inferred stats, so many powers share similar scores. This is expected because the source dataset does not contain true combat/utility stats.

Current rule: use numeric score internally for sorting only. Do not treat it as a true universal ranking.

## Target Ranking Pipeline

The intended ranking pipeline should enrich every power with explainable labels.

```text
raw power
  │
  ├─ text normalization
  │    name + overview + description + pros + cons + tags
  │
  ├─ category inference
  │    category + subcategory + keyword evidence
  │
  ├─ stat inference
  │    offense, defense, mobility, utility, control, risk
  │
  ├─ scope inference
  │    focused | versatile | expansive
  │
  ├─ role fit
  │    primary | secondary | utility
  │
  ├─ risk level
  │    low | medium | high | extreme
  │
  ├─ rating label
  │    core | advanced | legendary
  │
  ├─ confidence label
  │    low-data | inferred | strong
  │
  └─ enriched power profile
       displayed as labels, sorted by hidden numeric values
```

Target fields:

```js
ranking: {
  rating: "core" | "advanced" | "legendary",
  scope: "focused" | "versatile" | "expansive",
  riskLevel: "low" | "medium" | "high" | "extreme",
  bestRole: "primary" | "secondary" | "utility",
  confidence: "low-data" | "inferred" | "strong",
  sortScore: 0,
  evidence: {
    categorySignals: [],
    scopeSignals: [],
    riskSignals: [],
    popularitySignals: []
  }
}
```

The UI should show the readable labels, not the hidden `sortScore`.

## Hero Build Shape

`createEmptyHeroBuild()` creates:

```js
{
  alias: "",
  civilianName: "",
  homeBase: "",
  motivation: "",
  storyConstraint: "",
  origin: null,
  primary: null,
  secondary: [],
  utility: null,
  limitation: null
}
```

`limitation` remains in the object for backward compatibility, but the current UI does not assign limitation powers. Current limits are derived from selected power weaknesses plus optional `storyConstraint`.

## Draft Output

`buildHeroDraft(heroBuild)` returns:

| Field | Meaning |
| --- | --- |
| `heroName` | Alias, user override, or generated name |
| `generatedName` | Deterministic generated name |
| `classification` | Role archetype |
| `selectedCount` | Primary + secondary + utility count |
| `filledSlots` | Completed origin/primary/secondary/utility slots |
| `canonCount` / `importedCount` | Selected power sources |
| `stats` | Aggregate stats |
| `strengths` | Selected power strengths |
| `weaknesses` | Selected power weaknesses |
| `tags` | Combined tags |
| `synergy` | Score, notes, conflicts |
| `interactions` | Origin/primary/support/story pressure relationships |
| `missingSteps` | Human-readable missing steps |
| `checklist` | Build-path checklist |
| `quality` | Identity, field use, balance, cohesion |
| `recommendations` | Next best actions |
| `characterSheet` | Export-ready profile |
| `storyBrief` | Name rationale, premise, arc, beats |

## Quality Metrics

Quality is not a truth score. It is a build-completeness signal.

| Metric | Meaning |
| --- | --- |
| Identity | Origin, name, civilian identity, home base, motivation |
| Field Use | Primary, support, utility, mobility/defense |
| Balance | Drawbacks, story constraints, risk control |
| Cohesion | Synergy and explainable interactions |

Empty drafts score `0`; the app should not show fake quality before powers are selected.

## Sorting and Filtering

Library filtering supports:

- search query
- category
- subcategory
- tier
- source
- recommended role fit
- stat thresholds
- origin category bias
- pagination

Sorting supports:

- recommended
- best balance
- most popular
- lowest risk
- highest risk
- offense high
- defense high
- mobility high
- utility high
- control high
- A-Z

## Deployment

GitHub:

```text
https://github.com/Kxd395/Hero-Forge-Workshop
```

Vercel:

```text
https://hero-forge-workshop.vercel.app
```

Project config:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

## Commands

```bash
npm run dev
npm run test
npm run lint
npm run build
npm run import:superpowers
npm run docs:powers
```

## Source Ownership

| Area | File |
| --- | --- |
| Main UI | `src/App.jsx` |
| Styling | `src/styles.css` |
| Canon powers/categories | `src/data/superpowers.js` |
| Data source roadmap | `src/data/dataSources.js` |
| User guide | `docs/user-guide.md` |
| Data dictionary | `docs/data-dictionary.md` |
| Ranking pipeline spec | `docs/ranking-pipeline.md` |
| Character creation model | `docs/character-creation-model.md` |
| Import runbook | `docs/import-runbook.md` |
| Deployment runbook | `docs/deployment-runbook.md` |
| Testing strategy | `docs/testing-strategy.md` |
| UX flows | `docs/ux-flows.md` |
| Release checklist | `docs/release-checklist.md` |
| Type-safety baseline | `docs/type-safety.md` |
| Running work log | `docs/running-log.md` |
| Ranking schema contract | `docs/ranking-schema.md` |
| Ranking enrichment runbook | `docs/ranking-enrichment-runbook.md` |
| External ranking review handoff | `docs/review/hero-forge-ranking-handoff/` |
| Power model validation/scoring | `src/utils/powerModel.js` |
| Unified power normalization/filtering | `src/utils/powerLibrary.js` |
| Hero build/draft generation | `src/utils/heroBuilder.js` |
| Imported pool filtering helpers | `src/utils/importedPowerPool.js` |
| Superpower List import script | `scripts/import-superpower-list.mjs` |
| Power taxonomy doc generator | `scripts/generate-power-taxonomy-doc.mjs` |
| Documentation map/backlog | `docs/documentation-map.md` |
| Power catalog taxonomy | `docs/power-catalog-taxonomy.md` |
| Model tests | `src/utils/powerModel.test.js` |

## Known Technical Debt

- Imported power scoring is coarse. Replace user-facing numeric score with ranking labels.
- Ranking should eventually be precomputed into enriched JSON instead of inferred entirely at runtime.
- `heroBuild.limitation` remains for backward compatibility but should not be used by new UI.
- The imported JSON is large but acceptable for current Vercel deployment. If it grows, move to chunked data or indexed search.

## Next Ranking Work

1. Add an enrichment script that reads canon and imported powers.
2. Compute `ranking` metadata for every power.
3. Write enriched JSON into `public/data/`.
4. Update `buildImportedLibrary()` to consume enriched ranking metadata.
5. Replace `Score N` card chip with rating/scope/risk/confidence labels.
6. Keep `sortScore` internal and auditable.
