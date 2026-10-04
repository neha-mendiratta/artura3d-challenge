# Conventions

## Simplicity

- Build only what the brief and approved specs ask for. Anything else is listed under "Out of scope" in the spec, not built.
- Improvement ideas beyond the brief go in [recommendations.md](recommendations.md) for discussion, not into the code.
- Plain functions and small files. No abstraction "just in case" (e.g. no repository classes wrapping simple SQL queries).
- One place per rule: pricing in one function, status transitions in one function.
- Clear names over clever code. Comments only explain *why*, never *what*.
- Few dependencies. Each one is justified in [decisions.md](decisions.md).

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
- Tests never use the dev database.
- One Jest config at the root (`jest.config.js`).
- One `tsconfig.json` at the root for the backend packages. `npm test` type-checks (`tsc --noEmit`), then runs all tests. Jest alone does not type-check (ts-jest is transpile-only because `isolatedModules` is on).
- Quick run while iterating: `npx jest <path>` (no type check).
- A step is done only when `npm test` passes.

## API

- JSON in and out. Errors use one shape: `{ "error": { "code": string, "message": string } }`.
- Status codes: 400 invalid input, 404 not found, 409 conflicts with current state, 500 unexpected.
- Money is stored and calculated in integer cents; shown as 2-decimal values.

## Git

- Nothing is committed unless the developer explicitly asks.
- Intended granularity: one commit per completed step. Message: short imperative summary, body explains what and why.

## Handoff

`HANDOFF.md` is updated at the end of every step and every session.
