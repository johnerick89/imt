import { Router } from "express";
import { CurrencyController } from "./currencies.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const currencyController = new CurrencyController();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Currency routes
router.post("/", currencyController.createCurrency.bind(currencyController));
router.get("/", currencyController.getCurrencies.bind(currencyController));
router.get(
  "/all",
  currencyController.getAllCurrencies.bind(currencyController)
);
router.get(
  "/stats",
  currencyController.getCurrencyStats.bind(currencyController)
);
router.get("/:id", currencyController.getCurrencyById.bind(currencyController));
router.put("/:id", currencyController.updateCurrency.bind(currencyController));
router.delete(
  "/:id",
  currencyController.deleteCurrency.bind(currencyController)
);

export default router;
