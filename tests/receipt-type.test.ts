import { describe, it, expect } from 'vitest';
import { applyReceiptTypeRules } from '../src/hooks/applyReceiptTypeRules';
import { processPayment } from '../src/services/allocationPipeline';
import { PaymentRecord, PipelineContext, UserContext } from '../src/types';

const orgUser: UserContext = {
  id: 'u1',
  organization_id: 'org-a',
  role: 'user',
};

const tdsPayment: PaymentRecord = {
  id: 'pay-tds',
  organization_id: 'org-a',
  amount_paid: 0,
  payment_mode: null,
  bank_account_id: null,
  receipt_type: 'TDS',
  sync_status: 'pending',
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

describe('applyReceiptTypeRules', () => {
  it('forces amount_paid to zero for TDS receipts', () => {
    const result = applyReceiptTypeRules({
      receipt_type: 'TDS',
      amount_paid: 2500,
      payment_mode: 'NEFT',
    });
    expect(result.amount_paid).toBe(0);
  });

  it('leaves REGULAR receipt amounts unchanged', () => {
    const result = applyReceiptTypeRules({
      receipt_type: 'REGULAR',
      amount_paid: 2500,
    });
    expect(result.amount_paid).toBe(2500);
  });
});

describe('TDS payments through processPayment', () => {
  it('zeros cash on create even when the client sends a non-zero amount_paid', () => {
    const result = processPayment(
      makeContext({
        data: {
          organization_id: 'org-a',
          receipt_type: 'TDS',
          amount_paid: 1800,
          payment_mode: '',
          bank_account_id: '__none__',
          sync_status: 'pending',
        },
      })
    );
    expect(result.amount_paid).toBe(0);
    expect(result.payment_mode).toBeNull();
  });

  it('re-applies TDS rules on patch when receipt_type is inherited from existing', () => {
    const result = processPayment(
      makeContext({
        method: 'patch',
        existing: tdsPayment,
        data: { amount_paid: 500 },
      })
    );
    expect(result.receipt_type).toBe('TDS');
    expect(result.amount_paid).toBe(0);
  });

  it('keeps amount_paid at zero when patching unrelated fields on a TDS payment', () => {
    const result = processPayment(
      makeContext({
        method: 'patch',
        existing: tdsPayment,
        data: { payment_mode: 'CHEQUE' },
      })
    );
    expect(result.payment_mode).toBe('CHEQUE');
    expect(result.amount_paid).toBe(0);
  });
});
