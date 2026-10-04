# Plan

Single source of progress. Tick a task only when its spec is approved and its tests pass.

## Goal

A small full-stack app for creating and processing custom orthotic manufacturing orders, built from the Artura3D Senior Fullstack coding challenge brief.

## Stack

| Part | Choice |
|---|---|
| Backend | Node 22 + TypeScript 6, Express 5, `pg` (plain SQL), `node-pg-migrate`, pino |
| Database | PostgreSQL 18 in Docker (dev + separate test database) |
| Frontend | React + TypeScript, Vite, Mantine, TanStack Query, react-three-fiber |
| Shared | TypeScript package: Zod schemas, status types |
| Tests | Jest (backend and frontend) |
| Repo | npm workspaces |

Reasons and alternatives: see [decisions.md](decisions.md).

## Scope

### In scope (from the brief)

- Endpoints: `POST /orders`, `PUT /orders/{id}` (Draft only), `GET /orders/{id}`, `POST /orders/{id}/submit`, `POST /orders/{id}/quote` (idempotent), `GET /orders/{id}/packet`
- Pricing rules
- Workflow rules: Draft → Submitted, Submitted is immutable except Notes, submitting twice is an error
- Async manufacturing packet: Pending → Completed / Failed, JSON payload persisted
- UI: order form with validation, editing disabled when Submitted, submit button, generate and show quote, packet status
- 3D preview: orthotic model, live dimension controls, colour selection, orbit controls, WebGL cleanup, one extra feature

### Added (needed to make the brief work)

- `GET /orders`: the UI needs a way to find existing orders
- Editing Notes after submit: the brief allows it; endpoint shape decided in [specs/04-api.md](specs/04-api.md)
- 3D extra: measurement labels (mm) on the model

### Out of scope

Optimistic locking, packet retry endpoint, failure-injection flag, duplicate order, keyboard shortcuts, PNG snapshot, Playwright, CI, authentication.

Edge cases are never out of scope: see [conventions.md](conventions.md).

## Workflow per feature

1. Write spec in `docs/specs/`
2. Review and approval by the developer
3. Write Jest tests from the acceptance criteria and edge cases
4. Write the minimum code that passes them
5. Tick the task here, update `HANDOFF.md`. Commit only when the developer asks

## Phases

### Phase 0: Setup

- [x] Repo, git, docs skeleton
- [x] Docker Compose: Postgres (dev, port 5432) + Postgres (test, port 5433)
- [x] npm workspaces, TypeScript, Jest skeleton for `apps/api` and `packages/shared`

### Phase 1: Specs (review before any feature code)

- [x] 01 Data model
- [x] 02 Pricing
- [x] 03 Order workflow
- [x] 04 API
- [x] 05 Async packet
- [ ] 06 Frontend
- [ ] 07 3D preview

### Phase 2: Backend

- [ ] Data model: SQL migrations
- [ ] Pricing
- [ ] Order workflow
- [ ] API endpoints
- [ ] Async packet worker
- [ ] API Dockerfile + `api` service in Docker Compose

### Phase 3: Frontend

- [ ] App shell, routing, API client
- [ ] Orders list
- [ ] Order form (create, edit, validation, locked when Submitted)
- [ ] Submit, quote, packet status

### Phase 4: 3D preview

- [ ] Model, dimension controls, colour, orbit controls
- [ ] WebGL cleanup
- [ ] Measurement labels

### Phase 5: Wrap-up

- [ ] README with setup instructions
- [ ] Interview talking points (`docs/talking-points.md`)
- [ ] Final `HANDOFF.md`
