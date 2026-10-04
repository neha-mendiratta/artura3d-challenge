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
