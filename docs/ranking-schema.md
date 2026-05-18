# Ranking Schema Contract

This is the target contract for enriched power ranking metadata. It is not fully implemented yet. New code should use this schema when adding the enrichment pipeline.

## Compatibility Rule

Keep existing top-level fields until migration is complete:

```js
power.tier
power.score
power.popularity
```

New enriched ranking data must use:

```js
power.ranking.rating
```

Do not write new data with `ranking.tier`. If old data contains it, normalize it once:

```js
const rating = power.ranking?.rating ?? power.ranking?.tier ?? power.tier ?? "core";
```

## Ranking Profile

```js
ranking: {
  schemaVersion: 1,
  pipelineVersion: "ranking-pipeline-v1",
  rulesetVersion: "ranking-rules-v1",
  generatedAt: "2026-05-18T00:00:00.000Z",
  inputHash: "sha256-or-other-stable-hash",

  rating: "core" | "advanced" | "legendary",
  scope: "focused" | "versatile" | "expansive",

  risk: {
    score: 0,
    level: "low" | "medium" | "high" | "extreme",
    tags: [
      "story-breaking",
      "collateral-damage",
      "privacy-risk",
      "moral-risk",
      "condition-dependent",
      "low-drawback-text"
    ]
  },

  bestRole: "primary" | "secondary" | "utility",
  roleFit: {
    primary: {
      score: 0,
      label: "weak" | "usable" | "strong",
      reasons: []
    },
    secondary: {
      score: 0,
      label: "weak" | "usable" | "strong",
      reasons: []
    },
    utility: {
      score: 0,
      label: "weak" | "usable" | "strong",
      reasons: []
    }
  },

  confidence: {
    label: "low-data" | "inferred" | "strong",
    score: 0,
    reasons: []
  },

  popularity: {
    label: "unproven" | "niche-pick" | "known-pick",
    rawRatio: 0,
    smoothedScore: 0,
    comparisonCount: 0,
    timesPreferred: 0,
    timesRejected: 0
  },

  constraint: {
    requiredForPrimary: false,
    reason: "",
    suggestedConstraintTypes: []
  },

  sort: {
    recommended: 0,
    bestBalance: 0,
    highestImpact: 0,
    lowestRisk: 0,
    mostUtility: 0,
    bestPrimary: 0,
    bestSecondary: 0,
    bestUtility: 0,
    mostPopular: 0
  },

  quality: {
    flags: [],
    defaultVisible: true,
    reviewed: false,
    reasons: [],
    duplicateKey: "normalized-power-name",
    languageRisk: "none",
    clarity: "clear",
    canonCandidate: false,
    categoryConfidence: 0,
    textQualityScore: 0,
    duplicateGroupId: null
  },

  content: {
    flags: [],
    reasons: [],
    defaultVisible: true,
    moderationReason: ""
  },

  evidenceSummary: [],

  evidence: {
    categorySignals: [],
    subcategorySignals: [],
    statSignals: [],
    scopeSignals: [],
    riskSignals: [],
    roleSignals: [],
    confidenceSignals: [],
    popularitySignals: [],
    qualitySignals: [],
    contentSignals: []
  }
}
```

## Evidence Object

Evidence arrays should contain structured objects:

```js
{
  field: "description",
  match: "anything",
  weight: 4,
  reason: "broad all-purpose language increases scope"
}
```

Do not store only raw matched strings in the audit output.

## UI Payload Vs Audit Payload

The main UI payload should stay compact:

```text
public/data/superpower-list-enriched.json
```

The full audit payload can be separate:

```text
public/data/superpower-list-ranking-audit.json
```

The UI payload can include the labels needed for browsing:

```text
ranking.rating
ranking.scope
ranking.risk.level
ranking.bestRole
ranking.confidence.label
ranking.popularity.label
ranking.constraint.requiredForPrimary
ranking.content.defaultVisible
ranking.content.reasons
ranking.evidenceSummary
```

Full `evidence`, role-fit scoring, sort scoring, and detailed quality metadata belong in audit or review payloads, not the default browser payload.

## Fallback Rule

The app must handle:

- no `power.ranking`
- partial `power.ranking`
- legacy `power.ranking.tier`
- missing enriched JSON
- saved drafts created before ranking existed

Fallback order:

```text
enriched ranking
then legacy ranking fields
then top-level tier/stats/score/popularity
then current helper inference
```
