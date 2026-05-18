# Documentation Map And Missing Docs

This file tracks what documentation exists, what is missing, and which docs should be written next. It is the project documentation backlog.

## Current Docs

| Doc | Status | Purpose |
| --- | --- | --- |
| `README.md` | Current | Quick start, import command, product flow, architecture links |
| `docs/project-ssot.md` | Current | Single source of truth for product rules, architecture, data model, flow, ranking reality, and deployment |
| `docs/design.md` | Current | Visual system, layout rules, component rules, interaction rules |
| `docs/power-catalog-taxonomy.md` | Generated | Category counts, origin fit, slot model, canon powers, representative imported powers |
| `docs/user-guide.md` | Current | User-facing guide for building a hero |
| `docs/data-dictionary.md` | Current | Field definitions for categories, powers, normalized records, builds, selections, and drafts |
| `docs/ranking-pipeline.md` | Current | Target ranking/enrichment pipeline and rollout plan |
| `docs/character-creation-model.md` | Current | Product model for origin, powers, limits, motivation, naming, and story cohesion |
| `docs/import-runbook.md` | Current | Operational steps for refreshing and validating the imported power pool |
| `docs/deployment-runbook.md` | Current | GitHub/Vercel release path, preflight checks, smoke tests, and rollback |
| `docs/testing-strategy.md` | Current | Current coverage, missing test layers, and high-risk behaviors |
| `docs/ux-flows.md` | Current | Expected app flows, empty states, review mode, filters, compare tray, and mobile behavior |
| `docs/release-checklist.md` | Current | Pre-release command, smoke, data, mobile, deployment, and rollback checklist |
| `docs/type-safety.md` | Current | Honest baseline for current JS type-safety state and migration path |
| `docs/running-log.md` | Current | Running project log of architecture, docs, and implementation work |
| `docs/ranking-schema.md` | Current | Target enriched ranking schema and fallback contract |
| `docs/ranking-enrichment-runbook.md` | Current | Ranking enrichment command, outputs, validation, and rollback |
| `docs/data-governance.md` | Current | Ownership, moderation, attribution, enrichment, privacy, and rollback rules for power data |
| `docs/saved-draft-migrations.md` | Current | LocalStorage draft schema, migration rules, rollback, and test requirements |
| `docs/performance-plan.md` | Current | Runtime size budgets, complexity, measurement, optimization order, and rollback |
| `docs/accessibility-checklist.md` | Current | Keyboard, screen reader, visual, motion, testing, and release accessibility expectations |
| `docs/curation-workflow.md` | Current | Rules for promoting imported/generated powers into reviewed canon |
| `docs/security-privacy.md` | Current | Static app threat model, storage rules, future API requirements, and rollback |
| `docs/troubleshooting.md` | Current | Local development, import, filter, ranking, draft, Playwright, build, and deploy fixes |
| `docs/ai-generation-plan.md` | Current | Future server-side AI generation boundary, schema, safety, cost control, and rollback |
| `docs/content-quality-filters.md` | Current | Target moderation flags, visibility behavior, enrichment order, release checks, and rollback |
| `docs/mobile-visual-qa.md` | Current | Mobile viewport targets, visual risk areas, screenshot targets, and release gates |
| `docs/mvp-stabilization-report.md` | Current | Stabilization checkpoint, preview deployment, verification, data state, and remaining production risks |
| `docs/review/hero-forge-ranking-handoff/` | External review | GPT 5.5 Pro ranking refactor handoff and acceptance notes |
| `docs/adr-0001-power-catalog-scaffold.md` | Historical | Why the initial structured catalog was created |
| `docs/adr-0002-data-source-strategy.md` | Current | Why external sources stay metadata-only until integration is intentional |
| `docs/adr-0003-superpower-list-import-source.md` | Current | Why Superpower List Database is the bulk import source |
| `docs/adr-0004-hero-builder-flow.md` | Current | Why the app uses origin + Primary/Secondary/Utility build flow |

## Missing Docs

| Priority | Missing Doc | Proposed File | Why It Matters |
| ---: | --- | --- | --- |
| 5 | Admin review mode | `docs/admin-review-mode.md` | Defines future hidden-content review, moderation actions, and promotion workflow |

## Highest-Value Next Docs

Write these next because they cover the next feature and QA risks:

1. `docs/admin-review-mode.md`
2. `docs/search-index-plan.md`
3. `docs/browser-qa-matrix.md`

## Documentation Rules

- `docs/project-ssot.md` remains the authority for current product rules.
- Generated docs must say how to regenerate them.
- ADRs explain why major decisions were made; they should not become task lists.
- Runbooks must include verification and rollback steps.
- User-facing docs should avoid implementation jargon unless the user needs it to make a build decision.
- Data docs must distinguish canon, imported, generated, normalized, and saved-draft fields.

## Current Documentation Risks

- Content quality filters are implemented as first-pass enrichment metadata, but there is still no admin review UI.
- Mobile visual QA is documented but does not have screenshot assertions yet.
