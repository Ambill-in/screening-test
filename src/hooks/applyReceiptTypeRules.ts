/**
 * Business rules that depend on receipt_type.
 *
 * TODO: implement TDS handling per README (Background: billing rules).
 * Use isTdsReceipt() from ../lib/receiptType.
 */

import { PaymentRecord } from '../types';
interface ReceiptTyped {
  receipt_type?: unknown;
  amount_paid?: unknown;
}


export function applyReceiptTypeRules(
  payload: Partial<PaymentRecord>
): Partial<PaymentRecord> {
  const result = { ...payload };

  if (result.receipt_type === 'TDS') {
    result.amount_paid = 0;
  }

  return result;
}