/**
 * Clean up incoming payment fields before save.
 *
 * The UI submits empty strings for cleared optional inputs and the literal
 * '__none__' when no bank account is picked. Both mean "no value" and must be
 * stored as NULL rather than as a string the rest of the system has to special-case.
 */

const NULLABLE_FIELDS = ['payment_mode', 'bank_account_id'] as const;
const SENTINEL_FIELDS = ['bank_account_id'] as const;
const NONE_SENTINEL = '__none__';

export function normalizePayload(
  data: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...data };

  for (const field of NULLABLE_FIELDS) {
    if (result[field] === '') {
      result[field] = null;
    }
  }

  for (const field of SENTINEL_FIELDS) {
    if (result[field] === NONE_SENTINEL) {
      result[field] = null;
    }
  }

  return result;
}
