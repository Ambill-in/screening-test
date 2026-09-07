/**
 * Round and compare currency at 2 decimal places (paisa precision).
 *
 * Money is stored as a JS `number`, so every value is a binary float and
 * arithmetic drifts (0.1 + 0.2 === 0.30000000000000004). Every comparison in the
 * codebase therefore goes through these helpers, which normalise to whole cents
 * before comparing instead of trusting `===` / `>` on raw floats.
 */

const CENTS_PER_UNIT = 100;

/**
 * Whole cents for a finite number, correcting binary-representation drift.
 *
 * `10.456 * 100` is `1045.6000000000001` and `1.005 * 100` is
 * `100.49999999999999`, so scaling alone still rounds the wrong way. Trimming to
 * 12 significant digits discards the drift (which lives far past the 15th digit)
 * while keeping every digit that matters for currency.
 */
function toCents(value: number): number {
  const scaled = Number((value * CENTS_PER_UNIT).toPrecision(12));
  // Math.round breaks ties towards +Infinity; round halves away from zero so
  // -1.005 and 1.005 are treated symmetrically.
  return scaled < 0 ? -Math.round(-scaled) : Math.round(scaled);
}

/** Parse any input into a number rounded to 2 decimals. Invalid input → 0. */
export function toMoney(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return toCents(parsed) / CENTS_PER_UNIT;
}

/** True when both amounts are the same at cent precision. */
export function moneyEquals(a: number, b: number): boolean {
  return toMoney(a) === toMoney(b);
}

/** True when `a` is strictly greater than `b` at cent precision. */
export function moneyGreaterThan(a: number, b: number): boolean {
  return toMoney(a) > toMoney(b);
}
