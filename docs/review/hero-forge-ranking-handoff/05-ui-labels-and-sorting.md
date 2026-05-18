# UI Labels And Sorting Guidance

## Card metadata rule

Power cards should not show raw score values.

Replace:

```text
Score 23
```

With labels like:

```text
Advanced | Focused | High Risk | Best as Secondary | Inferred
```

For imported powers with comparison data:

```text
Advanced | Focused | High Risk | Best as Secondary | Inferred | Known Pick
```

## Badge rendering order

Recommended order:

1. Source badge: Canon or Imported
2. Category
3. Rating
4. Best role
5. Scope
6. Risk level
7. Confidence
8. Popularity label, imported only

This keeps the most important build-choice information near the top.

## Badge copy

Use these labels exactly:

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

Avoid:

```text
Score
Rank
Objective Rating
Power Value
Universal Score
```

## Tooltip copy

Use concise guidance copy:

```text
Ranking labels are deterministic guidance from text, tags, drawbacks, stats, and comparison data. Hidden scores are used only for sorting.
```

For imported confidence:

```text
Imported-power labels are inferred. Use them as build guidance, not absolute truth.
```

For expansive primary powers:

```text
Expansive primary powers need a visible cost, range, cooldown, or story constraint.
```

## Sort modes

### Recommended

Use when no specific sort is selected.

Internal behavior:

```text
origin category boost + active slot role score + confidence + balance score
```

Origin fit should influence sort order but should not mutate the power's inherent `ranking.bestRole`.

### Best Balance

Use:

```text
ranking.sortScores.balance
```

Fallback:

```text
score - stats.risk
```

### Highest Impact

Use:

```text
ranking.sortScores.impact
```

Fallback:

```text
stats.offense + stats.control + stats.defense + stats.utility
```

### Lowest Risk

Use:

```text
stats.risk ascending, then confidence descending
```

### Most Utility

Use:

```text
ranking.sortScores.utility
```

Fallback:

```text
stats.utility + stats.mobility + stats.control - stats.risk * 0.3
```

### Best Primary

Use:

```text
ranking.roleScores.primary
```

### Best Secondary

Use:

```text
ranking.roleScores.secondary
```

### Best Utility

Use:

```text
ranking.roleScores.utility
```

### Most Popular

Use:

```text
ranking.sortScores.popularity
```

Fallback:

```text
popularity + totalComparisons guardrail
```

Do not let a high popularity value hide low confidence or extreme risk.

## Filters

Keep role-fit filtering separate from sorting.

Examples:

- Filter: show only powers best as Utility.
- Sort: among those powers, show Lowest Risk first.

This gives users control without changing the ranking profile.

## Builder warnings

Add a recommendation when:

```js
heroBuild.primary?.ranking?.scope === "expansive" && !heroBuild.storyConstraint.trim()
```

Recommended copy:

```text
This primary power is expansive. Add a cost, range, cooldown, or rule so the build has a readable ceiling.
```

## Accessibility

- Do not rely on color alone for risk.
- Include text labels on all chips.
- Preserve keyboard focus states.
- Keep imported and canon cards in the same card component family.
- Do not create separate card layouts for imported powers.

## Empty and low-data states

If a power has low data, show the label instead of hiding it:

```text
Low Data
```

Optional helper copy:

```text
This imported record has limited text or comparison history, so its labels are conservative.
```

## Review panel copy

When summarizing the selected kit, use ranking labels as guidance:

```text
The primary power is Expansive and High Risk, so the draft needs a story constraint before it will feel balanced.
```

Avoid numeric quality claims for imported powers.
