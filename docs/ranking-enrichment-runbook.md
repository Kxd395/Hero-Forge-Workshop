# Ranking Enrichment Runbook

This runbook documents the deterministic ranking enrichment pipeline.

## Purpose

The enrichment pipeline creates readable ranking metadata for imported powers without presenting raw numeric scores as objective truth.

It writes:

```text
public/data/superpower-list-enriched.json
public/data/imported-powers/<category>.json
public/data/superpower-list-ranking-audit.json
public/data/superpower-list-hidden-review.json
public/data/superpower-list-ranking-manifest.json
```

## Commands

Run enrichment only:

```bash
npm run enrich:powers
```

Refresh the full power data path:

```bash
npm run refresh:powers
```

`refresh:powers` runs:

```bash
npm run import:superpowers
npm run enrich:powers
npm run docs:powers
```

## What The Script Does

`scripts/enrich-power-rankings.mjs`:

1. Reads `public/data/superpower-list-pool.json`.
2. Keeps published imported records.
3. Normalizes them through `buildImportedLibrary()`.
4. Creates `ranking` metadata through `createRankingProfile()`.
5. Writes a public enriched UI payload without full raw records.
6. Writes category-level enriched chunks under `public/data/imported-powers/`.
7. Writes a separate audit payload containing structured evidence.
8. Writes a compact hidden-review payload for records removed from normal browsing.
9. Writes a manifest with schema, pipeline, ruleset, input hash, counts, chunk metadata, and output paths.

## Current Outputs

Current known run:

- Enriched imported records: `8,531`
- Default-visible records: `8,370`
- Public enriched payload: about `13 MB` uncompressed, `2.64 MB` gzip
- Category chunks: `10` files, largest about `4.19 MB` uncompressed / `820 KB` gzip, total about `2.55 MB` gzip
- Ranking audit payload: about `12 MB` uncompressed
- Hidden-review payload: about `67 KB` uncompressed, `5 KB` gzip

The app loader tries the category chunks first. If chunked data is missing, malformed, or has no visible powers, it falls back to the monolithic enriched payload. If enriched data is unavailable, it falls back to the original imported pool.
The Data Sources admin view loads the hidden-review payload on demand so maintainers can inspect hidden record names, reasons, labels, and evidence summaries without downloading the full audit evidence file into normal browsing.

## Verification

Run:

```bash
npm run enrich:powers
npm run test
npm run lint
npm run build
```

Check:

- Manifest `schemaVersion` is `1`.
- Manifest `totalRecords` is plausible.
- Manifest `visibleRecords` is lower than or equal to `totalRecords`.
- Manifest `rankingDistribution` shows a plausible spread across rating, risk, role, and confidence labels.
- Manifest `hiddenReviewFile` points to `public/data/superpower-list-hidden-review.json`.
- Manifest `enrichedChunks` points to category chunk files and the chunk counts match the monolithic enriched payload.
- The largest category chunk stays under the `1 MB` gzip audit budget.
- Hidden-review record count matches `hiddenRecords`.
- Current display-rating distribution is approximately `4,591` core, `3,382` advanced, and `558` legendary.
- Enriched records use `ranking.rating`, not `ranking.tier`.
- Public enriched records do not include `ranking.evidence`.
- Public enriched records omit heavy audit/sort fields such as `ranking.roleFit`, `ranking.sort`, and `ranking.quality`.
- Audit records include structured evidence.
- Power cards do not display `Score N`.

## Rollback

The enrichment pipeline is additive. If enriched data is bad:

```bash
git restore public/data/superpower-list-enriched.json public/data/superpower-list-ranking-audit.json public/data/superpower-list-hidden-review.json public/data/superpower-list-ranking-manifest.json
```

If these files were already committed:

```bash
git revert <commit-sha>
```

The app can continue loading `public/data/superpower-list-pool.json`.

## Known Follow-Up

- Replace visible score chips with ranking labels.
- Add content/quality filter behavior.
- Consider loading only active category chunks once search/index behavior supports lazy cross-category search.
- Add saved draft rehydration against the current library.
