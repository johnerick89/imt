"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const beneficiaries_controller_1 = require("./beneficiaries.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const beneficiaryController = new beneficiaries_controller_1.BeneficiaryController();
router.post("/", auth_middleware_1.authMiddleware, beneficiaryController.createBeneficiary.bind(beneficiaryController));
router.get("/", beneficiaryController.getBeneficiaries.bind(beneficiaryController));
router.get("/stats", beneficiaryController.getBeneficiaryStats.bind(beneficiaryController));
router.get("/:id", beneficiaryController.getBeneficiaryById.bind(beneficiaryController));
router.put("/:id", auth_middleware_1.authMiddleware, beneficiaryController.updateBeneficiary.bind(beneficiaryController));
router.delete("/:id", auth_middleware_1.authMiddleware, beneficiaryController.deleteBeneficiary.bind(beneficiaryController));
exports.default = router;
//# sourceMappingURL=beneficiaries.routes.js.map