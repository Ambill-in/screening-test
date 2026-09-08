/**
 * Business rules that depend on receipt_type.
 *
 * A TDS receipt records tax deducted at source — a credit against the customer's
 * liability, not money that arrived in the bank. Whatever cash figure the client
 * sends, a TDS receipt must be stored with amount_paid of zero, or the ledger
 * reports bank income that never landed. Every other receipt type is left alone.
 */

import { isTdsReceipt } from '../lib/receiptType';

interface ReceiptTyped {
  receipt_type?: unknown;
  amount_paid?: unknown;
}

export function applyReceiptTypeRules<T extends ReceiptTyped>(data: T): T {
  if (!isTdsReceipt(data.receipt_type)) {
    return data;
  }

  return { ...data, amount_paid: 0 };
}
