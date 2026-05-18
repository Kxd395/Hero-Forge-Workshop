# MVP Stabilization Report

Date: May 2026

## Checkpoint

Stable checkpoint commit:

```text
7f70dca Stabilize hero forge MVP
```

GitHub branch:

```text
main
```

Preview deployment:

```text
https://hero-forge-workshop-ce3a1t199-kxd395s-projects.vercel.app
```

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
| Enriched browser payload | 16.99 MB | 2.96 MB |
| Ranking audit payload | 11.17 MB | 734.77 KB |

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
