# Hero Forge Workshop Blindspots And Missing Work Review

Date: 2026-05-18

Purpose: identify what is missing, overlooked, or risky in the current ranking and project direction, then give Codex a clear Markdown handoff for what to fix next.

Source docs reviewed:

- `project-ssot.md`
- `ranking-pipeline.md`
- `data-dictionary.md`
- `design.md`
- `documentation-map.md`
- `power-catalog-taxonomy.md`
- `character-creation-model.md`
- `user-guide.md`

## Executive Verdict

The proposed direction is correct: stop presenting imported powers as if they have precise public numeric rankings. Use a deterministic enrichment pipeline, keep numeric scores internal, and show readable labels.

The major blindspot is that the current plan is too focused on replacing `Score N` with badges. That is necessary, but not enough.

The project also needs:

1. A stable ranking data contract.
2. Audit metadata for the enrichment pipeline.
3. Dataset hygiene and moderation rules.
4. Role-fit scoring per slot, not just one `bestRole` value.
5. A migration path from current `tier`, `score`, and `popularity` fields.
6. Performance guardrails for the 8,000+ published imported powers.
7. Testing, fallback behavior, release checks, and runbooks.
8. UX handling for edge states, low confidence, hidden scores, and broad powers that require constraints.

## Highest Priority Fixes

| Priority | Issue | Why It Matters | Codex Action |
| ---: | --- | --- | --- |
| 1 | `ranking.tier` vs `ranking.rating` naming drift | The docs use both concepts. This will create implementation confusion. | Use `ranking.rating` in new code. Keep top-level `tier` for backward compatibility. Optionally read `ranking.tier` as a fallback only. |
| 1 | `bestRole` is too shallow | A power can be good as Primary and Utility for different reasons. | Store per-slot role fit scores and labels, then derive `bestRole`. |
| 1 | No enrichment audit metadata | Future reruns may silently change labels with no trace. | Add `schemaVersion`, `pipelineVersion`, `rulesetVersion`, `generatedAt`, and `inputHash`. |
| 1 | Evidence arrays are underspecified | Plain string evidence is hard to debug and test. | Store structured evidence objects with field, match, weight, and reason. |
| 1 | Popularity may be sparse or misleading | Raw `preferenceRatio` can overrate records with few comparisons. | Use Bayesian or Wilson-style smoothing and expose `comparisonCount`. |
| 1 | Content quality and safety are not covered enough | Imported community data can contain adult, abusive, low-quality, spammy, or story-breaking content. | Add `contentFlags`, `qualityFlags`, and default hiding rules for flagged records. |
| 2 | Performance plan is too general | Enriched evidence can make JSON large and sorting expensive. | Precompute search fields, use slim UI payloads, consider chunking and Web Worker search. |
| 2 | Saved draft migration is not defined | Old saved drafts may not include ranking metadata. | Version saved draft schema and handle missing ranking gracefully. |
| 2 | UI edge states are not fully specified | Users need clear feedback when filters hide selected powers, import data fails, or enriched data is missing. | Add explicit empty, loading, fallback, and review states. |
| 2 | Accessibility is documented but not verified | Design says accessible, but test coverage is missing. | Add keyboard, focus, contrast, aria, and reduced-motion checks. |
| 3 | Missing operational docs | Import, deployment, testing, curation, performance, and release processes are still underdocumented. | Add runbooks and release checklist before treating this as production-stable. |

## Main Blindspots

### 1. Ranking Contract Is Not Yet Stable

Current docs point in the right direction, but they do not yet define one final schema.

The conflict:

- Some wording says `rating`: `core`, `advanced`, `legendary`.
- The ranking pipeline target shape says `ranking.tier`.
- Current normalized powers already have top-level `tier`.

Recommended decision:

```js
power.tier = "core" | "advanced" | "legendary"; // legacy and compatibility
power.ranking.rating = "core" | "advanced" | "legendary"; // new display label
```

Migration rule:

```js
const rating = power.ranking?.rating ?? power.ranking?.tier ?? power.tier ?? "core";
```

Write only `ranking.rating` in new enriched JSON. Read `ranking.tier` only as an old-data fallback.

### 2. `bestRole` Should Be Derived, Not The Whole Role Model

The target shape currently has one `bestRole` value. That loses useful information.

A power can be:

- Strong as Primary because it defines the hero identity.
- Useful as Utility because it solves field problems.
- Risky as Secondary because it broadens the kit too much.

Recommended shape:

```js
ranking: {
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
  }
}
```

