import { Router } from "express";
import { CorridorController } from "./corridors.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const corridorController = new CorridorController();

// Corridor routes
router.post(
  "/",
  authMiddleware,
  corridorController.createCorridor.bind(corridorController)
);
router.get("/", corridorController.getCorridors.bind(corridorController));
router.get(
  "/stats",
  corridorController.getCorridorStats.bind(corridorController)
);
router.get(
  "/for-transaction",
  corridorController.getCorridorsForTransaction.bind(corridorController)
);
router.get("/:id", corridorController.getCorridorById.bind(corridorController));
router.put(
  "/:id",
  authMiddleware,
  corridorController.updateCorridor.bind(corridorController)
);
router.delete(
  "/:id",
  authMiddleware,
  corridorController.deleteCorridor.bind(corridorController)
);

export default router;
