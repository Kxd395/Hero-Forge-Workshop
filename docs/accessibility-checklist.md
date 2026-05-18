# Accessibility Checklist

Hero Forge is a dense dark-mode tool. Accessibility must be handled as part of the product model, not as a final visual pass.

## Current Expectations

- All interactive controls are reachable by keyboard.
- Buttons use real `<button>` elements.
- Search uses a real text input with a visible label or placeholder.
- Assignment feedback uses `role="status"` and `aria-live="polite"`.
- Cards do not rely only on color to communicate role, risk, or source.
- Text must not be hidden behind badges, sticky panels, or clipped card headers.

## Keyboard Flow

Expected tab order:

1. Top navigation
2. Hero action button
3. Hero summary actions
4. Library search
5. Source/category/filter controls
6. Power cards
7. Compare tray
8. Hero Forge panel

Required behavior:

- Focus indicator is visible on dark backgrounds.
- Enter/Space activates buttons.
- Filter chips do not trap focus.
- Popovers can be opened by keyboard-triggered buttons.
- Popovers must not hide the card's core action.

## Screen Reader Rules

- Assignment changes announce the selected power and target slot.
- Empty states explain what changed and how to recover.
- Icon-only buttons need accessible names.
- Decorative icons should be hidden from assistive technology.
- Review mode must say whether it is showing all selected powers or a specific slot.

## Visual Rules

- Minimum body text contrast target: WCAG AA.
- Risk colors must be paired with text labels.
- Small pills must not be the only place key state is shown.
- Long names must wrap instead of clipping.
- Mobile layout must keep the forge panel reachable without horizontal scroll.

## Motion Rules

- Avoid required motion.
- Respect `prefers-reduced-motion` for future animations.
- Sliding/sticky panels must not reveal background text through the active layer.

## Test Plan

Current automated coverage:

```bash
npm run test:e2e
```

Automated smoke coverage includes:

- keyboard-only source filtering, search, and primary assignment
- keyboard activation for a power card's Full details and Close controls
- mobile-width horizontal overflow checks
- long imported power names wrapping instead of clipping

Manual checks still required:

- full tab-order traversal across filters, cards, compare tray, and Hero draft
- mobile viewport at 390px width
- browser zoom at 200%
- macOS VoiceOver read-through of library and forge panel

Future automation:

- add axe-based checks
- add broader tab-order traversal smoke test
- add screenshot checks for sticky panel and card details clipping

## Release Gate

A release should not ship if:

- primary actions are unreachable by keyboard
- selected powers cannot be reviewed without visual guessing
- card text overlaps or clips at common mobile widths
- assignment changes are silent to assistive tech
