# Handoff

Last updated: 2026-10-06

## Status

Complete. Everything in the brief is built and tested: the order API, the background manufacturing packet, the frontend and the 3D preview. 138 tests pass (`npm test`, which type-checks both apps first). Every edge case in the specs has a named test.

## How to run

Requirements: Docker Desktop, Node 22 (`nvm use`), pgAdmin 4 (optional).

```bash
nvm use
npm install
cp .env.example .env
npm run db:up        # starts the dev (5432) and test (5433) databases, waits until healthy
npm run app:up       # builds and runs the API in Docker on http://localhost:3000; runs migrations on start
npm run dev:web      # frontend on http://localhost:5173 (needs the API on :3000)
npm test             # type-checks the backend and the frontend, then runs all tests
npm run db:down      # stops the API and the databases (dev data is kept in a Docker volume)
```

Running the API outside Docker (reloads on save): `npm run db:migrate`, then `npm run dev:api` instead of `npm run app:up`.

Other commands:

```bash
npx jest apps/api    # one package's tests, no type check (also apps/web, packages/shared)
npm run spec         # regenerates apps/api/spec/openapi.yaml after an API change (a test fails if it is out of date)
```

pgAdmin: host `localhost`, port `5432`, database `artura`, user `artura`, password `artura`.

## What is built

**API** (`apps/api`): Express 5, Sequelize, PostgreSQL 18

- 8 endpoints: the brief's 6, plus `GET /orders` (cursor pages, status filter) and `PATCH /orders/{id}/notes`. One error format: `{ "error": { "code", "message" } }`
- Workflow: Draft → Submitted; a Submitted order is locked except its notes. Status checks run inside the `UPDATE`, so concurrent requests cannot both succeed
- Quote: Submitted orders only, idempotent (a unique `order_id` returns the same quote), priced in cents in one function (`pricing.ts`)
- Manufacturing packet: created with the quote in one transaction; a worker in the API process claims Pending packets with `FOR UPDATE SKIP LOCKED` and completes them. Connection errors leave a packet Pending for the next poll; other errors mark it Failed with a plain message, and the details are logged
- Patient data: database error details are hidden in the logs; Docker ports are published on `127.0.0.1` only
- API docs: Swagger UI at `/docs`; the contract as a file in `apps/api/spec/openapi.yaml`. Request schemas are generated from the shared Zod schema, and tests check that every route and model field is documented
- Runs in Docker: production dependencies only, non-root user, migrations on start

**Shared** (`packages/shared`): the Zod order schema, dimension limits and status types, used by both the form and the API, so their rules cannot differ.

**Frontend** (`apps/web`): React 19, Vite, Mantine, TanStack Query, React Router

- Orders list (status filter, Load more), new order page, order page
- Form validated with the shared schema; locked except notes once Submitted; Submit asks for confirmation
- Generate quote shows the total; the packet status is polled every 2 seconds while Pending, then stops

**3D preview** (`apps/web/src/components/OrthoticPreview.tsx`, `OrthoticModel.tsx`): react-three-fiber and drei

- A box sized and coloured live from the form, resized with `scale` (no new geometry while typing); half-typed values are clamped
- Orbit controls; measurement labels in mm on each edge (the extra feature)
- Redraws only on change; geometry, material and the WebGL context are released on unmount; loaded only when a form is shown (`React.lazy`)

## Where to find things

| What | Where |
|---|---|
| Setup and overview | [README.md](README.md) |
| Diagrams: system, API layers, data model, quote → packet flow, recommended production setup | [docs/architecture.md](docs/architecture.md) |
| One spec per feature, each with its edge cases and tests | [docs/specs/](docs/specs/) (01–07) |
| 37 decisions with reasons and alternatives | [docs/decisions.md](docs/decisions.md) |
| 12 improvements beyond the brief | [docs/recommendations.md](docs/recommendations.md) |
| How the code is written and tested | [docs/conventions.md](docs/conventions.md) |
| Phases and scope | [docs/plan.md](docs/plan.md) |
| API contract | `apps/api/spec/openapi.yaml`, or http://localhost:3000/docs |

## Known limitations

Out of scope for the brief; each has a recommendation.

- No sign-in or access control: anyone who can reach the API can read and change every order ([recommendations](docs/recommendations.md) §6)
- A Failed packet is final: there is no retry action (§11)
- Two people editing the same Draft: the last save wins (§12)
- The packet worker polls inside the API process (§3)
- Runs locally only; no hosted deployment (decision 3, §7)

## Next steps, if work continued

1. Sign-in and per-clinic access control (§6), since the orders hold patient data
2. A retry action for Failed packets, then a queue with separate workers at volume (§11, §3)
3. Hosting on AWS as in the production diagram (§7, `docs/architecture.md`)

## Open questions

None.

## Known issues

None.
