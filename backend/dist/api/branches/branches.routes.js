"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const branches_controller_1 = require("./branches.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const branchController = new branches_controller_1.BranchController();
router.get("/", branchController.getBranches);
router.get("/stats", branchController.getBranchStats);
router.get("/:id", branchController.getBranchById);
router.post("/", auth_middleware_1.authMiddleware, branchController.createBranch);
router.put("/:id", auth_middleware_1.authMiddleware, branchController.updateBranch);
router.delete("/:id", auth_middleware_1.authMiddleware, branchController.deleteBranch);
exports.default = router;
//# sourceMappingURL=branches.routes.js.map