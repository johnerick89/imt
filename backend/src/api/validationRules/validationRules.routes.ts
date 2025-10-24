import { Router } from "express";
import { validationRuleController } from "./validationRules.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { aclMiddleware } from "../../middlewares/acl.middleware";

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all validation rules
router.get(
  "/",
  validationRuleController.getValidationRules.bind(validationRuleController)
);

// Get validation rule by ID
router.get(
  "/:id",
  validationRuleController.getValidationRuleById.bind(validationRuleController)
);

// Get validation rule by entity
router.get(
  "/entity/:entity",
  validationRuleController.getValidationRuleByEntity.bind(
    validationRuleController
  )
);

// Update validation rule
router.put(
  "/:id",
  aclMiddleware({
    errorMessage: "You do not have permission to edit validation rules",
    resource: "admin.validationRules.edit",
  }),
  validationRuleController.updateValidationRule.bind(validationRuleController)
);

// Get validation rule stats
router.get(
  "/stats/overview",
  validationRuleController.getValidationRuleStats.bind(validationRuleController)
);

export default router;
