# Security And Privacy

Hero Forge is currently a static client-side app. It has no backend API, no authentication, no server database, and no runtime third-party API calls.

## Current Data Flow

```text
Browser
  ├─ fetches static JSON from /public/data
  ├─ builds hero drafts in React state
  ├─ saves drafts to LocalStorage
  └─ exports text through the clipboard API when requested
```

## Sensitive Data

Current app data is low sensitivity:

- selected powers
- generated hero names
- civilian name field
- home base field
- motivation field
- story constraint field

Even though this is not regulated data, users may type personal text into profile fields. Treat saved drafts as user-controlled local data.

## Storage Rules

- Saved drafts stay in LocalStorage.
- No draft data is sent to a server.
- No API keys are stored in client code.
- No imported source credentials are needed.
- Clipboard write only happens after the user clicks Copy.

## Threat Model

| Risk | Current mitigation | Future requirement |
| --- | --- | --- |
| Malformed imported JSON | Runtime guards drop invalid records | Add schema validation in import script |
| Bad LocalStorage payload | Normalization and try/catch | Add versioned migrations |
| XSS through imported text | React escapes rendered strings | Keep avoiding `dangerouslySetInnerHTML` |
| Hardcoded secrets | No secrets required | Add secret scan before deploy |
| Oversized payload DoS | Static payload only | Add payload budgets and chunking |
| Offensive imported content | Visibility filter only | Add moderation workflow |

## Coding Rules

- Do not use `dangerouslySetInnerHTML` for imported power text.
- Do not put API keys in files committed to the repo.
- Do not expose future AI provider keys to the browser.
- Do not trust LocalStorage shape.
- Do not trust generated/imported records without runtime guards.

## Future Server/API Rules

If the app adds generation, accounts, or shared drafts:

- move API keys server-side
- validate request body size and shape
- rate-limit generation endpoints
- add request correlation IDs
- store only the minimum needed user data
- provide draft delete/export behavior
- add abuse monitoring for generated content

## Release Checks

Before deploy:

```bash
npm run test
npm run test:e2e
npm run lint
npm run build
```

Manual checks:

- search for committed secrets
- confirm no `dangerouslySetInnerHTML`
- confirm generated/imported data is static and attributed
- confirm LocalStorage failure does not crash the app

## Rollback

If a security issue ships:

1. Disable the affected feature or revert the release.
2. Remove exposed secrets immediately if any exist.
3. Rotate any affected credentials.
4. Publish a fixed build.
5. Add a regression test or release checklist item.
