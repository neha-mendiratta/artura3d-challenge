# Pricing

Status: Implemented

## Source

- Base price: 100.00
- ThicknessMm × 2.0
- WidthMm × 0.5
- If Expedite = true → multiply total by 1.15
- Round to 2 decimal places

## Behaviour

One function in `apps/api/src/pricing.ts`, used when a quote is created:

```ts
calculatePriceCents({ thicknessMm, widthMm, expedite }): number
```

It returns the total in cents, which is what gets stored (`quotes.total_cents`).

```ts
const subtotal =
  BASE_PRICE_CENTS +                                   // 10_000
  Math.round(thicknessMm * THICKNESS_RATE_CENTS_PER_MM) + // 200
  Math.round(widthMm * WIDTH_RATE_CENTS_PER_MM);       // 50
const total = expedite ? Math.round((subtotal * EXPEDITE_PERCENT) / 100) : subtotal; // 115
return total;
```

- Works in cents (whole numbers) because decimal maths gives wrong results: `127.30 × 1.15` should be `146.395` → `146.40`, but floating point gives `146.39`.
- Rounding is half up (`146.395` → `146.40`).
- Inputs are already validated by the API (spec 04), so the function does not re-check them.

## Edge cases

| Situation | Expected | Test |
|---|---|---|
| Thickness 3.0, width 80.0, no expedite | 14600 (146.00) | `prices an order without expedite` |
| Thickness 3.0, width 80.0, expedite | 16790 (167.90) | `applies the expedite multiplier` |
| Thickness 3.5, width 90.5, expedite | 17509 (175.09) | `rounds to the nearest cent` |
| Thickness 1.0, width 50.6, expedite | 14640 (146.40), not 14639 | `rounds a half cent up` |

## Acceptance criteria

1. `calculatePriceCents` follows the brief's rules and returns cents.
2. Every edge case above has a passing unit test.

## Out of scope

- Currency symbol, tax, discounts: the brief gives no currency, tax or discount rules.
