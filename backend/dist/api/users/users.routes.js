"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("./users.controller");
const router = (0, express_1.Router)();
const usersController = new users_controller_1.UsersController();
router.post("/", usersController.createUser.bind(usersController));
router.get("/", usersController.getUsers.bind(usersController));
router.get("/stats", usersController.getUserStats.bind(usersController));
router.get("/:id", usersController.getUserById.bind(usersController));
router.put("/:id", usersController.updateUser.bind(usersController));
router.patch("/:id/status", usersController.toggleUserStatus.bind(usersController));
router.delete("/:id", usersController.deleteUser.bind(usersController));
exports.default = router;
//# sourceMappingURL=users.routes.js.map