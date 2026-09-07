/**
 * Round and compare currency at 2 decimal places (paisa precision).
 *
 * TODO:
 * - toMoney: parse input, return a number rounded to 2 decimals (invalid → 0)
 * - moneyEquals: true when amounts match at cent precision
 * - moneyGreaterThan: true when first amount is strictly greater at cent precision
 */

export function toMoney(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return 0;
  }
  const rounded = Math.round(n * 100) / 100;
  return rounded === 0 ? 0 : rounded;
}

export function moneyEquals(a: number, b: number): boolean {
  return Math.round(a * 100) === Math.round(b * 100);
}

export function moneyGreaterThan(a: number, b: number): boolean {
  return Math.round(a * 100) > Math.round(b * 100);
}
