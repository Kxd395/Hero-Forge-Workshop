# Project Review Findings

## Executive assessment

The project direction is sound. The docs already define Hero Forge Workshop as a character-building tool rather than a simple power list. The main design rule is also correct: imported powers should not be presented as if the dataset can support precise universal numeric rankings.

The highest-value improvement is to convert ranking from a visible numeric score into an explainable label profile backed by deterministic internal sorting.

## What is already strong

### 1. Product model is coherent

The character flow is clear:

```text
Origin + Primary Power + Secondary Powers + Utility Power + Limits + Motivation = Coherent Hero Draft
```

This is the right foundation. It keeps the app focused on character building, not raw catalog browsing.

### 2. Origin is correctly separated from powers

Origin explains how powers were gained. It should bias recommendations but should not occupy a power slot or block any user choice.

Keep this rule unchanged.

### 3. Limitations are correctly derived

Limits should come from selected power weaknesses, counters, risk, broad scope, and the optional story constraint field. They should not become a separate power category.

Keep this rule unchanged.

### 4. The docs correctly identify fake precision

The current score is deterministic but coarse. That is acceptable for internal sorting but not acceptable as a public truth claim.

The right direction is already documented:

- Use numeric sort values internally.
- Display readable labels externally.
- Make imported-power rankings conservative and explainable.
- Attach evidence to inferred labels.

### 5. The UI system already supports the solution

The design system already expects a unified power-card language for canon and imported powers. It also says imported rankings should be presented as guidance, not truth.

This means the refactor should be a card metadata update, not a redesign.

## Main gaps to fix

### Gap 1: `ranking.rating` and `ranking.tier` are inconsistent

The docs currently mix two names for the same concept:

- `ranking.rating`
- `ranking.tier`

Recommendation:

- Use `ranking.rating` for the new ranking profile because it matches the user-facing label `Power Rating`.
- Keep top-level `tier` for compatibility with current app code.
- Normalize legacy `ranking.tier` into `ranking.rating` if encountered.
- Do not keep both new fields long term.

### Gap 2: Confidence and popularity are being conflated

The rough model has `Popularity / Confidence` with values like:

```text
Known Pick
Niche Pick
Low Data
```

This mixes two different ideas.

Recommended split:

```text
confidence: low-data | inferred | strong
popularityLabel: known-pick | niche-pick | unproven | null
```

Use confidence to describe trust in the ranking metadata.

Use popularity label to describe imported comparison activity.

### Gap 3: Runtime inference should become precomputed enrichment

The app currently infers category, tier, stats, role, and score while loading imported powers. That works as a scaffold, but it does not scale well and makes debugging harder.

Recommendation:

- Keep runtime fallback logic.
- Add `scripts/enrich-power-rankings.mjs`.
- Write enriched records to `public/data/superpower-list-enriched.json`.
- Load enriched data when available.
- Keep the original imported pool as source data.

### Gap 4: Evidence exists conceptually but not structurally

The ranking pipeline should write evidence arrays, not just final labels.

Minimum evidence fields:

```js
evidence: {
  categorySignals: [],
  subcategorySignals: [],
  statSignals: [],
  scopeSignals: [],
  riskSignals: [],
  roleSignals: [],
  popularitySignals: []
}
```

This makes the ranking auditable and easier for Codex or a human maintainer to fix.

### Gap 5: Documentation backlog needs operational docs

The docs map correctly identifies missing runbooks. After this ranking refactor, the next required docs are:

1. `docs/import-runbook.md`
2. `docs/testing-strategy.md`
3. `docs/release-checklist.md`
4. `docs/performance-plan.md`
5. `docs/curation-workflow.md`

The ranking pipeline should be included in the import runbook.

## Recommended priority order

### Priority 1: Ranking field consistency

Decide field names before code changes.

Use:

```js
ranking.rating
```

Keep:

```js
tier
```

Avoid:

```js
ranking.tier
```

### Priority 2: Add deterministic ranking profile

Add profile labels and evidence to every normalized power.

### Priority 3: Replace visible score chip

Do not expose `score` or `sortScore` as a public card value.

### Priority 4: Move imported ranking to enrichment script

This is the architecture fix.

### Priority 5: Add tests and rollback path

Make `ranking` optional during rollout.

## Recommended final architecture

```text
Raw imported pool
  -> import script
  -> normalized imported JSON
  -> ranking enrichment script
  -> enriched JSON with ranking profiles
  -> React app loader
  -> unified power cards with labels
  -> internal sort modes use hidden scores
```

## Final product rule

The app should feel like a character-building workspace, not a spreadsheet pretending every power has an objective universal rank.
