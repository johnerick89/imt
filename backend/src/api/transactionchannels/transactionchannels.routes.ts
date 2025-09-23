import { Router } from "express";
import { transactionChannelController } from "./transactionchannels.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { aclMiddleware } from "../../middlewares/acl.middleware";
import { auditMiddleware } from "../../middlewares/audit.middleware";

const router = Router();

// Apply authentication and audit middleware to all routes
router.use(authMiddleware);
router.use(auditMiddleware);

// Get transaction channels with optional search and pagination
router.get(
  "/",
  aclMiddleware({
    errorMessage: "You do not have permission to view transaction channels",
    resource: "admin.transactionChannels.view",
  }),
  transactionChannelController.getTransactionChannels.bind(
    transactionChannelController
  )
);

// Get transaction channel by ID
router.get(
  "/:id",
  aclMiddleware({
    errorMessage: "You do not have permission to view transaction channels",
    resource: "admin.transactionChannels.view",
  }),
  transactionChannelController.getTransactionChannelById.bind(
    transactionChannelController
  )
);

// Create new transaction channel
router.post(
  "/",
  aclMiddleware({
    errorMessage: "You do not have permission to create transaction channels",
    resource: "admin.transactionChannels.create",
  }),
  transactionChannelController.createTransactionChannel.bind(
    transactionChannelController
  )
);

// Update transaction channel
router.put(
  "/:id",
  aclMiddleware({
    errorMessage: "You do not have permission to edit transaction channels",
    resource: "admin.transactionChannels.edit",
  }),
  transactionChannelController.updateTransactionChannel.bind(
    transactionChannelController
  )
);

// Delete transaction channel
router.delete(
  "/:id",
  aclMiddleware({
    errorMessage: "You do not have permission to delete transaction channels",
    resource: "admin.transactionChannels.delete",
  }),
  transactionChannelController.deleteTransactionChannel.bind(
    transactionChannelController
  )
);

// Get transaction channel statistics
router.get(
  "/stats/overview",
  aclMiddleware({
    errorMessage: "You do not have permission to view transaction channels",
    resource: "admin.transactionChannels.view",
  }),
  transactionChannelController.getTransactionChannelStats.bind(
    transactionChannelController
  )
);

export default router;
