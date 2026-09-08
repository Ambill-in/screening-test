/**
 * Remove managed fields from a payment payload before save.
 *
 * Managed fields are server-assigned (see MANAGED_PAYMENT_FIELDS in ../constants.ts).
 * The `fields` argument is that list when the pipeline calls this hook.
 * Works for a single object or an array of objects.
 */

export function stripManagedFields<T extends object>(
  data: T | T[],
  fields: string[]
): T | T[] {
  if (Array.isArray(data)) {
    return data.map((row) => stripManagedFields(row, fields) as T);
  }

  const result = { ...data } as Record<string, unknown>;
  for (const field of fields) {
    delete result[field];
  }
  return result as T;
}
