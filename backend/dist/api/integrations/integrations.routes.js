"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const integrations_controller_1 = require("./integrations.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const integrationController = new integrations_controller_1.IntegrationController();
router.use(auth_middleware_1.authMiddleware);
router.post("/", integrationController.createIntegration.bind(integrationController));
router.get("/", integrationController.getIntegrations.bind(integrationController));
router.get("/stats", integrationController.getIntegrationStats.bind(integrationController));
router.get("/:id", integrationController.getIntegrationById.bind(integrationController));
router.put("/:id", integrationController.updateIntegration.bind(integrationController));
router.delete("/:id", integrationController.deleteIntegration.bind(integrationController));
exports.default = router;
//# sourceMappingURL=integrations.routes.js.map