/**
 * Business rules that depend on receipt_type.
 *
 * TDS receipts represent tax deducted at source — not cash in the bank.
 * amount_paid must be forced to 0 for TDS receipts.
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
