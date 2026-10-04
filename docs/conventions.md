# Conventions

## Simplicity

- Build only what the brief and approved specs ask for. Anything else is listed under "Out of scope" in the spec, not built.
- Improvement ideas beyond the brief go in [recommendations.md](recommendations.md) for discussion, not into the code.
- Plain functions and small files. No abstraction "just in case" (e.g. no repository classes wrapping Sequelize models).
- One place per rule: pricing in one function, status transitions in one function.
- Clear names over clever code. Comments only explain *why*, never *what*; keep them few.
- Few dependencies. Each one is justified in [decisions.md](decisions.md).

## Code structure

- Node, Express and TypeScript.
- Single responsibility: each file does one job (e.g. config, database connection, logger, one feature's queries, one feature's routes). No file holds everything.
- API folders by layer: `routes/` (HTTP only), `services/` (business rules), `middleware/` (validation, error handling), `models/` (Sequelize models).
- Reuse, don't repeat: shared helpers live in one place and are imported, never copied into each file.
- Written to scale: no work per request that grows with table size, no in-memory state that breaks with several API instances.

## Simple, not incomplete

Keep the implementation minimal, but every edge case in the spec must be handled and covered by a test. Simple means no unnecessary *abstraction*, never skipping validation, error handling or failure paths.

- Every spec has an **Edge cases** table: situation, expected behaviour (exact status code and error), test name.
- A spec is not approved until its edge cases are complete.
- New edge cases found later are added to the spec and get a test.

## Specs

Each file in `docs/specs/` uses these sections:

1. **Source**: the brief's requirements this spec covers
2. **Behaviour**: what happens, in plain rules
3. **Edge cases**: table as above
4. **Acceptance criteria**: numbered, each maps to at least one test
5. **Out of scope**
6. **Status**: Draft / Approved / Implemented

## Tests

- Jest. Test names describe behaviour, e.g. `returns 409 when submitting a Submitted order`.
- Unit tests for pure logic (pricing, transitions). Integration tests for endpoints against the test database.
- Tests never use the dev database. Test files run one at a time (`maxWorkers: 1`) because they share the test database.
- One Jest config at the root (`jest.config.js`).
- One `tsconfig.json` at the root for the backend packages. `npm test` type-checks (`tsc --noEmit`), then runs all tests. Jest alone does not type-check (ts-jest is transpile-only because `isolatedModules` is on).
- Quick run while iterating: `npx jest <path>` (no type check).
- Tests mirror the source folders: `src/routes/order-routes.ts` → `tests/routes/order-routes.test.ts`. Shared test code lives in `tests/helpers/` and `tests/setup/`.
- A step is done only when `npm test` passes.

## API

- JSON in and out. Errors use one shape: `{ "error": { "code": string, "message": string } }`.
- Status codes: 400 invalid input, 404 not found, 409 conflicts with current state, 500 unexpected.
- Money is stored and calculated in integer cents; shown as 2-decimal values.

## Logging

- pino, one shared logger in `apps/api`. No `console.log`.
- `pino-http` logs every request.
- Log unexpected errors (500s) and packet failures with `logger.error`, including the relevant id.
- Log only where it helps diagnose a problem. No logging in every function.

## Git

- Nothing is committed unless the developer explicitly asks.
- Intended granularity: one commit per completed step. Message: short imperative summary, body explains what and why.

## Handoff

`HANDOFF.md` is updated at the end of every step and every session.
