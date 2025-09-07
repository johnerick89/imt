import { Response } from "express";
import { RoleService } from "./roles.services";
import {
  createRoleSchema,
  updateRoleSchema,
  roleFiltersSchema,
  permissionFiltersSchema,
  createRolePermissionSchema,
} from "./roles.validation";
import type CustomRequest from "../../types/CustomReq.type";

const roleService = new RoleService();

export class RoleController {
  async createRole(req: CustomRequest, res: Response): Promise<void> {
    try {
      const validation = createRoleSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.issues,
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const result = await roleService.createRole(validation.data, userId);
      res.status(201).json(result);
    } catch (error: any) {
      console.error("Error in createRole:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getRoles(req: CustomRequest, res: Response): Promise<void> {
    try {
      const validation = roleFiltersSchema.safeParse(req.query);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.issues,
        });
        return;
      }

      const result = await roleService.getRoles(validation.data);
      res.json(result);
    } catch (error: any) {
      console.error("Error in getRoles:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getRoleById(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log(id);

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Role ID is required",
        });
        return;
      }

      const result = await roleService.getRoleById(id);
      res.json(result);
    } catch (error: any) {
      console.error("Error in getRoleById:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async updateRole(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validation = updateRoleSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.issues,
        });
        return;
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Role ID is required",
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const result = await roleService.updateRole(id, validation.data, userId);
      res.json(result);
    } catch (error: any) {
      console.error("Error in updateRole:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async deleteRole(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Role ID is required",
        });
        return;
      }

      const result = await roleService.deleteRole(id);
      res.json(result);
    } catch (error: any) {
      console.error("Error in deleteRole:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getPermissions(req: CustomRequest, res: Response): Promise<void> {
    try {
      const validation = permissionFiltersSchema.safeParse(req.query);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.issues,
        });
        return;
      }

      const result = await roleService.getPermissions(validation.data);
      res.json(result);
    } catch (error: any) {
      console.error("Error in getPermissions:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getRoleStats(req: CustomRequest, res: Response): Promise<void> {
    try {
      const result = await roleService.getRoleStats();
      res.json(result);
    } catch (error: any) {
      console.error("Error in getRoleStats:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async createRolePermission(req: CustomRequest, res: Response): Promise<void> {
    try {
      const validation = createRolePermissionSchema.safeParse(req.body);
      const roleId = req.params.id;

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.issues,
        });
        return;
      }
      const result = await roleService.createRolePermission(
        validation.data,
        roleId
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error in createRolePermission:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async deleteRolePermission(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { roleId, permissionId } = req.params;

      if (!roleId || !permissionId) {
        res.status(400).json({
          success: false,
          message: "Role permission ID is required",
        });
        return;
      }

      const result = await roleService.deleteRolePermission(
        roleId,
        permissionId
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error in deleteRolePermission:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}