Then `bestRole` becomes a display shortcut, not the only source of truth.

### 3. Confidence And Popularity Need Separate Fields

Do not combine confidence and popularity.

They answer different questions:

- `confidence`: how reliable is the inference?
- `popularity`: how known or preferred is this power in the imported comparison data?

Recommended shape:

```js
ranking: {
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
  }
}
```

This avoids overrating a power with a high ratio but only one or two comparisons.

### 4. Evidence Needs To Be Structured And Testable

Current docs say to attach evidence, but do not fully specify the evidence object.

Avoid this:

```js
evidence: {
  scopeSignals: ["time", "reality", "anything"]
}
```

Prefer this:

```js
evidence: {
  scopeSignals: [
    {
      field: "description",
      match: "anything",
      weight: 4,
      reason: "broad all-purpose language increases scope"
    }
  ],
  riskSignals: [
    {
      field: "tags",
      match: "reality",
      weight: 3,
      reason: "reality-level power raises story balance risk"
    }
  ]
}
```

This makes the pipeline auditable and allows tests to assert why a label was assigned.

### 5. Risk Is Too Broad As One Number

The current `risk` stat is useful, but the system should explain what type of risk it found.

Recommended risk tags:

```js
risk: {
  score: 9,
  level: "extreme",
  tags: [
    "story-breaking",
    "collateral-damage",
    "privacy-risk",
    "moral-risk",
    "condition-dependent",
    "low-drawback-text"
  ]
}
```

This matters because `Fire Control`, `Telepathy`, and `Reality Warping` can all be high risk for completely different reasons.

### 6. Broad Powers Need A Constraint Requirement Flag

The character model already says expansive powers need hard rules. The ranking profile should make this explicit.

Recommended field:

```js
ranking: {
  constraint: {
    requiredForPrimary: true,
    reason: "expansive scope with high risk",
    suggestedConstraintTypes: ["range", "cooldown", "line-of-sight", "emotional-cost"]
  }
}
```

UI behavior:

- If an expansive or extreme-risk power is assigned as Primary and no story constraint exists, show a clear warning.
- Do not block the user outright.
- Mark the draft as incomplete or lower balance until the constraint is added.

### 7. Dataset Hygiene Is Under-Specified

The imported dataset is large and community-generated. The docs already acknowledge weak precision, but more cleanup rules are needed.

Add import or enrichment checks for:

- Duplicate names.
- Near-duplicate names.
- Empty descriptions.
- Thin descriptions.
- Broken spelling or nonsense text.
- Spammy tags.
- Powers that say `anything`, `everything`, `omnipotent`, `all powers`, or similar.
- Names that are too long.
- Descriptions that are too long for cards.
- Records with no useful pros, cons, tags, or comparisons.
- Imported records whose category confidence is too weak.

Recommended fields:

```js
quality: {
  flags: ["thin-description", "possible-duplicate", "overbroad-language"],
  duplicateGroupId: "optional-group-key",
  categoryConfidence: 0.72,
  textQualityScore: 0.64
}
```

### 8. Content Moderation And User-Generated Data Risks Are Missing

The imported pool can include privacy-invading, adult, abusive, low-quality, or unsafe themes. The app should not blindly display every imported record the same way.

Add content flags during import or enrichment:

```js
content: {
  flags: [
    "adult-context",
    "privacy-violation",
    "graphic-violence",
    "hate-or-harassment",
    "real-world-harm",
    "profanity",
    "copyright-risk"
  ],
  defaultVisible: false,
  moderationReason: "privacy-invasive context detected"
}
```

Default product rule:

- Canon and reviewed imported records are visible by default.
- Imported records with serious content flags should be hidden by default.
- Low-quality imported records can remain searchable only if the user explicitly includes low-confidence or unreviewed data.

This is a major blindspot because the source is not curated app canon.

### 9. Source Attribution And Licensing Need A Formal Check

The data dictionary stores source IDs, timestamps, username, and comparison stats. The docs mention source ownership, but the app still needs a clearer attribution and licensing posture.

Add `docs/source-attribution.md` or `docs/data-governance.md` covering:

- Original data source name.
- What fields are imported.
- Whether source usernames should display in the UI.
- Whether source descriptions can be copied verbatim.
- How attribution appears in the app.
- How to remove or suppress problematic records.
- Whether generated or curated powers can be promoted to app canon.

Recommended data rule:

```text
Keep source username in raw data only unless attribution requires display. Do not use username as a ranking signal.
```

### 10. Enriched JSON Should Not Ship Full Debug Evidence By Default

