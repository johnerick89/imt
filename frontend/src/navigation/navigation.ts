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
            id: "inbound",
            label: "Inbound",
            path: "/transactions/inbound",
            icon: "📥",
          },
          {
            id: "outbound",
            label: "Outbound",
            path: "/transactions/outbound",
            icon: "📤",
          },
        ],
      },
      {
        id: "customers",
        label: "Customers",
        path: "/customers",
        icon: "👥",
      },
    ],
  },
  {
    id: "administrative",
    label: "ADMINISTRATIVE",
    items: [
      {
        id: "organisations",
        label: "Organisations",
        path: "/organisations",
        icon: "🏢",
        children: [
          {
            id: "organisations.settings",
            label: "Settings",
            path: "/organisations",
            icon: "🏢",
          },
          {
            id: "organisations.ledgers",
            label: "Ledgers",
            path: "/organisations/ledgers",
            icon: "📋",
          },
          {
            id: "organisations.balances",
            label: "Balances",
            path: "/organisations/balances",
            icon: "💰",
          },
          {
            id: "organisations.vault",
            label: "Vault",
            path: "/organisations/vault",
            icon: "🔒",
          },
          {
            id: "organisations.commission-rates",
            label: "Commission Rates",
            path: "/organisations/commission-rates",
            icon: "📈",
          },
        ],
      },
      {
        id: "fees",
        label: "Fees",
        path: "/fees",
        icon: "💳",
      },
      {
        id: "exchange-rates",
        label: "Exchange Rates",
        path: "/exchange-rates",
        icon: "💱",
      },
      {
        id: "tills",
        label: "Tills",
        path: "/tills",
        icon: "🏪",
      },
      {
        id: "taxes",
        label: "Taxes",
        path: "/taxes",
        icon: "🧾",
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
