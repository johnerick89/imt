import express from "express";
import { TransactionController } from "./transactions.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();
const transactionController = new TransactionController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Outbound Transactions
router.post(
  "/organisations/:orgId/outbound",
  transactionController.createOutboundTransaction.bind(transactionController)
);

// Inbound Transactions
router.get(
  "/organisations/:orgId/inbound",
  transactionController.getInboundTransactions.bind(transactionController)
);

router.get(
  "/inbound/:transactionId",
  transactionController.getInboundTransactionById.bind(transactionController)
);

router.post(
  "/inbound/:transactionId/approve",
  transactionController.approveInboundTransaction.bind(transactionController)
);

router.post(
  "/inbound/:transactionId/reverse",
  transactionController.reverseInboundTransaction.bind(transactionController)
);

router.get(
  "/organisations/:orgId/inbound/stats",
  transactionController.getInboundTransactionStats.bind(transactionController)
);

// Transaction Management
router.put(
  "/transactions/:transactionId",
  transactionController.updateTransaction.bind(transactionController)
);

router.post(
  "/transactions/:transactionId/cancel",
  transactionController.cancelTransaction.bind(transactionController)
);

router.post(
  "/transactions/:transactionId/approve",
  transactionController.approveTransaction.bind(transactionController)
);

router.post(
  "/transactions/:transactionId/reverse",
  transactionController.reverseTransaction.bind(transactionController)
);

// Transaction Queries
router.get(
  "/organisations/:orgId/transactions",
  transactionController.getTransactions.bind(transactionController)
);

router.get(
  "/transactions/:transactionId",
  transactionController.getTransactionById.bind(transactionController)
);

router.get(
  "/organisations/:orgId/transactions/stats",
  transactionController.getTransactionStats.bind(transactionController)
);

export default router;
