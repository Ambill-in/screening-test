/**
 * Remove managed fields from a payment payload before save.
 *
 * Managed fields are server-assigned (see MANAGED_PAYMENT_FIELDS in ../constants.ts).
 * The `fields` argument is that list when the pipeline calls this hook.
 *
 * TODO: return a copy of the data with each managed field in `fields` removed.
 * Must work for a single object or an array of objects.
 */

export function stripManagedFields<T extends object>(
  data: T | T[],
  fields: string[]
): T | T[] {
  const removeFields = (obj: T): T => {
    const { ...rest } = obj as Record<string, unknown>;
    for (const field of fields) {
      delete rest[field];
    }
    return rest as T;
  };

  if (Array.isArray(data)) {
    return data.map(removeFields);
  }
  return removeFields(data);
}
