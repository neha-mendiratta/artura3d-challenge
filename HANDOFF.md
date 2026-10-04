# Handoff

Last updated: 2026-10-04

## Status

Phase 0 (Setup) complete. No application code yet. Next: Phase 1, specs.

## How to run

Requirements: Docker Desktop, Node 22 (`nvm use`), pgAdmin 4 (optional).

```bash
nvm use
npm install
cp .env.example .env
npm run db:up        # starts dev (5432) and test (5433) Postgres, waits until healthy
npm test             # type-checks (tsc --noEmit), then runs all tests
npx jest apps/api    # quick run of one package's tests (no type check)
# inside apps/api or packages/shared, `npm test` calls the root script for that package only
npm run db:down      # stops the databases (dev data is kept in a Docker volume)
```

pgAdmin: host `localhost`, port `5432`, database `artura`, user `artura`, password `artura`.

## Done

- `docs/plan.md`, `docs/conventions.md`, `docs/decisions.md`, spec templates `docs/specs/01–07`
- Docker Compose: `db` (dev, persistent volume) and `db-test` (in-memory, tests only), Postgres 18
- npm workspaces: `apps/api`, `packages/shared`
- One root `tsconfig.json` (TypeScript 6, strict) and one root `jest.config.js` (Jest 30 + ts-jest) for `apps/api` and `packages/shared`
- Setup verified: both databases healthy, a throwaway test passed in each workspace and typecheck passed, then the throwaway tests were removed

## In progress

Nothing.

## Next step

Phase 1: write spec 01 (data model), then developer review.

## Open questions

- Notes edit after submit: `PATCH /orders/{id}/notes` or `PUT` accepting only `notes` when Submitted (decide in spec 04).
- Hosted deployment: deferred to the end (decision 3).

## Known issues

- `npm test` fails until code exists: `tsc` reports `TS18003: No inputs were found`, and Jest exits with an error when there are no tests. Resolves itself in Phase 2.
