/**
 * Remove managed fields from a payment payload before save.
 *
 * Managed fields are server-assigned (see MANAGED_PAYMENT_FIELDS in ../constants.ts).
 * The `fields` argument is that list when the pipeline calls this hook.
 */

function stripManagedFieldsValue<T extends object>(data: T, fields: string[]): T {
  const result = { ...data } as T;
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
    return data.map((item) => stripManagedFieldsValue(item, fields));
  }
  return stripManagedFieldsValue(data, fields);
}
