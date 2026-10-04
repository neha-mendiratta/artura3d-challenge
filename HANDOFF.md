# Handoff

Last updated: 2026-10-04

## Status

Phase 0 (Setup) complete. Phase 1 (Specs) in progress. No application code yet.

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

- Spec 01 (data model) approved: 3 tables (`orders`, `quotes`, `manufacturing_packets`), plain SQL with `pg`, UUID v7 ids from PostgreSQL 18, cursor pagination, index budget
- Spec 02 (pricing) approved: one function in `apps/api`, calculated in cents, rounded half up
- Spec 03 (order workflow) approved: Draft → Submitted, only notes editable after submit, quotes only for Submitted orders
- Spec 04 (API) approved: 6 brief endpoints + `GET /orders` and `PATCH /orders/{id}/notes`, one error format, idempotent quote
- Spec 05 (async packet) approved: worker in the API process, `FOR UPDATE SKIP LOCKED`, Completed or Failed, no retries
- `docs/recommendations.md`: improvements beyond the brief, for the interview
- `docs/plan.md`, `docs/conventions.md`, `docs/decisions.md`, spec templates `docs/specs/01–07`
- Docker Compose: `db` (dev, persistent volume) and `db-test` (in-memory, tests only), Postgres 18
- npm workspaces: `apps/api`, `packages/shared`
- One root `tsconfig.json` (TypeScript 6, strict) and one root `jest.config.js` (Jest 30 + ts-jest) for `apps/api` and `packages/shared`
- Setup verified: both databases healthy, a throwaway test passed in each workspace and typecheck passed, then the throwaway tests were removed

## In progress

Nothing.

## Next step

Write spec 06 (frontend), then developer review.

## Open questions

- Hosted deployment: deferred to the end (decision 3).

## Known issues

- `npm test` fails until code exists: `tsc` reports `TS18003: No inputs were found`, and Jest exits with an error when there are no tests. Resolves itself in Phase 2.
