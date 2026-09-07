import { describe, it, expect } from 'vitest';
import { toMoney, moneyEquals, moneyGreaterThan } from '../src/lib/money';

describe('money helpers', () => {
  it('toMoney rounds to two decimal places', () => {
    expect(toMoney(10.456)).toBe(10.46);
    expect(toMoney('99.999')).toBe(100);
    expect(toMoney(null)).toBe(0);
    expect(toMoney('not-a-number')).toBe(0);
  });

  it('moneyEquals compares at cent precision', () => {
    expect(moneyEquals(0.1 + 0.2, 0.3)).toBe(true);
    expect(moneyEquals(10.004, 10.01)).toBe(false);
    expect(moneyEquals(33.33, 33.33)).toBe(true);
  });

  it('moneyGreaterThan compares at cent precision', () => {
    expect(moneyGreaterThan(10.02, 10.01)).toBe(true);
    expect(moneyGreaterThan(0.3, 0.1 + 0.2)).toBe(false);
  });
});
