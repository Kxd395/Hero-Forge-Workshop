# Curation Workflow

This document defines how a power moves from imported or generated inspiration into reviewed app canon.

## Canon Standard

A canon power must be:

- original enough for this project
- clearly categorized
- assigned intentional stats
- assigned intentional role guidance
- written in consistent app voice
- balanced by explicit weaknesses/counters
- free of obvious copyrighted character-specific framing

Imported text is inspiration. It is not canon copy.

## Promotion Flow

```text
Imported/generated candidate
  │
  ├─ screen for duplicates and low-quality content
  ├─ rewrite name/summary/description in app voice
  ├─ assign category and subcategory
  ├─ assign stats intentionally
  ├─ add strengths, weaknesses, counters
  ├─ add tags and role
  ├─ add tests if model behavior changes
  └─ commit as canon in src/data/superpowers.js
```

## Review Checklist

Before promotion:

- Does the power have a clear play pattern?
- Is it too broad to be useful without constraints?
- Does the weakness create story pressure?
- Does the category match user expectations?
- Can it work as Primary, Secondary, or Utility without confusing the builder?
- Does the name avoid protected franchise-specific language?
- Does it duplicate an existing canon power?

## Rejection Reasons

Use these reasons for future moderation/audit fields:

- `duplicate`
- `too-vague`
- `too-broad`
- `offensive`
- `copyright-risk`
- `non-power`
- `low-quality`
- `needs-rewrite`
- `unsafe-content`

## Canon Edit Rules

- Keep canon records small and intentional.
- Prefer one strong weakness over several decorative drawbacks.
- Use broad powers sparingly; they need concrete constraints.
- Do not make every popular imported power legendary.
- Do not copy imported descriptions verbatim into canon.

## Rollback

If a promoted power causes UX or balance problems:

1. Revert the canon record.
2. Regenerate taxonomy docs with `npm run docs:powers`.
3. Run `npm run test && npm run lint && npm run build`.
4. Add the rejection reason to the source candidate if moderation fields exist.
