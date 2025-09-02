import { Router } from "express";
import { CustomerController } from "./customers.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const customerController = new CustomerController();

// Customer routes
router.post(
  "/",
  authMiddleware,
  customerController.createCustomer.bind(customerController)
);
router.get("/", customerController.getCustomers.bind(customerController));
router.get(
  "/stats",
  customerController.getCustomerStats.bind(customerController)
);
router.get("/:id", customerController.getCustomerById.bind(customerController));
router.put(
  "/:id",
  authMiddleware,
  customerController.updateCustomer.bind(customerController)
);
router.delete(
  "/:id",
  authMiddleware,
  customerController.deleteCustomer.bind(customerController)
);

export default router;
