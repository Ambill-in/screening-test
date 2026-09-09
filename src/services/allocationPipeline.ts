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
import { applyReceiptTypeRules } from '../hooks/applyReceiptTypeRules';
import { moneyEquals } from '../lib/money';
import { MANAGED_PAYMENT_FIELDS } from '../constants';
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
  const total = allocations.reduce((sum, row) => sum + row.amount, 0);
  if (!moneyEquals(total, paymentAmount)) {
    throw new Error('Allocation total must equal payment amount');
  }
}

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
    const merged = mergePatch(existing, payload);
    return applyReceiptTypeRules(merged);
  }

  enforceOrgScope(user, query);

  return applyReceiptTypeRules(payload as PaymentRecord);
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
