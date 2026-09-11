/**
 * Managed fields — assigned by the server, never accepted from client payloads.
 *
 * stripManagedFields(data, MANAGED_PAYMENT_FIELDS) removes these before save.
 * The pipeline passes this same list; the hook itself works with any field names.
 */
export const MANAGED_PAYMENT_FIELDS = ['public_key', 'payment_seq'] as const;

export type ManagedPaymentField = (typeof MANAGED_PAYMENT_FIELDS)[number];``
