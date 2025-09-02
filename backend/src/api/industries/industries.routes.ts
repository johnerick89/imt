import { Router } from "express";
import { IndustryController } from "./industries.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const industryController = new IndustryController();

// Industry routes
router.post(
  "/",
  authMiddleware,
  industryController.createIndustry.bind(industryController)
);
router.get("/", industryController.getIndustries.bind(industryController));
router.get(
  "/stats",
  industryController.getIndustryStats.bind(industryController)
);
router.get("/:id", industryController.getIndustryById.bind(industryController));
router.put(
  "/:id",
  authMiddleware,
  industryController.updateIndustry.bind(industryController)
);
router.delete(
  "/:id",
  authMiddleware,
  industryController.deleteIndustry.bind(industryController)
);

export default router;
