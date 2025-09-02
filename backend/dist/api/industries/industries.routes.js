"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const industries_controller_1 = require("./industries.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const industryController = new industries_controller_1.IndustryController();
router.post("/", auth_middleware_1.authMiddleware, industryController.createIndustry.bind(industryController));
router.get("/", industryController.getIndustries.bind(industryController));
router.get("/stats", industryController.getIndustryStats.bind(industryController));
router.get("/:id", industryController.getIndustryById.bind(industryController));
router.put("/:id", auth_middleware_1.authMiddleware, industryController.updateIndustry.bind(industryController));
router.delete("/:id", auth_middleware_1.authMiddleware, industryController.deleteIndustry.bind(industryController));
exports.default = router;
//# sourceMappingURL=industries.routes.js.map