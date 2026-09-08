/**
 * Apply a partial PATCH to an existing payment: fields present in the patch
 * override the existing record, omitted fields are inherited from it.
 */

import { PaymentRecord } from '../types';

export function mergePatch(
  existing: PaymentRecord,
  patch: Partial<PaymentRecord>
): PaymentRecord {
  return { ...existing, ...patch };
}
