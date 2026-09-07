import { describe, it, expect } from 'vitest';
import { processAllocations } from '../src/services/allocationPipeline';

/**
 * Edge-case tests rooted in real Ambill patterns.
 *
 * These mirror production bugs where naive floating-point arithmetic
 * causes allocation totals to disagree with payment headers even when
 * the amounts are logically equal at 2-decimal precision.
 */
describe('floating-point allocation edge cases', () => {
  it('accepts allocations whose raw float sum differs from payment amount', () => {
    // 0.1 + 0.2 === 0.30000000000000004 in JavaScript
    const paymentAmount = 0.1 + 0.2;
    const rows = processAllocations(paymentAmount, [
      { invoice_id: 'inv-a', amount: 0.1 },
      { invoice_id: 'inv-b', amount: 0.2 },
    ]);
    expect(rows).toHaveLength(2);
  });

  it('accepts three-way split that accumulates representation error', () => {
    const paymentAmount = 1.0;
    const rows = processAllocations(paymentAmount, [
      { invoice_id: 'inv-1', amount: 0.33 },
      { invoice_id: 'inv-2', amount: 0.33 },
      { invoice_id: 'inv-3', amount: 0.34 },
    ]);
    expect(rows).toHaveLength(3);
  });

  it('rejects over-allocation even when within float noise', () => {
    expect(() =>
      processAllocations(10.0, [
        { invoice_id: 'inv-1', amount: 5.01 },
        { invoice_id: 'inv-2', amount: 5.01 },
      ])
    ).toThrow('Allocation total must equal payment amount');
  });
});
