import express from "express";
import { ChargesPaymentController } from "./chargespayments.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();
const chargesPaymentController = new ChargesPaymentController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Pending transaction charges
router.get(
  "/organisations/:orgId/pending-charges",
  chargesPaymentController.getPendingTransactionCharges.bind(
    chargesPaymentController
  )
);

router.get(
  "/organisations/:orgId/pending-charges-stats",
  chargesPaymentController.getPendingChargesStats.bind(chargesPaymentController)
);

router.get(
  "/organisations/:orgId/charge-payments-stats",
  chargesPaymentController.getChargePaymentsStats.bind(chargesPaymentController)
);

// Charges payments
router.post(
  "/organisations/:orgId/charges-payments",
  chargesPaymentController.createChargesPayment.bind(chargesPaymentController)
);

router.get(
  "/organisations/:orgId/charges-payments",
  chargesPaymentController.getChargesPayments.bind(chargesPaymentController)
);

router.get(
  "/charges-payments/:paymentId",
  chargesPaymentController.getChargesPaymentById.bind(chargesPaymentController)
);

router.post(
  "/charges-payments/:paymentId/approve",
  chargesPaymentController.approveChargesPayment.bind(chargesPaymentController)
);

router.post(
  "/charges-payments/:paymentId/reverse",
  chargesPaymentController.reverseChargesPayment.bind(chargesPaymentController)
);

export default router;
