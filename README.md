# SuperHero Powers Forge

A React/Vite scaffold for building an original superhero powers app. The first version includes:

- A skill-card catalog for base powers
- A slot-based hero-builder workflow that turns selected powers into a draft character sheet
- Exportable generated character sheets
- Category breakdowns for expanding the power system
- Search, category filters, subcategory filters, tier filters, source filters, recommended-slot filters, slot-aware recommendations, stat sorting, and paged library browsing
- Scope review for focused, versatile, and expansive powers so broad primaries require stronger limits
- Generated identity brief with name rationale, premise, first story arc, and missing build steps
- Alias options and story beats generated from origin, primary, secondary, utility, and derived limits
- Selectable alias override that persists with the hero draft and export sheet
- Editable civilian name and home base fields that feed the story premise and export sheet
- Editable motivation and story constraint fields that can balance expansive powers
- Guided build checklist that turns missing slots into active library filters
- Build-path review mode that shows selected slot powers even when browsing filters would hide them
- Power interaction analysis explaining how origin, primary, support, utility, and power drawbacks work together
- Build quality metrics for identity, field use, balance, and cohesion
- Dedicated origin-source picker so origin is a story source, not another power card
- Expandable power-card details for full descriptions, strengths, risks, counters, tags, and slot guidance
- A data-source strategy section for original canon, public hero APIs, official comic APIs, wiki imports, knowledge graphs, AI generation, static datasets, and manual curation
- A generated imported power pool from the Superpower List Database
- Local saved hero drafts
- A compare tray for reviewing up to four powers before assignment
- Structured data separated from UI components
- Vitest coverage for catalog validation, filtering, grouping, scoring, and data-source validation

## Run Locally

```bash
npm install
npm run dev
```

## Import The Large Power Pool

```bash
npm run import:superpowers
```

This downloads `justinmahar/superpowerlistdb`, normalizes the CSV, and writes:

- `public/data/superpower-list-pool.json`
- `public/data/superpower-list-manifest.json`

The current import contains 12,798 records, including 8,531 published records.

## Product Flow

1. Choose an origin source such as mutation, experiment, artifact, training, alien species, or cosmic event.
2. Search, filter by category or recommended hero role, sort, and page through the unified canon/imported power library.
3. Assign powers into Primary, Secondary, or Utility slots from either the active slot button or the direct role buttons on each card.
4. Review the generated alias, classification, stats, strengths, derived limits, synergy, and story hook.
5. Promote selected powers through a future curation queue before they become canon.

## Verify

```bash
npm run verify
```

`npm run verify` runs the generated power asset audit, unit tests, Playwright browser smoke tests, lint, and production build.

## Architecture Notes

Power data lives in `src/data/superpowers.js`. Catalog behavior lives in `src/utils/powerModel.js`.
The unified library model lives in `src/utils/powerLibrary.js`, and slot-based hero assembly lives in
`src/utils/heroBuilder.js`. The UI consumes those models through `src/App.jsx`, which keeps the current
scaffold easy to replace with API-backed data later.

The current source-of-truth docs are:

- `docs/project-ssot.md` for the product, architecture, data model, flow, ranking reality, and next work.
- `docs/power-catalog-taxonomy.md` for category counts, origin-to-category fit, canon powers, and representative imported powers.
- `docs/documentation-map.md` for existing docs, missing docs, and the documentation backlog.
- `docs/user-guide.md` for how to build a hero in the app.
- `docs/data-dictionary.md` for field definitions and data shapes.
- `docs/ranking-pipeline.md` for the target ranking/enrichment model.
- `docs/character-creation-model.md` for how origin, powers, limits, motivation, and story work together.
- `docs/import-runbook.md` for refreshing and validating imported power data.
- `docs/deployment-runbook.md` for GitHub/Vercel release and rollback.
- `docs/testing-strategy.md` for current coverage and missing test layers.
- `docs/ux-flows.md` for expected app states and user flows.
- `docs/release-checklist.md` for pre-release verification and rollback.
- `docs/type-safety.md` for current type-safety status and migration path.
- `docs/running-log.md` for the active project work log.
- `docs/ranking-schema.md` for the target enriched ranking contract.
- `docs/ranking-enrichment-runbook.md` for ranking enrichment generation and rollback.

External data-source candidates live in `src/data/dataSources.js`. They are intentionally metadata-only right now. The app does not make unauthenticated live calls, expose provider tokens, or bundle existing licensed hero records into the original power canon.

The current source shortlist includes the Superpower List Database, Akabab Superhero API, SuperHero API, Comic Vine, Marvel Developer API, Powerlisting/Fandom MediaWiki, Superheroes Fandom MediaWiki, Wikidata SPARQL, OpenAI-style structured generation, Gemini-style JSON generation, reviewed local JSON, Hugging Face dataset evaluation, and a future admin curation queue.

The recommended bulk-import source is `justinmahar/superpowerlistdb`. It requires visible attribution when displayed: `Copyright © Justin Mahar | The Superpower List`.

## Initial Category Base

- Physical
- Elemental
- Psychic
- Energy
- Mobility
- Biological
- Tech
- Mystic
- Cosmic
- Stealth

## Product Backlog

- Add keyboard shortcuts for search, next page, previous page, and slot switching.
- Add tag chips as first-class filters once imported tags are normalized.
