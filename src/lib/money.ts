/**
 * Round and compare currency at 2 decimal places (paisa precision).
 */

function toPaisa(value: number): number {
  return Math.round(value * 100);
}

export function toMoney(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return 0;
  }
  return toPaisa(n) / 100;
}

export function moneyEquals(a: number, b: number): boolean {
  return toPaisa(a) === toPaisa(b);
}

export function moneyGreaterThan(a: number, b: number): boolean {
  return toPaisa(a) > toPaisa(b);
}
