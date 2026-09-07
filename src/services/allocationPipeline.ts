/**
 * Payment save pipeline and allocation validation.
 */

import { normalizePayload } from '../hooks/normalizePayload';
import { stripManagedFields } from '../hooks/stripManagedFields';
import { mergePatch } from '../hooks/mergePatch';
import { enforceOrgScope } from '../hooks/enforceOrgScope';
import { applyReceiptTypeRules } from '../hooks/applyReceiptTypeRules';
import { MANAGED_PAYMENT_FIELDS } from '../constants';
import { moneyEquals } from '../lib/money';

import {
  AllocationRow,
  PaymentRecord,
  PipelineContext,
} from '../types';

const MANAGED_FIELDS = [...MANAGED_PAYMENT_FIELDS];

export function validateAllocationTotal(
  paymentAmount: number,
  allocations: AllocationRow[]
): void {
  const total = allocations.reduce(
    (sum, row) => sum + row.amount,
    0
  );

  if (!moneyEquals(total, paymentAmount)) {
    throw new Error('Allocation total must equal payment amount');
  }
}

export function canDeletePayment(payment: PaymentRecord): boolean {
  return payment.sync_status !== 'success';
}

export function processPayment(context: PipelineContext): PaymentRecord {
  const { method, data, existing, user, query } = context;

  // DELETE
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

  // Remove server-managed fields first
  let payload = stripManagedFields(
    data as Record<string, unknown>,
    MANAGED_FIELDS
  ) as Partial<PaymentRecord>;

  // PATCH: merge first so omitted fields from existing record are preserved
  if (method === 'patch') {
    if (!existing) {
      throw new Error('Payment not found');
    }

    payload = mergePatch(existing, payload);
  }

  // Normalize after merge
  payload = normalizePayload(
    payload as Record<string, unknown>
  ) as Partial<PaymentRecord>;

  // Apply business rules after final payload is ready
  payload = applyReceiptTypeRules(payload);

  // CREATE requires organization scope validation
  if (method === 'create') {
    enforceOrgScope(user, query);
  }

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