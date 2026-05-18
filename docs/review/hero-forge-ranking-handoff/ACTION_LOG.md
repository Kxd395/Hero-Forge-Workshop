# Action Log

## Handoff creation

Date: 2026-05-18

Actions completed in this handoff:

1. Reviewed the uploaded Hero Forge Workshop docs.
2. Confirmed the project already supports the core direction: hidden numeric sorting and visible ranking labels.
3. Identified the main inconsistency: `ranking.rating` vs `ranking.tier`.
4. Recommended `ranking.rating` for the new profile and top-level `tier` for compatibility.
5. Split confidence from popularity.
6. Converted the rough ranking proposal into a polished spec.
7. Created a Codex implementation plan.
8. Created a ranking data contract.
9. Created UI label and sorting guidance.
10. Created tests and acceptance criteria.

## Source code status

No source code was modified by this handoff.

## Recommended next action for Codex

Implement the refactor additively:

1. Add `src/utils/rankingRules.js`.
2. Add `scripts/enrich-power-rankings.mjs`.
3. Add `npm run enrich:powers`.
4. Update imported power loading to prefer enriched data.
5. Replace visible score chips with ranking labels.
6. Add tests.
7. Update project docs.

## Open decisions for maintainer

### Decision 1: Enriched file name

Recommended:

```text
public/data/superpower-list-enriched.json
```

### Decision 2: Manifest file name

Recommended:

```text
public/data/superpower-list-ranking-manifest.json
```

### Decision 3: Ranking version

Recommended:

```text
2026-05-ranking-v1
```

### Decision 4: Popularity label display

Recommended:

Show popularity label only for imported powers. Do not render it for canon powers.

### Decision 5: Low-data label display

Recommended:

Show `Low Data` visibly. Do not hide uncertainty.
