import { Router } from "express";
import { ChargeController } from "./charges.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const chargeController = new ChargeController();

// Charge routes
router.post(
  "/",
  authMiddleware,
  chargeController.createCharge.bind(chargeController)
);
router.get("/", chargeController.getCharges.bind(chargeController));
router.get(
  "/stats",
  chargeController.getChargeStats.bind(chargeController)
);
router.get("/:id", chargeController.getChargeById.bind(chargeController));
router.put(
  "/:id",
  authMiddleware,
  chargeController.updateCharge.bind(chargeController)
);
router.delete(
  "/:id",
  authMiddleware,
  chargeController.deleteCharge.bind(chargeController)
);

export default router;
