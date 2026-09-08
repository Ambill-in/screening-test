/**
 * Remove managed fields from a payment payload before save.
 *
 * Managed fields are server-assigned (see MANAGED_PAYMENT_FIELDS in ../constants.ts).
 * The `fields` argument is that list when the pipeline calls this hook, so a client
 * cannot claim a public_key or a payment_seq by putting one in the request body.
 *
 * Accepts a single record or a bulk array, and always returns copies — the caller's
 * payload is never mutated.
 */

function stripOne<T extends object>(record: T, fields: string[]): T {
  const result = { ...record };

  for (const field of fields) {
    delete (result as Record<string, unknown>)[field];
  }

  return result;
}

export function stripManagedFields<T extends object>(
  data: T | T[],
  fields: string[]
): T | T[] {
  if (Array.isArray(data)) {
    return data.map((record) => stripOne(record, fields));
  }

  return stripOne(data, fields);
}
