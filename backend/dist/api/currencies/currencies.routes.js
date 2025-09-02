"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const currencies_controller_1 = require("./currencies.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const currencyController = new currencies_controller_1.CurrencyController();
router.use(auth_middleware_1.authMiddleware);
router.post("/", currencyController.createCurrency.bind(currencyController));
router.get("/", currencyController.getCurrencies.bind(currencyController));
router.get("/all", currencyController.getAllCurrencies.bind(currencyController));
router.get("/stats", currencyController.getCurrencyStats.bind(currencyController));
router.get("/:id", currencyController.getCurrencyById.bind(currencyController));
router.put("/:id", currencyController.updateCurrency.bind(currencyController));
router.delete("/:id", currencyController.deleteCurrency.bind(currencyController));
exports.default = router;
//# sourceMappingURL=currencies.routes.js.map