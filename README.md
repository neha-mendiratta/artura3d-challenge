# Artura3D orthotic orders

A small full-stack app for creating and processing custom orthotic manufacturing orders, built for the Artura3D Senior Fullstack coding challenge.

- Create and edit orders (patient ref, length, width, thickness, colour, expedite, notes), validated with the same rules in the form and the API
- Submit an order (Draft → Submitted); after that only the notes can change
- Generate a quote for a Submitted order (idempotent: asking again returns the same quote)
- A manufacturing packet is built in the background (Pending → Completed or Failed); the order page shows its status
- A 3D preview of the orthotic next to the form: resizes and recolours live, orbit controls, measurement labels in mm

## Stack

| Part | Choice |
|---|---|
| Backend | Node 22, TypeScript, Express 5, Sequelize, PostgreSQL 18 |
| Frontend | React 19, Vite, Mantine, TanStack Query, React Router, react-three-fiber |
| Shared | Zod validation schemas and status types used by both sides |
| Tests | Jest, Supertest, React Testing Library, `@react-three/test-renderer` |

Reasons for each choice: [docs/decisions.md](docs/decisions.md).

## Requirements

- Docker Desktop (running)
- Node 22 (`.nvmrc` is included: run `nvm use`)

## Run it

```bash
nvm use
npm install
cp .env.example .env
npm run db:up        # starts the dev database (port 5432) and the test database (port 5433)
npm run app:up       # builds and starts the API in Docker on http://localhost:3000 (runs migrations on start)
npm run dev:web      # starts the frontend on http://localhost:5173
```

Open http://localhost:5173.

To run the API outside Docker instead (reloads on save), use these in place of `npm run app:up`:

```bash
npm run db:migrate   # creates the tables in the dev database
npm run dev:api      # API on http://localhost:3000
```

Stop the databases and the API with `npm run db:down`. Dev data is kept in a Docker volume.

To browse the database (e.g. pgAdmin): host `localhost`, port `5432`, database `artura`, user `artura`, password `artura`.

## Tests

```bash
npm run db:up        # the API tests use the test database
npm test             # type-checks the backend and frontend, then runs every test
```

`npx jest apps/api`, `npx jest apps/web` or `npx jest packages/shared` runs one package's tests without the type check.

## API

| Endpoint | Purpose |
|---|---|
| `GET /orders` | List orders, newest first; `status` filter and cursor pages |
| `POST /orders` | Create a Draft order |
| `GET /orders/{id}` | Get an order with its quote |
| `PUT /orders/{id}` | Edit a Draft order |
| `PATCH /orders/{id}/notes` | Edit the notes (any status) |
| `POST /orders/{id}/submit` | Submit a Draft order |
| `POST /orders/{id}/quote` | Create the quote and the manufacturing packet (Submitted orders only) |
| `GET /orders/{id}/packet` | Get the manufacturing packet and its status |

**Interactive docs:** with the API running, open http://localhost:3000/docs (Swagger UI; the OpenAPI document is at `/openapi.json`). You can try each endpoint from there.

Errors use one format: `{ "error": { "code", "message" } }`, with `code` one of `VALIDATION_ERROR` (400), `NOT_FOUND` (404), `CONFLICT` (409) or `INTERNAL_ERROR` (500). Full contract: [docs/specs/04-api.md](docs/specs/04-api.md).

**Pricing:** $100 base + $2 per mm of thickness + $0.50 per mm of width, +15% if expedited. Calculated in cents and rounded half up ([docs/specs/02-pricing.md](docs/specs/02-pricing.md)).

## Project layout

```
apps/api          Express API: routes, services (business rules), models, migrations, packet worker
apps/web          React frontend: pages, components (incl. the 3D preview), hooks, API client
packages/shared   Zod schemas, dimension limits and status types used by both apps
docs/             plan, specs, decisions, conventions, recommendations
```

## Docs

- [docs/architecture.md](docs/architecture.md): diagrams of the system, the API layers, the data model, the quote → packet flow, and the recommended production setup
- API reference: Swagger UI at http://localhost:3000/docs when the API is running
- [docs/specs/](docs/specs/): one spec per feature, each with its edge cases and the test that covers each one
- [docs/decisions.md](docs/decisions.md): decisions with reasons and alternatives
- [docs/recommendations.md](docs/recommendations.md): improvements beyond the brief (scaling, queue-based workers, authentication, hosting)
- [docs/conventions.md](docs/conventions.md): how the code is written and tested
