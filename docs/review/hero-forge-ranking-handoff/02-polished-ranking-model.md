# Polished Ranking Model

## Position statement

The imported dataset does not contain enough reliable truth to support precise public numeric rankings. The app can use numbers internally, but it should not show a number like `Score 23` as if it is objective.

The better model is an explainable ranking profile. Each power gets readable labels that describe capability, breadth, risk, role fit, and confidence. Sorting can still use hidden numeric values behind the scenes.

## Public labels

### 1. Power Rating

Describes the general capability and complexity of the power.

```text
Core
Advanced
Legendary
```

Use `rating` in the ranking profile.

### 2. Scope

Describes how broad the power is.

```text
Focused
Versatile
Expansive
```

Definitions:

| Scope | Meaning | Build guidance |
| --- | --- | --- |
| Focused | Narrow, readable, easy to balance | Safe as a primary or support power |
| Versatile | Useful in many situations | Needs a clear role in the kit |
| Expansive | Can solve too many problems if unchecked | Needs cost, range, cooldown, rule, or story constraint |

### 3. Risk Level

Describes how hard the power is to control, balance, or write around.

```text
Low
Medium
High
Extreme
```

Risk includes collateral damage, privacy or moral issues, story-breaking breadth, dependency problems, and powers with high impact but weak drawback text.

### 4. Best Role

Describes the slot where the power usually works best.

```text
Primary
Secondary
Utility
```

Definitions:

| Role | Meaning |
| --- | --- |
| Primary | Signature ability that anchors identity, name, and conflict style |
| Secondary | Support power that creates combos or covers one weakness |
| Utility | Field-use power for movement, rescue, scouting, defense, investigation, communication, or escape |

### 5. Confidence

Describes how much trust the app should place in the inferred ranking profile.

```text
Low Data
Inferred
Strong
```

Definitions:

| Confidence | Meaning |
| --- | --- |
| Low Data | Thin text, weak tags, few comparisons, or limited evidence |
| Inferred | Enough evidence to rank deterministically, but not curated |
| Strong | Canon, curated, or imported record with strong text and comparison evidence |

### 6. Popularity Label

Only applies to imported powers with comparison data.

```text
Known Pick
Niche Pick
Unproven
```

Definitions:

| Popularity label | Meaning |
| --- | --- |
| Known Pick | Meaningful comparison activity and favorable preference ratio |
| Niche Pick | Some comparison activity but limited broad preference |
| Unproven | Little or no comparison data |

Do not use popularity as a synonym for quality. Popularity is a signal, not a truth score.

## Example display

Replace this:

```text
Score 23
```

With this:

```text
Advanced | Focused | High Risk | Best as Secondary | Inferred
```

For an imported power with comparison activity:

```text
Advanced | Focused | High Risk | Best as Secondary | Inferred | Known Pick
```

## Internal sorting

The app should still calculate internal numbers. The difference is that the user does not see those numbers as objective power scores.

Recommended hidden scores:

```js
ranking.sortScore
ranking.roleScores.primary
ranking.roleScores.secondary
ranking.roleScores.utility
ranking.sortScores.balance
ranking.sortScores.impact
ranking.sortScores.utility
ranking.sortScores.popularity
```

## Sort options

Use labels that describe the user intent:

| Sort option | Internal behavior |
| --- | --- |
| Recommended | Origin fit + active slot fit + confidence + balance |
| Best Balance | Useful stats minus risk and overbreadth |
| Highest Impact | Offense + control + defense + utility |
| Lowest Risk | Risk ascending, confidence descending |
| Most Utility | Utility + mobility + control, lower risk preferred |
| Best Primary | `ranking.roleScores.primary` descending |
| Best Secondary | `ranking.roleScores.secondary` descending |
| Best Utility | `ranking.roleScores.utility` descending |
| Most Popular | Imported comparison count + preference ratio, with confidence guardrails |
| A-Z | Name ascending |

## Ranking pipeline

The right architecture is not to ask a skill or model to rank powers by vibes. The right architecture is a deterministic ranking pipeline.

Pipeline:

```text
Raw power
  -> normalize text
  -> infer category and subcategory
  -> infer stats
  -> infer scope
  -> infer risk level
  -> infer best role
  -> infer confidence
  -> infer popularity label
  -> compute hidden sort values
  -> attach evidence
  -> write enriched JSON
```

The app loads the enriched JSON and renders readable labels.

## Core product principle

The score should work for sorting, not for pretending there is one true universal ranking of every superpower.
