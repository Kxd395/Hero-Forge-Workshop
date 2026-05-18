# Content Quality Filters

This document defines how imported and generated power content should be screened before it appears in normal browsing.

## Current State

Current runtime filtering checks:

- imported record is published
- name is non-empty
- enriched record has valid `stats`
- enriched record has valid `ranking`
- `ranking.content.defaultVisible !== false`

The enrichment pipeline now emits `ranking.quality` and combines quality/content reasons into `ranking.content.defaultVisible`. This is still a deterministic first-pass gate, not full human moderation.

## Filter Model

The dedicated content-quality object is:

```js
{
  quality: {
    defaultVisible: true,
    reviewed: false,
    reasons: [],
    duplicateKey: "normalized-name",
    languageRisk: "none|low|medium|high",
    clarity: "clear|thin|confusing",
    canonCandidate: false
  }
}
```

## Filter Reasons

Supported reasons:

- `duplicate`
- `empty-description`
- `thin-record`
- `offensive-language`
- `copyright-risk`
- `non-power`
- `too-broad`
- `unsafe-real-world`
- `broken-format`
- `needs-human-review`

Current implemented reasons include:

- `too-broad`
- `graphic-violence`
- `privacy-violation`
- `unsafe-real-world`
- `offensive-language`

## UI Behavior

Default browsing should hide high-risk records.

Power users can later get an explicit quality filter:

- Reviewed
- Usable imported
- Needs review
- Hidden

Do not expose hidden records through normal search unless an admin/review mode exists.

## Enrichment Behavior

Quality filtering should happen before ranking display labels are trusted.

```text
raw imported record
  ├─ validate shape
  ├─ normalize text
  ├─ detect duplicates
  ├─ flag quality risks
  ├─ infer ranking
  └─ publish visible compact payload
```

## Release Checks

When quality filters change:

```bash
npm run enrich:powers
npm run docs:powers
npm run test
npm run test:e2e
npm run lint
npm run build
```

Record before/after counts:

- imported raw count
- published count
- visible enriched count
- hidden count
- top hidden reasons

The ranking manifest records `hiddenRecords` and `hiddenReasons`.

## Rollback

If quality filters hide too much:

1. Revert the enrichment script change.
2. Restore the previous enriched JSON.
3. Keep existing runtime guards.
4. Add fixtures for the false-positive records.
