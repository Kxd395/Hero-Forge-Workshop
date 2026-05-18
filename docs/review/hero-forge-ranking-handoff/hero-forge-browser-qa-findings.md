# Hero Forge Workshop Browser QA Findings

Run date: 2026-05-18

Target app: `https://hero-forge-workshop.vercel.app`

## Test status

I attempted a browser driven smoke test against the public Vercel app.

What worked:

- The live URL resolves through the browsing tool and reports the page title `SuperHero Powers Forge`.
- The public GitHub repo and current source files were readable.
- The source confirms the current deployed product includes the Hero Forge view, Taxonomy view, Data Sources view, unified power cards, origin picker, slot assignment, compare tray, saved drafts, filters, sorting, pagination, and imported power loading.

What did not work in this sandbox:

- Headless Chromium navigation to the Vercel URL was blocked by the execution environment.
- A direct shell network check could not resolve the Vercel host.
- Because of that, I could not complete true live click testing from Chromium inside this sandbox.

This file still gives Codex an actionable QA and implementation pass based on the live page metadata, the repo source, and the project docs. A final manual browser pass should still be run in a normal local Chrome session or Vercel preview.

## Executive summary

The app direction is strong. The main product model is correct: origin is separate from powers, powers are assigned into Primary, Secondary, and Utility roles, limitations are derived instead of manually selected, and the app is already structured around a unified canon plus imported power library.

The biggest unresolved issue is that the UI still exposes exact numeric scoring on cards. That directly conflicts with the newer ranking direction. Imported powers do not have enough ground truth for public `Score N` display. The UI should replace visible scores with readable ranking labels and keep numbers internal for sorting only.

The second issue is that ranking is still mostly runtime inference. The imported pool should be pre-enriched into JSON with ranking metadata, confidence, and evidence, then loaded by the app. That will make the UI faster, easier to audit, and easier to repair.

## What appears good

### 1. Product model is coherent

The app already follows the right high-level character creation shape:

```text
Origin
+ Primary Power
+ Secondary Powers
+ Utility Power
+ Story Constraint
= Coherent Hero Draft
```

The origin picker is separate from power cards, which is correct. Origin should explain how the hero got powers, not occupy a power slot.

### 2. Slot model is implemented

The UI has a visible slot strip for Primary, Secondary, and Utility. It excludes origin from normal power assignment, while the draft panel still tracks origin as part of the build checklist.

This matches the desired model.

### 3. Unified power library exists

Canon and imported powers use one normalized shape and one card component. That is the right foundation. Do not split imported cards into a separate visual system.

### 4. Large pool browsing is accounted for

The source shows support for:

- search
- category filter
- subcategory filter
- tier filter
- source filter
- recommended role fit filter
- stat filters
- sorting
- pagination
- page size control

That is the correct feature set for an 8,000 plus record imported library.

### 5. Compare tray exists

The compare tray is the right interaction pattern for selecting between similar powers. It should be preserved and polished, not removed.

### 6. Draft panel is product useful

The draft panel already includes:

- generated hero name
- classification
- slot count
- build checklist
- selected powers
- profile fields
- stats
- quality metrics
- strengths
- limits
- synergy
- interactions
- story hook
- name options
- export sheet
- saved drafts

This is a strong base for a character building app.

## High priority issues

### 1. Visible `Score N` must be removed from power cards

Current behavior exposes a card chip equivalent to:

```jsx
{power.tier} Score {power.score}
```

That is the most important UI issue.

Problem:

- Canon scores are hand-authored and more meaningful.
- Imported scores are inferred from weak signals.
- Displaying `Score 23` implies a false level of precision.
- Users will treat the number as an objective rank.

Fix:

Show readable labels instead:

```text
Advanced | Focused | High Risk | Best as Secondary | Inferred
```

Keep numeric values internal for sorting.

### 2. Ranking schema is inconsistent across docs

There is a naming conflict:

```js
ranking.rating
```

versus:

```js
ranking.tier
```

Use this final shape:

