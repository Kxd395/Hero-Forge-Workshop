# Import Runbook

This runbook explains how to refresh the Superpower List Database import and verify that the app still works.

## Scope

The import pipeline downloads the public CSV from `justinmahar/superpowerlistdb`, normalizes records, and writes local JSON files used by the Vite app.

Source:

```text
https://raw.githubusercontent.com/justinmahar/superpowerlistdb/master/superpowers.csv
```

Outputs:

```text
public/data/superpower-list-pool.json
public/data/superpower-list-manifest.json
```

## Preconditions

- Network access is available.
- `npm install` has already been run.
- The source license/attribution remains acceptable for project use.
- No unrelated user edits are being overwritten.

## Command

```bash
npm run import:superpowers
```

## What The Script Does

`scripts/import-superpower-list.mjs`:

1. Downloads the CSV.
2. Parses rows with `csv-parse/sync`.
3. Normalizes fields into the imported power shape.
4. Sorts records by `preferenceRatio`, then `totalComparisons`.
5. Writes the full pool JSON.
6. Writes the manifest JSON with attribution, source URL, import timestamp, record counts, and field list.

## Verification

Run:

```bash
npm run docs:powers
npm run test
npm run lint
npm run build
```

The full import path is:

```bash
npm run import:superpowers
npm run enrich:powers
npm run docs:powers
npm run test
npm run lint
npm run build
```

The enrichment step is additive and keeps the original imported pool available for rollback.

Then check:

- `public/data/superpower-list-manifest.json` has `totalRecords` greater than `12000`.
- `stateCounts.published` remains greater than `8000`.
- `docs/power-catalog-taxonomy.md` regenerated successfully.
- The app still loads imported powers.
- The footer still shows the attribution: `Copyright © Justin Mahar | The Superpower List`.

## Expected Current Baseline

Current known baseline:

- Raw imported records: `12,798`
- Published imported records loaded by app: `8,531`
- Unified library total: `8,546`

The exact counts can change if the upstream CSV changes. Investigate any large unexpected drop before committing.

## Failure Modes

| Failure | Likely Cause | Action |
| --- | --- | --- |
| Download fails | Network or upstream outage | Retry later; do not commit partial output |
| Record count drops sharply | Upstream schema/data changed | Inspect CSV diff before accepting |
| Tests fail after import | Normalized data exposed a model edge case | Fix model/test before committing |
| Build fails | JSON too large or malformed | Revert generated JSON and investigate |
| Attribution missing | Manifest or UI regression | Restore attribution before release |

## Rollback

If the import is bad:

```bash
git restore public/data/superpower-list-pool.json public/data/superpower-list-manifest.json docs/power-catalog-taxonomy.md
```

If the import was already committed, revert the commit:

```bash
git revert <commit-sha>
```

## Commit Checklist

Only commit an import refresh when all are true:

- `npm run import:superpowers` completed.
- `npm run docs:powers` completed.
- `npm run test` passed.
- `npm run lint` passed.
- `npm run build` passed.
- Manifest counts are plausible.
- Attribution is still present.
