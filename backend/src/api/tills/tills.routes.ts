import { Router } from "express";
import { TillController } from "./tills.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const tillController = new TillController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// CRUD routes
router.post("/", tillController.createTill);
router.get("/", tillController.getTills);
router.get("/stats", tillController.getTillStats);
router.get("/:id", tillController.getTillById);
router.put("/:id", tillController.updateTill);
router.delete("/:id", tillController.deleteTill);

// Till operations
router.post("/:id/open", tillController.openTill);
router.post("/:id/close", tillController.closeTill);
router.post("/:id/block", tillController.blockTill);
router.post("/:id/deactivate", tillController.deactivateTill);

export default router;
