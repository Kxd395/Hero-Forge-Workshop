# ADR 0003: Superpower List Database As Bulk Import Source

## Status

Accepted

## Context

The app needs a much larger pool of superpower options than the curated starter canon. A direct Fandom import would require heavier sanitization, attribution, and page-structure normalization. Existing hero APIs are useful for character lookup, but they are not ideal as an exhaustive ability list.

The `justinmahar/superpowerlistdb` GitHub repository provides `superpowers.csv` with 12,000+ user-generated powers from The Superpower List. The documented fields include name, overview, description, pros, cons, tags, moderation state, comparison metrics, dates, and submitter metadata.

## Decision

Use the Superpower List Database as the recommended bulk import source for the app's exhaustive power option pool.

Do not merge imported rows directly into `BASE_SUPERPOWERS`. Imported records must go through a staging and curation step before they become canonical app powers.

The initial import generated 12,798 staged records in `public/data/superpower-list-pool.json`, with 8,531 records marked `published` in `public/data/superpower-list-manifest.json`.

## Import Rules

- Import only through a build-time script or admin job.
- Generate the local pool with `npm run import:superpowers`.
- Treat all CSV text as untrusted user-generated content.
- Filter public catalog display to `state = published`.
- Preserve source attribution and source row IDs.
- Map pros and cons into strengths and weaknesses only after normalization.
- Use `preference_ratio`, `times_preferred`, and `total_comparisons` as ranking signals, not as final balance scores.

## Attribution

Visible attribution is required wherever imported records are shown:

`Copyright © Justin Mahar | The Superpower List`

## Rollback

Remove the `superpower-list-database` entry from `src/data/dataSources.js`, remove this ADR, and remove any future import artifacts generated from the CSV.

## Complexity

CSV parsing is `O(r * c)`, where `r` is row count and `c` is column count. Search over imported records is `O(r)` until an index is introduced.
