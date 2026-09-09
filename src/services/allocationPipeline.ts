import { normalizePayload } from '../hooks/normalizePayload';
import { stripManagedFields } from '../hooks/stripManagedFields';
import { mergePatch } from '../hooks/mergePatch';
import { enforceOrgScope } from '../hooks/enforceOrgScope';
import { applyReceiptTypeRules } from '../hooks/applyReceiptTypeRules';
import { MANAGED_PAYMENT_FIELDS } from '../constants';
import { AllocationRow, PaymentRecord, PipelineContext } from '../types';

const MANAGED_FIELDS = [...MANAGED_PAYMENT_FIELDS];

export function validateAllocationTotal(
  paymentAmount: number,
  allocations: AllocationRow[]
): void {
  const total = allocations.reduce((sum, row) => sum + row.amount, 0);
  if (total !== paymentAmount) {
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

  if (method === 'patch') {
    if (!existing) {
      throw new Error('Payment not found');
    }

    const rawData = (data || {}) as Record<string, unknown>;
    const cleanPatch = stripManagedFields(rawData, MANAGED_FIELDS);
    const normalizedPatch = normalizePayload(cleanPatch as Record<string, unknown>);
    const merged = mergePatch(existing as unknown as Record<string,unknown>, normalizedPatch as Record<string,unknown>);

    // Apply TDS receipt type rules on the final merged record
    const withRules = applyReceiptTypeRules((merged as unknown)as PaymentRecord);

    return withRules as PaymentRecord;
  }

  // Handle 'create' method
  enforceOrgScope(user, query);

  const rawData = (data || {}) as Record<string, unknown>;
  const cleanData = stripManagedFields(rawData, MANAGED_FIELDS);
  const normalized = normalizePayload(cleanData as Record<string, unknown>);

  // Apply TDS receipt type rules on newly created records
  const withRules = applyReceiptTypeRules((normalized as unknown)as PaymentRecord);

  return withRules as unknown as PaymentRecord;
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