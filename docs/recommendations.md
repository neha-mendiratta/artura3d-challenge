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

**Today:** a worker inside the API process polls the database every second.

**Recommendation for production at high volume:** the quote request puts a message on a queue (e.g. AWS SQS) and a serverless function (e.g. AWS Lambda) processes it. It scales automatically, has built-in retries and a dead-letter queue for failures, and keeps the work separate from the API.

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

**Today (as per brief):** no login. Anyone who can reach the API and knows an order id can read, edit and submit that order.

What already holds: ids are UUID v7 (not guessable or countable), invalid ids are rejected before the database, queries are parameterised, and patient data travels in request bodies, not URLs or logs.

**Recommendation for production** (orders relate to patients, so this is health data):

- **Authentication:** users sign in through an identity provider (e.g. AWS Cognito or Auth0, OIDC/JWT); every API request carries a token, verified by middleware.
- **Authorization:** each order belongs to an organisation (lab). Every query includes it, e.g. `WHERE id = :id AND org_id = :userOrg`, so another lab's order returns 404. A hard-to-guess id identifies a record; it never protects it (insecure direct object reference).
- HTTPS everywhere, rate limiting, and an audit log of who changed which order.
