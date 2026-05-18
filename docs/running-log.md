# Running Log

This is the working log for active Hero Forge Workshop changes. Add short entries when project direction, architecture, data contracts, or operational workflow changes.

## 2026-05-18

### Documentation Foundation

- Added `docs/project-ssot.md` as the project source of truth.
- Added `docs/power-catalog-taxonomy.md` and `scripts/generate-power-taxonomy-doc.mjs`.
- Added `npm run docs:powers`.
- Updated stale origin/limitation language in README, design docs, and ADR 0004.

### Product Model

- Confirmed origin is not a power.
- Confirmed powers are assigned only to Primary, Secondary, and Utility.
- Confirmed limitations are derived from selected power weaknesses and optional story constraints.
- Confirmed public numeric ranking should be replaced by readable labels.

### Documentation Expansion

- Added user guide, data dictionary, ranking pipeline, and character creation model.
- Added import runbook, deployment runbook, testing strategy, UX flows, and release checklist.
- Added documentation map/backlog.
- Added type-safety baseline.

### External Review Integration

- Reviewed GPT 5.5 Pro ranking handoff and blindspots review.
- Adopted `ranking.rating` as the new ranking field; top-level `tier` remains for compatibility.
- Split confidence and popularity into separate ranking concepts.
- Added future enrichment path to import/release docs.
- Added external handoff path to SSOT and documentation map.

### Logging

- Added `src/utils/logger.js` structured JSON logger.
- Added logger tests.
- Wired logger into imported-library load failure and saved-draft LocalStorage failures.

### Runtime Guards

- Added `src/utils/runtimeGuards.js`.
- Added published imported record filtering before normalization.
- Added saved draft normalization with `schemaVersion`.
- Added runtime guard tests.

### Ranking Enrichment

- Added `src/utils/rankingModel.js`.
- Added `scripts/enrich-power-rankings.mjs`.
- Added `npm run enrich:powers` and `npm run refresh:powers`.
- Generated enriched imported ranking payload, audit payload, and ranking manifest.
- Added ranking model tests for smoothed popularity, risk labels, scope, constraints, role fit, and audit stripping.
- Compacted public ranking payload so full structured evidence stays in the audit file.
- Replaced public card `Score N` display with rating, role-fit, risk, and confidence labels.
- Wired the app loader to try enriched imported powers first and fall back to the original imported pool.
- Added imported-source attribution to full power details.
- Added assignment status feedback after slot assignment and draft load.
- Added direct Primary/Secondary/Utility assignment buttons in the compare tray.

### Browser QA

- Added Playwright config and `npm run test:e2e`.
- Added smoke tests for enriched library load, no public `Score N`, primary assignment feedback, and compare-tray direct utility assignment.
- Verified the initial e2e suite passes locally.
- Added mobile viewport smoke coverage for library search and forge-panel reachability.

### Governance And Release Maturity

