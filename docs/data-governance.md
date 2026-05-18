# Data Governance

This document defines how Hero Forge Workshop treats canon, imported, enriched, and future generated power data.

## Ownership Rules

| Data class | Source | Ownership | App treatment |
| --- | --- | --- | --- |
| Canon powers | `src/data/superpowers.js` | Project-authored | Trusted curated records |
| Imported powers | Superpower List Database CSV | Third-party/community | Searchable inspiration, not reviewed canon |
| Enriched powers | `scripts/enrich-power-rankings.mjs` output | Project-generated inference | Deterministic labels for sorting and guidance |
| Generated powers | Future AI or user generation | User/project generated | Must be labeled separately until curated |
| Saved drafts | Browser LocalStorage | User local data | Private to the browser |

Imported powers must never be silently promoted to canon. Promotion requires a curated rewrite, source attribution check, and explicit entry in the canon catalog.

## Public UI Rules

- Do not show imported powers as authoritative.
- Do not expose raw numeric score as a universal ranking.
- Show readable inferred labels: rating, role fit, scope, risk, and confidence.
- Show attribution for imported detail views.
- Hide records marked `ranking.content.defaultVisible === false`.
- Keep user-facing language clear that enrichment is guidance, not reviewed truth.

## Moderation Policy

Imported records are community-generated and can contain low-quality, duplicated, offensive, copyrighted, or mechanically confusing content.

Minimum filters before public display:

- `state === "published"`
- non-empty `name`
- valid normalized `id`
- valid `stats`
- valid `ranking`
- `defaultVisible !== false`

Future moderation fields should live under `ranking.content` or a dedicated `moderation` object:

```js
{
  moderation: {
    reviewed: false,
    defaultVisible: true,
    reasons: [],
    duplicateOf: null,
    quality: "usable"
  }
}
```

## Enrichment Rules

The enrichment pipeline must be deterministic and idempotent:

```bash
npm run enrich:powers
```

Repeated runs against the same input must produce the same classification output, aside from manifest timestamps.

Ranking logic must keep evidence in the audit file when the browser payload is compacted:

- Browser payload: display fields needed by React.
- Audit payload: full evidence, matched terms, confidence inputs, and hidden decisions.

## Rollback

If enrichment or imported data breaks the app:

1. Revert `public/data/superpower-list-enriched.json`.
2. Keep `public/data/superpower-list-pool.json` available.
3. The runtime loader falls back to the original pool when enriched data is missing or empty.
4. Run `npm run test && npm run lint && npm run build`.

## Security And Privacy

- No API tokens are required for current import or runtime loading.
- Saved drafts stay in LocalStorage; they are not transmitted.
- Imported usernames are source metadata and should not be emphasized in the UI.
- Future AI generation must avoid storing API keys in client code.
- Future server APIs must rate-limit generation/import endpoints and validate all payloads server-side.

## Open Risks

- No human moderation queue exists yet.
- No automated offensive-content classifier exists yet.
- Duplicates are inferred weakly through names/tags only.
- Large public JSON payloads still expose all visible imported power text.
