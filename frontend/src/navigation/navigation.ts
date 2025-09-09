export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  children?: NavigationItem[];
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
      },
      {
        id: "transactions",
        label: "Transactions",
        path: "/transactions",
        icon: "💸",
        children: [
          {
            id: "outbound",
            label: "Outbound",
            path: "/transactions/outbound",
            icon: "📤",
          },
          {
            id: "inbound",
            label: "Inbound",
            path: "/transactions/inbound",
            icon: "📥",
          },
        ],
      },
      {
        id: "customers",
        label: "Customers",
        path: "/customers",
        icon: "👥",
      },
      {
        id: "organisations.gl-transactions",
        label: "GL Transactions",
        path: "/gl-transactions",
        icon: "📊",
      },
      {
        id: "charges-payments",
        label: "Charges Payments",
        path: "/charges-payments",
        icon: "💰",
      },
      {
        id: "reports",
        label: "Reports",
        path: "/reports",
        icon: "📋",
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
      },
      {
        id: "organisations.corridors",
        label: "Corridors",
        path: "/corridors",
        icon: "🌍",
      },
      {
        id: "organisations.integrations",
        label: "Integrations",
        path: "/integrations",
        icon: "🔌",
      },
      {
        id: "organisations.charges",
        label: "Charges",
        path: "/charges",
        icon: "💰",
      },
      {
        id: "exchange-rates",
        label: "Exchange Rates",
        path: "/exchange-rates",
        icon: "💱",
      },

      {
        id: "organisations.balances",
        label: "Organisation Balances",
        path: "/organisation-balances",
        icon: "💰",
      },
      {
        id: "organisations.vault",
        label: "Vaults",
        path: "/vaults",
        icon: "🔒",
      },

      {
        id: "tills",
        label: "Tills",
        path: "/tills",
        icon: "🏪",
      },
      {
        id: "bank-accounts",
        label: "Bank Accounts",
        path: "/bank-accounts",
        icon: "🏦",
      },
      {
        id: "organisations.accounts",
        label: "GL Accounts",
        path: "/gl-accounts",
        icon: "📋",
      },

      {
        id: "reports",
        label: "Reports",
        path: "/reports",
        icon: "📊",
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
      },
      {
        id: "roles",
        label: "Roles",
        path: "/roles",
        icon: "🔐",
      },
      {
        id: "my-account",
        label: "My Account",
        path: "/my-account",
        icon: "⚙️",
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
