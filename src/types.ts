export type SyncStatus = 'pending' | 'success' | 'failed';

export interface PaymentRecord {
  id: string;
  organization_id: string;
  amount_paid: number;
  payment_mode: string | null;
  bank_account_id: string | null;
  receipt_type: string;
  tally_sync_status: SyncStatus;
  public_key?: string;
  payment_seq?: number;
}

export interface AllocationRow {
  invoice_id: string;
  amount: number;
}

export interface UserContext {
  id: string;
  organization_id: string;
  role: 'user' | 'superadmin';
}

export type HttpMethod = 'create' | 'patch' | 'remove';

export interface PipelineContext {
  method: HttpMethod;
  data: Partial<PaymentRecord>;
  existing?: PaymentRecord;
  user: UserContext;
  query: Record<string, unknown>;
}