- Added `docs/data-governance.md`.
- Added `docs/saved-draft-migrations.md`.
- Added `docs/performance-plan.md`.
- Added `docs/accessibility-checklist.md`.
- Updated the documentation map and testing strategy to reflect the new release docs.
- Added `docs/curation-workflow.md`.
- Added `docs/security-privacy.md`.
- Added `docs/troubleshooting.md`.
- Added Playwright smoke coverage for saving, clearing, and loading a one-power draft.
- Added `docs/ai-generation-plan.md`.
- Added `docs/content-quality-filters.md`.
- Added `docs/mobile-visual-qa.md`.
- Added Playwright smoke coverage for review-all selected powers after filters would otherwise hide the selection.
- Implemented first-pass `ranking.quality` metadata and combined quality/content visibility reasons in the enrichment pipeline.
- Added hidden record counts and hidden reason counts to the ranking manifest.
- Surfaced the imported quality-gate hidden count in the Forge hero metric and Data Sources view.
- Added Playwright smoke coverage for ranking-manifest quality-gate display.
- Guarded quality-gate UI so hidden counts only appear on the Forge overview when the enriched payload is active.
- Added Playwright smoke coverage for raw imported-pool fallback when the enriched payload is unavailable.
- Added `npm run audit:powers` to validate generated power payload counts and gzip budgets.
- Added Playwright keyboard smoke coverage for opening and closing a power detail popover.
- Added `npm run verify` as the consolidated release gate.
- Updated deployment docs to use `npm run verify`.
- Added Playwright artifact folders to `.gitignore`.
- Added `docs/mvp-stabilization-report.md` with checkpoint, preview URL, verification state, data state, risks, next steps, and rollback.
- Added `PLAYWRIGHT_BASE_URL` support for running Playwright smoke tests against deployed preview URLs.
- Attempted remote Playwright smoke against the Vercel preview; blocked by Vercel Deployment Protection login page.
- Added `VERCEL_AUTOMATION_BYPASS_SECRET` support for Playwright through Vercel's `x-vercel-protection-bypass` header.
- Recalibrated ranking v1 display labels so imported powers spread more usefully across core/advanced/legendary, risk, and confidence buckets.
- Added ranking distribution summaries to the generated ranking manifest and power asset audit output.
- Added per-power ranking rationale to imported power detail popovers, including rating, risk, recommended fit, confidence, and evidence summary chips.
- Added Playwright smoke coverage for imported ranking rationale visibility.
- Verified the ranking-rationale checkpoint with `npm run verify`: asset audit, 52 unit tests, 10 browser smoke tests, lint, and production build all passed.
- Pushed commit `0da1fee` and created preview deployment `https://hero-forge-workshop-bvlwgpqa8-kxd395s-projects.vercel.app`.
- Added compact `public/data/superpower-list-hidden-review.json` so hidden imported records can be reviewed without loading the full ranking audit payload in the browser.
- Added Data Sources admin UI for hidden-record review, including reason filters and evidence summaries.
- Updated the power asset audit to validate hidden-review count and gzip budget.
- Verified the hidden-review checkpoint with `npm run verify`: asset audit, 52 unit tests, 10 browser smoke tests, lint, and production build all passed.
- Compacted the public ranking payload by removing heavy audit/sort fields from `ranking` while keeping labels, visibility, constraints, and evidence summaries in the browser payload.
- Reduced `public/data/superpower-list-enriched.json` from `16.95 MB` raw / `3.02 MB` gzip to `13.19 MB` raw / `2.64 MB` gzip.
- Added category-level enriched chunks under `public/data/imported-powers/` and manifest `enrichedChunks` metadata.
- Updated the imported library loader to prefer category chunks, fall back to the monolithic enriched payload, and finally fall back to the raw imported pool.
- Added Playwright fallback coverage for chunk failure and enriched-payload failure.
- Added a browser regression test proving normal startup uses chunk files without requesting `superpower-list-enriched.json`.
- Added a 1 MB gzip budget for the largest category chunk in `npm run audit:powers`.
- Added `tsconfig.typecheck.json` and `npm run typecheck` for core utility and pipeline modules.
- Added TypeScript/React/Node type packages and wired typechecking into `npm run verify`.
- Added JSDoc contracts for the logger and library filter APIs so core model/pipeline typechecking passes without suppressions.
- Added Playwright coverage for keyboard-only source filtering, search, and primary assignment.
- Added mobile visual regression coverage to ensure long imported power names wrap instead of clipping.
- Added saved draft rehydration so selected powers refresh from the current unified library by ID when older drafts load.
- Preserved missing saved powers as legacy fallbacks and surfaced a load notice instead of dropping user data.
- Added unit and browser regression coverage for stale saved draft power rehydration.
- Added `src/App.jsx` to the enforced TypeScript `checkJs` gate and fixed the surfaced UI shape issues.
- Added Playwright browser smoke tests to the enforced TypeScript `checkJs` gate.
- Fixed mobile ranking rationale details to use two columns instead of four inside power detail popovers.
- Added Playwright geometry coverage for mobile detail popover bounds and desktop sticky Hero Forge panel bounds.

## Active Work Queue

1. Expand browser smoke tests for full tab-order traversal.
2. Add lazy active-category loading once search/index behavior can support cross-category search without downloading every chunk.
3. Add a real moderation workflow if hidden records need human approve/reject state instead of read-only audit review.

## Open Risks

- Project is not fully type-safe yet.
- `App.jsx` is checked, but still needs explicit component prop contracts or a staged TSX split.
- Browser tests are checked, but still need shared typed fixture helpers if the suite grows.
- Imported dataset is community-generated; first-pass quality flags exist, but human moderation workflow is not implemented.
- Enriched runtime payload is still large and needs measured browser performance.
- Saved drafts now have a schema version and rehydrate selected powers from the current catalog; future breaking schema migrations still need explicit version handlers.
- Accessibility expectations are documented but not tested.
- Performance budgets are partially enforced through `npm run audit:powers`.
