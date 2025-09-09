export interface TransactionSummary {
  totalTransactions: {
    today: number;
    week: number;
    month: number;
  };
  transactionValue: {
    today: number;
    week: number;
    month: number;
    currency: string;
  };
  pendingTransactions: number;
  recentTransactions: {
    id: string;
    amount: number;
    type: string;
    status: string;
    created_at: string;
    currency: string;
  }[];
  transactionTrend: {
    date: string;
    count: number;
    value: number;
  }[];
}

export interface FinancialBalances {
  tillBalances: {
    total: number;
    currency: string;
    lowBalanceTills: {
      id: string;
      name: string;
      balance: number;
      minBalance: number;
      currency: string;
    }[];
  };
  vaultBalances: {
    total: number;
    currency: string;
  };
  bankAccountBalances: {
    total: number;
    currency: string;
  };
  partnerReceivables: {
    total: number;
    currency: string;
    partners: {
      orgId: string;
      orgName: string;
      balance: number;
      currency: string;
    }[];
  };
  lowBalanceAlerts: {
    type: "TILL" | "VAULT" | "BANK_ACCOUNT";
    id: string;
    name: string;
    balance: number;
    minBalance: number;
    currency: string;
  }[];
}

export interface ChargesAndPayments {
  pendingCharges: {
    total: number;
    currency: string;
    byType: {
      type: string;
      amount: number;
      count: number;
    }[];
  };
  recentBatchPayments: {
    id: string;
    referenceNumber: string;
    type: string;
    externalTotalAmount: number;
    dateCompleted: string;
    currency: string;
  }[];
  chargeBreakdown: {
    type: string;
    amount: number;
    percentage: number;
  }[];
}

export interface CustomerBeneficiaryInsights {
  totalCustomers: number;
  totalBeneficiaries: number;
  newRegistrations: {
    today: number;
    week: number;
    month: number;
  };
  highRiskCustomers: number;
  customerGrowth: {
    date: string;
    customers: number;
    beneficiaries: number;
  }[];
}

export interface OrganisationCorridorActivity {
  activeCorridors: {
    countryId: string;
    countryName: string;
    transactionCount: number;
    totalValue: number;
    currency: string;
  }[];
  integrationStatus: {
    internalPartners: number;
    externalPartners: number;
    pendingIntegrations: number;
  };
  partnerBalances: {
    orgId: string;
    orgName: string;
    balance: number;
    currency: string;
    type: "RECEIVABLE" | "PAYABLE";
  }[];
}

export interface SystemHealth {
  tillVaultActivity: {
    lastTillTopup: {
      amount: number;
      date: string;
      tillName: string;
      currency: string;
    } | null;
    lastVaultTopup: {
      amount: number;
      date: string;
      vaultName: string;
      currency: string;
    } | null;
    recentActivity: {
      type: "TOPUP" | "WITHDRAWAL";
      entityType: "TILL" | "VAULT";
      entityName: string;
      amount: number;
      date: string;
      currency: string;
    }[];
  };
  failedTransactions: {
    today: number;
    week: number;
    month: number;
  };
  systemAlerts: {
    type: "ERROR" | "WARNING" | "INFO";
    message: string;
    count: number;
  }[];
}

export interface DashboardData {
  transactionSummary: TransactionSummary;
  financialBalances: FinancialBalances;
  chargesAndPayments: ChargesAndPayments;
  customerBeneficiaryInsights: CustomerBeneficiaryInsights;
  organisationCorridorActivity: OrganisationCorridorActivity;
  systemHealth: SystemHealth;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
  error?: string;
}
