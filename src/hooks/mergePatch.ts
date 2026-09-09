/**
 * Apply a partial PATCH to an existing payment.
 *
 * TODO: return a full payment record.
 * Fields present in patch override existing; fields omitted in patch stay from existing.
 */

import { PaymentRecord } from '../types';

export function mergePatch(
  existing: PaymentRecord,
  patch: Partial<PaymentRecord>
): PaymentRecord {
  const result = { ...existing };

  for (const key of Object.keys(patch) as (keyof PaymentRecord)[]) {
    const value = patch[key];
    if (value !== undefined) {
      (result as Record<keyof PaymentRecord, unknown>)[key] = value;
    }
  }
  return result;
}
