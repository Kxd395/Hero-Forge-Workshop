# Mobile Visual QA

This document defines the mobile visual checks needed for Hero Forge. The app is dense, so mobile regressions usually appear as clipped card text, unreachable sticky panels, or horizontal overflow.

## Target Viewports

Minimum smoke viewports:

| Device class | Size |
| --- | ---: |
| Small phone | 390 x 844 |
| Large phone | 430 x 932 |
| Tablet portrait | 768 x 1024 |
| Desktop | 1440 x 1000 |

## Required Checks

For each viewport:

- top navigation remains usable
- library search is visible
- category rail does not create horizontal page overflow
- power card names wrap instead of clipping
- detail popover does not hide card actions
- Hero draft panel is reachable
- selected powers do not overflow their cards
- `Review all selected powers` remains visible when powers are selected

## Known Risk Areas

- long imported power names
- sticky right panel at narrow widths
- power card detail popover
- selected-power cards inside the Hero draft panel
- dense filter bars
- compare tray with multiple pinned powers

## Automated Coverage

Current Playwright smoke coverage checks:

- mobile width loads
- search works
- Hero draft region is present
- document width does not exceed viewport width

Future screenshot coverage should capture:

```text
tests/screenshots/mobile-library.png
tests/screenshots/mobile-selected-power.png
tests/screenshots/mobile-detail-popover.png
tests/screenshots/desktop-review-mode.png
```

## Release Gate

Do not release if:

- the page has horizontal overflow at 390px width
- primary card actions are off-screen
- selected power names are clipped behind buttons
- review mode cannot be reached on mobile
- sticky panels cover library content
