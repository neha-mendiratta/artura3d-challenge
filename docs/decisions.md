# Decisions

Short log. Newest at the bottom.

| # | Decision | Reason | Alternatives considered |
|---|---|---|---|
| 1 | Node + TypeScript for the backend | One language across backend, frontend and shared code; shared types and validation | .NET 8 + EF Core |
| 2 | PostgreSQL in Docker | Allowed by the brief; strong JSON support for the packet payload; same SQL concepts as MySQL | MySQL |
| 3 | Local-first; hosted deployment at the end | Build without accounts; only the connection string changes when deploying | Hosting from day one |
| 4 | Express 5 | Most widely used Node framework; small and well understood. Version 5 passes errors from async handlers to the error middleware, so no wrapper code is needed. Request validation uses the shared Zod schemas | Fastify (built-in schema validation), NestJS (too heavy for this size) |
| 5 | Plain SQL with `pg` (no ORM) | The brief says "an ORM if applicable". With 3 tables and concurrency-critical queries (`UPDATE ... WHERE status`, `ON CONFLICT DO NOTHING`, `FOR UPDATE SKIP LOCKED`), explicit SQL is clearer and shows exactly what runs. Inputs are validated by Zod; every query is covered by integration tests against a real database | Prisma (the key queries would still need raw SQL), Drizzle, TypeORM |
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
| 19 | Keep `packages/shared` | Validation, pricing and statuses are used by both API and frontend; one source of truth, no backend code in the browser bundle | Duplicate rules in each app; frontend importing from `apps/api` |
| 20 | One root `tsconfig.json` for `apps/api` and `packages/shared` | Both run on Node with identical settings; one type-check run, no per-package config or scripts. The frontend gets its own `tsconfig.json` (browser types, JSX, Vite module mode) and is not included in the root one | `tsconfig.base.json` extended by one `tsconfig.json` per package |
| 21 | `node-pg-migrate` with SQL migration files | Numbered migrations tracked in the database, so each runs once; files are plain SQL you can read | Hand-written migration runner; ORM-generated migrations |
| 22 | `snake_case` plural table names (`orders`, `quotes`, `manufacturing_packets`) | `order` is a reserved word in SQL; Postgres convention; no quoting in queries | Quoted `"Order"` tables with camelCase columns |
