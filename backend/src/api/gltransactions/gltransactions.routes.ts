import { Router } from "express";
import { GlTransactionController } from "./gltransactions.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const glTransactionController = new GlTransactionController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GL Transaction routes (organisation-scoped)
router.get("/:id/gltransactions", (req, res) =>
  glTransactionController.getGlTransactions(req, res)
);
router.get("/:id/gltransactions/stats", (req, res) =>
  glTransactionController.getGlTransactionStats(req, res)
);
router.get("/:id/gltransactions/:transactionId", (req, res) =>
  glTransactionController.getGlTransactionById(req, res)
);
router.post("/:id/gltransactions/:transactionId/reverse", (req, res) =>
  glTransactionController.reverseGlTransaction(req, res)
);

export default router;
