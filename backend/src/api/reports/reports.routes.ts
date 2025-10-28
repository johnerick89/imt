import { Router } from "express";
import { ReportsController } from "./reports.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Outbound Transactions Report
router.get(
  "/outbound-transactions",
  ReportsController.getOutboundTransactionsReport
);

// Inbound Transactions Report
router.get(
  "/inbound-transactions",
  ReportsController.getInboundTransactionsReport
);

// Commissions & Other Revenues Report
router.get("/commissions", ReportsController.getCommissionsReport);

// Taxes Report
router.get("/taxes", ReportsController.getTaxesReport);

// User Tills Report
router.get("/user-tills", ReportsController.getUserTillsReport);

// Balances History Report
router.get("/balances-history", ReportsController.getBalancesHistoryReport);

// Organisation Balances History Report
router.get(
  "/organisation-balances-history",
  ReportsController.getOrganisationBalancesHistoryReport
);

// GL Accounts Report
router.get("/gl-accounts", ReportsController.getGlAccountsReport);

// Profit and Loss Report
router.get("/profit-loss", ReportsController.getProfitLossReport);

// Balance Sheet Report
router.get("/balance-sheet", ReportsController.getBalanceSheetReport);

// Partner Balances Report
router.get("/partner-balances", ReportsController.getPartnerBalancesReport);

// Customer and Beneficiary Compliance Report
router.get("/compliance", ReportsController.getComplianceReport);

// Exchange Rates Report
router.get("/exchange-rates", ReportsController.getExchangeRatesReport);

// Audit Trail Report
router.get("/audit-trail", ReportsController.getAuditTrailReport);

// Corridor Performance Report
router.get(
  "/corridor-performance",
  ReportsController.getCorridorPerformanceReport
);

// User Performance Report
router.get("/user-performance", ReportsController.getUserPerformanceReport);

// Integration Status Report
router.get("/integration-status", ReportsController.getIntegrationStatusReport);

// Cash Position Report
router.get("/cash-position", ReportsController.getCashPositionReport);

export default router;
