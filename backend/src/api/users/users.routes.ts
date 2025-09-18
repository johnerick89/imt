import { Router } from "express";
import { UsersController } from "./users.controller";

const router = Router();
const usersController = new UsersController();

// User management routes
router.post("/", usersController.createUser.bind(usersController));
router.get("/", usersController.getUsers.bind(usersController));
router.get("/stats", usersController.getUserStats.bind(usersController));
router.get("/:id", usersController.getUserById.bind(usersController));
router.put("/:id", usersController.updateUser.bind(usersController));
router.patch(
  "/:id/status",
  usersController.toggleUserStatus.bind(usersController)
);
router.delete("/:id", usersController.deleteUser.bind(usersController));
router.patch(
  "/:id/update-password",
  usersController.updatePassword.bind(usersController)
);
router.patch(
  "/:id/reset-password",
  usersController.resetPassword.bind(usersController)
);

export default router;
