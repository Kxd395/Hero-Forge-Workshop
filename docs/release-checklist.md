# Release Checklist

Use this checklist before pushing changes that affect the app, data, docs, or deployment.

## Required Commands

Run from the project root:

```bash
npm run verify
```

`npm run verify` runs the power asset audit, unit tests, browser smoke tests, lint, and production build.

Regenerate docs separately when taxonomy/category logic changes:

```bash
npm run docs:powers
```

If imported data changed, also run:

```bash
npm run import:superpowers
npm run docs:powers
```

After ranking enrichment is implemented, include:

```bash
npm run enrich:powers
```

## Source Control Check

Before committing:

```bash
git status --short
git diff --stat
```

Confirm:

- Only intended files changed.
- Generated docs were refreshed when source data/category logic changed.
- No unrelated user changes were reverted.
- No secrets, tokens, or local machine paths were added.

## App Smoke Test

Run locally:

```bash
npm run dev
```

Smoke-test:

- Forge view loads.
- Library count loads.
- Search works.
- Category and subcategory filters work.
- Origin picker works.
- Primary assignment works.
- Secondary assignment works.
- Utility assignment works.
- Assignment status message appears after assigning a power.
- Compare tray direct Primary/Secondary/Utility assignment works.
- Browser smoke tests pass with `npm run test:e2e`.
- Review all selected powers shows selected powers.
- Compare tray can add/remove powers.
- Save draft works for non-empty drafts.
- Export text is populated.
- Taxonomy view loads.
- Data Sources view loads.

## Data And Attribution Check

If imported data changed:

- Manifest count is plausible.
- Published count is plausible.
- `docs/power-catalog-taxonomy.md` reflects new counts.
- Attribution remains visible: `Copyright © Justin Mahar | The Superpower List`.

## Ranking Check

When ranking enrichment exists:

- Cards do not show raw public `score`.
- Cards show readable ranking labels.
- Missing `power.ranking` falls back without crashing.
- `ranking.rating` is used instead of `ranking.tier`.
- Confidence and popularity are separate labels.
- Origin fit changes sort order but does not mutate `ranking.bestRole`.

## Mobile Check

At a mobile viewport:

- Navigation remains usable.
- Filters do not overlap.
- Power cards do not clip action buttons.
- Long names wrap without hiding controls.
- Builder panel is reachable.
- Review mode remains usable.

## Deployment Check

After push and Vercel deployment:

- Production URL loads.
- Imported library loads.
- Core smoke test passes in production.
- No obvious console errors.
- Rollback commit or previous deployment is identified.

## Rollback

Preferred rollback:

```bash
git revert <bad-commit-sha>
git push origin main
```

Emergency Vercel rollback:

1. Promote the previous known-good deployment in Vercel.
2. Revert or fix Git so source control matches production.
