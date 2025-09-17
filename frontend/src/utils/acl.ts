import React from "react";
import type { User } from "../types/AuthTypes";
import type { Permission } from "../types/RolesTypes";

/**
 * Frontend ACL (Access Control List) Utility
 * Provides permission checking functionality for UI components
 */

// Permission names - matches backend seed permissions exactly
export const PERMISSIONS = {
  // Organisation Management
  VIEW_ORGANISATIONS: "admin.organisations.view",
  CREATE_ORGANISATIONS: "admin.organisations.create",
  EDIT_ORGANISATIONS: "admin.organisations.edit",
  DELETE_ORGANISATIONS: "admin.organisations.delete",

  // User Management
  VIEW_USERS: "admin.users.view",
  CREATE_USERS: "admin.users.create",
  EDIT_USERS: "admin.users.edit",
  DELETE_USERS: "admin.users.delete",

  // Role Management
  VIEW_ROLES: "admin.roles.view",
  CREATE_ROLES: "admin.roles.create",
  EDIT_ROLES: "admin.roles.edit",
  DELETE_ROLES: "admin.roles.delete",

  // Integration Management
  VIEW_INTEGRATIONS: "admin.integrations.view",
  CREATE_INTEGRATIONS: "admin.integrations.create",
  EDIT_INTEGRATIONS: "admin.integrations.edit",
  DELETE_INTEGRATIONS: "admin.integrations.delete",

  // Corridor Management
  VIEW_CORRIDORS: "admin.corridors.view",
  CREATE_CORRIDORS: "admin.corridors.create",
  EDIT_CORRIDORS: "admin.corridors.edit",
  DELETE_CORRIDORS: "admin.corridors.delete",

  // Charge Management
  VIEW_CHARGES: "admin.charges.view",
  CREATE_CHARGES: "admin.charges.create",
  EDIT_CHARGES: "admin.charges.edit",
  DELETE_CHARGES: "admin.charges.delete",

  // Account Management (GL Accounts)
  VIEW_ACCOUNTS: "admin.accounts.view",
  CREATE_ACCOUNTS: "admin.accounts.create",
  EDIT_ACCOUNTS: "admin.accounts.edit",
  DELETE_ACCOUNTS: "admin.accounts.delete",

  // Ledger Management (GL Transactions)
  VIEW_LEDGERS: "admin.ledgers.view",
  CREATE_LEDGERS: "admin.ledgers.create",
  EDIT_LEDGERS: "admin.ledgers.edit",
  DELETE_LEDGERS: "admin.ledgers.delete",

  // Vault Management
  VIEW_VAULTS: "admin.vaults.view",
  CREATE_VAULTS: "admin.vaults.create",
  EDIT_VAULTS: "admin.vaults.edit",
  DELETE_VAULTS: "admin.vaults.delete",

  // Till Management
  VIEW_TILLS: "admin.tills.view",
  CREATE_TILLS: "admin.tills.create",
  EDIT_TILLS: "admin.tills.edit",
  DELETE_TILLS: "admin.tills.delete",

  // Exchange Rate Management
  VIEW_EXCHANGE_RATES: "admin.exchangerates.view",
  CREATE_EXCHANGE_RATES: "admin.exchangerates.create",
  EDIT_EXCHANGE_RATES: "admin.exchangerates.edit",
  DELETE_EXCHANGE_RATES: "admin.exchangerates.delete",

  // Customer Management
  VIEW_CUSTOMERS: "admin.customers.view",
  CREATE_CUSTOMERS: "admin.customers.create",
  EDIT_CUSTOMERS: "admin.customers.edit",
  DELETE_CUSTOMERS: "admin.customers.delete",

  // Transaction Management
  VIEW_TRANSACTIONS: "admin.transactions.view",
  CREATE_TRANSACTIONS: "admin.transactions.create",
  EDIT_TRANSACTIONS: "admin.transactions.edit",
  DELETE_TRANSACTIONS: "admin.transactions.delete",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Extract user permissions from user object
 */
export const getUserPermissions = (user: User | null): string[] => {
  if (!user?.user_role?.permissions) {
    return [];
  }

  return user.user_role.permissions.map(
    (permission: Permission) => permission.name
  );
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = (
  user: User | null,
  permission: string
): boolean => {
  if (!user) return false;

  const userPermissions = getUserPermissions(user);
  console.log("userPermissions", userPermissions);
  return userPermissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (
  user: User | null,
  permissions: string[]
): boolean => {
  if (!user) return false;

  const userPermissions = getUserPermissions(user);
  return permissions.some((permission) => userPermissions.includes(permission));
};

/**
 * Check if user has all of the specified permissions
 */
export const hasAllPermissions = (
  user: User | null,
  permissions: string[]
): boolean => {
  if (!user) return false;

  const userPermissions = getUserPermissions(user);
  return permissions.every((permission) =>
    userPermissions.includes(permission)
  );
};

/**
 * Get user's role name
 */
export const getUserRole = (user: User | null): string | null => {
  return user?.user_role?.name || user?.role || null;
};

/**
 * Check if user has a specific role
 */
export const hasRole = (user: User | null, roleName: string): boolean => {
  const userRole = getUserRole(user);
  return userRole === roleName;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (user: User | null, roleNames: string[]): boolean => {
  const userRole = getUserRole(user);
  return userRole ? roleNames.includes(userRole) : false;
};

/**
 * Check if user is admin (has admin role or all permissions)
 */
export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;

  const userRole = getUserRole(user);
  const adminRoles = ["ADMIN", "SUPER_ADMIN", "SYSTEM_ADMIN"];

  return adminRoles.includes(userRole || "");
};

/**
 * Check if user can access a specific route/page
 */
export const canAccessRoute = (
  user: User | null,
  routePermissions: string[]
): boolean => {
  if (!user) return false;

  // Admin can access everything
  if (isAdmin(user)) return true;

  // Check if user has any of the required permissions
  return hasAnyPermission(user, routePermissions);
};

/**
 * Check if user can perform a specific action
 */
export const canPerformAction = (
  user: User | null,
  actionPermission: string
): boolean => {
  if (!user) return false;

  // Admin can do everything
  if (isAdmin(user)) return true;

  // Check specific permission
  return hasPermission(user, actionPermission);
};

/**
 * Get filtered navigation items based on user permissions
 */
export const getAccessibleNavItems = (
  user: User | null,
  navItems: Array<{
    name: string;
    path: string;
    permissions?: string[];
  }>
): Array<{
  name: string;
  path: string;
  permissions?: string[];
}> => {
  if (!user) return [];

  return navItems.filter((item) => {
    if (!item.permissions || item.permissions.length === 0) return true;
    return canAccessRoute(user, item.permissions);
  });
};

/**
 * Permission-based component wrapper
 */
export const withPermission = <T extends object>(
  Component: React.ComponentType<T>,
  requiredPermissions: string[],
  fallback?: React.ComponentType<Record<string, unknown>> | null
) => {
  const WrappedComponent = (props: T & { user?: User | null }) => {
    const { user, ...otherProps } = props;

    if (!canAccessRoute(user || null, requiredPermissions)) {
      if (fallback) {
        const FallbackComponent = fallback;
        return React.createElement(FallbackComponent);
      }
      return null;
    }

    return React.createElement(Component, otherProps as T);
  };

  return WrappedComponent;
};

/**
 * Hook for permission checking
 */
export const usePermissions = (user: User | null) => {
  return {
    hasPermission: (permission: string) => hasPermission(user, permission),
    hasAnyPermission: (permissions: string[]) =>
      hasAnyPermission(user, permissions),
    hasAllPermissions: (permissions: string[]) =>
      hasAllPermissions(user, permissions),
    hasRole: (roleName: string) => hasRole(user, roleName),
    hasAnyRole: (roleNames: string[]) => hasAnyRole(user, roleNames),
    isAdmin: () => isAdmin(user),
    canAccessRoute: (routePermissions: string[]) =>
      canAccessRoute(user, routePermissions),
    canPerformAction: (actionPermission: string) =>
      canPerformAction(user, actionPermission),
    getUserPermissions: () => getUserPermissions(user),
    getUserRole: () => getUserRole(user),
  };
};

/**
 * Common permission groups for easier management
 */
export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS,
  ],
  ORGANISATION_MANAGEMENT: [
    PERMISSIONS.VIEW_ORGANISATIONS,
    PERMISSIONS.CREATE_ORGANISATIONS,
    PERMISSIONS.EDIT_ORGANISATIONS,
    PERMISSIONS.DELETE_ORGANISATIONS,
  ],
  ROLE_MANAGEMENT: [
    PERMISSIONS.VIEW_ROLES,
    PERMISSIONS.CREATE_ROLES,
    PERMISSIONS.EDIT_ROLES,
    PERMISSIONS.DELETE_ROLES,
  ],
  FINANCIAL_MANAGEMENT: [
    PERMISSIONS.VIEW_ACCOUNTS,
    PERMISSIONS.CREATE_ACCOUNTS,
    PERMISSIONS.EDIT_ACCOUNTS,
    PERMISSIONS.DELETE_ACCOUNTS,
    PERMISSIONS.VIEW_LEDGERS,
    PERMISSIONS.CREATE_LEDGERS,
    PERMISSIONS.EDIT_LEDGERS,
    PERMISSIONS.DELETE_LEDGERS,
  ],
  TRANSACTION_MANAGEMENT: [
    PERMISSIONS.VIEW_TRANSACTIONS,
    PERMISSIONS.CREATE_TRANSACTIONS,
    PERMISSIONS.EDIT_TRANSACTIONS,
    PERMISSIONS.DELETE_TRANSACTIONS,
  ],
  CUSTOMER_MANAGEMENT: [
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.CREATE_CUSTOMERS,
    PERMISSIONS.EDIT_CUSTOMERS,
    PERMISSIONS.DELETE_CUSTOMERS,
  ],
  INFRASTRUCTURE_MANAGEMENT: [
    PERMISSIONS.VIEW_TILLS,
    PERMISSIONS.CREATE_TILLS,
    PERMISSIONS.EDIT_TILLS,
    PERMISSIONS.DELETE_TILLS,
    PERMISSIONS.VIEW_VAULTS,
    PERMISSIONS.CREATE_VAULTS,
    PERMISSIONS.EDIT_VAULTS,
    PERMISSIONS.DELETE_VAULTS,
  ],
  SYSTEM_CONFIGURATION: [
    PERMISSIONS.VIEW_INTEGRATIONS,
    PERMISSIONS.CREATE_INTEGRATIONS,
    PERMISSIONS.EDIT_INTEGRATIONS,
    PERMISSIONS.DELETE_INTEGRATIONS,
    PERMISSIONS.VIEW_CORRIDORS,
    PERMISSIONS.CREATE_CORRIDORS,
    PERMISSIONS.EDIT_CORRIDORS,
    PERMISSIONS.DELETE_CORRIDORS,
    PERMISSIONS.VIEW_CHARGES,
    PERMISSIONS.CREATE_CHARGES,
    PERMISSIONS.EDIT_CHARGES,
    PERMISSIONS.DELETE_CHARGES,
    PERMISSIONS.VIEW_EXCHANGE_RATES,
    PERMISSIONS.CREATE_EXCHANGE_RATES,
    PERMISSIONS.EDIT_EXCHANGE_RATES,
    PERMISSIONS.DELETE_EXCHANGE_RATES,
  ],
} as const;

export default {
  PERMISSIONS,
  PERMISSION_GROUPS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  isAdmin,
  canAccessRoute,
  canPerformAction,
  getUserPermissions,
  getUserRole,
  getAccessibleNavItems,
  withPermission,
  usePermissions,
};
