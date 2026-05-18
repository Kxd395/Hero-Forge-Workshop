# Codex Implementation Plan

## Goal

Refactor ranking so the UI displays readable labels and uses hidden deterministic scores for sorting.

Do this as an additive rollout. Do not remove existing fields until the new ranking pipeline is stable.

## Phase 0: Normalize naming

Use the following names:

```js
ranking.rating
ranking.scope
ranking.riskLevel
ranking.bestRole
ranking.confidence
ranking.popularityLabel
ranking.sortScore
```

Keep these existing fields for compatibility:

```js
tier
stats
score
popularity
```

Mapping rule:

```js
power.tier = power.ranking?.rating ?? power.tier
power.score = power.ranking?.sortScore ?? power.score
```

If old data uses `ranking.tier`, normalize it:

```js
const rating = ranking.rating ?? ranking.tier ?? fallbackTier
```

## Phase 1: Add shared ranking helpers

Create one shared helper module with pure deterministic functions.

Recommended file:

```text
src/utils/rankingRules.js
```

Suggested exports:

```js
export const RATING_VALUES = ["core", "advanced", "legendary"]
export const SCOPE_VALUES = ["focused", "versatile", "expansive"]
export const RISK_LEVEL_VALUES = ["low", "medium", "high", "extreme"]
export const ROLE_VALUES = ["primary", "secondary", "utility"]
export const CONFIDENCE_VALUES = ["low-data", "inferred", "strong"]
export const POPULARITY_LABEL_VALUES = ["known-pick", "niche-pick", "unproven"]

export function normalizeRanking(rawRanking, fallbackPower) {}
export function inferScope(textBundle) {}
export function inferRiskLevel(stats, textBundle) {}
export function inferConfidence(power, source) {}
export function inferPopularityLabel(power) {}
export function computeRoleScores(stats, scope, riskLevel, textBundle) {}
export function computeSortScores(stats, ranking, popularity) {}
export function createRankingProfile(power, context) {}
```

Keep this module free of React and browser-only APIs so scripts can import it.

## Phase 2: Add enrichment script

Create:

```text
scripts/enrich-power-rankings.mjs
```

Inputs:

```text
public/data/superpower-list-pool.json
src/data/superpowers.js
```

Outputs:

```text
public/data/superpower-list-enriched.json
public/data/superpower-list-ranking-manifest.json
```

Script behavior:

1. Read imported pool.
2. For each imported power, combine `name`, `overview`, `description`, `pros`, `cons`, and `tags` into a normalized text bundle.
3. Infer category and subcategory if missing.
4. Infer stats using existing helpers plus keyword evidence.
5. Add `ranking` profile.
6. Preserve original source fields.
7. Write enriched JSON.
8. Write manifest with counts, timestamp, ranking version, and quality summary.

Recommended manifest shape:

```js
{
  generatedAt: "2026-05-18T00:00:00.000Z",
  rankingVersion: "2026-05-ranking-v1",
  rawImportedRecords: 12798,
  publishedImportedRecords: 8531,
  enrichedRecords: 8531,
  confidenceCounts: {
    "low-data": 0,
    inferred: 0,
    strong: 0
  },
  scopeCounts: {
    focused: 0,
    versatile: 0,
    expansive: 0
  },
  riskCounts: {
    low: 0,
    medium: 0,
    high: 0,
    extreme: 0
  }
}
```

## Phase 3: Add package scripts

Update `package.json`:

```json
{
  "scripts": {
    "enrich:powers": "node scripts/enrich-power-rankings.mjs"
  }
}
```

Optional combined command:

```json
{
  "scripts": {
    "refresh:powers": "npm run import:superpowers && npm run enrich:powers && npm run docs:powers"
  }
}
```

## Phase 4: Update imported power loading

In `src/utils/powerLibrary.js`, update imported normalization.

Expected behavior:

1. Prefer `record.ranking` when present.
2. Normalize `record.ranking` through `normalizeRanking()`.
3. Set top-level `tier` from `ranking.rating`.
4. Set top-level `score` from `ranking.sortScore`.
5. Keep fallback behavior if `ranking` is absent.

Pseudo-implementation:

```js
const ranking = normalizeRanking(record.ranking, fallbackPower)

return {
  ...existingPower,
  tier: ranking.rating,
  score: ranking.sortScore,
  ranking,
}
```

## Phase 5: Update fetch source

In `src/App.jsx` or the relevant loader, prefer enriched data:

```text
public/data/superpower-list-enriched.json
```

Fallback path:

```text
public/data/superpower-list-pool.json
```

This allows rollback if enrichment data is missing or malformed.

## Phase 6: Replace card score display

Find UI copy that renders something like:

```text
Score {power.score}
```

Replace with ranking badges:

```js
const badges = [
  ranking.rating,
  ranking.scope,
  ranking.riskLevel,
  `best-as-${ranking.bestRole}`,
  ranking.confidence,
]

if (power.source === "imported" && ranking.popularityLabel) {
  badges.push(ranking.popularityLabel)
}
```

Display labels:

```text
Core
Advanced
Legendary
Focused
Versatile
Expansive
Low Risk
Medium Risk
High Risk
Extreme Risk
Best as Primary
Best as Secondary
Best as Utility
Low Data
Inferred
Strong
Known Pick
Niche Pick
Unproven
```

## Phase 7: Update sort modes

Add or remap sort modes:

```text
recommended
best-balance
highest-impact
lowest-risk
most-utility
best-primary
best-secondary
best-utility
most-popular
a-z
```

Sorting should use `ranking.sortScores` and `ranking.roleScores` when present.

Fallback to current `score`, `stats`, and existing recommended-slot rules when ranking is missing.

## Phase 8: Add expansive primary warning

When selected primary has:

```js
ranking.scope === "expansive"
```

and `heroBuild.storyConstraint` is empty, show a visible recommendation:

```text
Add a cost, range, cooldown, or rule before using this as the signature power.
```

This aligns the ranking model with the character-building model.

## Phase 9: Update docs

Update these docs after implementation:

```text
docs/project-ssot.md
docs/ranking-pipeline.md
docs/data-dictionary.md
docs/design.md
docs/documentation-map.md
```

Also add:

```text
docs/import-runbook.md
```

At minimum, document:

- how to run the import
- how to run enrichment
- how to verify counts
- how to rollback to raw imported pool

## Phase 10: Validate

Run:

```bash
npm run import:superpowers
npm run enrich:powers
npm run docs:powers
npm run test
npm run lint
npm run build
```

Acceptance criteria are listed in `06-tests-and-acceptance.md`.
