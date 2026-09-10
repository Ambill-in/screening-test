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
  const merged = { ...existing };

  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) {
      (merged as Record<string, unknown>)[key] = value;
    }
  }

  return merged;
}
