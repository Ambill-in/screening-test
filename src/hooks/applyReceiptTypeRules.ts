/**
 * Business rules that depend on receipt_type.
 *
 * A TDS receipt records tax deducted at source — a credit against the invoice, not
 * cash that ever reached a bank account. Storing a non-zero `amount_paid` for one
 * would overstate collections, so the amount is forced to zero regardless of what
 * the client sent. REGULAR receipts are left untouched.
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
