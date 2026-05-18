# Ranking Pipeline Spec

This document defines the target ranking pipeline for powers. It separates display labels from hidden sort math so the UI does not imply fake precision.

## Problem

Canon powers have authored stats. Imported powers do not. The app currently infers category, stats, tier, role, and score from text and popularity signals. That is useful for sorting, but it is not a true objective ranking.

The fix is not one better number. The fix is an explainable ranking profile with confidence and evidence.

## Principles

- Show readable labels, not hidden math.
- Keep numeric scores internal for sorting only.
- Attach evidence to every inferred label.
- Prefer conservative labels when data is weak.
- Separate power strength from story risk.
- Let origin and active slot influence recommendations without changing the underlying power profile.

## Pipeline

```text
raw power
  │
  ├─ normalize text
  │    name + overview + description + pros + cons + tags
  │
  ├─ infer category
  │    category, subcategories, category evidence
  │
  ├─ infer stats
  │    offense, defense, mobility, utility, control, risk
  │
  ├─ infer scope
  │    focused, versatile, expansive
  │
  ├─ infer rating
  │    core, advanced, legendary
  │
  ├─ infer role fit
  │    primary, secondary, utility
  │
  ├─ infer confidence
  │    low-data, inferred, strong
  │
  └─ produce ranking profile
```

## Target Ranking Shape

```js
ranking: {
  rating: "core" | "advanced" | "legendary",
  scope: "focused" | "versatile" | "expansive",
  riskLevel: "low" | "medium" | "high" | "extreme",
  bestRole: "primary" | "secondary" | "utility",
  popularityLabel: "known-pick" | "niche-pick" | "unproven" | null,
  confidence: "low-data" | "inferred" | "strong",
  sortScore: 0,
  evidence: {
    categorySignals: [],
    subcategorySignals: [],
    statSignals: [],
    scopeSignals: [],
    riskSignals: [],
    roleSignals: [],
    popularitySignals: []
  }
}
```

Use `ranking.rating` for the new ranking profile. Keep top-level `tier` for existing app compatibility. If legacy enriched data ever contains `ranking.tier`, normalize it into `ranking.rating` at load time and do not keep both long term.

## Category Evidence

Category is inferred from weighted keyword families.

Examples:

| Category | Signals |
| --- | --- |
| Physical | strength, muscle, durability, armor, combat |
| Elemental | fire, ice, water, earth, storm, weather |
| Psychic | mind, memory, emotion, telepathy, perception |
| Energy | blast, beam, electricity, radiation, magnetism |
| Mobility | flight, speed, teleport, portals, phasing |
| Biological | healing, mutation, senses, venom, shapeshift |
| Tech | cyber, machine, hacking, armor, weapon |
| Mystic | magic, curse, ritual, spirit, summon |
| Cosmic | space, time, gravity, dimension, void |
| Stealth | invisibility, shadow, silence, disguise, infiltration |

Target improvement: store matched terms and category confidence with the normalized power so debugging is possible.

## Stat Inference

Stats are 1-10 and should be inferred from:

- category baseline
- keyword boosts
- drawbacks
- scope
- popularity/comparison confidence

The current system uses category baseline plus popularity and drawback count. The target system should add keyword-specific evidence.

Example:

```text
Teleportation
  mobility +3 from teleport/blink/portal terms
  utility +2 from travel/rescue/access terms
  risk +2 from dimensional/time terms
```

## Scope

Scope explains how broad a power is.

| Scope | Meaning | Build Rule |
| --- | --- | --- |
| Focused | Narrow, readable power | Safe as Primary or support |
| Versatile | Flexible power with multiple uses | Needs clear role in the kit |
| Expansive | Rules-level or reality-level power | Needs cost, range, cooldown, or story constraint |

Expansive signals include:

- time
- reality
- probability
- dimensional
- cosmic
- gravity
- force
- omnipotent/all/anything/everything language

## Role Fit

Role fit should be calculated separately for each slot.

| Slot | Strong Signals |
| --- | --- |
| Primary | high offense, high control, concept-defining utility, high narrative identity |
| Secondary | combo value, utility/control mix, moderate risk, supports another power |
| Utility | high utility, mobility, scouting, defense, rescue, low-to-medium offense |

Origin fit is separate. Origin boosts categories in sorting but does not change the power's best role.

## Confidence

| Confidence | Meaning |
| --- | --- |
| Low-data | Thin description, few comparisons, weak tags, little evidence |
| Inferred | Enough text/signals to rank, but not reviewed |
| Strong | Canon, curated, or imported record with strong evidence and comparison data |

Target rule:

```text
canon = strong
imported with enough text + comparisons = inferred or strong
imported with thin text + no comparisons = low-data
```

## Popularity Label

Popularity describes imported comparison activity. It is related to confidence, but it is not the same signal.

| Label | Meaning |
| --- | --- |
| Known Pick | Enough comparison activity to show that users have chosen it before |
| Niche Pick | Some comparison activity, but not enough to treat as broadly validated |
| Unproven | Little or no comparison activity |
| None | Canon or generated records where imported comparison activity does not apply |

Target internal values:

```text
known-pick | niche-pick | unproven | null
```

## Risk Level

Risk is not just danger. It includes:

- collateral damage
- moral/privacy issues
- story-breaking breadth
- user safety risk
- dependence on conditions
- high risk with no drawback text

| Level | Risk Range |
| --- | --- |
| Low | 1-3 |
| Medium | 4-6 |
| High | 7-8 |
| Extreme | 9-10 |

## Sorting

Sort modes should use ranking profile fields:

| Sort | Internal Behavior |
| --- | --- |
| Recommended | Origin fit boost + active slot fit + confidence + balance |
| Best Balance | High useful stats, lower risk |
| Most Popular | Popularity + comparison count |
| Lowest Risk | Risk ascending |
| Highest Risk | Risk descending |
| Stat High | Selected stat descending |
| A-Z | Name ascending |

## Rollout Plan

1. Add ranking profile generation beside current fields.
2. Keep existing UI working from `tier`, `stats`, `score`, and `getRecommendedSlot()`.
3. Add tests for category evidence, confidence, risk labels, and role fit.
4. Update cards to display ranking labels from `ranking`.
5. Move imported ranking enrichment to a precompute step during import.

## Rollback

Ranking rollout should be additive. If enriched ranking causes regressions:

1. Stop rendering `power.ranking`.
2. Fall back to existing `tier`, `stats`, `score`, and `getRecommendedSlot()`.
3. Keep imported JSON compatible by making `ranking` optional.
