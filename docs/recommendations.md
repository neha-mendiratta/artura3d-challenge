# Recommendations

Improvements beyond the brief. Not built: the app follows the brief exactly. Kept here to discuss at the interview.

## 1. Single order "stage" for ops users

**Today (as per brief):** order status is `Draft` or `Submitted`. Packet status (`Pending`, `Completed`, `Failed`) is separate. The UI shows both.

**Recommendation:** give ops users one status that says where an order is, e.g. `Draft → Submitted → Processing → ReadyForManufacturing` (or `PacketFailed`).

**Options:**

- **Derived stage (preferred first step):** compute it in the API from data already stored (order status, quote exists, packet status). Each fact stays in one place, so it can never contradict the packet.
- **Stored status:** add the statuses to the order and update order + packet in one transaction. Simpler filtering at high volume, but the same fact is stored twice and must be kept in sync.

**Why:** an ops manager working through many orders needs to see and filter "ready for manufacturing" at a glance.

## 2. Scaling the database further

The data model already handles large tables (time-ordered ids, cursor pagination, targeted indexes, no full counts, safe concurrent workers; see spec 01). Beyond that, at much larger scale:

- **Connection pooling** (e.g. PgBouncer): many API instances each opening connections can exhaust Postgres.
- **Partitioning `Order` by month** (`createdAt`): queries and maintenance touch only recent partitions.
- **Archiving** completed orders older than N months to cheaper storage.
- **Read replica** for the orders list and reporting, keeping the primary for writes.
- **Payload in object storage** (e.g. S3) if packets grow beyond small JSON (e.g. real 3D scan files), storing only a link in the database.
- **Full-text or trigram search** on `patientRef` if ops users need "contains" search rather than exact/prefix.

## 3. Packet processing with a queue and serverless workers

**Today:** a worker inside the API process polls the database every second and processes every Pending packet before waiting again. Each packet is one short transaction with indexed queries, and several instances share the work with `FOR UPDATE SKIP LOCKED`.

**First steps as volume grows (no new infrastructure):**

- **Claim packets in batches** (e.g. `LIMIT 50`) instead of one at a time: fewer round trips per packet.
- **A partial index** on `manufacturing_packets (id) WHERE status = 'Pending'`: it holds only the few Pending rows, so it stays small however many packets have been completed.

**Recommendation for production at high volume:** the quote request puts a message on a queue (e.g. AWS SQS) and a serverless function (e.g. AWS Lambda) processes it. Work starts immediately with no polling, it scales automatically, has built-in retries and a dead-letter queue for failures, and keeps the work separate from the API.

- **The packet table stays.** It holds each packet's status, payload and error for the UI and for support; the queue only replaces the polling.
- **No lost messages (transactional outbox).** If the API saved the quote and then sent the message, a crash in between would leave a packet with no message. The Pending packet is already written in the same transaction as the quote, so it acts as the outbox: a small job sends any Pending packet that has not been queued yet.
- **SNS only if several systems need the event** (e.g. manufacturing, clinic notifications, analytics): SNS fans one "order quoted" event out to one SQS queue per consumer. For a single consumer, SQS alone is enough.

## 4. Compiled production image

**Today:** the Docker image runs the TypeScript source with `tsx`, which keeps the setup simple and lets the shared package be used as source.

**Recommendation for production:** compile the API and the shared package to JavaScript in a separate build stage (multi-stage Dockerfile) and run `node dist/server.js`. Faster startup, a smaller image without TypeScript tooling, and no compiler at runtime.

## 5. Secrets in production

**Today:** the database user and password are written in `docker-compose.yml` and `.env.example`. That is fine for the local and test databases only; `.env` is git-ignored.

**Recommendation for production:**

