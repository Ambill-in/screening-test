/**
 * Remove managed fields from a payment payload before save.
 *
 * Managed fields are server-assigned (see MANAGED_PAYMENT_FIELDS in ../constants.ts).
 * The `fields` argument is that list when the pipeline calls this hook.
 *
 * TODO: return a copy of the data with each managed field in `fields` removed.
 * Must work for a single object or an array of objects.
 */

function stripOne<T extends Record<string, any>>(record: T, fields: string[]): T {
  const clone = { ...record };
  for (const f of fields) delete (clone as any)[f];
  return clone;
}

export function stripManagedFields<T extends Record<string, any>>(
  record: T | T[],
  fields: string[]
): T | T[] {
  return Array.isArray(record) ? record.map(r => stripOne(r, fields)) : stripOne(record, fields);
}