Full evidence is useful for audits but may make the public data file too large.

Use two files:

```text
public/data/superpower-list-enriched.json
public/data/superpower-list-ranking-audit.json
```

The UI file should contain compact display fields:

```js
ranking: {
  rating: "advanced",
  scope: "focused",
  riskLevel: "high",
  bestRole: "secondary",
  confidenceLabel: "inferred",
  popularityLabel: "niche-pick",
  sortScore: 72,
  evidenceSummary: ["telepathy signal", "privacy risk", "thin comparison data"]
}
```

The audit file can contain full evidence arrays for debugging and tests.

### 11. Sorting Needs Stable Tie-Breakers

If many imported records share similar inferred stats, sorting can feel random.

Every sort mode should have deterministic tie-breakers.

Recommended tie-break order:

```text
primary sort value
then confidence score
then smoothed popularity score
then category name
then power name A-Z
then sourceId
```

For `Recommended`, use:

```text
slot role fit
+ origin category fit
+ useful stat score
+ confidence score
+ smoothed popularity score
- risk penalty
- low quality penalty
```

Do not show the final number publicly.

### 12. `Most Popular` Needs Smoothed Math

Raw `preferenceRatio` is not enough.

Problem example:

```text
Power A: 1 win, 0 losses, ratio 1.00
Power B: 80 wins, 20 losses, ratio 0.80
```

Power A should not automatically sort above Power B.

Use a smoothed score such as:

```js
const alpha = 5;
const beta = 5;
const smoothedPopularity = (timesPreferred + alpha) / (totalComparisons + alpha + beta);
```

Then use `totalComparisons` to assign popularity label:

```text
Known Pick: enough comparisons and good smoothed score
Niche Pick: some evidence but limited comparison volume
Unproven: little or no comparison evidence
```

### 13. UI Needs To Explain Hidden Ranking Without Reintroducing Fake Precision

The user should understand why a power is recommended without seeing a fake exact score.

Card display should use compact labels:

```text
Advanced | Focused | High Risk | Best as Secondary | Inferred
```

Optional tooltip or details drawer:

```text
Why this recommendation?
- Strong utility and control signals.
- Privacy risk raised the risk level.
- Imported record has limited comparison data.
```

Do not show:

```text
Score 23
Rank #416 of 8,546
Objectively better than X
```

### 14. UX Edge States Need To Be Written Down

Add explicit UX rules for:

- No search results.
- Selected power hidden by current filters.
- Imported JSON fetch failure.
- Enriched JSON missing or stale.
- Ranking profile missing on some records.
- Low confidence power assigned as Primary.
- Expansive Primary selected without story constraint.
- Compare tray full.
- Secondary slots full.
- Review mode active.
- Local storage unavailable.
- User clears origin after selecting powers.
- User changes active slot after filtering by role.

These should go into `docs/ux-flows.md` and tests.

### 15. Saved Drafts Need Schema Versioning

Saved drafts are stored locally in the browser. If the data model changes, old saved drafts may lack ranking fields.

Recommended saved draft shape:

```js
savedDraft: {
  schemaVersion: 2,
  savedAt: "2026-05-18T00:00:00.000Z",
  build: {},
  selectedPowerIds: [],
  sourceSnapshot: {
    appVersion: "optional",
    rankingSchemaVersion: 1,
    importedManifestHash: "optional"
  }
}
```

Migration rule:

- Never assume saved selections include full ranking metadata.
- Rehydrate saved powers from current library by ID.
- If a selected imported power no longer exists, show a missing-power placeholder in review mode.

### 16. Accessibility Needs Testable Acceptance Criteria

The design doc states accessibility principles, but the project needs verification.

Add checks for:

- Keyboard-only browsing.
- Focus order through filters, cards, compare tray, and builder.
- Visible focus ring on all actionable controls.
- `aria-live` count updates for selected powers.
- Card buttons with clear accessible names.
- Color not being the only risk or confidence signal.
- Reduced-motion behavior.
- Screen reader labels for stat bars.
- Pagination controls with current page announcement.
- Mobile tap targets.

Recommended test tooling:

```text
unit tests for data logic
component tests for labels and states
browser smoke tests for keyboard flow
manual screen reader checklist before release
```

### 17. Performance Needs Hard Budgets

Current data size is manageable, but the project is already near the point where naive filtering and sorting can feel slow on weaker devices.

Define budgets:

