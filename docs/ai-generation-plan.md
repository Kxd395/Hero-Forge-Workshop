# AI Generation Plan

This document defines the boundary for future AI-generated powers or hero drafts. No provider API should be wired into the app until these constraints are implemented.

## Product Boundary

AI generation should assist the workshop. It should not replace the curated model.

Allowed generation targets:

- power name ideas
- power descriptions
- strengths, limits, and counters
- hero alias options
- origin/story prompts
- full draft summaries based on selected powers

Disallowed first version targets:

- automatic canon promotion
- unreviewed public sharing
- provider calls from browser-only code
- unrestricted free-form generation without schema validation

## Architecture

Future provider calls must run server-side.

```text
Browser
  │
  ├─ selected powers + user prompt
  ▼
Server endpoint
  ├─ auth/rate limit if accounts exist
  ├─ validate request schema
  ├─ add system prompt and safety rules
  ├─ call model provider
  ├─ validate response schema
  └─ return generated draft
```

## Required Schema

Generated powers should return structured data:

```js
{
  name: "string",
  category: "physical|elemental|psychic|energy|mobility|biological|tech|mystic|cosmic|stealth",
  summary: "string",
  strengths: ["string"],
  weaknesses: ["string"],
  counters: ["string"],
  suggestedSlot: "primary|secondary|utility",
  scope: "focused|versatile|expansive",
  riskLevel: "low|medium|high|extreme"
}
```

Invalid responses must be rejected, not patched silently.

## Safety Rules

- Do not ask the model to imitate a specific copyrighted hero.
- Do not generate explicit sexual content, hate content, or graphic gore.
- Do not generate real-world instructions for harm.
- Do not accept generated HTML.
- Do not render generated text through `dangerouslySetInnerHTML`.
- Label generated content as generated until curated.

## Cost Controls

- Require a user action before generation.
- Limit prompt size.
- Limit max generations per action.
- Cache draft generation only when privacy rules permit it.
- Add provider timeout and retry limits.
- Log request metadata without storing private prompt text by default.

## Observability

Future server logs should include:

- correlation ID
- route name
- model/provider
- latency
- token or cost estimate when available
- validation success/failure
- safety rejection reason

Do not log API keys or full user drafts by default.

## Rollback

If generation misbehaves:

1. Disable the generation UI.
2. Disable the server route.
3. Keep manual hero-building functional.
4. Review logs for validation/safety failures.
5. Add regression cases before re-enabling.
