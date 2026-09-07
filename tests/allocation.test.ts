import { describe, it, expect } from 'vitest';
import {
  processPayment,
  processAllocations,
  canDeletePayment,
} from '../src/services/allocationPipeline';
import { PaymentRecord, PipelineContext, UserContext } from '../src/types';

const orgUser: UserContext = {
  id: 'u1',
  organization_id: 'org-a',
  role: 'user',
};

const existing: PaymentRecord = {
  id: 'pay-1',
  organization_id: 'org-a',
  amount_paid: 1000,
  payment_mode: 'NEFT',
  bank_account_id: 'bank-1',
  receipt_type: 'REGULAR',
  tally_sync_status: 'pending',
  public_key: 'PAY-0001',
  payment_seq: 1,
};

function makeContext(overrides: Partial<PipelineContext>): PipelineContext {
  return {
    method: 'create',
    data: {},
    user: orgUser,
    query: { organization_id: 'org-a' },
    ...overrides,
  };
}

describe('processPayment', () => {
  it('strips managed fields and normalizes on create', () => {
    const result = processPayment(
      makeContext({
        data: {
          organization_id: 'org-a',
          amount_paid: 500,
          payment_mode: '',
          bank_account_id: '__none__',
          receipt_type: 'REGULAR',
          tally_sync_status: 'pending',
          public_key: 'HACKED',
          payment_seq: 999,
        },
      })
    );
    expect(result.public_key).toBeUndefined();
    expect(result.payment_seq).toBeUndefined();
    expect(result.payment_mode).toBeNull();
    expect(result.bank_account_id).toBeNull();
  });

  it('merges patch with existing record', () => {
    const result = processPayment(
      makeContext({
        method: 'patch',
        existing,
        data: { amount_paid: 1200 },
      })
    );
    expect(result.amount_paid).toBe(1200);
    expect(result.receipt_type).toBe('REGULAR');
    expect(result.payment_mode).toBe('NEFT');
  });

  it('blocks delete when tally_sync_status is success', () => {
    expect(() =>
      processPayment(
        makeContext({
          method: 'remove',
          existing: { ...existing, tally_sync_status: 'success' },
        })
      )
    ).toThrow('Cannot delete a payment that has been synced');
  });

  it('allows delete when tally_sync_status is pending', () => {
    const result = processPayment(
      makeContext({
        method: 'remove',
        existing,
      })
    );
    expect(result.id).toBe('pay-1');
  });
});

describe('canDeletePayment', () => {
  it('returns false for synced payments', () => {
    expect(canDeletePayment({ ...existing, tally_sync_status: 'success' })).toBe(false);
  });

  it('returns true for pending payments', () => {
    expect(canDeletePayment(existing)).toBe(true);
  });
});

describe('processAllocations', () => {
  it('accepts allocations that sum to the payment amount', () => {
    const rows = processAllocations(100, [
      { invoice_id: 'inv-1', amount: 60 },
      { invoice_id: 'inv-2', amount: 40 },
    ]);
    expect(rows).toHaveLength(2);
  });

  it('rejects duplicate invoice ids', () => {
    expect(() =>
      processAllocations(100, [
        { invoice_id: 'inv-1', amount: 50 },
        { invoice_id: 'inv-1', amount: 50 },
      ])
    ).toThrow('Duplicate invoice in allocations');
  });

  it('rejects negative allocation amounts', () => {
    expect(() =>
      processAllocations(100, [{ invoice_id: 'inv-1', amount: -1 }])
    ).toThrow('Allocation amount cannot be negative');
  });

  it('rejects when total does not match payment amount', () => {
    expect(() =>
      processAllocations(100, [{ invoice_id: 'inv-1', amount: 90 }])
    ).toThrow('Allocation total must equal payment amount');
  });
});
