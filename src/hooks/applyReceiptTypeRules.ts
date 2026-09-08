/**
 * Business rules that depend on receipt_type: a TDS receipt is a tax credit,
 * not cash in the bank, so amount_paid must never be stored as cash.
 */

import { isTdsReceipt } from '../lib/receiptType';

interface ReceiptTyped {
  receipt_type?: unknown;
  amount_paid?: unknown;
}

export function applyReceiptTypeRules<T extends ReceiptTyped>(data: T): T {
  if (isTdsReceipt(data.receipt_type)) {
    return { ...data, amount_paid: 0 };
  }
  return data;
}
