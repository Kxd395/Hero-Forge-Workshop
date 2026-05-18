# Performance Plan

Hero Forge currently loads canon powers plus roughly 8,500 imported powers in the browser. This is acceptable for the current app size, but it needs explicit budgets because search and filtering run on the client.

## Current Runtime Shape

```text
App boot
  ├─ fetch enriched imported JSON
  ├─ fetch fallback imported pool
  ├─ fetch manifest
  ├─ normalize canon powers
  ├─ merge canon + imported powers
  └─ filter/sort/page in React state
```

Filtering complexity is currently:

```text
O(n * f)
```

Where `n` is visible powers and `f` is the active filter/sort work. Space complexity is:

```text
O(n)
```

The current design is fine for thousands of records. It is not the final architecture for hundreds of thousands.

## Budgets

| Area | Budget |
| --- | ---: |
| Initial JS gzip | under 150 KB |
| Initial CSS gzip | under 20 KB |
| Imported JSON gzip | under 3.5 MB |
| Search/filter interaction | under 100 ms on normal desktop hardware |
| Category switch | under 100 ms |
| Page change | no visible layout jump |
| Mobile first meaningful UI | under 3 seconds on fast 4G-class network |

## Required Measurement

Before release, run:

```bash
npm run build
npm run audit:powers
npm run test:e2e
```

Check Vite output for JS/CSS size and browser behavior for obvious lockups.

When payload size changes, record:

- raw JSON size
- gzip JSON size
- visible imported record count
- hidden/moderated record count
- build output JS/CSS gzip size

The asset audit command validates manifest counts and gzip budgets:

```bash
npm run audit:powers
```

## Optimization Path

Use this order. Do not add infrastructure before measurement proves it is needed.

1. Keep enrichment precomputed at import time.
2. Compact runtime payload and keep evidence in audit JSON.
3. Memoize derived category/source/subcategory counts.
4. Add indexed search fields at import time.
5. Split imported data by category. Completed: `public/data/imported-powers/*.json`.
6. Load category chunks on demand. Partial: loader can consume chunks, but currently loads all chunks to preserve global search.
7. Move search to a worker if the main thread becomes visibly blocked.
8. Add server-backed search only when the static app model is no longer sufficient.

## Anti-Patterns

- Do not compute ranking evidence during render.
- Do not keep full audit evidence in the browser payload.
- Do not fetch generated data from third-party APIs on page load.
- Do not add a database until saved drafts or search require server persistence.

## Rollback

If a performance change degrades the app:

1. Revert the payload or search implementation.
2. Restore the last known good generated JSON.
3. Run `npm run test:e2e`.
4. Re-run `npm run build` and compare gzip output.
