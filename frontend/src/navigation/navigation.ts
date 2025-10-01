export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  children?: NavigationItem[];
  permission?: string; // Required permission to view this navigation item
}

export interface NavigationSection {
  id: string;
  label: string;
  items: NavigationItem[];
}

// Navigation sections for sidebar organization
export const navigationSections: NavigationSection[] = [
  {
    id: "main",
    label: "MAIN",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/dashboard",
        icon: "📊",
        // No permission required - everyone can access dashboard
      },
      {
        id: "transactions",
        label: "Transactions",
        path: "/transactions",
        icon: "💸",
        permission: "admin.transactions.view",
      },

      {
        id: "customers",
        label: "Customers",
        path: "/customers",
        icon: "👥",
        permission: "admin.customers.view",
      },
      {
        id: "charges-payments",
        label: "Charges Payments",
        path: "/charges-payments",
        icon: "💰",
        permission: "admin.chargesPayments.view",
      },
      {
        id: "organisations.gl-transactions",
        label: "GL Transactions",
        path: "/gl-transactions",
        icon: "📊",
        permission: "admin.ledgers.view",
      },

      {
        id: "reports",
        label: "Reports",
        path: "/reports",
        icon: "📊",
        permission: "admin.reports.view",
      },
    ],
  },
  {
    id: "administrative",
    label: "ADMINISTRATIVE",
    items: [
      {
        id: "organisations.index",
        label: "Organisations",
        path: "/organisations",
        icon: "🏢",
        permission: "admin.organisations.view",
      },
      {
        id: "organisations.connections",
        label: "Connections",
        path: "/connections",
        icon: "🔌",
        permission: "admin.corridors.view",
      },

      {
        id: "organisations.financial-settings",
        label: "Financial Settings",
        path: "/financial-settings",
        icon: "💰",
        permission: "admin.charges.view", // Or use a dedicated permission if available
      },

      {
        id: "organisations.vault",
        label: "Vaults",
        path: "/vaults",
        icon: "🔒",
        permission: "admin.vaults.view",
      },

      {
        id: "tills",
        label: "Tills",
        path: "/tills",
        icon: "🏪",
        permission: "admin.tills.view",
      },
      {
        id: "bank-accounts",
        label: "Bank Accounts",
        path: "/bank-accounts",
        icon: "🏦",
        permission: "admin.bankAccounts.view",
      },
      {
        id: "organisations.accounts",
        label: "GL Accounts",
        path: "/gl-accounts",
        icon: "📋",
        permission: "admin.accounts.view",
      },
    ],
  },
  {
    id: "core-setups",
    label: "CORE SETUPS",
    items: [
      {
        id: "core-configurations",
        label: "Core Configurations",
        path: "/core-configurations",
        icon: "⚙️",
        permission: "admin.parameters.view",
      },
      {
        id: "transaction-channels",
        label: "Transaction Channels",
        path: "/transaction-channels",
        icon: "🔗",
        permission: "admin.transactionChannels.view",
      },
    ],
  },
  {
    id: "user-management",
    label: "USER MANAGEMENT",
    items: [
      {
        id: "users",
        label: "Users",
        path: "/users",
        icon: "👤",
        permission: "admin.users.view",
      },
      {
        id: "roles",
        label: "Roles",
        path: "/roles",
        icon: "🔐",
        permission: "admin.roles.view",
      },
      {
        id: "my-account",
        label: "My Account",
        path: "/my-account",
        icon: "⚙️",
        // No permission required - everyone can access their own account
      },
    ],
  },
];

// Flatten all navigation items for backward compatibility
export const navigationItems: NavigationItem[] = navigationSections.flatMap(
  (section) => section.items
);

export const getNavigationItemByPath = (
  path: string
): NavigationItem | undefined => {
  const findItem = (items: NavigationItem[]): NavigationItem | undefined => {
    for (const item of items) {
      if (item.path === path) {
        return item;
      }
      if (item.children) {
        const found = findItem(item.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  return findItem(navigationItems);
};

export const getBreadcrumbs = (path: string): NavigationItem[] => {
  const breadcrumbs: NavigationItem[] = [];

  const findPath = (
    items: NavigationItem[],
    targetPath: string,
    currentPath: NavigationItem[] = []
  ): boolean => {
    for (const item of items) {
      const newPath = [...currentPath, item];

      if (item.path === targetPath) {
        breadcrumbs.push(...newPath);
        return true;
      }

      if (item.children) {
        if (findPath(item.children, targetPath, newPath)) {
          return true;
        }
      }
    }
    return false;
  };

  findPath(navigationItems, path);
  return breadcrumbs;
};
