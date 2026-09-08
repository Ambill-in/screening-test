/**
 * Round and compare currency at 2 decimal places (paisa precision).
 */

// Convert to integer paisa before comparing: float math like
// 0.1 + 0.2 gives 0.30000000000000004, but 10 + 20 paisa is exact.
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
