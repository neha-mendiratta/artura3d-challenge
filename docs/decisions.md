# Decisions

Short log. Newest at the bottom.

| # | Decision | Reason | Alternatives considered |
|---|---|---|---|
| 1 | Node + TypeScript for the backend | One language across backend, frontend and shared code; shared types and validation | .NET 8 + EF Core |
| 2 | PostgreSQL in Docker | Allowed by the brief; strong JSON support for the packet payload; same SQL concepts as MySQL | MySQL |
| 3 | Runs locally with Docker; no hosted deployment | The brief asks for a working system and setup instructions; Docker Compose starts the database and API with one command and needs no accounts. Only the connection string changes when deploying (see recommendations) | Hosting on a cloud platform |
| 4 | Express 5 | Most widely used Node framework; small and well understood. Version 5 passes errors from async handlers to the error middleware, so no wrapper code is needed. Request validation uses the shared Zod schemas | Fastify (built-in schema validation), NestJS (too heavy for this size) |
| 5 | Sequelize (ORM) | The brief asks for an ORM if applicable. Sequelize is mature and widely used with Postgres; typed models with `InferAttributes`. The concurrency-critical parts still map to clear SQL: conditional `update` with `where: { status: 'Draft' }`, a unique constraint surfaced as `UniqueConstraintError`, and `lock` + `skipLocked` for `FOR UPDATE SKIP LOCKED` | Prisma, TypeORM, Drizzle, plain SQL with `pg` |
| 6 | Zod schemas in a shared package | One set of validation rules for the API and the form | Separate validation per side |
| 7 | Vite for the frontend | Internal tool with its own API: no need for SSR/SEO; fastest dev setup | Next.js, Create React App (deprecated) |
| 8 | TanStack Query | Handles loading, errors, caching, refetch and packet-status polling without hand-written effects | Plain `fetch` + `useEffect`, SWR |
| 9 | Mantine | Good forms, tables and notifications for an ops-style UI | MUI, shadcn/ui |
| 10 | react-three-fiber + drei | React-friendly Three.js; orbit controls and HTML labels built in | Plain Three.js |
| 11 | Jest | Widely used; mature mocking and a large ecosystem | Vitest |
| 12 | npm workspaces | No extra tool to install | pnpm |
| 13 | Quotes only for Submitted orders | A quote triggers manufacturing, so it must be based on a locked order. The brief does not say; this is an interpretation | Allow quotes on Drafts |
| 14 | TypeScript 6 (not 7) | ts-jest supports TypeScript < 7 | TypeScript 7 with a different Jest transformer |
| 15 | PostgreSQL 18 | Built-in `uuidv7()`, so the database generates time-ordered ids itself | PostgreSQL 17 (no built-in `uuidv7()`; ids generated in the app) |
| 16 | Test database in its own container with in-memory storage (tmpfs) | Tests never touch dev data; fast; nothing to clean up between runs | Separate schema in the dev database |
| 17 | One root Jest config | `api` and `shared` share the same Node test setup; one file instead of one per package. The frontend will be added with Jest `projects` (jsdom) | One `jest.config.js` per package |
| 18 | `isolatedModules: true`; Jest transpiles only; `tsc` type-checks; `npm test` runs both | ts-jest requires `isolatedModules` with `module: nodenext`, and in that mode it strips types without checking them (fast tests). `tsc` checks every file, not only those imported by tests | `module: commonjs` so ts-jest type-checks (slower tests, still needs `tsc` for full coverage) |
| 19 | Keep `packages/shared` | Validation and statuses are used by both API and frontend; one source of truth, no backend code in the browser bundle | Duplicate rules in each app; frontend importing from `apps/api` |
| 20 | One root `tsconfig.json` for `apps/api` and `packages/shared` | Both run on Node with identical settings; one type-check run, no per-package config or scripts. The frontend gets its own `tsconfig.json` (browser types, JSX, Vite module mode) and is not included in the root one | `tsconfig.base.json` extended by one `tsconfig.json` per package |
| 21 | `sequelize-cli` migrations | The standard Sequelize way: numbered migration files tracked in the database (`SequelizeMeta`), so each runs once and can be undone | Plain SQL migrations with a separate tool |
| 22 | `snake_case` plural table names (`orders`, `quotes`, `manufacturing_packets`); units in column names (`length_mm`, `total_cents`) | `order` is a reserved word in SQL; Postgres folds unquoted names to lowercase, so camelCase would need quotes in every query. Units in names remove ambiguity: a unit mix-up in a manufacturing order is costly, and the brief names them `ThicknessMm`, `WidthMm` | Quoted `"Order"` tables with camelCase columns; unit-less names with units documented elsewhere |
| 23 | pino + pino-http for logging | Structured JSON logs; fast and actively maintained; `pino-http` logs every request with one line of setup | Bunyan (no longer actively developed, no request-logging package), winston (more configuration) |
| 24 | React Router 7 for pages | Standard routing for React; three pages with URLs that can be bookmarked. Version 7 ships CommonJS as well as ES modules, so Jest loads it without extra tooling | React Router 8 (ES modules only, needs Babel in Jest), TanStack Router |
| 25 | Mantine form for the order form | Part of the UI library already chosen; works with the shared Zod schema | react-hook-form |
| 26 | Measurement labels as the extra 3D feature | Lets the user check the model against the prescription at a glance; small and clearly useful | Preset camera views, left/right foot mirroring |
| 27 | `@react-three/test-renderer` for 3D tests | Renders the scene in Jest without a browser or graphics card, so size, colour and cleanup can be tested | Manual testing only |
| 28 | Supertest for API tests | Standard way to test Express endpoints: sends real HTTP requests to the app without opening a port | Calling route handlers directly |
| 29 | tsx to run the API (development and the Docker image) | Runs TypeScript directly, including the shared package's TypeScript source; no build step to configure | ts-node; compiling to JavaScript first (see recommendations) |
| 30 | React Testing Library + jsdom for frontend tests | Tests render components and interact like a user (find by text and role, click, type); jsdom simulates the browser in Jest | Testing implementation details (component state) |
| 31 | Plain `fetch` in one small API client | Built into the browser; one wrapper handles JSON and turns API errors into readable messages | axios |
| 32 | Dimension limits defined once in `packages/shared` (`DIMENSION_LIMITS`) | Used by the validation schema, the form inputs and the 3D preview; a range cannot differ between them | Repeating the numbers in each place |
| 33 | 3D preview loaded only when an order form is shown (`React.lazy`) | three.js is most of the frontend's size; the orders list does not need it, so it loads faster | One bundle for every page |
| 34 | Database error details hidden in logs (pino `redact`) | Sequelize errors carry the SQL and its values, which can include patient refs and notes; logs are often sent to other services | Not logging error objects at all (loses the error type and stack) |
| 35 | Docker ports published on `127.0.0.1` only | The databases and the API hold patient data; by default Docker makes them reachable from other machines on the network | Publishing on all interfaces (Docker's default) |
| 36 | A failed packet stores a fixed message; the real error is only logged | The packet's error is shown to users and must not reveal internals; support finds the details in the log by packet id | Storing the raw error message |
| 37 | OpenAPI docs served with Swagger UI (`swagger-ui-express`) at `/docs`; request schemas generated from the shared Zod schemas | One source for the validation rules and their documentation; tests check every route and model field is documented | A hand-written `openapi.yaml` (rules written twice and can drift); generating everything with `zod-openapi` (extra library for little gain) |
