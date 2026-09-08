/**
 * Business rules that depend on receipt_type.
 *
 * TODO: implement TDS handling per README (Background: billing rules).
 * Use isTdsReceipt() from ../lib/receiptType.
 */

import { isTdsReceipt } from '../lib/receiptType';

interface ReceiptTyped {
  receipt_type?: unknown;
  amount_paid?: unknown;
}

export function applyReceiptTypeRules<T extends ReceiptTyped>(data: T): T {
  if (isTdsReceipt(data.receipt_type)) {
    data.amount_paid = 0;
  }
  return data;
}
