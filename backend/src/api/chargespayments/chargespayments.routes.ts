import { Router } from "express";
import { ChargesPaymentController } from "./chargespayments.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const chargesPaymentController = new ChargesPaymentController();

// Pending transaction charges
router.get(
  "/pending-charges",
  chargesPaymentController.getPendingTransactionCharges.bind(
    chargesPaymentController
  )
);

router.get(
  "/pending-charges-stats",
  chargesPaymentController.getPendingChargesStats.bind(chargesPaymentController)
);

router.get(
  "/charge-payments-stats",
  chargesPaymentController.getChargePaymentsStats.bind(chargesPaymentController)
);

// Charges payments
router.post(
  "/charges-payments",
  authMiddleware,
  chargesPaymentController.createChargesPayment.bind(chargesPaymentController)
);

router.get(
  "/charges-payments",
  chargesPaymentController.getChargesPayments.bind(chargesPaymentController)
);

router.get(
  "/charges-payments/:paymentId",
  chargesPaymentController.getChargesPaymentById.bind(chargesPaymentController)
);

router.post(
  "/charges-payments/:paymentId/approve",
  authMiddleware,
  chargesPaymentController.approveChargesPayment.bind(chargesPaymentController)
);

router.post(
  "/charges-payments/:paymentId/reverse",
  authMiddleware,
  chargesPaymentController.reverseChargesPayment.bind(chargesPaymentController)
);

export default router;
