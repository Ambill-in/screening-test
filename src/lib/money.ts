/**
 * Round and compare currency at 2 decimal places (paisa precision).
 *
 * Amounts are carried as floats but are only ever meaningful to 2 decimals, so
 * every comparison happens on whole paisa. Comparing the raw floats instead lets
 * representation error (0.1 + 0.2 === 0.30000000000000004) leak into billing
 * decisions.
 */

const PAISA_PER_UNIT = 100;

/** Amount as a whole number of paisa — the unit every comparison works in. */
function toPaisa(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return 0;
  }
  return Math.round(n * PAISA_PER_UNIT);
}

export function toMoney(value: unknown): number {
  return toPaisa(value) / PAISA_PER_UNIT;
}

export function moneyEquals(a: number, b: number): boolean {
  return toPaisa(a) === toPaisa(b);
}

export function moneyGreaterThan(a: number, b: number): boolean {
  return toPaisa(a) > toPaisa(b);
}
