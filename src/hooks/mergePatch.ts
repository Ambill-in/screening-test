/**
 * Apply a partial PATCH to an existing payment.
 */

import { PaymentRecord } from '../types';

export function mergePatch(
  existing: PaymentRecord,
  patch: Partial<PaymentRecord>
): PaymentRecord {
  return { ...existing, ...patch } as PaymentRecord;
}
