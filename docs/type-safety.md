# Type Safety Baseline

Current answer: the project is partially type-checked, but not fully type-safe.

The app is a JavaScript React/Vite project. TypeScript now runs in `allowJs`/`checkJs` mode for the main React app, core utility modules, and pipeline modules through `tsconfig.typecheck.json`. Browser tests are not yet inside the typecheck gate.

## Current Safety Net

| Layer | Status |
| --- | --- |
| Runtime model validation | Partial |
| Unit tests | Good baseline for utility/model behavior |
| ESLint | Enabled for JS/JSX |
| TypeScript static checking | Enforced for `src/App.jsx`, core utilities, and scripts |
| PropTypes | Disabled |
| Schema validation for imported JSON | Partial/manual |
| Saved draft schema migration | Partial |

## What Is Safe Today

- `validatePowerCatalog()` catches malformed canon power records.
- `validateDataSources()` catches malformed data-source strategy records.
- Tests cover assignment, draft generation, filtering, imported manifest loading, and many model edge cases.
- The app has deterministic normalization helpers for canon and imported powers.
- `src/utils/runtimeGuards.js` now filters fetched imported records and normalizes saved drafts before the UI uses them.
- `npm run typecheck` validates `src/App.jsx`, scripts, and core utility modules with TypeScript `checkJs`.
- `npm run verify` now includes `npm run typecheck`.

## Current Type Risks

- React UI typechecking is still coarse because `App.jsx` is a large JavaScript module without explicit component prop typedefs.
- Imported and enriched JSON now pass through runtime guards, but deeper schema validation is still needed before the data model is considered type-safe.
- Saved drafts now get a schema version when saved and selected powers rehydrate from the current unified library by ID on load.
- Missing saved powers are preserved as legacy local copies so older drafts do not lose user data, but future breaking schema migrations still need explicit version handlers.
- `ranking` has a documented schema and runtime tests, but not generated TypeScript types.
- `heroBuild.limitation` remains for backward compatibility, so new code could accidentally revive it as an active slot.
- There are no generated types for `public/data/*.json`.

## Recommended Path

Do not convert everything to TypeScript in one large rewrite. Use a staged migration:

1. Add JSDoc typedefs for core shapes: `UnifiedPower`, `RankingProfile`, `HeroBuild`, `HeroDraft`, `OriginSource`, `SavedDraft`.
2. Add runtime schema guards for imported JSON and saved drafts.
3. Expand `tsconfig.typecheck.json` module by module.
4. Fix reported issues before adding modules to the enforced gate.
5. Convert utility modules to `.ts` first.
6. Convert React components after model types are stable.
7. Keep rollback easy by avoiding a repo-wide file extension churn until tests are stronger.

## Type-Safety Milestones

| Milestone | Exit Criteria |
| --- | --- |
| Baseline docs | This file exists and names current risk honestly |
| Runtime guards | Imported JSON and saved drafts are validated before use |
| JSDoc core types | Main model shapes are documented in code |
| Typecheck script | Done: `npm run typecheck` exists and passes for `src/App.jsx`, core utilities, and scripts |
| Utility TS migration | `src/utils` model files are TypeScript |
| UI TS migration | `App.jsx` is split and converted to typed components |

## Immediate Rule

Until TypeScript is enforced, every new data shape must include:

- a documented schema in `docs/data-dictionary.md`
- tests for required fallback behavior
- runtime fallback for missing optional fields
- no user-facing crash when imported or saved data is malformed
