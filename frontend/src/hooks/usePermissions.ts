import { useSession } from "./useSession";
import {
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
} from "../utils/acl";

/**
 * Hook for easy permission checking in components
 *
 * Usage:
 * const { canCreate, canUpdate, canDelete, isAdmin } = usePermissions();
 *
 * if (canCreate) {
 *   // Show create button
 * }
 */
export const usePermissions = () => {
  const { user } = useSession();

  return {
    // Permission checks
    hasPermission: (permission: string) => hasPermission(user, permission),
    hasAnyPermission: (permissions: string[]) =>
      hasAnyPermission(user, permissions),
    hasAllPermissions: (permissions: string[]) =>
      hasAllPermissions(user, permissions),

    // Role checks
    hasRole: (roleName: string) => hasRole(user, roleName),
    hasAnyRole: (roleNames: string[]) => hasAnyRole(user, roleNames),
    isAdmin: () => isAdmin(user),

    // Route and action checks
    canAccessRoute: (routePermissions: string[]) =>
      canAccessRoute(user, routePermissions),
    canPerformAction: (actionPermission: string) =>
      canPerformAction(user, actionPermission),

    // User info
    getUserPermissions: () => getUserPermissions(user),
    getUserRole: () => getUserRole(user),

    // Common permission checks for convenience
    canViewUsers: () => hasPermission(user, "admin.users.view"),
    canCreateUsers: () => hasPermission(user, "admin.users.create"),
    canEditUsers: () => hasPermission(user, "admin.users.edit"),
    canDeleteUsers: () => hasPermission(user, "admin.users.delete"),

    canViewOrganisations: () => hasPermission(user, "admin.organisations.view"),
    canCreateOrganisations: () =>
      hasPermission(user, "admin.organisations.create"),
    canEditOrganisations: () => hasPermission(user, "admin.organisations.edit"),
    canDeleteOrganisations: () =>
      hasPermission(user, "admin.organisations.delete"),

    canViewGlAccounts: () => hasPermission(user, "admin.accounts.view"),
    canCreateGlAccounts: () => hasPermission(user, "admin.accounts.create"),
    canEditGlAccounts: () => hasPermission(user, "admin.accounts.edit"),
    canDeleteGlAccounts: () => hasPermission(user, "admin.accounts.delete"),
    canGenerateGlAccounts: () => hasPermission(user, "admin.accounts.create"), // Use create permission for generate

    canViewGlTransactions: () => hasPermission(user, "admin.ledgers.view"),
    canCreateGlTransactions: () => hasPermission(user, "admin.ledgers.create"),
    canEditGlTransactions: () => hasPermission(user, "admin.ledgers.edit"),
    canDeleteGlTransactions: () => hasPermission(user, "admin.ledgers.delete"),

    canViewTransactions: () => hasPermission(user, "admin.transactions.view"),
    canCreateTransactions: () =>
      hasPermission(user, "admin.transactions.create"),
    canEditTransactions: () => hasPermission(user, "admin.transactions.edit"),
    canDeleteTransactions: () =>
      hasPermission(user, "admin.transactions.delete"),

    canViewCustomers: () => hasPermission(user, "admin.customers.view"),
    canCreateCustomers: () => hasPermission(user, "admin.customers.create"),
    canEditCustomers: () => hasPermission(user, "admin.customers.edit"),
    canDeleteCustomers: () => hasPermission(user, "admin.customers.delete"),

    canViewTills: () => hasPermission(user, "admin.tills.view"),
    canCreateTills: () => hasPermission(user, "admin.tills.create"),
    canEditTills: () => hasPermission(user, "admin.tills.edit"),
    canDeleteTills: () => hasPermission(user, "admin.tills.delete"),

    canViewVaults: () => hasPermission(user, "admin.vaults.view"),
    canCreateVaults: () => hasPermission(user, "admin.vaults.create"),
    canEditVaults: () => hasPermission(user, "admin.vaults.edit"),
    canDeleteVaults: () => hasPermission(user, "admin.vaults.delete"),

    canViewCharges: () => hasPermission(user, "admin.charges.view"),
    canCreateCharges: () => hasPermission(user, "admin.charges.create"),
    canEditCharges: () => hasPermission(user, "admin.charges.edit"),
    canDeleteCharges: () => hasPermission(user, "admin.charges.delete"),

    canViewExchangeRates: () => hasPermission(user, "admin.exchangerates.view"),
    canCreateExchangeRates: () =>
      hasPermission(user, "admin.exchangerates.create"),
    canEditExchangeRates: () => hasPermission(user, "admin.exchangerates.edit"),
    canDeleteExchangeRates: () =>
      hasPermission(user, "admin.exchangerates.delete"),

    canViewCorridors: () => hasPermission(user, "admin.corridors.view"),
    canCreateCorridors: () => hasPermission(user, "admin.corridors.create"),
    canEditCorridors: () => hasPermission(user, "admin.corridors.edit"),
    canDeleteCorridors: () => hasPermission(user, "admin.corridors.delete"),

    canViewIntegrations: () => hasPermission(user, "admin.integrations.view"),
    canCreateIntegrations: () =>
      hasPermission(user, "admin.integrations.create"),
    canEditIntegrations: () => hasPermission(user, "admin.integrations.edit"),
    canDeleteIntegrations: () =>
      hasPermission(user, "admin.integrations.delete"),

    // User context
    user,
  };
};

export default usePermissions;
