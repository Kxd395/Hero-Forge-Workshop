# ADR 0001: Structured Power Catalog Scaffold

## Status

Accepted

## Context

The application needs a foundation for superhero power cards, category breakdowns, and a base list of powers. Hardcoding powers directly into UI components would make future features such as hero builders, matchup simulators, scoring, and persistence harder to evolve.

## Decision

Use a Vite/React frontend with plain CSS and structured local JavaScript data for the MVP.

- `src/data/superpowers.js` defines categories and base powers.
- `src/utils/powerModel.js` owns validation, grouping, filtering, and scoring.
- `src/App.jsx` renders skill cards, category filters, category breakdowns, and the base power list.

## Alternatives Considered

- Static HTML only: lower setup cost, but weaker component boundaries for a growing app.
- Database-backed app immediately: unnecessary operational cost before the data model is stable.
- Next.js: useful for routing and server rendering later, but heavier than needed for the first scaffold.

## Rollback

This scaffold is self-contained. Rollback is a standard git revert of this ADR and the files added with the initial scaffold:

```bash
git revert <commit-sha>
```

If no commit exists yet, remove `package.json`, `index.html`, `eslint.config.js`, `README.md`, `docs/`, and `src/`.

## Complexity

- Filtering powers is `O(n * m)`, where `n` is the number of powers and `m` is the searchable text size per power.
- Grouping powers by category is currently `O(c * n)`, where `c` is category count. This is acceptable for the MVP catalog size and can be changed to an indexed map if the dataset grows.
- Rendering is `O(v)`, where `v` is the number of visible powers.
