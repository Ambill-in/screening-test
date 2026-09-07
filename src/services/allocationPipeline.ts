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
 */

import { normalizePayload } from '../hooks/normalizePayload';
import { stripManagedFields } from '../hooks/stripManagedFields';
import { mergePatch } from '../hooks/mergePatch';
import { enforceOrgScope } from '../hooks/enforceOrgScope';
import { applyReceiptTypeRules } from '../hooks/applyReceiptTypeRules';
import { moneyEquals, toMoney } from '../lib/money';
import { MANAGED_PAYMENT_FIELDS } from '../constants';
import {
  AllocationRow,
  PaymentRecord,
  PipelineContext,
} from '../types';

const MANAGED_FIELDS = [...MANAGED_PAYMENT_FIELDS];

/**
 * A payment's allocations must add up to exactly what was received.
 *
 * Both sides are rounded to cents before comparing: allocation rows are entered
 * to 2 decimals but their float sum is not (0.33 + 0.33 + 0.34 === 1.0000000000000002),
 * so a raw `!==` rejects splits that are correct to the paisa.
 */
export function validateAllocationTotal(
  paymentAmount: number,
  allocations: AllocationRow[]
): void {
  const total = allocations.reduce(
    (sum, row) => sum + toMoney(row.amount),
    0
  );

  if (!moneyEquals(total, paymentAmount)) {
    throw new Error('Allocation total must equal payment amount');
  }
}

/**
 * A payment that reached the customer's accounting system is no longer ours to
 * remove — deleting it here would leave the two systems permanently out of sync.
 */
export function canDeletePayment(payment: PaymentRecord): boolean {
  return payment.sync_status !== 'success';
}

export function processPayment(context: PipelineContext): PaymentRecord {
  const { method, data, existing, user, query } = context;

  // Authorize before touching the record: a caller outside the tenant should not
  // get as far as reading or transforming another organization's payment.
  enforceOrgScope(user, query);

  if (method === 'remove') {
    if (!existing) {
      throw new Error('Payment not found');
    }
    if (!canDeletePayment(existing)) {
      throw new Error('Cannot delete a payment that has been synced');
    }
    return existing;
  }

  let payload = stripManagedFields(
    data as Record<string, unknown>,
    MANAGED_FIELDS
  ) as Partial<PaymentRecord>;
  payload = normalizePayload(payload as Record<string, unknown>) as Partial<PaymentRecord>;

  if (method === 'patch') {
    if (!existing) {
      throw new Error('Payment not found');
    }
    // Merge first: a PATCH body usually omits receipt_type, so the rules have to
    // run against the full record or a TDS payment silently accepts cash.
    return applyReceiptTypeRules(mergePatch(existing, payload));
  }

  return applyReceiptTypeRules(payload) as PaymentRecord;
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
