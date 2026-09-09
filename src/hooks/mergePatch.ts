/**
 * Apply a partial PATCH to an existing payment.
 *
 * TODO: return a full payment record.
 * Fields present in patch override existing; fields omitted in patch stay from existing.
 */

import { PaymentRecord } from '../types';

export function mergePatch<T extends Record<string, unknown>>(
  existing: T,
  patch: Partial<T>
): T {
  const result = { ...existing };

  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) {
      (result as Record<string, unknown>)[key] = value;
    }
  }

  return result;
}
