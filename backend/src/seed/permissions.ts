const permissions = [
  {
    permission_name: "admin.organisations.view",
    permission_description: "View Organisations",
  },
  {
    permission_name: "admin.organisations.edit",
    permission_description: "Edit Organisations",
  },
  {
    permission_name: "admin.organisations.delete",
    permission_description: "Delete Organisations",
  },
  {
    permission_name: "admin.organisations.create",
    permission_description: "Add Organisations",
  },
  {
    permission_name: "admin.users.view",
    permission_description: "View Users",
  },
  {
    permission_name: "admin.users.edit",
    permission_description: "Edit Users",
  },
  {
    permission_name: "admin.users.delete",
    permission_description: "Delete Users",
  },
  {
    permission_name: "admin.users.create",
    permission_description: "Add Users",
  },
  {
    permission_name: "admin.roles.view",
    permission_description: "View Roles",
  },
  {
    permission_name: "admin.roles.edit",
    permission_description: "Edit Roles",
  },
  {
    permission_name: "admin.roles.delete",
    permission_description: "Delete Roles",
  },
  {
    permission_name: "admin.roles.create",
    permission_description: "Add Roles",
  },
  {
    permission_name: "admin.integrations.view",
    permission_description: "View Integrations",
  },
  {
    permission_name: "admin.integrations.edit",
    permission_description: "Edit Integrations",
  },
  {
    permission_name: "admin.integrations.delete",
    permission_description: "Delete Integrations",
  },
  {
    permission_name: "admin.integrations.create",
    permission_description: "Add Integrations",
  },
  {
    permission_name: "admin.corridors.view",
    permission_description: "View Corridors",
  },
  {
    permission_name: "admin.corridors.edit",
    permission_description: "Edit Corridors",
  },
  {
    permission_name: "admin.corridors.delete",
    permission_description: "Delete Corridors",
  },
  {
    permission_name: "admin.corridors.create",
    permission_description: "Add Corridors",
  },
  {
    permission_name: "admin.charges.view",
    permission_description: "View Charges",
  },
  {
    permission_name: "admin.charges.edit",
    permission_description: "Edit Charges",
  },
  {
    permission_name: "admin.charges.delete",
    permission_description: "Delete Charges",
  },
  {
    permission_name: "admin.charges.create",
    permission_description: "Add Charges",
  },
  {
    permission_name: "admin.accounts.view",
    permission_description: "View Accounts",
  },
  {
    permission_name: "admin.accounts.edit",
    permission_description: "Edit Accounts",
  },
  {
    permission_name: "admin.accounts.delete",
    permission_description: "Delete Accounts",
  },
  {
    permission_name: "admin.accounts.create",
    permission_description: "Add Accounts",
  },
  {
    permission_name: "admin.ledgers.view",
    permission_description: "View Ledgers",
  },
  {
    permission_name: "admin.ledgers.edit",
    permission_description: "Edit Ledgers",
  },
  {
    permission_name: "admin.ledgers.delete",
    permission_description: "Delete Ledgers",
  },
  {
    permission_name: "admin.ledgers.create",
    permission_description: "Add Ledgers",
  },
  {
    permission_name: "admin.vaults.view",
    permission_description: "View Vaults",
  },
  {
    permission_name: "admin.vaults.edit",
    permission_description: "Edit Vaults",
  },
  {
    permission_name: "admin.vaults.delete",
    permission_description: "Delete Vaults",
  },
  {
    permission_name: "admin.vaults.create",
    permission_description: "Add Vaults",
  },
  {
    permission_name: "admin.tills.view",
    permission_description: "View Tills",
  },
  {
    permission_name: "admin.tills.edit",
    permission_description: "Edit Tills",
  },
  {
    permission_name: "admin.tills.delete",
    permission_description: "Delete Tills",
  },
  {
    permission_name: "admin.tills.create",
    permission_description: "Add Tills",
  },
  {
    permission_name: "admin.exchangerates.view",
    permission_description: "View Exchange Rates",
  },
  {
    permission_name: "admin.exchangerates.edit",
    permission_description: "Edit Exchange Rates",
  },
  {
    permission_name: "admin.exchangerates.delete",
    permission_description: "Delete Exchange Rates",
  },
  {
    permission_name: "admin.exchangerates.create",
    permission_description: "Add Exchange Rates",
  },
  {
    permission_name: "admin.customers.view",
    permission_description: "View Customers",
  },
  {
    permission_name: "admin.customers.edit",
    permission_description: "Edit Customers",
  },
  {
    permission_name: "admin.customers.delete",
    permission_description: "Delete Customers",
  },
  {
    permission_name: "admin.customers.create",
    permission_description: "Add Customers",
  },
  {
    permission_name: "admin.transactions.view",
    permission_description: "View Transactions",
  },
  {
    permission_name: "admin.transactions.edit",
    permission_description: "Edit Transactions",
  },
  {
    permission_name: "admin.transactions.delete",
    permission_description: "Delete Transactions",
  },
  {
    permission_name: "admin.transactions.create",
    permission_description: "Add Transactions",
  },
  {
    permission_name: "admin.transactions.approve",
    permission_description: "Approve Transactions",
  },
  {
    permission_name: "admin.transactions.cancel",
    permission_description: "Cancel Transactions",
  },
  {
    permission_name: "admin.transactions.reverse",
    permission_description: "Reverse Transactions",
  },
  {
    permission_name: "admin.chargesPayments.view",
    permission_description: "View Charges Payments",
  },
  {
    permission_name: "admin.chargesPayments.create",
    permission_description: "Create charges payments",
  },
  {
    permission_name: "admin.chargesPayments.approve",
    permission_description: "Approve charges payments",
  },
  {
    permission_name: "admin.orgBalances.view",
    permission_description: "View Org Balances",
  },
  {
    permission_name: "admin.orgBalances.create",
    permission_description: "Create org balances",
  },
  {
    permission_name: "admin.bankAccounts.view",
    permission_description: "View Bank Accounts",
  },
  {
    permission_name: "admin.bankAccounts.create",
    permission_description: "Create bank accounts",
  },
  {
    permission_name: "admin.bankAccounts.edit",
    permission_description: "Edit bank accounts",
  },
  {
    permission_name: "admin.bankAccounts.delete",
    permission_description: "Delete bank accounts",
  },
  {
    permission_name: "admin.reports.view",
    permission_description: "View reports",
  },
  {
    permission_name: "admin.transactionChannels.view",
    permission_description: "View transaction channels",
  },
  {
    permission_name: "admin.transactionChannels.create",
    permission_description: "Create transaction channels",
  },
  {
    permission_name: "admin.transactionChannels.edit",
    permission_description: "Edit transaction channels",
  },
  {
    permission_name: "admin.transactionChannels.delete",
    permission_description: "Delete transaction channels",
  },
  {
    permission_name: "admin.parameters.view",
    permission_description: "View parameters",
  },
  {
    permission_name: "admin.parameters.create",
    permission_description: "Create parameters",
  },
  {
    permission_name: "admin.parameters.edit",
    permission_description: "Edit parameters",
  },
  {
    permission_name: "admin.parameters.delete",
    permission_description: "Delete parameters",
  },
  {
    permission_name: "admin.validationRules.view",
    permission_description: "View validation rules",
  },
  {
    permission_name: "admin.validationRules.edit",
    permission_description: "Edit validation rules",
  },
];

export default permissions;
