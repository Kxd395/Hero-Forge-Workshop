# UX Flows

This document defines the expected app flows and UI states.

## Views

| View | Purpose |
| --- | --- |
| Hero Forge | Main workspace for selecting origin, browsing powers, assigning slots, reviewing draft |
| Taxonomy | Read-only category reference and counts |
| Data Sources | Read-only source strategy roadmap |

## Hero Forge Flow

```text
Open app
  │
  ├─ imported library loads
  │
  ├─ user chooses origin
  │    └─ origin fit boosts matching categories
  │
  ├─ user browses/searches/filters powers
  │
  ├─ user assigns Primary
  │
  ├─ user assigns Secondary and/or Utility
  │
  ├─ Hero Forge panel updates live
  │
  ├─ user reviews selected powers
  │
  └─ user saves or exports draft
```

## Empty States

| State | Expected UI |
| --- | --- |
| Imported data loading | Library should show loading context without crashing |
| Imported data failed | Canon powers should remain usable; error should be visible |
| No filters active, no powers selected | Builder should guide user to choose origin or power slot |
| Filters return no matches | Empty state should explain no matches and offer clear filters |
| Empty draft quality | Quality and synergy should show `0`, not fake default values |

## Origin Flow

Expected:

1. User opens origin picker.
2. User selects an origin source.
3. Origin appears in the draft/checklist.
4. Origin category fit panel appears.
5. Recommended sorting favors matching categories.
6. User can clear/change origin.

Origin does not:

- appear as a power card
- count toward selected power total
- block unrelated powers

## Power Slot Flow

| Slot | Expected Behavior |
| --- | --- |
| Primary | One signature power; assigning a new one replaces the old one |
| Secondary | Up to three support powers; assigning an existing power moves it here |
| Utility | One field-use power; assigning a new one replaces the old one |

After assignment, the app should advance to the next sensible slot.

The app should show a visible status message after assignment so the user knows which slot was changed and which slot is active next.

## Review Flow

Review actions from the build path should work as filters over selected powers.

| Action | Expected Result |
| --- | --- |
| Review all selected powers | Library shows all selected powers |
| Review Primary | Library shows selected Primary |
| Review Support | Library shows selected Secondary powers |
| Review Utility | Library shows selected Utility |
| Browse Origin | Scrolls to origin picker |

Review mode should ignore normal category/search filters so the user can always see what they picked.

## Filter Flow

Filter controls:

- search
- source
- category
- subcategory
- tier
- slot fit
- stat thresholds
- sort mode
- page size
- pagination

Rules:

- Category change resets subcategory.
- Any filter change resets to page 1.
- Clear filters resets search, category, subcategory, tier, source, slot fit, review mode, sort, and stat filters.
- Origin fit is a recommendation boost, not a filter.

## Compare Flow

Expected:

1. User adds up to four powers to compare.
2. Compare tray shows selected comparison cards.
3. User can assign a compared power to active slot.
4. User can assign a compared power directly to Primary, Secondary, or Utility.
5. User can remove one comparison.
6. User can clear the tray.

The compare tray should not change the hero until the user assigns a power.

## Draft Panel Flow

The right-side Hero Forge panel should show:

- hero name
- readiness message
- classification
- primary scope guidance
- build path
- selected powers
- origin/profile fields
- aggregate stats
- quality metrics
- strengths
- limits
- synergy
- recommendations
- story brief
- export controls
- saved drafts

The panel should remain readable on desktop and stack cleanly on smaller screens.

## Save Draft Flow

Expected:

1. User selects at least one power.
2. User clicks Save draft.
3. Draft is stored in LocalStorage.
4. Saved draft appears in the list.
5. Loading the draft restores `heroBuild`.
6. Deleting removes only that draft.

Save should be disabled or inert for empty drafts.

## Error And Edge States

| Scenario | Expected Behavior |
| --- | --- |
| Imported JSON fetch fails | App still runs with canon library |
| LocalStorage unavailable | App should not crash; future hardening should show non-persistent mode |
| Selected power disappears after import refresh | Saved draft should still render stored selection fields |
| Search/filter hides selected power | Review mode should reveal selected powers |
| Very long power names | Cards should not hide critical actions or overflow |

## Mobile Expectations

- Top nav remains usable.
- Search and filters stack without overlap.
- Category rail becomes scrollable or stacked.
- Power cards fit the viewport.
- Builder panel is reachable after the library.
- Long selected power names wrap instead of clipping controls.
- Sticky/floating controls should not cover card actions.
