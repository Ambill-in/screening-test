/**
 * Business rules that depend on receipt_type.
 *
 * TDS receipts represent a tax credit, not cash received, so amount_paid
 * is always forced to 0 regardless of what the client sends.
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
