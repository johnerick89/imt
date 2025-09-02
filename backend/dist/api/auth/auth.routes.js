"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
router.post("/login", authController.login.bind(authController));
router.post("/register", authController.register.bind(authController));
router.get("/profile", authController.getProfile.bind(authController));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map