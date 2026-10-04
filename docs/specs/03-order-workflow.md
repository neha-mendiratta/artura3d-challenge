# Order workflow

Status: Approved

## Source

- Orders start as Draft
- Only Draft orders can be edited
- Submitting twice returns an error
- Submitted orders become immutable (except optional Notes field)

## Behaviour

```
Draft ──submit──> Submitted
```

- A new order is `Draft`.
- **Edit:** allowed only while `Draft`.
- **Submit:** `Draft` → `Submitted`, sets `submitted_at`. Never goes back.
- **After submit:** only `notes` can change.
- **Quote:** only for `Submitted` orders. A quote is the basis for manufacturing, so the order must be final.

Each change is one SQL statement that checks the status in its `WHERE` clause, so two requests at the same time cannot both succeed:

```sql
UPDATE orders
SET status = 'Submitted', submitted_at = now(), updated_at = now()
WHERE id = $1 AND status = 'Draft'
RETURNING *;
```

If no row is updated, the order either does not exist (404) or is not `Draft` (409).

## Edge cases

| Situation | Expected | Test |
|---|---|---|
| Submit a Draft order | 200, status `Submitted`, `submitted_at` set | `submits a draft order` |
| Submit a Submitted order | 409, order unchanged | `rejects submitting twice` |
| Submit an order that does not exist | 404 | `returns 404 when submitting a missing order` |
| Two submits at the same time | One 200, one 409 | `allows only one of two concurrent submits` |
| Edit a Draft order | 200, changes saved | `edits a draft order` |
| Edit a Submitted order (any field except notes) | 409, order unchanged | `rejects editing a submitted order` |
| Change notes on a Submitted order | 200, only notes change | `updates notes on a submitted order` |
| Quote a Draft order | 409, no quote created | `rejects quoting a draft order` |

## Acceptance criteria

1. Orders follow the rules above.
2. Every edge case above has a passing integration test.

## Out of scope

- Un-submitting or cancelling an order: the brief says submitted orders are immutable.
