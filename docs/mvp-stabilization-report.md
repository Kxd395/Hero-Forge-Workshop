# MVP Stabilization Report

Date: May 2026

## Checkpoint

Stable checkpoint commit:

```text
7f70dca Stabilize hero forge MVP
```

Latest documentation checkpoint:

```text
a03185b Document MVP stabilization checkpoint
```

GitHub branch:

```text
main
```

Preview deployment:

```text
https://hero-forge-workshop-ce3a1t199-kxd395s-projects.vercel.app
```

Remote smoke command:

```bash
PLAYWRIGHT_BASE_URL=https://hero-forge-workshop-ce3a1t199-kxd395s-projects.vercel.app npm run test:e2e
```

Preview smoke status: blocked by Vercel Deployment Protection. The preview URL served the Vercel login page to unauthenticated Playwright, so hosted browser smoke tests require a public target or a configured Vercel protection bypass.

The Playwright config supports Vercel's automation bypass header when `VERCEL_AUTOMATION_BYPASS_SECRET` is provided in the environment.

Production deployment was not promoted. Use an explicit production deploy command only after preview smoke testing.

## Current Product State

Hero Forge is MVP-stable:

- unified canon/imported power library
- quality-gated imported dataset
- origin source picker
- Primary, Secondary, and Utility power slots
- review selected powers flow
- saved drafts
- compare tray
- generated hero identity/story/quality output
- ranking labels instead of public raw score claims
- documented data, ranking, deployment, testing, and governance model

## Data State

Imported power dataset:

| Metric | Count |
| --- | ---: |
| Raw published imported records | 8,531 |
| Visible quality-gated imported powers | 8,370 |
| Hidden imported records | 161 |

Hidden reasons:

| Reason | Count |
| --- | ---: |
| `too-broad` | 70 |
| `graphic-violence` | 61 |
| `unsafe-real-world` | 59 |
| `privacy-violation` | 40 |
| `offensive-language` | 4 |

Payload audit:

| Asset | Raw | Gzip |
| --- | ---: | ---: |
| Enriched browser payload | 13.19 MB | 2.64 MB |
| Ranking audit payload | 12.20 MB | 769.50 KB |
| Hidden review payload | 66.55 KB | 5.20 KB |

Ranking distribution:

| Label group | Distribution |
| --- | --- |
| Rating | core `4,591` · advanced `3,382` · legendary `558` |
| Risk | medium `3,026` · high `2,772` · extreme `2,720` · low `13` |
| Best role | primary `4,361` · secondary `846` · utility `3,324` |
| Confidence | inferred `2,804` · strong `5,726` · low-data `1` |

## Verification

The release gate passed:

```bash
npm run verify
```

`verify` includes:

- `npm run audit:powers`
- `npm run test`
- `npm run test:e2e`
- `npm run lint`
- `npm run build`

Current automated coverage:

- 52 Vitest unit/model tests
- 9 Playwright browser smoke tests

Browser smoke coverage includes:

- enriched library load
- no public `Score N` chips
- primary assignment feedback
- compare-tray direct assignment
- mobile-width library/forge usability
- saved draft save/clear/load
- review-all selected powers overriding filters
- quality-gate manifest display
- raw imported-pool fallback
- keyboard open/close for power details

## Production Readiness

Ready for preview QA.

Not yet fully production-polished because:

- no human admin review mode for hidden/imported records
- no screenshot-based visual regression checks
- accessibility has smoke coverage but not full traversal/assistive-tech validation
- type safety is still mostly runtime-guard based, not TypeScript-first
- large static JSON remains acceptable by gzip budget but should be watched

## Recommended Next Steps

1. Open the preview URL and perform manual smoke testing.
2. If preview is acceptable, run an explicit production deploy.
3. Add admin review mode for hidden imported records.
4. Add screenshot checks for mobile card clipping and sticky-panel regressions.
5. Continue type-safety migration after product flow stabilizes.

## Rollback

Git rollback:

```bash
git revert 7f70dca
git push origin main
```

Vercel rollback:

1. Promote the previous known-good deployment in Vercel.
2. Revert or fix Git so source control matches production.
