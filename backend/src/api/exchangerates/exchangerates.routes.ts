import { Router } from "express";
import { ExchangeRateController } from "./exchangerates.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const exchangeRateController = new ExchangeRateController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// CRUD routes
router.post(
  "/",
  exchangeRateController.createExchangeRate.bind(exchangeRateController)
);
router.get(
  "/",
  exchangeRateController.getExchangeRates.bind(exchangeRateController)
);
router.get(
  "/stats",
  exchangeRateController.getExchangeRateStats.bind(exchangeRateController)
);
router.get(
  "/:id",
  exchangeRateController.getExchangeRateById.bind(exchangeRateController)
);
router.put(
  "/:id",
  exchangeRateController.updateExchangeRate.bind(exchangeRateController)
);
router.delete(
  "/:id",
  exchangeRateController.deleteExchangeRate.bind(exchangeRateController)
);

// Approve route
router.post(
  "/:id/approve",
  exchangeRateController.approveExchangeRate.bind(exchangeRateController)
);

export default router;
