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