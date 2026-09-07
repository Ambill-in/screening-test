/**
 * Round and compare currency at 2 decimal places (paisa precision).
 */

function toCents(n: number): number {
  return Math.round(n * 100);
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