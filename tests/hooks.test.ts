import { describe, it, expect } from 'vitest';
import { MANAGED_PAYMENT_FIELDS } from '../src/constants';
import { normalizePayload } from '../src/hooks/normalizePayload';
import { stripManagedFields } from '../src/hooks/stripManagedFields';
import { mergePatch } from '../src/hooks/mergePatch';
import { enforceOrgScope } from '../src/hooks/enforceOrgScope';
import { PaymentRecord, UserContext } from '../src/types';

const basePayment: PaymentRecord = {
  id: 'pay-1',
  organization_id: 'org-a',
  amount_paid: 500,
  payment_mode: 'NEFT',
  bank_account_id: 'bank-1',
  receipt_type: 'REGULAR',
  sync_status: 'pending',
  public_key: 'PAY-0001',
  payment_seq: 1,
};

describe('normalizePayload', () => {
  it('converts empty strings on nullable fields to null', () => {
    const result = normalizePayload({
      payment_mode: '',
      bank_account_id: '',
      amount_paid: 100,
    });
    expect(result.payment_mode).toBeNull();
    expect(result.bank_account_id).toBeNull();
    expect(result.amount_paid).toBe(100);
  });

  it('converts __none__ sentinel to null on reference fields', () => {
    const result = normalizePayload({
      bank_account_id: '__none__',
      payment_mode: 'UPI',
    });
    expect(result.bank_account_id).toBeNull();
    expect(result.payment_mode).toBe('UPI');
  });
});

describe('stripManagedFields', () => {
  it('removes managed fields from a single record', () => {
    const input: PaymentRecord & { notes: string } = { ...basePayment, notes: 'hello' };
    const result = stripManagedFields(input, [...MANAGED_PAYMENT_FIELDS]) as PaymentRecord & {
      notes: string;
    };
    expect(result.public_key).toBeUndefined();
    expect(result.payment_seq).toBeUndefined();
    expect(result.notes).toBe('hello');
  });

  it('removes managed fields from each record in a bulk array', () => {
    const rows = [
      { ...basePayment, id: 'a' },
      { ...basePayment, id: 'b', public_key: 'PAY-0002' },
    ];
    const result = stripManagedFields(rows, ['public_key']) as PaymentRecord[];
    expect(result).toHaveLength(2);
    expect(result[0].public_key).toBeUndefined();
    expect(result[1].public_key).toBeUndefined();
  });
});

describe('mergePatch', () => {
  it('inherits omitted fields from the existing record', () => {
    const result = mergePatch(basePayment, { amount_paid: 750 });
    expect(result.amount_paid).toBe(750);
    expect(result.receipt_type).toBe('REGULAR');
    expect(result.payment_mode).toBe('NEFT');
    expect(result.id).toBe('pay-1');
  });

  it('allows explicitly setting a field to null', () => {
    const result = mergePatch(basePayment, { payment_mode: null });
    expect(result.payment_mode).toBeNull();
    expect(result.bank_account_id).toBe('bank-1');
  });
});

describe('enforceOrgScope', () => {
  const orgUser: UserContext = {
    id: 'u1',
    organization_id: 'org-a',
    role: 'user',
  };

  it('allows superadmin without organization_id in query', () => {
    expect(() =>
      enforceOrgScope({ id: 'sa', organization_id: 'org-a', role: 'superadmin' }, {})
    ).not.toThrow();
  });

  it('requires organization_id for non-superadmin', () => {
    expect(() => enforceOrgScope(orgUser, {})).toThrow('Organization ID is required');
  });

  it('rejects mismatched organization_id', () => {
    expect(() =>
      enforceOrgScope(orgUser, { organization_id: 'org-b' })
    ).toThrow('Unauthorized Access');
  });

  it('allows matching organization_id', () => {
    expect(() =>
      enforceOrgScope(orgUser, { organization_id: 'org-a' })
    ).not.toThrow();
  });
});