```js
ranking: {
  rating: "core" | "advanced" | "legendary",
  scope: "focused" | "versatile" | "expansive",
  riskLevel: "low" | "medium" | "high" | "extreme",
  bestRole: "primary" | "secondary" | "utility",
  confidence: "low-data" | "inferred" | "strong",
  popularityLabel: "known-pick" | "niche-pick" | "unproven",
  sortScore: 0,
  evidence: {
    categorySignals: [],
    subcategorySignals: [],
    statSignals: [],
    scopeSignals: [],
    riskSignals: [],
    popularitySignals: []
  }
}
```

Keep top-level `tier` for backward compatibility.

### 3. Confidence and popularity should stay separate

Do not merge these concepts.

Bad:

```text
Popularity / Confidence: Known Pick, Niche Pick, Low Data
```

Better:

```js
confidence: "low-data" | "inferred" | "strong"
popularityLabel: "known-pick" | "niche-pick" | "unproven"
```

Reason:

A power can be popular but poorly described. A power can also be obscure but have enough text evidence to rank confidently.

### 4. Runtime ranking should become precomputed enrichment

Current imported powers are normalized live through `buildImportedLibrary()` and `normalizeImportedPower()`.

That works for a scaffold, but it is not the best long-term architecture.

Add:

```text
scripts/enrich-power-rankings.mjs
```

Output:

```text
public/data/superpower-list-enriched.json
public/data/superpower-list-ranking-manifest.json
```

Then the app should load enriched data first and fall back to the old pool only if enriched data is missing.

### 5. Category fallback to `physical` is risky

The current category inference falls back to `physical` when text is weak or empty.

Problem:

- Thin imported powers may be mislabeled as Physical.
- Counts and origin recommendations become distorted.
- It hides uncertainty instead of surfacing it.

Fix options:

Preferred:

```js
category: "unknown"
confidence: "low-data"
```

If an `unknown` category is too disruptive, use:

```js
category: "physical"
ranking.evidence.categorySignals = []
ranking.confidence = "low-data"
ranking.flags = ["weak-category-evidence"]
```

### 6. Scope inference may over-label powers as expansive

Current broad scope patterns include terms such as:

```text
power
magic
technology
energy
system
control
create
adapt
transform
summon
```

These terms are too common. They can make normal powers look broader than they really are.

Fix:

Use weighted signals instead of simple broad-signal count.

Example:

```js
scopeSignals: [
  { term: "reality", weight: 5 },
  { term: "probability", weight: 5 },
  { term: "time", weight: 4 },
  { term: "dimension", weight: 4 },
  { term: "anything", weight: 4 },
  { term: "control", weight: 1 },
  { term: "power", weight: 1 }
]
```

Only classify as `expansive` when the weighted total crosses the threshold.

### 7. Role fit is too single-label right now

The app currently recommends one best slot. That is fine for a first pass, but the ranking pipeline should preserve role-fit scores internally.

Use:

```js
roleFit: {
  primary: 78,
  secondary: 64,
  utility: 42,
  bestRole: "primary"
}
```

UI can still show one readable label:

```text
Best as Primary
```

This makes sorting more reliable and makes future explanations easier.

### 8. Search is too literal for a large imported pool

Current search appears to use lowercase substring matching across power text.

Problems:

- No typo tolerance.
- No stemming beyond whatever text is already present.
- Multi-word intent can be weak.
- Tags are not normalized into first-class filter chips yet.

Fix:

Add a precomputed search index per power:

```js
searchText
searchTokens
tagTokens
subcategoryTokens
```

Then add ranked search behavior:

1. exact name match
2. name starts with
3. tag match
4. subcategory match
5. description match
6. fuzzy fallback

### 9. Imported data needs a content safety and quality pass

The imported pool includes user-generated power names, tags, descriptions, pros, and cons.

Potential issues:

- low quality text
- duplicate powers
- offensive text
- sexualized or unsafe tags
- meme powers
- copyrighted names or references
- powers that are too broad to be useful
- powers with no limits

