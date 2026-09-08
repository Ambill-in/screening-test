/**
 * Apply a partial PATCH to an existing payment.
 *
 * TODO: return a full payment record.
 * Fields present in patch override existing; fields omitted in patch stay from existing.
 */

import { PaymentRecord } from '../types';

export function mergePatch<T extends Record<string, any>>(existing: T, patch: Partial<T>): T {
  return { ...existing, ...patch };
}