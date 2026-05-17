# ADR 0004: Slot-Based Hero Forge Flow

## Status

Accepted

## Context

The app had disconnected data surfaces: starter canon cards, imported Superpower List records, source strategy cards, and category tables. Users needed a clear reason to browse powers. A flat "selected powers" list made the app feel like separate projects on one page because it did not explain why a power belonged in the character.

## Decision

Use a shared power model across canon and imported powers, then assign selected powers into explicit hero slots.

- `HERO_SLOTS` defines origin, primary, secondary, utility, and limitation roles.
- `assignPowerToSlot` moves a power into exactly one slot, replacing single-slot values and capping secondary powers.
- `buildHeroDraft` creates a deterministic alias, classification, aggregate stats, strength stack, weakness stack, tags, synergy notes, conflicts, readiness, and a character sheet.
- The UI uses one card style for canon and imported powers. Slot assignment changes the action label, not the card family.
- Library browsing is paginated with explicit next/previous controls, stat-oriented sort modes, subcategory chips, and slot-aware recommendations.
- Imported powers remain staged options, not canon records.

## Flow

1. Pick the slot being filled.
2. Search or filter the unified library.
3. Assign a power into that slot.
4. Review the generated character sheet, synergy, conflicts, and story hook.
5. Future admin curation can promote drafts or powers into the canon.

## Rollback

Remove `src/utils/heroBuilder.js`, remove builder-related code from `src/App.jsx`, remove builder and select-button styles from `src/styles.css`, and remove related tests from `src/utils/powerModel.test.js`.

## Complexity

- Slot assignment/removal is `O(n)` for the small selected slot set because the model removes duplicates before placing a power.
- Draft generation is `O(n * m)`, where `n` is selected power count and `m` is the average number of strengths, weaknesses, and tags.
- Imported-pool filtering remains `O(r * t)`, where `r` is imported record count and `t` is searchable text size. Sorting filtered matches is `O(k log k)`.
- Pagination render cost is `O(p)`, where `p` is the selected page size.
- Slot-fit recommendation scoring is `O(k)` before the existing `O(k log k)` sort.
