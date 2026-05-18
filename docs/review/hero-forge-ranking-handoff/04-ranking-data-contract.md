# Ranking Data Contract

## Purpose

This contract defines the ranking metadata that should exist on every normalized power after the enrichment refactor.

The ranking contract separates:

- user-facing labels
- hidden numeric sort values
- evidence used to explain the labels
- compatibility fields used by existing app code

## Canonical field name decision

Use:

```js
ranking.rating
```

Do not introduce `ranking.tier` as a new field.

Reason:

- `tier` already exists as a top-level compatibility field.
- `rating` is clearer for the new user-facing label.
- The user-facing label is called `Power Rating`.

Compatibility rule:

```js
power.tier = power.ranking.rating
```

Legacy normalization rule:

```js
ranking.rating = rawRanking.rating ?? rawRanking.tier ?? power.tier ?? "core"
```

## Ranking profile schema

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
    categorySignals: Array<RankingSignal>,
    subcategorySignals: Array<RankingSignal>,
    statSignals: Array<RankingSignal>,
    scopeSignals: Array<RankingSignal>,
    riskSignals: Array<RankingSignal>,
    roleSignals: Array<RankingSignal>,
    popularitySignals: Array<RankingSignal>
  }
}
```

## Ranking signal shape

Use a small object. Avoid storing long text copies.

```js
{
  type: "keyword" | "stat" | "drawback" | "popularity" | "source" | "fallback",
  field: "name" | "description" | "tags" | "pros" | "cons" | "stats" | "source",
  term: "teleport",
  target: "mobility",
  weight: 3,
  note: "teleport keyword increased mobility and utility"
}
```

## Label values and UI labels

### Rating

| Stored value | UI label |
| --- | --- |
| `core` | Core |
| `advanced` | Advanced |
| `legendary` | Legendary |

### Scope

| Stored value | UI label |
| --- | --- |
| `focused` | Focused |
| `versatile` | Versatile |
| `expansive` | Expansive |

### Risk level

| Stored value | UI label |
| --- | --- |
| `low` | Low Risk |
| `medium` | Medium Risk |
| `high` | High Risk |
| `extreme` | Extreme Risk |

### Best role

| Stored value | UI label |
| --- | --- |
| `primary` | Best as Primary |
| `secondary` | Best as Secondary |
| `utility` | Best as Utility |

### Confidence

| Stored value | UI label |
| --- | --- |
| `low-data` | Low Data |
| `inferred` | Inferred |
| `strong` | Strong |

### Popularity label

| Stored value | UI label |
| --- | --- |
| `known-pick` | Known Pick |
| `niche-pick` | Niche Pick |
| `unproven` | Unproven |
| `null` | Do not render |

## Risk mapping

Use existing numeric `stats.risk` to derive risk label.

```text
1-3: low
4-6: medium
7-8: high
9-10: extreme
```

If `scope === "expansive"` and no meaningful drawback text exists, raise risk at least one level.

## Confidence mapping

Recommended deterministic rules:

```text
canon: strong
imported, text length below 80 and total comparisons below 5: low-data
imported, text length at least 220 and total comparisons at least 25: strong
all other imported records: inferred
```

Tune thresholds after inspecting real distribution.

## Popularity mapping

Recommended deterministic rules:

```text
totalComparisons < 5: unproven
totalComparisons >= 25 and preferenceRatio >= 0.60: known-pick
totalComparisons >= 5: niche-pick
otherwise: unproven
```

Do not let popularity override risk, scope, or confidence.

## Scope signals

Expansive signals should include words or phrases like:

```text
time
reality
probability
dimensional
dimension
cosmic
gravity
force
omnipotent
all
anything
everything
infinite
universal
absolute
```

Focused signals include narrow action verbs and bounded objects:

```text
blade
shield
jump
heal self
camouflage
silence
single target
line of sight
contact
```

Versatile is the middle state when multiple uses exist but the text does not imply reality-level or universal breadth.

## Role score guidance

Compute all three role scores. `bestRole` is the highest.

Suggested formulas to start:

```js
primary = offense * 1.15 + control * 1.1 + utility * 0.65 + identitySignal * 2 - risk * 0.35
secondary = defense * 0.75 + utility * 0.75 + control * 0.75 + comboSignal * 1.5 - risk * 0.55
utility = utility * 1.25 + mobility * 1.15 + defense * 0.45 + scoutingSignal * 1.5 - offense * 0.2 - risk * 0.35
```

Normalize the results to 0-100.

## Sort score guidance

`sortScore` should be a general balanced score for internal ordering only.

Suggested base:

```js
impact = offense * 1.0 + defense * 0.75 + mobility * 0.75 + utility * 1.0 + control * 1.0
riskPenalty = risk * 0.65
confidenceBoost = { "low-data": 0, inferred: 2, strong: 4 }[confidence]
scopePenalty = { focused: 0, versatile: 1, expansive: 2 }[scope]
sortScore = impact - riskPenalty + confidenceBoost - scopePenalty
```

Then normalize or round for internal sort stability.

Do not render `sortScore` as a public score.

## Compatibility fields

The normalized power can still expose:

```js
{
  tier: ranking.rating,
  score: ranking.sortScore,
  popularity: importedPreferenceRatio
}
```

These fields support old functions and fallback behavior.

## Rollback rule

The app must handle:

```js
power.ranking === undefined
```

Fallback behavior:

1. Use `power.tier` for rating.
2. Use inferred scope from existing helper if available.
3. Use numeric risk from `power.stats.risk`.
4. Use existing recommended-slot helper.
5. Use `power.score` for sort.

This keeps rollout safe.
