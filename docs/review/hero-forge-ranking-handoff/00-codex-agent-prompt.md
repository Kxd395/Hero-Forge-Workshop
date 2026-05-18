# Codex Agent Prompt

You are working in the Hero Forge Workshop repository.

Implement the ranking refactor described in this handoff. The goal is not to create a subjective LLM ranking. The goal is a deterministic enrichment pipeline that assigns explainable metadata to every power and lets the UI display honest labels instead of fake precise numeric scores.

## Core requirement

Do not display raw numeric score chips like `Score 23` on power cards.

Display label badges instead:

```text
Advanced | Focused | High Risk | Best as Secondary | Inferred
```

For imported powers, also show a popularity label when available:

```text
Known Pick
Niche Pick
Unproven
```

## Required data model

Add a ranking profile to normalized powers:

```js
ranking: {
  version: "2026-05-ranking-v1",
  rating: "core" | "advanced" | "legendary",
  scope: "focused" | "versatile" | "expansive",
  riskLevel: "low" | "medium" | "high" | "extreme",
  bestRole: "primary" | "secondary" | "utility",
  confidence: "low-data" | "inferred" | "strong",
  popularityLabel: "known-pick" | "niche-pick" | "unproven" | null,
  sortScore: number,
  roleScores: {
    primary: number,
    secondary: number,
    utility: number
  },
  sortScores: {
    balance: number,
    impact: number,
    utility: number,
    popularity: number
  },
  evidence: {
    categorySignals: Array<object>,
    subcategorySignals: Array<object>,
    statSignals: Array<object>,
    scopeSignals: Array<object>,
    riskSignals: Array<object>,
    roleSignals: Array<object>,
    popularitySignals: Array<object>
  }
}
```

## Naming decision

Use `ranking.rating` in the new profile.

Keep existing top-level `tier` because existing code and docs use it. Set `tier = ranking.rating` when ranking exists. If older data contains `ranking.tier`, normalize it to `ranking.rating` once in the loader.

## Implementation targets

1. Add shared ranking-rule helpers.
2. Add an enrichment script that writes enriched JSON into `public/data/`.
3. Update `buildImportedLibrary()` or the imported loader to consume ranking metadata.
4. Update card metadata chips to show labels instead of raw score.
5. Update sort modes to use `ranking.sortScores`, `ranking.roleScores`, and `ranking.sortScore`.
6. Add unit tests for risk label, scope inference, confidence, role fit, and fallback behavior.
7. Keep rollback additive: if `power.ranking` is missing, use existing top-level `tier`, `stats`, `score`, and recommended-slot rules.

## Do not do

- Do not use an LLM call at runtime to rank powers.
- Do not present a universal public numeric power score.
- Do not merge popularity and confidence into one field.
- Do not turn origin into a power.
- Do not create a separate visual card family for imported powers.
- Do not remove existing compatibility fields during the first rollout.

## Acceptance summary

The refactor is complete when:

- No power card shows `Score N`.
- Imported powers show deterministic guidance labels.
- Sorting still works.
- Canon powers remain strong-confidence records.
- The large imported pool can be enriched and loaded without live recomputation of all ranking labels.
- Tests, lint, and build pass.
