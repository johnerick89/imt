import { Router } from "express";
import { GlAccountController } from "./glaccounts.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const glAccountController = new GlAccountController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GL Account CRUD routes
router.post("/", (req, res) => glAccountController.createGlAccount(req, res));
router.get("/", (req, res) => glAccountController.getGlAccounts(req, res));
router.get("/stats", (req, res) =>
  glAccountController.getGlAccountStats(req, res)
);
router.get("/:id", (req, res) =>
  glAccountController.getGlAccountById(req, res)
);
router.put("/:id", (req, res) => glAccountController.updateGlAccount(req, res));
router.delete("/:id", (req, res) =>
  glAccountController.deleteGlAccount(req, res)
);

// Generate GL Accounts
router.post("/generate", (req, res) =>
  glAccountController.generateGlAccounts(req, res)
);

export default router;
