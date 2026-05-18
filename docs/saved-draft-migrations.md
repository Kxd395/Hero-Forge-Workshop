# Saved Draft Migrations

Hero Forge saves drafts in browser LocalStorage under:

```text
powers-forge:saved-drafts
```

Drafts are local browser data. There is no server persistence or cross-device sync.

## Current Schema

Current version:

```js
SAVED_DRAFT_SCHEMA_VERSION = 1
```

Normalized draft shape:

```js
{
  schemaVersion: 1,
  id: "timestamp-name",
  name: "Titan Fist",
  classification: "Mindlock Strategist",
  selectedCount: 3,
  savedAt: "2026-05-17T00:00:00.000Z",
  heroBuild: {
    origin: null,
    primary: null,
    secondary: [],
    utility: null,
    profile: {}
  }
}
```

## Migration Rules

- Loading must never crash the app.
- Invalid records are dropped.
- Missing draft names become `Untitled Draft`.
- Missing draft IDs are regenerated.
- Missing schema versions are treated as the current version until a breaking migration exists.
- Drafts are capped to the most recent safe display limit.

## Future Versioning

When a breaking draft shape changes:

1. Increment `SAVED_DRAFT_SCHEMA_VERSION`.
2. Add a migration function in `src/utils/runtimeGuards.js`.
3. Add unit tests for old, current, malformed, and mixed draft arrays.
4. Update this document with field-level changes.
5. Keep old draft loading for at least one release cycle.

Example migration dispatcher:

```js
function migrateSavedDraft(rawDraft) {
  if (!rawDraft.schemaVersion) return migrateV0ToV1(rawDraft);
  if (rawDraft.schemaVersion === 1) return rawDraft;
  return null;
}
```

## Rollback

If a draft migration corrupts local data:

1. Disable the migration path.
2. Restore the previous `normalizeSavedDraft` behavior.
3. Tell users they can clear `powers-forge:saved-drafts` from LocalStorage if their local browser state is unrecoverable.
4. Add a regression fixture before reattempting migration.

## Test Requirements

Required unit cases:

- non-array LocalStorage payload
- malformed JSON
- draft missing `heroBuild`
- draft missing `schemaVersion`
- draft with future unknown version
- draft with duplicate or missing ID
- draft with old slot shape after a future schema change

Required browser cases:

- save a draft
- reload the page
- load the draft
- verify origin, profile, and selected slots are restored
- delete the draft
