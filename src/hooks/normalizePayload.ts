/**
 * Clean up incoming payment fields before save.
 *
 * For each field in NULLABLE_FIELDS: if the value is '', sets it to null.
 * For each field in SENTINEL_FIELDS: if the value is '__none__', sets it to null.
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
