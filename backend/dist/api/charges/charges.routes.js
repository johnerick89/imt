"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const charges_controller_1 = require("./charges.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const chargeController = new charges_controller_1.ChargeController();
router.post("/", auth_middleware_1.authMiddleware, chargeController.createCharge.bind(chargeController));
router.get("/", chargeController.getCharges.bind(chargeController));
router.get("/stats", chargeController.getChargeStats.bind(chargeController));
router.get("/:id", chargeController.getChargeById.bind(chargeController));
router.put("/:id", auth_middleware_1.authMiddleware, chargeController.updateCharge.bind(chargeController));
router.delete("/:id", auth_middleware_1.authMiddleware, chargeController.deleteCharge.bind(chargeController));
exports.default = router;
//# sourceMappingURL=charges.routes.js.map