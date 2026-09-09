/**
 * Round and compare currency at 2 decimal places (paisa precision).
 *
 * TODO:
 * - toMoney: parse input, return a number rounded to 2 decimals (invalid → 0)
 * - moneyEquals: true when amounts match at cent precision
 * - moneyGreaterThan: true when first amount is strictly greater at cent precision
 */

export function toMoney(amount?: number | string | null): number {
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (amount == null || isNaN(num)) {
    return 0;
  }
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function moneyEquals(a: number, b: number): boolean {
  return toMoney(a) === toMoney(b);
}

export function moneyGreaterThan(a: number, b: number): boolean {
  return a > b;
}
