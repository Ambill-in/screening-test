/**
 * Remove managed fields from a payment payload before save.
 *
 * Managed fields are server-assigned (see MANAGED_PAYMENT_FIELDS in ../constants.ts).
 * The `fields` argument is that list when the pipeline calls this hook.
 *
 * TODO: return a copy of the data with each managed field in `fields` removed.
 * Must work for a single object or an array of objects.
 */

export function stripManagedFields(
  payload: Record<string, unknown> | Array<Record<string, unknown>>,
  managedFields: string[]
): Record<string, unknown> | Array<Record<string, unknown>> {
  if (Array.isArray(payload)) {
    return payload.map((item) =>
      stripManagedFields(item, managedFields) as Record<string, unknown>
    );
  }

  const result = { ...payload };
  for (const field of managedFields) {
    delete result[field];
  }
  return result;
}
