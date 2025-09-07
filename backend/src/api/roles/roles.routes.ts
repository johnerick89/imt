import { Router } from "express";
import { RoleController } from "./roles.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const roleController = new RoleController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// CRUD routes for roles
router.post("/", roleController.createRole);
router.get("/", roleController.getRoles);
router.get("/stats", roleController.getRoleStats);
router.get("/:id", roleController.getRoleById);
router.put("/:id", roleController.updateRole);
router.delete("/:id", roleController.deleteRole);

// Permissions routes
router.get("/permissions/list", roleController.getPermissions);

// Role permissions routes
router.post("/:id/permissions", roleController.createRolePermission);
router.delete(
  "/permissions/:roleId/:permissionId",
  roleController.deleteRolePermission
);

export default router;
