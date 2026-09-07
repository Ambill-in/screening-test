/**
 * Remove managed fields from a payment payload before save.
 *
 * Managed fields are server-assigned (see MANAGED_PAYMENT_FIELDS in ../constants.ts).
 * The `fields` argument is that list when the pipeline calls this hook.
 *
 * TODO: return a copy of the data with each managed field in `fields` removed.
 * Must work for a single object or an array of objects.
 */

function stripOne<T extends object>(record: T, fields: string[]): T {
  const copy = { ...record } as Record<string, unknown>;
  for (const field of fields) {
    delete copy[field];
  }
  return copy as unknown as T;
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
