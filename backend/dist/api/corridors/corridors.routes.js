"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const corridors_controller_1 = require("./corridors.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const corridorController = new corridors_controller_1.CorridorController();
router.post("/", auth_middleware_1.authMiddleware, corridorController.createCorridor.bind(corridorController));
router.get("/", corridorController.getCorridors.bind(corridorController));
router.get("/stats", corridorController.getCorridorStats.bind(corridorController));
router.get("/:id", corridorController.getCorridorById.bind(corridorController));
router.put("/:id", auth_middleware_1.authMiddleware, corridorController.updateCorridor.bind(corridorController));
router.delete("/:id", auth_middleware_1.authMiddleware, corridorController.deleteCorridor.bind(corridorController));
exports.default = router;
//# sourceMappingURL=corridors.routes.js.map