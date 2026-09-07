/**
 * Remove managed fields from a payment payload before save.
 *
 * Managed fields are server-assigned (see MANAGED_PAYMENT_FIELDS in ../constants.ts).
 * The `fields` argument is that list when the pipeline calls this hook.
 *
 * Returns a copy of the data with each managed field in `fields` removed.
 * Works for a single object or an array of objects.
 */

function stripOne<T extends object>(item: T, fields: string[]): T {
  const copy = { ...item };
  for (const field of fields) {
    delete (copy as Record<string, unknown>)[field];
  }
  return copy;
}

export function stripManagedFields<T extends object>(
  data: T | T[],
  fields: string[]
): T | T[] {
  if (Array.isArray(data)) {
    return data.map((item) => stripOne(item, fields));
  }
  return stripOne(data, fields);
}
