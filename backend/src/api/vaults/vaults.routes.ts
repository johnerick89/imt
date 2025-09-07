import { Router } from "express";
import { VaultController } from "./vaults.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const vaultController = new VaultController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// CRUD routes
router.post("/", vaultController.createVault);
router.get("/", vaultController.getVaults);
router.get("/stats", vaultController.getVaultStats);
router.get("/:id", vaultController.getVaultById);
router.put("/:id", vaultController.updateVault);
router.delete("/:id", vaultController.deleteVault);

export default router;
