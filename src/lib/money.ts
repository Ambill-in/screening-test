/**
 * Round and compare currency at 2 decimal places (paisa precision).
 *
 * - toMoney: parses input and returns a number rounded to 2 decimals (invalid → 0)
 * - moneyEquals: compares amounts at cent precision using integer math
 * - moneyGreaterThan: checks if first amount is strictly greater at cent precision
 */

export function toMoney(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return 0;
  }
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function moneyEquals(a: number, b: number): boolean {
  return Math.round(a * 100) === Math.round(b * 100);
}

export function moneyGreaterThan(a: number, b: number): boolean {
  return Math.round(a * 100) > Math.round(b * 100);
}