| Area | Target |
| --- | ---: |
| Initial app data payload | Keep under a chosen budget, such as 2 MB compressed, or document exception |
| Search/filter response | Under 100 ms after data is loaded |
| Sort response | Under 150 ms for the full published pool |
| First useful render | Avoid blocking on full ranking audit data |
| Card render count | Render only current page or use virtualization |

Recommended implementation:

- Precompute lowercase search text.
- Precompute normalized category, subcategory, ranking, and role fit.
- Memoize filter and sort results.
- Do not sort inside render loops.
- Consider a Web Worker for search if the dataset grows.
- Split full audit evidence from the UI payload.
- Consider category-chunked JSON if imported records grow beyond current size.

### 18. Testing Strategy Needs Golden Fixtures

The ranking pipeline needs stable fixtures so future changes do not silently degrade labels.

Add fixtures for:

| Fixture | Expected Result |
| --- | --- |
| `Fire Control` | Core, Focused, High or Extreme risk, Primary |
| `Flight` | Core, Focused, Low or Medium risk, Utility |
| `Telepathy` | Advanced, Focused, High risk, Primary |
| `Portal Creation` | Legendary, Expansive, Extreme risk, Utility or Primary depending logic |
| `Reality Warping` style imported power | Legendary, Expansive, Extreme risk, requires constraint |
| Thin imported power with weak text | Low-data confidence |
| Imported power with high ratio but low comparison count | Not `known-pick` |
| Duplicate imported power names | Duplicate quality flag |

Add tests for:

- Deterministic enrichment output.
- Category inference evidence.
- Subcategory inference evidence.
- Risk level thresholds.
- Scope labels.
- Confidence labels.
- Smoothed popularity.
- Role fit per slot.
- Fallback when `ranking` is missing.
- UI hiding of `sortScore`.
- Sort tie-breakers.

### 19. Rollback Should Be A Feature Flag, Not Only A Manual Revert

The ranking pipeline rollout is supposed to be additive. Make rollback operational.

Recommended flag:

```js
const USE_ENRICHED_RANKING = import.meta.env.VITE_USE_ENRICHED_RANKING !== "false";
```

Fallback behavior:

```text
If enriched ranking is available, use it.
If enriched ranking is missing, derive labels from existing tier, stats, score, and recommended slot.
If enriched JSON fails to load, load the current imported pool.
If both fail, show canon powers and an imported-data warning.
```

### 20. Documentation Map Is Missing Ranking-Specific Ops Docs

The documentation map already lists several missing docs. Add these ranking-specific docs too:

| Doc | Proposed File | Why It Matters |
| --- | --- | --- |
| Ranking enrichment runbook | `docs/ranking-enrichment-runbook.md` | Exact command, outputs, validation, rollback |
| Ranking schema contract | `docs/ranking-schema.md` | Prevents naming drift and field confusion |
| Data governance and moderation | `docs/data-governance.md` | Handles imported user-generated data safely |
| Saved draft migration | `docs/saved-draft-migrations.md` | Prevents local-storage data loss |
| Ranking QA fixtures | `docs/ranking-fixtures.md` | Keeps expected behavior stable over time |

## Recommended Final Ranking Schema

