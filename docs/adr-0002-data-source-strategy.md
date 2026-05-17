# ADR 0002: Data Source Strategy

## Status

Accepted

## Context

The app can grow in three directions: original powers, existing hero lookups, and generated powers. These are different product and compliance surfaces. Mixing them into one implicit source would make attribution, licensing, API authentication, caching, and validation unclear.

## Decision

Keep `src/data/superpowers.js` as the active original canon and add `src/data/dataSources.js` as metadata for future integrations.

Current strategy:

- Original Power Canon remains the default source of truth.
- Superpower List Database is the recommended bulk import source for a large option pool, subject to attribution and staging review.
- Akabab Superhero API is a candidate public JSON source for existing hero comparison data.
- Token-based SuperHero API access is deferred until a server-side proxy exists.
- Comic Vine and Marvel Developer API are listed as official/comic metadata options, but both require server-side auth and terms review.
- Powerlisting/Fandom MediaWiki import is deferred until there is an import pipeline with sanitization, attribution, and review.
- Wikidata SPARQL is a candidate identity and factual-enrichment source, not a power canon.
- AI generation is planned as a server-side feature with schema validation before catalog insertion. OpenAI-style structured output is the preferred first implementation; Gemini-style JSON generation is a fallback candidate.
- Static JSON and Hugging Face-style datasets are allowed only after source pinning, license review, and field mapping.
- A future admin curation queue is required before any generated or imported power is published.

## Security And Compliance

- No provider tokens belong in frontend code.
- Wiki and generated content must be treated as untrusted input.
- External hero and wiki data must stay labeled separately from original app canon.
- Image and character usage rights require review before bundling or redisplay.
- Superpower List Database records require visible attribution: `Copyright © Justin Mahar | The Superpower List`.

## Rollback

Remove `src/data/dataSources.js`, `src/utils/dataSourceModel.js`, the roadmap component in `src/App.jsx`, related styles in `src/styles.css`, the added tests in `src/utils/powerModel.test.js`, and this ADR.

## Complexity

- Source roadmap sorting is `O(s log s)`, where `s` is the number of configured data sources.
- Validation is `O(s)`.
