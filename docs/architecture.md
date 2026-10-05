# Architecture

How the system fits together: as built (sections 1–4), and the recommended production setup (section 5, not built). Diagrams are [Mermaid](https://mermaid.js.org/), which GitHub draws from the text.

## 1. System as built

```mermaid
flowchart TB
    user(["Clinic / ops user"])

    subgraph browser["Browser"]
        web["React app<br/>Mantine · TanStack Query<br/>3D preview (react-three-fiber)"]
    end

    vite["Vite dev server :5173<br/>serves the app, forwards /api to the API"]

    subgraph compose["Docker Compose (ports on 127.0.0.1 only)"]
        subgraph apiproc["API process (Node 22)"]
            api["Express API :3000<br/>routes → services → models<br/>Swagger UI at /docs"]
            worker["Packet worker<br/>checks every second"]
        end
        db[("PostgreSQL 18<br/>orders · quotes · manufacturing_packets")]
    end

    shared[["packages/shared<br/>Zod schema · dimension limits · status types"]]

    user --> web
    web -- "/api/... (JSON)" --> vite
    vite -- "proxy" --> api
    api -- "Sequelize" --> db
    worker -- "FOR UPDATE SKIP LOCKED" --> db
    shared -. "validates the form" .-> web
    shared -. "validates every request" .-> api
```

- **One validation schema** in `packages/shared` is used by the form (instant errors) and the API (the real check), so the two cannot disagree.
- **The API is stateless:** everything lives in Postgres, so several instances can run side by side. Their workers share the packets safely with `FOR UPDATE SKIP LOCKED`.
- **Tests** use a second Postgres container (port 5433, in-memory storage), so they never touch dev data.

## 2. Inside the API

```mermaid
flowchart TB
    req["HTTP request"] --> log["pino-http<br/>one log line per request"]
    log --> parse["express.json"]
    parse --> route["Route (routes/)<br/>validateId · validateBody (shared Zod schema)"]
    route --> service["Service (services/)<br/>business rules"]
    service --> model["Sequelize model (models/)"]
    model --> db[("PostgreSQL")]
    service -- "200 / 201 JSON" --> res["HTTP response"]

    route -. "throws ValidationError" .-> err
    service -. "throws NotFoundError / ConflictError" .-> err
    err["Error handler (middleware/)<br/>{ error: { code, message } }<br/>unexpected → 500, logged with patient data redacted"] --> res
```

| Layer | Folder | Job |
|---|---|---|
| Routes | `apps/api/src/routes/` | HTTP only: read the request, call a service, send the response |
| Middleware | `apps/api/src/middleware/` | Validate ids and bodies; turn every error into one JSON format |
| Services | `apps/api/src/services/` | Business rules: status changes, quotes, packets |
| Models | `apps/api/src/models/` | Tables mapped to TypeScript (Sequelize) |
| Worker | `apps/api/src/workers/` | Builds manufacturing packets in the background |

## 3. Data model

```mermaid
erDiagram
    orders ||--o| quotes : "0 or 1"
    orders ||--o| manufacturing_packets : "0 or 1"

    orders {
        uuid id PK "uuidv7, time-ordered"
        text patient_ref "1-50 chars, trimmed"
        numeric length_mm "150.0-350.0"
        numeric width_mm "50.0-150.0"
        numeric thickness_mm "1.0-15.0"
        text colour "#RRGGBB, uppercase"
        boolean expedite
        text notes "nullable, max 1000"
        enum status "Draft | Submitted"
        timestamptz created_at
        timestamptz updated_at
        timestamptz submitted_at "nullable"
    }

    quotes {
        uuid id PK
        uuid order_id FK "UNIQUE: one quote per order"
        integer total_cents
        timestamptz created_at
    }

    manufacturing_packets {
        uuid id PK
        uuid order_id FK "UNIQUE: one packet per order"
        enum status "Pending | Completed | Failed"
        jsonb payload "set when Completed"
        text error "plain message, set when Failed"
        timestamptz created_at
        timestamptz updated_at
    }
```

Indexes: `orders (status, id)` for the filtered orders list, newest first; `manufacturing_packets (status, id)` for the worker's search for Pending packets. Details: [spec 01](specs/01-data-model.md).

## 4. Quote and manufacturing packet

```mermaid
sequenceDiagram
    actor U as User
    participant W as React app
    participant A as API
    participant D as PostgreSQL
    participant K as Packet worker

    U->>W: Generate quote
    W->>A: POST /orders/{id}/quote
    A->>D: order is Submitted?
    A->>D: BEGIN · INSERT quote · INSERT packet (Pending) · COMMIT
    Note over A,D: unique order_id: a second request gets the same quote (200)
    A-->>W: 201 quote
    W-->>U: shows the total

    loop every second
        K->>D: BEGIN · SELECT Pending packet FOR UPDATE SKIP LOCKED
        K->>D: read order + quote, build payload
        K->>D: UPDATE packet: Completed + payload · COMMIT
        Note over K,D: connection error: rollback, stays Pending<br/>other error: Failed, plain message, real error logged
    end

    loop every 2 seconds while Pending
        W->>A: GET /orders/{id}/packet
        A-->>W: Pending / Completed / Failed
    end
    W-->>U: packet status
```

Details: [spec 05](specs/05-async-packet.md).

## 5. Recommended production setup (not built)

The system runs locally (decision 3). This is how it would run on AWS; each part links to its recommendation.

```mermaid
flowchart TB
    user(["Clinic / ops user"])
    idp["Amazon Cognito<br/>sign-in, JWT with org_id"]
    cdn["CloudFront (HTTPS)"]
    s3["S3<br/>React app (static files)"]

    subgraph vpc["VPC"]
        alb["Application Load Balancer<br/>health check: GET /health"]
        ecs["ECS Fargate<br/>API containers (several)"]
        sqs["SQS queue + dead-letter queue"]
        lambda["Lambda packet workers"]
        proxy["RDS Proxy<br/>shares DB connections"]
        rds[("RDS PostgreSQL<br/>encrypted, backups")]
    end

    secrets["Secrets Manager (KMS)"]
    logs["CloudWatch logs and alarms"]
    ci["CI/CD pipeline<br/>tests → image → migrations → deploy"]

    user -- "sign in" --> idp
    user --> cdn
    cdn -- "/" --> s3
    cdn -- "/api" --> alb
    alb --> ecs
    ecs --> proxy
    ecs -- "Pending packet ids" --> sqs
    sqs --> lambda
    lambda --> proxy
    proxy --> rds
    secrets -. "DATABASE_URL" .-> ecs
    ecs -. "logs" .-> logs
    ci -. "deploys" .-> ecs
```

| Part | Why | Recommendation |
|---|---|---|
| Cognito + `org_id` in every query | Sign-in, and each clinic sees only its own orders | §6 |
| CloudFront + S3 | The frontend is static files: fast and cheap | §7 |
| ALB + ECS Fargate | Runs several API containers, HTTPS, health checks, graceful shutdown | §7, §10 |
| RDS + RDS Proxy | Managed Postgres with encryption and backups; the proxy keeps total connections under Postgres's limit | §8, §9 |
| SQS + Lambda | Packets start immediately, retries and a dead-letter queue built in, workers scale apart from the API. Added when volume needs it | §3 |
| Secrets Manager | Database credentials never in code or images | §5 |
| CloudWatch | Logs (patient data redacted) and alarms, e.g. on Failed packets | §8 |

Recommendations: [recommendations.md](recommendations.md).
