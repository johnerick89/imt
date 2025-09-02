import { Router } from "express";
import { BranchController } from "./branches.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const branchController = new BranchController();

// Public routes
router.get("/", branchController.getBranches);
router.get("/stats", branchController.getBranchStats);
router.get("/:id", branchController.getBranchById);

// Protected routes (require authentication)
router.post("/", authMiddleware, branchController.createBranch);
router.put("/:id", authMiddleware, branchController.updateBranch);
router.delete("/:id", authMiddleware, branchController.deleteBranch);

export default router;
