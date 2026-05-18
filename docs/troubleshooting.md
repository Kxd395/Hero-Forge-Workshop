# Troubleshooting

This guide covers common local development, import, build, and UI problems.

## App Does Not Start

Run:

```bash
npm install
npm run dev
```

If the port is busy:

```bash
npm run dev -- --port 4174
```

## Imported Powers Do Not Load

Expected files:

```text
public/data/superpower-list-pool.json
public/data/superpower-list-enriched.json
public/data/superpower-list-manifest.json
```

Refresh generated data:

```bash
npm run refresh:powers
```

If enriched data is broken, the app should fall back to the original imported pool. Check the browser console for `imported_library_enriched_fallback`.

## Filters Show No Powers

Use the UI Clear filters button first.

Common causes:

- source is set to Canon while searching an imported-only power
- category and subcategory are too narrow
- stat filters are too strict
- active slot fit hides powers that do not fit the selected role

The empty state should provide a clear filters action.

## Scores Or Rankings Look Repetitive

This is expected for imported powers. The source dataset does not include true combat, utility, control, or risk stats. Rankings are inferred labels for browsing, not canonical power levels.

Use:

- rating label
- role fit
- scope
- risk
- confidence

Do not treat raw numeric score as product truth.

## Saved Drafts Look Wrong

Drafts live in LocalStorage:

```text
powers-forge:saved-drafts
```

If a local draft is unrecoverable, clear that LocalStorage key in browser devtools.

Developers should add migration tests before changing saved draft shape.

## Playwright Fails

Run:

```bash
npm run test:e2e
```

If a test fails:

1. Read the Playwright error context under `test-results`.
2. Confirm whether the test is wrong or the UI behavior regressed.
3. Fix selectors to use roles/names where possible.
4. Remove `test-results` before committing unless keeping traces intentionally.

## Build Fails

Run checks individually:

```bash
npm run test
npm run test:e2e
npm run lint
npm run build
```

Common causes:

- Vitest collected non-unit tests
- ESLint config does not match browser vs Node files
- generated JSON is malformed
- imported scripts were not rerun after schema changes

## Deployment Looks Stale

Confirm the generated files are committed:

```bash
git status --short public/data docs
```

Then rebuild:

```bash
npm run build
```

For Vercel rollback, use the previous successful deployment from the Vercel dashboard or CLI.
