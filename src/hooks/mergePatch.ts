/**
 * Apply a partial PATCH to an existing payment.
 *
 * A PATCH body carries only the fields the client wants to change, so the result
 * has to start from the stored record. Keys the patch omits — and keys explicitly
 * set to `undefined`, which JSON never produces — keep their existing value; an
 * explicit `null` is a real value and does overwrite.
 */

import { PaymentRecord } from '../types';

export function mergePatch(
  existing: PaymentRecord,
  patch: Partial<PaymentRecord>
): PaymentRecord {
  const changes = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined)
  ) as Partial<PaymentRecord>;

  return { ...existing, ...changes };
}
