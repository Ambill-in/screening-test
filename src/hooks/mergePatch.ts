/**
 * Apply a partial PATCH to an existing payment.
 *
 * A PATCH body carries only the fields the client wants to change, so the result is
 * the stored record overlaid with the patch. Overriding is presence-based, not
 * truthiness-based: a field explicitly sent as null is a deliberate clear and wins,
 * while a field the client omitted keeps its stored value.
 */

import { PaymentRecord } from '../types';

export function mergePatch(
  existing: PaymentRecord,
  patch: Partial<PaymentRecord>
): PaymentRecord {
  return { ...existing, ...patch };
}