Add fields:

```js
qualityFlags: []
contentFlags: []
requiresReview: boolean
```

Possible flags:

```text
thin-description
duplicate-likely
unsafe-language
copyright-reference
omni-power
adult-content
low-confidence-category
missing-drawbacks
```

### 10. Attribution should be more visible for imported details

The footer attribution is good. For imported powers, the detail panel should also show source attribution or source label.

Add to imported detail panel:

```text
Imported from Superpower List Database. Ranking is inferred guidance, not canon truth.
```

### 11. Saved drafts need schema migration

Saved drafts are stored in localStorage. Once ranking profiles are added, older saved drafts may not include `ranking`.

Add draft versioning:

```js
schemaVersion: 2
```

Add a migration function:

```js
migrateSavedDraft(savedDraft)
```

Rules:

- Preserve older saved drafts.
- Fill missing `ranking` from fallback functions.
- Do not crash if a power no longer exists in the current imported pool.

### 12. Assignment flow may surprise users

After assigning a power, the app automatically advances the active slot.

That can be useful, but it needs confirmation because the next click may assign to a different slot than the user expects.

Add visible feedback:

```text
Assigned Fire Control to Primary. Next slot: Secondary.
```

A compact toast or status region is enough.

### 13. Compare tray should allow direct role assignment

The compare tray currently assigns to the active slot. It should expose direct buttons:

```text
Set Primary | Set Secondary | Set Utility
```

This keeps comparison close to the decision.

### 14. The app needs browser QA automation

The docs mention missing testing strategy and UX flow docs. This is now a real need.

Add Playwright tests for:

- app loads
- imported pool count appears
- search filters cards
- category filter updates subcategory row
- subcategory filter works
- source filter works
- tier filter works
- stat filters work
- pagination works
- origin picker biases recommendations
- assigning primary works
- assigning secondary cap works
- utility assignment works
- duplicate power assignment moves instead of duplicates
- full details opens and closes
- compare tray maxes at four
- review mode shows selected powers even if filters hide them
- save draft, reload, load draft
- copy export sheet fallback behavior
- mobile layout at 390 px width
- keyboard tab order

## Medium priority polish

### 1. Add a ranking explanation tooltip

Each card should explain labels briefly:

```text
Advanced: inferred capability tier.
Focused: narrow enough to balance easily.
High Risk: needs limits, counters, or story constraints.
Best as Secondary: strongest as support, not signature.
Inferred: enough text to rank, not human reviewed.
```

### 2. Add a `Why this recommendation?` affordance

For recommended sorting, show why the top result appears first.

Example:

```text
Recommended because it matches Mutation / Gene, fits Primary, and has strong control.
```

### 3. Add empty state guidance per filter

Current generic no-match text is acceptable. Better would show active filters:

```text
No Mobility powers match Utility + Legendary + Max Risk 3.
Clear risk filter or broaden tier.
```

### 4. Make active slot impossible to miss

The slot strip exists, but the active slot should be repeated near the card action button and compare tray.

Example:

```text
Active assignment slot: Primary
```

### 5. Add a guided first build recipe

For first-time users, a small preset can reduce friction:

```text
Try a balanced starter build:
Origin: Accident
Primary: Fire Control
Secondary: Invulnerability
Utility: Flight
Constraint: Fire control fails in low oxygen.
```

### 6. Add duplicate detection for imported powers

Many imported powers are likely variants of common concepts.

Add:

```js
duplicateClusterId
canonicalDuplicateName
similarityScore
```

Then UI can show:

```text
Similar powers exist
```

### 7. Add hidden audit drawer for maintainers

For imported powers, Codex should add a developer-facing debug drawer or JSON view gated behind a URL flag.

Example:

```text
?debugRankings=1
```

Shows:

- raw source ID
- source text
- category signals
- stat signals
- scope signals
- risk signals
- sort score
- confidence reason

## Recommended implementation order for Codex

### Phase 1: Remove fake precision

