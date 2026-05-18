# Deployment Runbook

This runbook documents the current GitHub and Vercel deployment path.

## Current Deployment

GitHub:

```text
https://github.com/Kxd395/Hero-Forge-Workshop
```

Vercel:

```text
https://hero-forge-workshop.vercel.app
```

Vercel config:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

## Local Preflight

Run before pushing or deploying:

```bash
npm run verify
```

`npm run verify` runs the generated power asset audit, unit tests, browser smoke tests, lint, and production build.

Regenerate taxonomy docs separately when category, power, import, or ranking logic changes:

```bash
npm run docs:powers
```

For frontend behavior changes, also run the app locally and smoke test:

```bash
npm run dev
```

Smoke-test at the dev server URL:

- Forge view loads.
- Imported count loads.
- Search returns powers.
- Category/subcategory filters work.
- Primary, Secondary, and Utility assignment work.
- Origin picker works.
- Review all selected powers works.
- Save draft does not throw.
- Export text is populated.

## Deploy Path

1. Verify local preflight.
2. Check changed files with `git status --short`.
3. Commit a focused change.
4. Push to `main`.
5. Let Vercel build from GitHub.
6. Open the production URL after deployment.
7. Run the smoke test against production.

## Rollback

Preferred rollback is a Git revert:

```bash
git revert <bad-commit-sha>
git push origin main
```

Vercel will redeploy from the reverted branch state.

If urgent, use the Vercel dashboard to promote a previous known-good deployment, then still revert or fix Git so source control matches production.

## Deployment Risks

| Risk | Mitigation |
| --- | --- |
| Large imported JSON increases load time | Monitor bundle/data size; move to chunked/indexed search if needed |
| Generated docs stale | Run `npm run docs:powers` before commit |
| UI regression on mobile | Browser smoke test mobile viewport before release |
| LocalStorage draft incompatibility | Keep build shape backward compatible or write migration |
| Missing attribution | Check footer and manifest after import changes |

## Release Checklist

- `npm run verify`
- `npm run docs:powers` when taxonomy/category/import logic changed
- local smoke test
- production smoke test
- attribution visible
- quality-gate hidden count looks plausible
- docs updated when behavior changed
- rollback path identified
