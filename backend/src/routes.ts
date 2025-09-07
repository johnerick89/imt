import { Router } from "express";
import authRoutes from "./api/auth";
import usersRoutes from "./api/users";
import organisationsRoutes from "./api/organisations";
import auditRoutes from "./api/audit";
import currencyRoutes from "./api/currencies";
import countryRoutes from "./api/countries";
import integrationRoutes from "./api/integrations";
import corridorRoutes from "./api/corridors";
import chargeRoutes from "./api/charges";
import occupationRoutes from "./api/occupations";
import industryRoutes from "./api/industries";
import customerRoutes from "./api/customers";
import beneficiaryRoutes from "./api/beneficiaries";
import branchRoutes from "./api/branches";
import exchangeRateRoutes from "./api/exchangerates";
import tillRoutes from "./api/tills";
import vaultRoutes from "./api/vaults";
import glAccountRoutes from "./api/glaccounts";
import roleRoutes from "./api/roles";
import userTillRoutes from "./api/usertills";
import bankAccountRoutes from "./api/bankaccounts";
import balanceOperationRoutes from "./api/balanceoperations";
import glTransactionRoutes from "./api/gltransactions";
import transactionRoutes from "./api/transactions";
import transactionChannelRoutes from "./api/transactionchannels";

const router = Router();

// API v1 routes
router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/users", usersRoutes);
router.use("/api/v1/organisations", organisationsRoutes);
router.use("/api/v1/audit", auditRoutes);
router.use("/api/v1/currencies", currencyRoutes);
router.use("/api/v1/countries", countryRoutes);
router.use("/api/v1/integrations", integrationRoutes);
router.use("/api/v1/corridors", corridorRoutes);
router.use("/api/v1/charges", chargeRoutes);
router.use("/api/v1/occupations", occupationRoutes);
router.use("/api/v1/industries", industryRoutes);
router.use("/api/v1/customers", customerRoutes);
router.use("/api/v1/beneficiaries", beneficiaryRoutes);
router.use("/api/v1/branches", branchRoutes);
router.use("/api/v1/exchangerates", exchangeRateRoutes);
router.use("/api/v1/tills", tillRoutes);
router.use("/api/v1/vaults", vaultRoutes);
router.use("/api/v1/glaccounts", glAccountRoutes);
router.use("/api/v1/roles", roleRoutes);
router.use("/api/v1/usertills", userTillRoutes);
router.use("/api/v1/bankaccounts", bankAccountRoutes);
router.use("/api/v1/balance", balanceOperationRoutes);
router.use("/api/v1/organisations", glTransactionRoutes);
router.use("/api/v1/transactions", transactionRoutes);
router.use("/api/v1/transactionchannels", transactionChannelRoutes);

// Default API route
router.get("/api", (req, res) => {
  res.json({
    message: "IMT Money Transfer API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/api/v1/auth",
      users: "/api/v1/users",
      organisations: "/api/v1/organisations",
      audit: "/api/v1/audit",
      currencies: "/api/v1/currencies",
      countries: "/api/v1/countries",
      integrations: "/api/v1/integrations",
      corridors: "/api/v1/corridors",
      charges: "/api/v1/charges",
      occupations: "/api/v1/occupations",
      industries: "/api/v1/industries",
      customers: "/api/v1/customers",
      beneficiaries: "/api/v1/beneficiaries",
      branches: "/api/v1/branches",
      exchangerates: "/api/v1/exchangerates",
      tills: "/api/v1/tills",
      vaults: "/api/v1/vaults",
      glaccounts: "/api/v1/glaccounts",
      roles: "/api/v1/roles",
      bankaccounts: "/api/v1/bankaccounts",
      balance: "/api/v1/balance",
      gltransactions: "/api/v1/organisations/:id/gltransactions",
      transactions: "/api/v1/transactions",
      transactionchannels: "/api/v1/transactionchannels",
    },
  });
});

export default router;
