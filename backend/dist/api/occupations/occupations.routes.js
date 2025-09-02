"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const occupations_controller_1 = require("./occupations.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const occupationController = new occupations_controller_1.OccupationController();
router.post("/", auth_middleware_1.authMiddleware, occupationController.createOccupation.bind(occupationController));
router.get("/", occupationController.getOccupations.bind(occupationController));
router.get("/stats", occupationController.getOccupationStats.bind(occupationController));
router.get("/:id", occupationController.getOccupationById.bind(occupationController));
router.put("/:id", auth_middleware_1.authMiddleware, occupationController.updateOccupation.bind(occupationController));
router.delete("/:id", auth_middleware_1.authMiddleware, occupationController.deleteOccupation.bind(occupationController));
exports.default = router;
//# sourceMappingURL=occupations.routes.js.map