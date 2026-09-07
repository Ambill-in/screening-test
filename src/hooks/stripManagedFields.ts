/**
 * Remove managed fields from a payment payload before save.
 *
 * Managed fields are server-assigned (see MANAGED_PAYMENT_FIELDS in ../constants.ts),
 * so a client must never be able to set or overwrite them by putting them in the body.
 * Accepts a single record or a bulk array; the input is never mutated.
 */

function stripOne<T extends object>(record: T, fields: string[]): T {
  const managed = new Set(fields);

  return Object.fromEntries(
    Object.entries(record).filter(([key]) => !managed.has(key))
  ) as T;
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