Use this as the target contract for Codex.

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
    tags: []
  },

  bestRole: "primary" | "secondary" | "utility",
  roleFit: {
    primary: { score: 0, label: "weak" | "usable" | "strong", reasons: [] },
    secondary: { score: 0, label: "weak" | "usable" | "strong", reasons: [] },
    utility: { score: 0, label: "weak" | "usable" | "strong", reasons: [] }
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
    categoryConfidence: 0,
    textQualityScore: 0,
    duplicateGroupId: null
  },

  content: {
    flags: [],
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

For the public UI payload, `evidence` can be omitted or moved to a separate audit file.

## UI Label Recommendation

Cards should show a compact metadata row:

```text
Advanced | Focused | High Risk | Secondary Fit | Inferred
```

For low-confidence imported powers:

```text
Advanced | Expansive | Extreme Risk | Primary Fit | Low Data
```

For powers requiring story constraints:

```text
Needs Constraint
```

Use a detail drawer or tooltip for short reasons.

Do not show:

- Exact internal score.
- Global rank number.
- Claims that one power is objectively best.
- Raw comparison math unless the user opens details.

## Codex Implementation Plan

### Phase 1: Stabilize Schema

1. Add `docs/ranking-schema.md`.
2. Decide `ranking.rating` as the canonical new field.
3. Keep top-level `tier`, `score`, and `popularity` until migration is complete.
4. Update `data-dictionary.md` to include `ranking`, `quality`, and `content` fields.
5. Add fallback helper:

```js
export function getRankingLabel(power) {
  return {
    rating: power.ranking?.rating ?? power.ranking?.tier ?? power.tier ?? "core",
    scope: power.ranking?.scope ?? inferScopeFallback(power),
    riskLevel: power.ranking?.risk?.level ?? power.ranking?.riskLevel ?? inferRiskLevel(power.stats?.risk),
    bestRole: power.ranking?.bestRole ?? getRecommendedSlot(power),
    confidence: power.ranking?.confidence?.label ?? power.ranking?.confidence ?? "inferred"
  };
}
```

### Phase 2: Build Enrichment Pipeline

1. Add `scripts/enrich-power-rankings.mjs`.
2. Read canon powers and imported pool.
3. Normalize text from name, overview, description, pros, cons, and tags.
4. Infer category, subcategory, stats, scope, rating, risk, role fit, confidence, popularity, quality, and content flags.
5. Write:

```text
public/data/superpower-list-enriched.json
public/data/superpower-list-ranking-audit.json
public/data/superpower-list-ranking-manifest.json
```

6. Add command:

```json
{
  "scripts": {
    "rank:powers": "node scripts/enrich-power-rankings.mjs"
  }
}
```

### Phase 3: Wire UI Without Breaking Existing Data

1. Load enriched JSON first.
2. Fall back to current imported pool if enriched JSON fails.
3. Replace visible score chip with readable badges.
4. Keep sorting numeric and internal.
5. Add label helper functions so `App.jsx` does not contain ranking logic.
6. Add detail display for evidence summary.
7. Add story-constraint warning for expansive or extreme-risk Primary powers.

### Phase 4: Add Tests

Add tests for:

- Ranking schema compatibility.
- Deterministic enrichment.
- Smoothed popularity.
- Low-data confidence.
- Extreme-risk broad powers.
- Per-slot role fit.
- UI score hiding.
- Fallback behavior when ranking is missing.
- Content flag hiding.
- Saved draft rehydration.

### Phase 5: Add Operational Docs

Add or update:

- `docs/ranking-schema.md`
- `docs/ranking-enrichment-runbook.md`
- `docs/import-runbook.md`
- `docs/testing-strategy.md`
- `docs/data-governance.md`
- `docs/performance-plan.md`
- `docs/ux-flows.md`
- `docs/release-checklist.md`

## Acceptance Criteria

Codex should not consider the work complete until all of these pass:

- No user-facing card displays `Score N`.
- Sorting still works for recommended, balance, popularity, risk, utility, primary, secondary, and A-Z.
- Enriched ranking data is generated by a deterministic script.
- Every enriched record has `schemaVersion`, `pipelineVersion`, `rating`, `scope`, `risk`, `bestRole`, `confidence`, and `sort` fields.
- Imported records with thin evidence become `low-data` rather than overconfident labels.
- Popularity uses smoothed comparison math, not raw ratio only.
- Expansive or extreme-risk Primary powers trigger a story-constraint warning.
- Missing enriched data falls back to existing normalization without crashing.
- Saved drafts load even if stored before the ranking schema change.
- Tests cover ranking labels, sorting, fallback, and key UX edge states.
- Documentation updates explain how to regenerate rankings and roll back if needed.

## Things Not To Do

Do not:

- Use an LLM to rank all powers live in the browser.
- Show exact internal numeric scores to users.
- Collapse confidence and popularity into one field.
- Replace authored canon stats with inferred values.
- Treat imported powers as reviewed canon.
- Store massive debug evidence in the main UI payload unless performance is verified.
- Remove old `tier`, `score`, or `popularity` fields before compatibility tests pass.
- Build ranking logic directly into `App.jsx`.
- Ignore content flags just because the source data is public.

## Final Polished Direction

Hero Forge should treat rankings as guidance, not truth.

The app should precompute an explainable ranking profile for every power. Public UI should show compact labels such as:

```text
Advanced | Focused | High Risk | Secondary Fit | Inferred
```

The app should sort by hidden deterministic numbers, but it should never present those numbers as objective power rankings.

The ranking pipeline should be auditable, versioned, testable, and conservative. Broad powers should be clearly marked as risky and should trigger story-constraint guidance when used as Primary powers. Imported powers should carry confidence, popularity, content, and quality signals so users can distinguish strong curated guidance from weak or noisy imported data.

The next real milestone is not just replacing the score chip. The next milestone is a complete enrichment layer with schema, pipeline, tests, fallback behavior, moderation flags, and documentation.
