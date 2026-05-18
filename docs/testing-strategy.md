# Testing Strategy

This document maps current test coverage to product risk and defines the missing test layers.

## Current Test Command

```bash
npm run test
```

Current test file:

```text
src/utils/powerModel.test.js
```

Current coverage focuses on pure model logic:

- base catalog validation
- category grouping/filtering
- score calculation
- data source validation
- imported power filtering
- manifest loading
- origin modeling
- slot assignment
- draft generation
- synergy
- checklist behavior
- unified library normalization/filtering
- subcategory counts
- slot-fit recommendations
- scope classification

## Required Pre-Release Checks

Run:

```bash
npm run docs:powers
npm run typecheck
npm run test
npm run test:e2e
npm run lint
npm run build
```

For UI changes, inspect any Playwright failure trace before release.

## Test Layers

| Layer | Current State | Needed |
| --- | --- | --- |
| Unit/model | Good baseline | Add ranking profile tests when implemented |
| Import pipeline | Partial via manifest test | Add script-level validation for output shape and counts |
| React component | Missing | Add tests for slot assignment, review mode, origin picker, saved drafts |
| Browser smoke | Started | Expand Playwright coverage for mobile, saved drafts, fallback, and accessibility flows |
| Accessibility | Manual/informal | Add keyboard/focus/contrast checks |
| Performance | Missing | Add large-library filter timing budget |
| Deployment | Manual | Add release checklist and production smoke steps |

## High-Risk Behaviors To Test

### Power Assignment

Expected:

- Primary holds one power.
- Secondary holds up to three.
- Utility holds one.
- Reassigning a power moves it instead of duplicating it.
- Origin does not count as a power.
- Limitation cannot be assigned as a power.

### Review Mode

Expected:

- Review all selected powers shows selected powers even when filters would hide them.
- Review Primary shows the selected Primary.
- Review Secondary shows selected Secondary powers.
- Review Utility shows selected Utility.
- Review mode can be cleared.

### Filters

Expected:

- Search combines with category, subcategory, source, tier, slot fit, and stat filters.
- Category change resets subcategory.
- Empty result state can clear filters.
- Pagination clamps to valid page.

### Origin Bias

Expected:

- Selecting origin changes recommendation ordering.
- Origin fit does not hide non-matching powers.
- Origin source appears in the draft/checklist.

### Draft Quality

Expected:

- Empty draft quality is `0`.
- Quality increases with origin/profile/powers/limits.
- Derived limits come from weaknesses and story constraint.
- Broad Primary powers produce guidance when limits are weak.

### Saved Drafts

Expected:

- Save only works when at least one power is selected.
- Saved draft stores `heroBuild`.
- Load restores origin, profile fields, selected powers, and slots.
- Stale saved powers rehydrate from the current library record by ID.
- Missing saved powers are preserved as legacy fallbacks instead of being dropped.
- Delete removes one draft.
- LocalStorage failures should not crash the app in future hardened behavior.

## Playwright Smoke Test

Run:

```bash
npm run test:e2e
```

Current automated coverage:

- app loads enriched library
- public `Score N` chips are absent
- risk/ranking labels render
- search finds a power
- Primary assignment shows visible status feedback
- compare tray can assign directly to Utility
- mobile viewport loads, searches, and keeps the forge panel reachable
- save/load draft smoke path persists one selected power and reloads it from LocalStorage
- stale saved draft powers rehydrate to current catalog records on load
- review-all mode shows selected powers even after filters/search would otherwise hide them
- keyboard focus can open and close a power detail popover
- keyboard-only search and primary assignment works
- long imported power names wrap instead of clipping at mobile width

Additional browser flows still needed:

1. Select an origin.
2. Assign Primary, Secondary, and Utility.
3. Reload a saved draft with origin and profile fields.
4. Add full keyboard traversal around filters, assignment buttons, compare tray, and Hero draft.
5. Add screenshot checks for mobile clipping regressions.

Mobile smoke is now automated at a basic level. It still needs visual screenshot checks for card clipping and sticky-panel regressions.

## Ranking Tests To Add Later

When `power.ranking` exists:

- category evidence contains matched terms
- confidence labels match data richness
- risk labels match risk stat and drawback text
- broad powers classify as expansive
- active-slot recommendation uses ranking profile
- origin fit boosts sorting but does not mutate ranking

## Performance Budget

Current filter cost is acceptable for roughly 8,500 loaded powers. If imported data grows materially:

- precompute ranking at import time
- chunk imported data by category/source
- add indexed search
- avoid recomputing normalized powers in render loops

Target interaction budget:

- filter update under 100ms on normal desktop hardware
- no layout shift when paging
- no browser lockup when clearing filters
