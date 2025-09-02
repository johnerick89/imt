import { Router } from "express";
import { BeneficiaryController } from "./beneficiaries.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const beneficiaryController = new BeneficiaryController();

// Beneficiary routes
router.post(
  "/",
  authMiddleware,
  beneficiaryController.createBeneficiary.bind(beneficiaryController)
);
router.get(
  "/",
  beneficiaryController.getBeneficiaries.bind(beneficiaryController)
);
router.get(
  "/stats",
  beneficiaryController.getBeneficiaryStats.bind(beneficiaryController)
);
router.get(
  "/:id",
  beneficiaryController.getBeneficiaryById.bind(beneficiaryController)
);
router.put(
  "/:id",
  authMiddleware,
  beneficiaryController.updateBeneficiary.bind(beneficiaryController)
);
router.delete(
  "/:id",
  authMiddleware,
  beneficiaryController.deleteBeneficiary.bind(beneficiaryController)
);

export default router;