- Store the database credentials in **AWS Secrets Manager**, encrypted with a **KMS** key (KMS manages the encryption key; Secrets Manager stores the secret).
- Inject them at runtime as the `DATABASE_URL` environment variable (e.g. from the ECS task definition's `secrets`), so they never appear in the code, the image or git.
- Grant the API's IAM role read access to that one secret only, and turn on automatic rotation.

No code change is needed: the API already reads `DATABASE_URL` from the environment (`config.ts`) and fails at startup if it is missing.

## 6. Authentication and authorization

**Today (as per brief):** no login. Anyone who can reach the API can list every order (`GET /orders`) and read, edit and submit any of them. Locally, the API and databases are only reachable from the same machine.

What already holds: ids are UUID v7 (not guessable or countable), invalid ids are rejected before the database, queries are parameterised, patient data travels in request bodies, not URLs, and database error details (which can contain patient data) are hidden in the logs.

**Recommendation for production** (orders relate to patients, so this is health data):

- **Authentication:** users sign in through an identity provider (e.g. AWS Cognito or Auth0, OIDC/JWT); every API request carries a token, verified by middleware.
- **Authorization:** each order belongs to an organisation (lab). Every query includes it, e.g. `WHERE id = :id AND org_id = :userOrg`, so another lab's order returns 404. A hard-to-guess id identifies a record; it never protects it (insecure direct object reference).
- HTTPS everywhere, rate limiting, and an audit log of who changed which order.

## 7. Hosted deployment

**Today:** the system runs locally with Docker Compose (database and API) and Vite (frontend).

**Recommendation:** host the API image on a container service (e.g. AWS ECS Fargate or App Runner), the database on a managed PostgreSQL (e.g. Amazon RDS), and the frontend as static files on a CDN (e.g. S3 + CloudFront). Only configuration changes: the database connection string and the API URL. Add a CI pipeline that runs `npm test` and builds the image on every push.

## 8. Protecting health data

Beyond sign-in (§6), for patient data in production:

- **Encryption:** in transit (HTTPS, and TLS to the database with `sslmode=require`) and at rest (encrypted RDS storage and backups, KMS keys).
- **Store less:** the packet payload copies the patient ref and notes. Send manufacturing only what it needs (often an order number and the dimensions), so patient data lives in one table.
- **Guide the free text:** the form already asks for a patient code, not a name. Notes can still hold health details; a short policy for what belongs there helps.
- **Retention:** decide how long orders are kept, then delete or anonymise them on a schedule.
- **Logs:** SQL logging (`LOG_LEVEL=debug`) can include values, so keep it off in production, and limit who can read the logs.
- **HTTP hardening:** security headers (e.g. `helmet`, a Content Security Policy), CORS limited to the app's own domain, rate limiting.
- **Compliance:** health information is sensitive under privacy law (e.g. Australia's Privacy Act, HIPAA in the US); the steps above support it.

## 9. Database connections at scale

**Today:** Sequelize's default pool: up to 5 connections per API instance; a request waits up to 60 seconds for a free one.

That is plenty here: each request runs a few short queries, so 5 connections serve hundreds of requests per second. At larger scale:

- **Make the pool configurable** (size and wait time from environment variables) and use a short wait (e.g. 5 seconds), so overload fails fast instead of after a minute.
- **Postgres allows about 100 connections in total**, so instances × pool size must stay below it (5 × 19 ≈ 95). A connection pooler (**PgBouncer** or **RDS Proxy**) lets many instances share a few database connections.
- **Monitor** how long requests wait for a connection: it is the first sign of overload.

## 10. Graceful shutdown and health check

**Today:** stopping the API ends it straight away. A packet being processed is safe (its transaction rolls back and it stays `Pending`), but HTTP requests in progress are cut off.

**Recommendation for production** (rolling deploys behind a load balancer):

- On `SIGTERM`: stop accepting new requests, let current ones finish, stop the packet worker (`startPacketWorker` already returns a stop function), then close the database pool.
- A `GET /health` endpoint that checks the database, so the load balancer only sends traffic to working instances.

## 11. Failed packets and late notes

- **Failed packets:** today a `Failed` packet is final, so the order can never reach manufacturing. Temporary database errors already stay `Pending` and are retried. Add a "Retry" action for support once the cause is fixed, or automatic retries with backoff through a queue (§3).
- **Notes after the packet is built:** notes can change after submit, but the packet is a snapshot. Ask the business whether late notes must reach manufacturing; if so, send an update, or lock notes once the packet is `Completed`.

## 12. Concurrent edits to a Draft (optimistic locking)

**Today:** status changes are safe under concurrency (the status check is inside the `UPDATE`). But if two people edit the same Draft at the same time, the second save replaces the first: the last save wins, and the first person's change is lost without warning.

**Recommendation:** add a `version` number to orders. The form sends the version it loaded; the update runs `WHERE id = ? AND version = ?` and increments it. If someone else saved in between, no row matches and the API returns 409; the page already reloads the order on a 409 and shows a message, so the user sees the latest values and can re-apply their change.
