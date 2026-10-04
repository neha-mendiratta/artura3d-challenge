# Handoff

Last updated: 2026-10-04

## Status

Phase 0 (Setup) and Phase 1 (Specs) complete. Phase 2 (Backend) in progress: data model, pricing and order workflow done.

## How to run

Requirements: Docker Desktop, Node 22 (`nvm use`), pgAdmin 4 (optional).

```bash
nvm use
npm install
cp .env.example .env
npm run db:up        # starts dev (5432) and test (5433) Postgres, waits until healthy
npm run db:migrate   # runs sequelize-cli migrations on the dev database (tests migrate the test database themselves)
npm run dev:api      # starts the API on http://localhost:3000 with reload on save
npm test             # type-checks (tsc --noEmit), then runs all tests
npx jest apps/api    # quick run of one package's tests (no type check)
# inside apps/api or packages/shared, `npm test` calls the root script for that package only
npm run db:down      # stops the databases (dev data is kept in a Docker volume)
```

pgAdmin: host `localhost`, port `5432`, database `artura`, user `artura`, password `artura`.

## Done

- Spec 01 (data model) approved: 3 tables (`orders`, `quotes`, `manufacturing_packets`), Sequelize models, UUID v7 ids from PostgreSQL 18, cursor pagination, index budget
- Spec 02 (pricing) approved: one function in `apps/api`, calculated in cents, rounded half up
- Spec 03 (order workflow) approved: Draft → Submitted, only notes editable after submit, quotes only for Submitted orders
- Spec 04 (API) approved: 6 brief endpoints + `GET /orders` and `PATCH /orders/{id}/notes`, one error format, idempotent quote
- Spec 05 (async packet) approved: worker in the API process, `FOR UPDATE SKIP LOCKED`, Completed or Failed, no retries
- Spec 06 (frontend) approved: orders list, new order and order pages; shared Zod validation; packet status polling
- Spec 07 (3D preview) approved: box model sized and coloured from the form, orbit controls, WebGL cleanup, measurement labels
- Data model implemented: Sequelize migration (`apps/api/migrations`), models (`apps/api/src/models`), `config.ts`, `logger.ts`, `db.ts`; 11 tests pass against the test database
- Pricing implemented: `apps/api/src/pricing.ts`, 4 unit tests
- Order workflow implemented: Express app (`app.ts`, `server.ts`), `errors.ts`, `middleware/` (validate, error handler), `routes/order-routes.ts`, `services/order-service.ts`, shared Zod schema in `packages/shared`; create, get, edit, notes, submit; 20 tests
- `docs/recommendations.md`: improvements beyond the brief, for the interview
- `docs/plan.md`, `docs/conventions.md`, `docs/decisions.md`, spec templates `docs/specs/01–07`
- Docker Compose: `db` (dev, persistent volume) and `db-test` (in-memory, tests only), Postgres 18
- npm workspaces: `apps/api`, `packages/shared`
- One root `tsconfig.json` (TypeScript 6, strict) and one root `jest.config.js` (Jest 30 + ts-jest) for `apps/api` and `packages/shared`
- Setup verified: both databases healthy, a throwaway test passed in each workspace and typecheck passed, then the throwaway tests were removed

## In progress

Nothing.

## Next step

Phase 2: rest of the API (spec 04): quote, orders list, packet.

## Notes for later steps

- Spec 03 test `rejects quoting a draft order` is written with the quote endpoint (next step).
- `OrderStatus` and `PacketStatus` are in `apps/api/src/types.ts`. Move them to `packages/shared` when the frontend needs them (Phase 3).

## Open questions

- Hosted deployment: deferred to the end (decision 3).

## Known issues

None.
