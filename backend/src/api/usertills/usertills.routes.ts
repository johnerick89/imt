import { Router } from "express";
import { UserTillController } from "./usertills.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const userTillController = new UserTillController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// CRUD routes for user tills
router.post("/", userTillController.createUserTill);
router.get("/", userTillController.getUserTills);
router.get("/stats", userTillController.getUserTillStats);
router.get("/:id", userTillController.getUserTillById);
router.put("/:id", userTillController.updateUserTill);
router.delete("/:id", userTillController.deleteUserTill);

// Operations routes
router.post("/:id/close", userTillController.closeUserTill);
router.post("/:id/block", userTillController.blockUserTill);

export default router;
