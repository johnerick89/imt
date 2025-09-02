import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();
const authController = new AuthController();

// POST /api/v1/auth/login
router.post("/login", authController.login.bind(authController));

// POST /api/v1/auth/register
router.post("/register", authController.register.bind(authController));

// GET /api/v1/auth/profile (protected route)
router.get("/profile", authController.getProfile.bind(authController));

export default router;
