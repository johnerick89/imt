import React from "react";
import { useSession } from "../hooks";
import { canAccessRoute, canPerformAction } from "../utils/acl";

interface PermissionGuardProps {
  permissions?: string[];
  permission?: string;
  roles?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * PermissionGuard Component
 * Conditionally renders children based on user permissions
 *
 * Usage:
 * <PermissionGuard permission="create_users">
 *   <CreateUserButton />
 * </PermissionGuard>
 *
 * <PermissionGuard permissions={["view_users", "update_users"]} requireAll={false}>
 *   <UserManagementSection />
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissions = [],
  permission,
  roles = [],
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { user } = useSession();

  // If no user, deny access
  if (!user) {
    return <>{fallback}</>;
  }

  // Check single permission
  if (permission) {
    const hasAccess = canPerformAction(user, permission);
    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const hasAccess = requireAll
      ? permissions.every((perm) => canPerformAction(user, perm))
      : permissions.some((perm) => canPerformAction(user, perm));

    if (hasAccess) {
      return <>{children}</>;
    }
  }

  // Check roles
  if (roles.length > 0) {
    const userRole = user.user_role?.name || user.role;
    const hasRole = userRole ? roles.includes(userRole) : false;

    if (hasRole) {
      return <>{children}</>;
    }
  }

  // If no permissions or roles specified, allow access
  if (permissions.length === 0 && roles.length === 0 && !permission) {
    return <>{children}</>;
  }

  // Default: deny access
  return <>{fallback}</>;
};

/**
 * Higher-order component for permission-based rendering
 */
export const withPermissionGuard = <T extends object>(
  Component: React.ComponentType<T>,
  guardProps: Omit<PermissionGuardProps, "children">
) => {
  return (props: T) => (
    <PermissionGuard {...guardProps}>
      <Component {...props} />
    </PermissionGuard>
  );
};

export default PermissionGuard;
