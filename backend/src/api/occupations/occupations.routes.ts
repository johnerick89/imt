import { Router } from "express";
import { OccupationController } from "./occupations.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const occupationController = new OccupationController();

// Occupation routes
router.post(
  "/",
  authMiddleware,
  occupationController.createOccupation.bind(occupationController)
);
router.get("/", occupationController.getOccupations.bind(occupationController));
router.get(
  "/stats",
  occupationController.getOccupationStats.bind(occupationController)
);
router.get(
  "/:id",
  occupationController.getOccupationById.bind(occupationController)
);
router.put(
  "/:id",
  authMiddleware,
  occupationController.updateOccupation.bind(occupationController)
);
router.delete(
  "/:id",
  authMiddleware,
  occupationController.deleteOccupation.bind(occupationController)
);

export default router;
