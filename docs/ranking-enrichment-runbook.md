# Ranking Enrichment Runbook

This runbook documents the deterministic ranking enrichment pipeline.

## Purpose

The enrichment pipeline creates readable ranking metadata for imported powers without presenting raw numeric scores as objective truth.

It writes:

```text
public/data/superpower-list-enriched.json
public/data/superpower-list-ranking-audit.json
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
6. Writes a separate audit payload containing structured evidence.
7. Writes a manifest with schema, pipeline, ruleset, input hash, counts, and output paths.

## Current Outputs

Current known run:

- Enriched imported records: `8,531`
- Default-visible records: `8,370`
- Public enriched payload: about `17 MB` uncompressed
- Ranking audit payload: about `12 MB` uncompressed

The app loader tries the enriched payload first. If enriched data is missing, malformed, or has no visible powers, it falls back to the original imported pool.

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
- Current display-rating distribution is approximately `4,591` core, `3,382` advanced, and `558` legendary.
- Enriched records use `ranking.rating`, not `ranking.tier`.
- Public enriched records do not include `ranking.evidence`.
- Audit records include structured evidence.
- Power cards do not display `Score N`.

## Rollback

The enrichment pipeline is additive. If enriched data is bad:

```bash
git restore public/data/superpower-list-enriched.json public/data/superpower-list-ranking-audit.json public/data/superpower-list-ranking-manifest.json
```

If these files were already committed:

```bash
git revert <commit-sha>
```

The app can continue loading `public/data/superpower-list-pool.json`.

## Known Follow-Up

- Replace visible score chips with ranking labels.
- Add content/quality filter behavior.
- Consider chunking the enriched payload before using it in production runtime.
- Add saved draft rehydration against the current library.
