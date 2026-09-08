/**
 * Payment save pipeline and allocation validation.
 *
 * processPayment runs before create / patch / delete:
 *   - strip managed fields (MANAGED_PAYMENT_FIELDS from src/constants.ts)
 *   - on PATCH: merge partial body with existing record
 *   - normalize payload (empty strings, __none__)
 *   - apply receipt-type rules (TDS, etc.)
 *   - on create: enforce org scope on query
 *   - on delete: enforce org scope, then check canDeletePayment
 *
 * TODO:
 *   - canDeletePayment: block delete when payment is synced (see README)
 *   - validateAllocationTotal: ensure allocation rows sum to payment amount
 *   - processPayment: call hooks in an order that makes PATCH and TDS tests pass
 */

import { normalizePayload } from '../hooks/normalizePayload';
import { stripManagedFields } from '../hooks/stripManagedFields';
import { mergePatch } from '../hooks/mergePatch';
import { enforceOrgScope } from '../hooks/enforceOrgScope';
import { moneyEquals, toMoney } from '../lib/money';
import { MANAGED_PAYMENT_FIELDS } from '../constants';
import {
  AllocationRow,
  PaymentRecord,
  PipelineContext,
} from '../types';

const MANAGED_FIELDS = [...MANAGED_PAYMENT_FIELDS];

/**
 * A payment must be fully allocated across its invoices.
 *
 * Summing the rows as raw floats and comparing with !== rejects splits that are
 * correct to the paisa — 0.10 + 0.20 lands on 0.30000000000000004, which is not
 * 0.30 — so the comparison is made at the precision the amounts actually carry.
 */
export function validateAllocationTotal(
  paymentAmount: number,
  allocations: AllocationRow[]
): void {
  const total = allocations.reduce((sum, row) => sum + toMoney(row.amount), 0);
  if (!moneyEquals(total, paymentAmount)) {
    throw new Error('Allocation total must equal payment amount');
  }
}

/**
 * A payment that reached the customer's accounting system is already in their
 * books. Deleting it here would leave the two ledgers permanently out of step,
 * so a successful sync makes the payment undeletable.
 */
export function canDeletePayment(payment: PaymentRecord): boolean {
  return payment.sync_status !== 'success';
}

export function processPayment(context: PipelineContext): PaymentRecord {
  const { method, data, existing, user, query } = context;

  if (method === 'remove') {
    enforceOrgScope(user, query);
    if (!existing) {
      throw new Error('Payment not found');
    }
    if (!canDeletePayment(existing)) {
      throw new Error('Cannot delete a payment that has been synced');
    }
    return existing;
  }

  let payload = normalizePayload(data as Record<string, unknown>) as Partial<PaymentRecord>;
  payload = stripManagedFields(payload, MANAGED_FIELDS) as Partial<PaymentRecord>;

  if (method === 'patch') {
    if (!existing) {
      throw new Error('Payment not found');
    }
    return mergePatch(existing, payload);
  }

  enforceOrgScope(user, query);

  return payload as PaymentRecord;
}

export function processAllocations(
  paymentAmount: number,
  allocations: AllocationRow[]
): AllocationRow[] {
  if (!allocations.length) {
    throw new Error('At least one allocation is required');
  }

  const seen = new Set<string>();
  for (const row of allocations) {
    if (seen.has(row.invoice_id)) {
      throw new Error('Duplicate invoice in allocations');
    }
    seen.add(row.invoice_id);
    if (row.amount < 0) {
      throw new Error('Allocation amount cannot be negative');
    }
  }

  validateAllocationTotal(paymentAmount, allocations);
  return allocations;
}