1. Add a `getPowerRankingProfile(power)` fallback helper.
2. Render ranking badge labels on the card.
3. Remove visible `Score N` from all user-facing card locations.
4. Keep `score` and `sortScore` internal.
5. Add tests that assert no rendered card includes `Score `.

### Phase 2: Add enriched ranking data

1. Create `scripts/enrich-power-rankings.mjs`.
2. Read `public/data/superpower-list-pool.json`.
3. Generate `public/data/superpower-list-enriched.json`.
4. Generate `public/data/superpower-list-ranking-manifest.json`.
5. Add evidence arrays.
6. Add confidence and quality flags.
7. Update `useImportedLibrary()` to load enriched data first.
8. Fall back to current pool if enriched data is unavailable.

### Phase 3: Improve sorting

1. Add role-fit score object.
2. Make `Recommended` sort use role fit, confidence, origin fit, and balance.
3. Keep origin fit as a sorting boost, not a mutation of the ranking profile.
4. Add tests for active slot sorting changes.

### Phase 4: Add QA coverage

1. Add Playwright.
2. Add smoke tests.
3. Add mobile layout tests.
4. Add saved draft tests.
5. Add no-match and fallback tests.
6. Add accessibility checks.

### Phase 5: Add operational docs

Write these docs next:

```text
docs/import-runbook.md
docs/deployment-runbook.md
docs/testing-strategy.md
docs/ux-flows.md
docs/security-privacy.md
docs/performance-plan.md
docs/accessibility-checklist.md
docs/release-checklist.md
```

## Browser smoke test checklist for a normal Chrome pass

Run this manually on Vercel after Codex changes:

```text
1. Open https://hero-forge-workshop.vercel.app
2. Confirm the title and hero panel render.
3. Confirm library count reaches 8,546 or the expected manifest count.
4. Confirm imported attribution appears.
5. Search for fire.
6. Confirm results update.
7. Select Elemental.
8. Confirm subcategory chips appear.
9. Select Fire.
10. Confirm only fire-related results remain.
11. Clear filters.
12. Select origin Accident.
13. Confirm suggested categories appear.
14. Assign Fire Control to Primary.
15. Confirm active slot advances with a visible assignment message.
16. Assign Invulnerability to Secondary.
17. Assign Flight to Utility.
18. Add a story constraint.
19. Confirm quality and limits update.
20. Open full details on a card.
21. Close full details.
22. Pin four powers to Compare.
23. Try pinning a fifth and confirm the tray remains capped at four.
24. Use Review all selected powers.
25. Confirm selected powers appear even if current filters would hide them.
26. Save draft.
27. Reload browser.
28. Confirm saved draft persists.
29. Load saved draft.
30. Copy export sheet.
31. Test at 390 px mobile width.
32. Tab through all controls using keyboard only.
```

## Acceptance criteria for the ranking refactor

A refactor is successful when:

- No public card shows `Score N`.
- Cards show rating, scope, risk, role fit, confidence, and popularity label.
- Imported rankings include evidence.
- Missing ranking data falls back without crashing.
- Saved drafts from the old schema still load.
- Recommended sorting changes when active slot changes.
- Origin fit boosts sorting but does not mutate the power profile.
- Imported data can be regenerated with one command.
- Generated ranking output has a manifest.
- Unit tests cover ranking labels.
- Browser tests cover basic build flow.
- Vercel build still passes.

## Best polished product wording

Use this in the UI or docs:

```text
Imported power rankings are guidance, not objective truth.
The app uses hidden numeric values for sorting, but displays readable labels so users understand capability, scope, risk, role fit, and confidence without pretending every power has a precise universal score.
```

Card example:

```text
Advanced | Focused | High Risk | Best as Secondary | Inferred | Niche Pick
```

## Final recommendation

Do not spend more time trying to perfect `Score N`. Replace public scores with a ranking profile now. Then move the imported ranking logic into a deterministic enrichment script with evidence and confidence. That single change will make the app feel like a real character-building tool instead of a spreadsheet wrapped in cards.
