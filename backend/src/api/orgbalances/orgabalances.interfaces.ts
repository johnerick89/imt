export interface IUpdateOrgBalance {
  organisationId: string;
  amount?: number;
  type:
    | "deposit"
    | "withdrawal"
    | "commission"
    | "transaction_in"
    | "transaction_out";
  referenceNumber?: string;
  description?: string;
  userId?: string;
  balanceHistoryId?: string;
}
