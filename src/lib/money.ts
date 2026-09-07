/**
 * Round and compare currency at 2 decimal places (paisa precision).
 */

/**
 * Converts a value to an integer number of cents, rounded to the nearest cent.
 *
 * Multiplying by 100 can land just below or above the "true" value due to
 * binary floating-point representation (e.g. 1.005 * 100 === 100.49999999999999),
 * which would make a plain Math.round() truncate the wrong way. We correct for
 * that by nudging the scaled value by a tiny epsilon proportional to its own
 * magnitude (fixed epsilon like Number.EPSILON alone isn't large enough to
 * matter once the value itself is bigger than ~1) before rounding.
 */
function toCents(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const scaled = value * 100;
  const nudge = Math.abs(scaled) * Number.EPSILON * 10;
  return Math.round(scaled + Math.sign(scaled) * nudge);
}

export function toMoney(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return 0;
  }
  return toCents(n) / 100;
}

export function moneyEquals(a: number, b: number): boolean {
  return toCents(a) === toCents(b);
}

export function moneyGreaterThan(a: number, b: number): boolean {
  return toCents(a) > toCents(b);
}