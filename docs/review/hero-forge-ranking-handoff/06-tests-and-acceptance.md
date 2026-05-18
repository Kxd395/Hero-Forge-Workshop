# Tests And Acceptance Criteria

## Required unit tests

Add tests for ranking helpers.

Recommended file:

```text
src/utils/rankingRules.test.js
```

### Risk label tests

Input risk values:

```text
1 -> low
3 -> low
4 -> medium
6 -> medium
7 -> high
8 -> high
9 -> extreme
10 -> extreme
```

### Scope tests

Expected examples:

| Input text | Expected scope |
| --- | --- |
| `can jump very high` | focused |
| `can teleport to nearby places they have seen` | versatile |
| `can manipulate reality and probability` | expansive |
| `has every power in the world` | expansive |
| `can control all forces` | expansive |

### Confidence tests

Expected examples:

| Source | Text/comparison state | Expected confidence |
| --- | --- | --- |
| canon | any | strong |
| imported | thin text, 0 comparisons | low-data |
| imported | enough text, some comparisons | inferred |
| imported | rich text, 25+ comparisons | strong |

### Popularity label tests

Expected examples:

| totalComparisons | preferenceRatio | Expected label |
| ---: | ---: | --- |
| 0 | 0 | unproven |
| 4 | 0.90 | unproven |
| 10 | 0.50 | niche-pick |
| 25 | 0.60 | known-pick |
| 50 | 0.40 | niche-pick |

### Role fit tests

Expected examples:

| Stats and signals | Expected best role |
| --- | --- |
| high offense and high control | primary |
| high defense, medium utility, moderate risk | secondary |
| high utility and mobility, low offense | utility |

### Fallback tests

Cases:

1. `power.ranking` missing should not crash.
2. `ranking.tier` from old data maps to `ranking.rating`.
3. Invalid ranking values fall back to safe defaults.
4. Missing stats use default stats.
5. Missing imported comparison data uses `unproven` or `null` as configured.

## Required integration tests

### Imported enrichment script

Test that the enrichment script:

1. Reads imported pool.
2. Filters or preserves published records according to current app rules.
3. Adds `ranking` to each enriched record.
4. Writes a manifest.
5. Produces stable output on repeated runs.

### Power library loader

Test that `buildImportedLibrary()` or the loader:

1. Uses enriched `ranking` when present.
2. Falls back to existing inference when ranking is missing.
3. Sets `tier` from `ranking.rating`.
4. Sets `score` from `ranking.sortScore`.
5. Preserves source fields in `raw`.

### Sorting

Test all sort modes:

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

Acceptance:

- Each sort returns stable order.
- Missing ranking does not crash.
- Role sorts use `ranking.roleScores` when available.
- Recommended sort applies origin fit and active slot without mutating the power profile.

## UI acceptance criteria

### Card display

Pass conditions:

- No card displays `Score N`.
- Canon and imported cards use the same visual grammar.
- Imported cards show confidence.
- Imported cards show popularity label when available.
- Risk is shown as text, not color only.
- Expansive powers are visibly labeled.

### Builder behavior

Pass conditions:

- Expansive primary with no story constraint triggers guidance.
- Origin remains separate from power slots.
- Limits remain derived from weaknesses and story constraint.
- Secondary powers remain capped at three.
- Utility remains a single field-use slot.

### Search and filters

Pass conditions:

- Search still works across name, description, tags, strengths, weaknesses.
- Category filters still work.
- Subcategory filters still work.
- Role-fit filters still work.
- Stat filters still work.
- Pagination still works.

## Manual QA checklist

Run these local checks on Mac Terminal:

```bash
npm run import:superpowers
npm run enrich:powers
npm run docs:powers
npm run test
npm run lint
npm run build
```

Then check the app manually:

1. Open the app locally.
2. Confirm power cards show labels instead of scores.
3. Search for a broad power such as reality, time, probability, or omnipotent.
4. Confirm broad powers show Expansive and high risk labels.
5. Select an Expansive power as Primary.
6. Confirm builder recommends a story constraint.
7. Add a story constraint.
8. Confirm the warning clears or changes to balanced guidance.
9. Try sorting by Best Utility and Most Popular.
10. Confirm no console errors.

## Rollback acceptance

If enriched ranking data breaks:

1. Rename or remove `public/data/superpower-list-enriched.json`.
2. App should load `public/data/superpower-list-pool.json`.
3. App should still render cards using fallback ranking labels.
4. Tests should cover this missing-enriched-data path.

## Completion definition

The work is complete when:

- `ranking` metadata exists for canon and imported powers.
- Imported enrichment is precomputed.
- UI no longer shows public score chips.
- Sorts continue to work.
- Docs are updated.
- All validation commands pass.
