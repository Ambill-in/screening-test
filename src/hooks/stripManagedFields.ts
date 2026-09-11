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
  const manageFields = new Set(fields);
  const stripfield = (record : T): T =>
    Object.fromEntries(
      Object.entries(record).filter(([key]) => !manageFields.has(key))
    ) as T;
return Array.isArray(data) ? data.map(stripfield) : stripfield(data);
}
