/**
 * Clean up incoming payment fields before save.
 *
 * The UI cannot send a bare null, so "no value" arrives either as an empty
 * string or as the '__none__' sentinel. Both mean null in the database.
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
