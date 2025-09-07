import express from "express";
import { BankAccountController } from "./bankaccounts.controller";

const router = express.Router();
const bankAccountController = new BankAccountController();

// Bank Account CRUD routes
router.post(
  "/",
  bankAccountController.createBankAccount.bind(bankAccountController)
);

router.get(
  "/",
  bankAccountController.getBankAccounts.bind(bankAccountController)
);

router.get(
  "/stats",
  bankAccountController.getBankAccountStats.bind(bankAccountController)
);

router.get(
  "/:id",
  bankAccountController.getBankAccountById.bind(bankAccountController)
);

router.put(
  "/:id",
  bankAccountController.updateBankAccount.bind(bankAccountController)
);

router.delete(
  "/:id",
  bankAccountController.deleteBankAccount.bind(bankAccountController)
);

// Balance operation routes
router.post(
  "/:id/topup",
  bankAccountController.topupBankAccount.bind(bankAccountController)
);

router.post(
  "/:id/withdraw",
  bankAccountController.withdrawFromBankAccount.bind(bankAccountController)
);

export default router;
