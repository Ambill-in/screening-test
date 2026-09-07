/**
 * Receipt-type helpers (provided — do not modify).
 *
 * Ambill classifies inbound customer receipts by what they represent in the books.
 */

export function isTdsReceipt(receiptType: unknown): boolean {
  return String(receiptType ?? 'REGULAR').trim() === 'TDS';
}
