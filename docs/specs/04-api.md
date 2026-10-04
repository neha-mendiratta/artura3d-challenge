# API

Status: Approved

## Source

- `POST /orders`
- `PUT /orders/{id}` (Draft only)
- `GET /orders/{id}`
- `POST /orders/{id}/submit`
- `POST /orders/{id}/quote` (idempotent)
- `GET /orders/{id}/packet`
- Submitted orders are immutable except Notes

## Behaviour

Express app in `apps/api`. JSON in and out, `camelCase` fields. One `pg` connection pool for the whole app.

### Endpoints

| Endpoint | Success | Errors |
|---|---|---|
| `GET /orders` | 200 `{ items, nextCursor }` | 400 |
| `POST /orders` | 201 order | 400 |
| `GET /orders/{id}` | 200 order, with `quote` (`null` until quoted) | 400, 404 |
| `PUT /orders/{id}` | 200 order | 400, 404, 409 if not Draft |
| `PATCH /orders/{id}/notes` | 200 order | 400, 404 |
| `POST /orders/{id}/submit` | 200 order | 400, 404, 409 if not Draft |
| `POST /orders/{id}/quote` | 201 quote (first time), 200 same quote (after) | 400, 404, 409 if Draft |
| `GET /orders/{id}/packet` | 200 packet | 400, 404 if order or packet missing |

Two endpoints are added to the brief's list:

- `GET /orders`: the UI needs a list of orders.
- `PATCH /orders/{id}/notes`: the brief keeps `PUT` for Draft only but allows Notes to change after submit. Works in any status.

### Request body (`POST /orders`, `PUT /orders/{id}`)

Validated by one Zod schema in `packages/shared`, also used by the frontend form.

| Field | Rule |
|---|---|
| `patientRef` | Required string, trimmed, 1–50 characters |
| `lengthMm` | Required number, 150–350, max 1 decimal place |
| `widthMm` | Required number, 50–150, max 1 decimal place |
| `thicknessMm` | Required number, 1–15, max 1 decimal place |
| `colour` | Required, `#RRGGBB`, saved uppercase |
| `expedite` | Optional boolean, default `false` |
| `notes` | Optional string, max 1000 characters, empty → `null` |

Unknown fields are rejected (400). Values are not converted: `"true"` or `"90"` as strings are rejected (400). `PATCH /notes` body: `{ notes }`, same `notes` rule.

### Responses

Order:

```json
{
  "id": "01a104ee-ceb5-7595-8401-5c400669e650",
  "patientRef": "PT-1042",
  "lengthMm": 260,
  "widthMm": 90.5,
  "thicknessMm": 3.5,
  "colour": "#3366FF",
  "expedite": true,
  "notes": null,
  "status": "Submitted",
  "createdAt": "2026-10-04T09:15:02.481Z",
  "updatedAt": "2026-10-04T09:21:40.117Z",
  "submittedAt": "2026-10-04T09:21:40.117Z",
  "quote": {
    "id": "01a104ee-ceb5-75b3-8b1d-c142a132fb2c",
    "totalCents": 17509,
    "createdAt": "2026-10-04T09:22:05.903Z"
  }
}
```

Packet:

```json
{
  "id": "01a104ee-ceb5-75b6-86db-7810f2513b0e",
  "orderId": "01a104ee-ceb5-7595-8401-5c400669e650",
  "status": "Completed",
  "payload": { "…": "defined in spec 05" },
  "error": null,
  "attempts": 1,
  "createdAt": "2026-10-04T09:22:05.903Z",
  "updatedAt": "2026-10-04T09:22:07.350Z"
}
```

Dates are ISO 8601 in UTC.

Errors: `{ "error": { "code": "...", "message": "..." } }` with `code` one of `VALIDATION_ERROR` (400), `NOT_FOUND` (404), `CONFLICT` (409), `INTERNAL_ERROR` (500). A 400 message names the field, e.g. `"widthMm: must be between 50 and 150"`. A 500 never shows internal details; it is logged. Unknown routes return 404 `NOT_FOUND` as JSON.

Checks run in this order: id format (400) → body (400) → order exists (404) → status (409).

### Orders list

`GET /orders?status=Draft&cursor=<id>`

- Newest first, 20 per page.
- `status` optional: `Draft` or `Submitted`.
- `cursor` optional: the `nextCursor` from the previous page. `nextCursor` is `null` on the last page.
- An invalid `status` or `cursor` returns 400.

### Quote (idempotent)

In one transaction:

1. `INSERT INTO quotes ... ON CONFLICT (order_id) DO NOTHING RETURNING *`
2. If a row was inserted: create the packet (`Pending`) → 201.
3. If not: the order already has a quote → return it, 200.

The unique `order_id` makes this safe when two requests arrive at the same time: only one quote and one packet are ever created.

## Edge cases

| Situation | Expected | Test |
|---|---|---|
| Create a valid order | 201, status `Draft` | `creates an order` |
| Missing required field | 400 `VALIDATION_ERROR` | `rejects a missing field` |
| Dimension out of range or with 2 decimals | 400 | `rejects an invalid dimension` |
| Colour not `#RRGGBB` | 400 | `rejects an invalid colour` |
| Unknown field in body | 400 | `rejects unknown fields` |
| Body is not valid JSON | 400 | `rejects invalid JSON` |
| `{id}` is not a UUID | 400 | `rejects an invalid id` |
| Order does not exist | 404 `NOT_FOUND` | `returns 404 for a missing order` |
| Update notes on a Submitted order | 200 | `updates notes after submit` |
| First quote on a Submitted order | 201, quote with correct `totalCents`, packet `Pending` | `creates a quote and a packet` |
| Second quote request | 200, same quote, no new packet | `returns the existing quote` |
| Two quote requests at the same time | One quote, one packet | `creates one quote for concurrent requests` |
| Packet before any quote | 404 | `returns 404 when no packet exists` |
| List with more than 20 orders | First page 20 items + `nextCursor`; next page continues with no duplicates | `pages through orders` |
| List filtered by status | Only that status | `filters orders by status` |
| Unexpected error | 500 `INTERNAL_ERROR`, no details, logged | `hides internal errors` |
| Unknown route | 404 `NOT_FOUND` as JSON | `returns JSON 404 for unknown routes` |
| Invalid `status` or `cursor` in list query | 400 | `rejects an invalid list query` |
| String instead of number or boolean (`"90"`, `"true"`) | 400 | `rejects wrong types` |
| `PUT` with an invalid body on a Submitted order | 400 (body checked before status) | `validates the body before checking status` |

Workflow rules (edit/submit/quote by status) are tested in spec 03.

## Acceptance criteria

1. All endpoints behave as described.
2. Every edge case above has a passing integration test.

## Out of scope

- Authentication
- Searching orders
- Deleting orders
- API documentation page (Swagger)
