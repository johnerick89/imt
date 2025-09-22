import { Router } from "express";
import { ParameterController } from "./parameters.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { aclMiddleware } from "../../middlewares/acl.middleware";
import { auditMiddleware } from "../../middlewares/audit.middleware";

const router = Router();
const parameterController = new ParameterController();

// Apply authentication and audit middleware to all routes
router.use(authMiddleware);
router.use(auditMiddleware);

// Get parameters with optional search and pagination
router.get(
  "/",
  aclMiddleware({
    errorMessage: "You do not have permission to view parameters",
    resource: "admin.parameters.view",
  }),
  parameterController.getParameters.bind(parameterController)
);

// Get parameter by ID
router.get(
  "/:id",
  aclMiddleware({
    errorMessage: "You do not have permission to view parameters",
    resource: "admin.parameters.view",
  }),
  parameterController.getParameterById.bind(parameterController)
);

// Create new parameter
router.post(
  "/",
  aclMiddleware({
    errorMessage: "You do not have permission to create parameters",
    resource: "admin.parameters.create",
  }),
  parameterController.createParameter.bind(parameterController)
);

// Update parameter
router.put(
  "/:id",
  aclMiddleware({
    errorMessage: "You do not have permission to edit parameters",
    resource: "admin.parameters.edit",
  }),
  parameterController.updateParameter.bind(parameterController)
);

// Delete parameter
router.delete(
  "/:id",
  aclMiddleware({
    errorMessage: "You do not have permission to delete parameters",
    resource: "admin.parameters.delete",
  }),
  parameterController.deleteParameter.bind(parameterController)
);

// Get parameter statistics
router.get(
  "/stats/overview",
  aclMiddleware({
    errorMessage: "You do not have permission to view parameters",
    resource: "admin.parameters.view",
  }),
  parameterController.getParameterStats.bind(parameterController)
);

export default router;
