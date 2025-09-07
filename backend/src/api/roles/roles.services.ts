import { Permission, PrismaClient, Role, RolePermission } from "@prisma/client";
import type {
  IRole,
  IPermission,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleFilters,
  RoleListResponse,
  RoleResponse,
  PermissionListResponse,
  RoleStats,
  CreateRolePermissionRequest,
  RolePermissionResponse,
} from "./roles.interfaces";

const prisma = new PrismaClient();

export class RoleService {
  async createRole(
    data: CreateRoleRequest,
    userId: string
  ): Promise<RoleResponse> {
    try {
      const { permission_ids, ...roleData } = data;

      const role = await prisma.role.create({
        data: {
          ...roleData,
          created_by: userId,
          role_permissions: permission_ids
            ? {
                create: permission_ids.map((permissionId) => ({
                  permission_id: permissionId,
                  created_by: userId,
                })),
              }
            : undefined,
        },
        include: {
          created_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          role_permissions: {
            include: {
              permission: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      });

      const roleWithPermissions = {
        ...role,
        permissions: role.role_permissions.map((rp) => rp.permission),
      };

      return {
        success: true,
        message: "Role created successfully",
        data: roleWithPermissions as unknown as IRole,
      };
    } catch (error) {
      console.error("Error creating role:", error);
      throw new Error("Failed to create role");
    }
  }

  async getRoles(filters: RoleFilters): Promise<RoleListResponse> {
    try {
      const { page = 1, limit = 10, search, ...otherFilters } = filters;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      // Add other filters
      Object.keys(otherFilters).forEach((key) => {
        if (otherFilters[key as keyof typeof otherFilters] !== undefined) {
          where[key] = otherFilters[key as keyof typeof otherFilters];
        }
      });

      const [roles, total] = await Promise.all([
        prisma.role.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            created_by_user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
            role_permissions: {
              include: {
                permission: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                  },
                },
              },
            },
            users: {
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        }),
        prisma.role.count({ where }),
      ]);

      const rolesWithPermissions = roles.map((role) => ({
        ...role,
        permissions: role.role_permissions.map((rp) => rp.permission),
      }));

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Roles retrieved successfully",
        data: {
          roles: rolesWithPermissions as unknown as IRole[],
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw new Error("Failed to fetch roles");
    }
  }

  async getRoleById(id: string): Promise<RoleResponse> {
    try {
      const role = await prisma.role.findUnique({
        where: { id },
        include: {
          created_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          role_permissions: {
            include: {
              permission: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
          users: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      if (!role) {
        throw new Error("Role not found");
      }

      const roleWithPermissions = {
        ...role,
        permissions: role.role_permissions.map((rp) => rp.permission),
      };

      return {
        success: true,
        message: "Role retrieved successfully",
        data: roleWithPermissions as unknown as IRole,
      };
    } catch (error) {
      console.error("Error fetching role:", error);
      throw new Error("Failed to fetch role");
    }
  }

  async updateRole(
    id: string,
    data: UpdateRoleRequest,
    userId: string
  ): Promise<RoleResponse> {
    try {
      const { permission_ids, ...roleData } = data;

      // Filter out undefined values
      const updateData: any = {};
      Object.keys(roleData).forEach((key) => {
        const value = roleData[key as keyof typeof roleData];
        if (value !== undefined) {
          updateData[key] = value;
        }
      });

      // Handle permission updates
      if (permission_ids !== undefined) {
        // Delete existing role permissions
        await prisma.rolePermission.deleteMany({
          where: { role_id: id },
        });

        // Create new role permissions
        if (permission_ids.length > 0) {
          await prisma.rolePermission.createMany({
            data: permission_ids.map((permissionId) => ({
              role_id: id,
              permission_id: permissionId,
              created_by: userId,
            })),
          });
        }
      }

      const role = await prisma.role.update({
        where: { id },
        data: updateData,
        include: {
          created_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          role_permissions: {
            include: {
              permission: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
          users: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      const roleWithPermissions = {
        ...role,
        permissions: role.role_permissions.map((rp) => rp.permission),
      };

      return {
        success: true,
        message: "Role updated successfully",
        data: roleWithPermissions as unknown as IRole,
      };
    } catch (error) {
      console.error("Error updating role:", error);
      throw new Error("Failed to update role");
    }
  }

  async deleteRole(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Delete role permissions first (cascade should handle this, but being explicit)
      await prisma.rolePermission.deleteMany({
        where: { role_id: id },
      });

      await prisma.role.delete({
        where: { id },
      });

      return {
        success: true,
        message: "Role deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting role:", error);
      throw new Error("Failed to delete role");
    }
  }

  async getPermissions(filters: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PermissionListResponse> {
    try {
      const { page = 1, limit = 10, search } = filters;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [permissions, total] = await Promise.all([
        prisma.permission.findMany({
          where,
          skip,
          take: limit,
          orderBy: { name: "asc" },
        }),
        prisma.permission.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Permissions retrieved successfully",
        data: {
          permissions: permissions as IPermission[],
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching permissions:", error);
      throw new Error("Failed to fetch permissions");
    }
  }

  async getRoleStats(): Promise<{
    success: boolean;
    message: string;
    data: RoleStats;
  }> {
    try {
      const [totalRoles, totalPermissions, rolesWithPermissions] =
        await Promise.all([
          prisma.role.count(),
          prisma.permission.count(),
          prisma.role.count({
            where: {
              role_permissions: {
                some: {},
              },
            },
          }),
        ]);

      const rolesWithoutPermissions = totalRoles - rolesWithPermissions;

      // Get most used permissions
      const permissionUsage = await prisma.rolePermission.groupBy({
        by: ["permission_id"],
        _count: {
          role_id: true,
        },
        orderBy: {
          _count: {
            role_id: "desc",
          },
        },
        take: 10,
      });

      const mostUsedPermissions = permissionUsage.reduce((acc, usage) => {
        acc[usage.permission_id] = usage._count.role_id;
        return acc;
      }, {} as { [key: string]: number });

      return {
        success: true,
        message: "Role stats retrieved successfully",
        data: {
          totalRoles,
          rolesWithPermissions,
          rolesWithoutPermissions,
          totalPermissions,
          mostUsedPermissions,
        },
      };
    } catch (error) {
      console.error("Error fetching role stats:", error);
      throw new Error("Failed to fetch role stats");
    }
  }

  async createRolePermission(
    data: CreateRolePermissionRequest,
    roleId: string
  ): Promise<RolePermissionResponse> {
    try {
      const { role_id, permission_id } = data;

      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });

      const permission = await prisma.permission.findUnique({
        where: { id: permission_id },
      });

      const existingRolePermission = await prisma.rolePermission.findUnique({
        where: { role_id_permission_id: { role_id: roleId, permission_id } },
      });

      if (existingRolePermission) {
        return {
          success: true,
          message: "Role permission already exists",
          data: existingRolePermission as unknown as RolePermission & {
            role: Role;
            permission: Permission;
          },
        };
      }

      if (!role || !permission) {
        throw new Error("Role or permission not found");
      }

      const rolePermission = await prisma.rolePermission.create({
        data: {
          role_id: roleId,
          permission_id,
        },
      });

      return {
        success: true,
        message: "Role permission created successfully",
        data: rolePermission as unknown as RolePermission & {
          role: Role;
          permission: Permission;
        },
      };
    } catch (error) {
      console.error("Error creating role permission:", error);
      throw new Error("Failed to create role permission");
    }
  }

  async deleteRolePermission(
    roleId: string,
    permissionId: string
  ): Promise<string> {
    console.log(roleId, permissionId);
    try {
      await prisma.rolePermission.delete({
        where: {
          role_id_permission_id: {
            role_id: roleId,
            permission_id: permissionId,
          },
        },
      });

      return "Role permission deleted successfully";
    } catch (error: any) {
      console.error("Error deleting role permission:", error);
      throw new Error("Failed to delete role permission");
    }
  }
}
