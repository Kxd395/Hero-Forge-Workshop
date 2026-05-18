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

## Active Work Queue

1. Add admin review mode for hidden/moderated imported records.
2. Expand browser smoke tests for full keyboard traversal and visual clipping.
3. Continue slimming or chunking enriched runtime payload if `npm run audit:powers` or browser measurements exceed budget.

## Open Risks

- Project is not fully type-safe yet.
- Imported dataset is community-generated; first-pass quality flags exist, but human moderation workflow is not implemented.
- Enriched runtime payload is still large and needs measured browser performance.
- Saved drafts now have a schema version on new saves, but migrations/rehydration are not complete.
- Accessibility expectations are documented but not tested.
- Performance budgets are not enforced.
