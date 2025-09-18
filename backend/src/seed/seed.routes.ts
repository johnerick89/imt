import { Router } from "express";
import { SeedController } from "./seed.controller";

const router = Router();
const seedController = new SeedController();

// User management routes
router.post("/", seedController.createUser.bind(seedController));

export default router;
