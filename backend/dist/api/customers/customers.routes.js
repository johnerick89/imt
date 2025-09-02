"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customers_controller_1 = require("./customers.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const customerController = new customers_controller_1.CustomerController();
router.post("/", auth_middleware_1.authMiddleware, customerController.createCustomer.bind(customerController));
router.get("/", customerController.getCustomers.bind(customerController));
router.get("/stats", customerController.getCustomerStats.bind(customerController));
router.get("/:id", customerController.getCustomerById.bind(customerController));
router.put("/:id", auth_middleware_1.authMiddleware, customerController.updateCustomer.bind(customerController));
router.delete("/:id", auth_middleware_1.authMiddleware, customerController.deleteCustomer.bind(customerController));
exports.default = router;
//# sourceMappingURL=customers.routes.js.map