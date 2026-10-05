# Handoff

Last updated: 2026-10-05

## Status

Phase 0 (Setup) and Phase 1 (Specs) complete. Phases 0–3 complete (setup, specs, backend, frontend). Next: Phase 4, 3D preview.

## How to run

Requirements: Docker Desktop, Node 22 (`nvm use`), pgAdmin 4 (optional).

```bash
nvm use
npm install
cp .env.example .env
npm run db:up        # starts only the dev (5432) and test (5433) databases, waits until healthy
npm run db:migrate   # runs sequelize-cli migrations on the dev database (tests migrate the test database themselves)
npm run dev:api      # starts the API on http://localhost:3000 with reload on save
npm run app:up       # or: builds and runs the API in Docker (port 3000) with its database; runs migrations on start
npm run dev:web      # frontend on http://localhost:5173 (needs the API on :3000); run `nvm use` first, Vite needs Node 22
npm test             # type-checks the backend and the frontend, then runs all tests
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
- Order page workflow: `SubmitOrderButton` (confirmation dialog), `QuotePanel` (Generate quote, total), `PacketPanel` + `hooks/packet.ts` (polls every 2 s while Pending, then stops); 113 tests in total
- Order form: `components/OrderForm.tsx` (shared Zod schema via Mantine `schemaResolver`, locked except notes when Submitted), new order and order pages, `hooks/orders.ts` mutations, `query-client.ts` (global error notification), `constants.ts` (new order defaults)
- Orders list page: `pages/OrdersListPage.tsx`, `hooks/orders.ts` (`useOrders`, infinite query with cursor), `components/StatusBadge.tsx`; status filter, Load more, empty and error states
- Frontend shell: `apps/web` (Vite, React, Mantine, TanStack Query, React Router 7); `api/` client and endpoint functions, layout, routes for the 3 pages (titles only so far), `utils/format.ts`; status types moved to `packages/shared`
- API runs in Docker: `apps/api/Dockerfile` (node:22-alpine, production dependencies only, non-root user, migrations on start), `api` service in Docker Compose, `.dockerignore`
- Packet worker implemented: `workers/packet-worker.ts` (claims with FOR UPDATE SKIP LOCKED, drains all Pending packets every second), `services/packet-payload.ts`; started by `server.ts`; 77 tests in total
- API endpoints implemented: orders list (cursor pages, status filter), idempotent quote (`services/quote-service.ts`), packet (`services/packet-service.ts`)
- Order workflow implemented: Express app (`app.ts`, `server.ts`), `errors.ts`, `middleware/` (validate, error handler), `routes/order-routes.ts`, `services/order-service.ts`, shared Zod schema in `packages/shared`; create, get, edit, notes, submit
- `docs/recommendations.md`: improvements beyond the brief, for the interview
- `docs/plan.md`, `docs/conventions.md`, `docs/decisions.md`, spec templates `docs/specs/01–07`
- Docker Compose: `db` (dev, persistent volume) and `db-test` (in-memory, tests only), Postgres 18
- npm workspaces: `apps/api`, `packages/shared`
- One root `tsconfig.json` (TypeScript 6, strict) and one root `jest.config.js` (Jest 30 + ts-jest) for `apps/api` and `packages/shared`
- Setup verified: both databases healthy, a throwaway test passed in each workspace and typecheck passed, then the throwaway tests were removed

## In progress

Nothing.

## Next step

Phase 4: 3D preview (spec 07), next to the order form on the new order and order pages.

## Open questions

- Hosted deployment: deferred to the end (decision 3).

## Known issues

None.
