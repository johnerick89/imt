import { Router } from "express";
import { IntegrationController } from "./integrations.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const integrationController = new IntegrationController();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Integration routes
router.post(
  "/",
  integrationController.createIntegration.bind(integrationController)
);
router.get(
  "/",
  integrationController.getIntegrations.bind(integrationController)
);
router.get(
  "/stats",
  integrationController.getIntegrationStats.bind(integrationController)
);
router.get(
  "/:id",
  integrationController.getIntegrationById.bind(integrationController)
);
router.put(
  "/:id",
  integrationController.updateIntegration.bind(integrationController)
);
router.delete(
  "/:id",
  integrationController.deleteIntegration.bind(integrationController)
);

export default router;
