import { PaymentRecord } from "../types";

export function mergePatch(
  existing: PaymentRecord,
  patch: Partial<PaymentRecord>,
): PaymentRecord {
  return {
    ...existing,
    ...patch,
  };
}
