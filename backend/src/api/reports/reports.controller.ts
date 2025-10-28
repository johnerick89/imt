import { Request, Response } from "express";
import ReportsService from "./reports.services";
import { asyncHandler } from "../../middlewares/error.middleware";
import { AppError } from "../../utils/AppError";
import type CustomRequest from "../../types/CustomReq.type";
import {
  outboundTransactionsReportSchema,
  inboundTransactionsReportSchema,
  commissionsReportSchema,
  taxesReportSchema,
  userTillsReportSchema,
  balancesHistoryReportSchema,
  organisationBalancesHistoryReportSchema,
  glAccountsReportSchema,
  profitLossReportSchema,
  balanceSheetReportSchema,
  partnerBalancesReportSchema,
  complianceReportSchema,
  exchangeRatesReportSchema,
  auditTrailReportSchema,
  corridorPerformanceReportSchema,
  userPerformanceReportSchema,
  integrationStatusReportSchema,
  cashPositionReportSchema,
} from "./reports.validation";

export class ReportsController {
  // Outbound Transactions Report
  static getOutboundTransactionsReport = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const validatedFilters = outboundTransactionsReportSchema.parse(
        req.query
      );
      const result = await ReportsService.getOutboundTransactionsReport({
        filters: validatedFilters,
        user_organisation_id: req.user?.organisation_id || "",
      });

      console.log("getOutboundTransactionsReport result", result);

      res.status(200).json(result);
    }
  );

  // Inbound Transactions Report
  static getInboundTransactionsReport = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const validatedFilters = inboundTransactionsReportSchema.parse(req.query);
      const result = await ReportsService.getInboundTransactionsReport({
        filters: validatedFilters,
        user_organisation_id: req.user?.organisation_id || "",
      });
      console.log("getInboundTransactionsReport result", result);
      res.status(200).json(result);
    }
  );

  // Commissions & Other Revenues Report
  static getCommissionsReport = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const validatedFilters = commissionsReportSchema.parse(req.query);
      const result = await ReportsService.getCommissionsReport({
        filters: validatedFilters,
        user_organisation_id: req.user?.organisation_id || "",
      });
      res.status(200).json(result);
    }
  );

  // Taxes Report
  static getTaxesReport = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const validatedFilters = taxesReportSchema.parse(req.query);
      const result = await ReportsService.getTaxesReport({
        filters: validatedFilters,
        user_organisation_id: req.user?.organisation_id || "",
      });
      res.status(200).json(result);
    }
  );

  // User Tills Report
  static getUserTillsReport = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const validatedFilters = userTillsReportSchema.parse(req.query);
      const result = await ReportsService.getUserTillsReport({
        filters: validatedFilters,
        user_organisation_id: req.user?.organisation_id || "",
      });
      res.status(200).json(result);
    }
  );

  // Balances History Report
  static getBalancesHistoryReport = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      console.log(req.query);
      const validatedFilters = balancesHistoryReportSchema.parse(req.query);
      const result = await ReportsService.getBalancesHistoryReport({
        filters: validatedFilters,
        user_organisation_id: req.user?.organisation_id || "",
      });
      res.status(200).json(result);
    }
  );

  // Organisation Balances History Report
  static getOrganisationBalancesHistoryReport = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const validatedFilters = organisationBalancesHistoryReportSchema.parse(
        req.query
      );
      const result = await ReportsService.getOrganisationBalancesHistoryReport({
        filters: validatedFilters,
        user_organisation_id: req.user?.organisation_id || "",
      });
      res.status(200).json(result);
    }
  );

  // GL Accounts Report
  static getGlAccountsReport = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const validatedFilters = glAccountsReportSchema.parse(req.query);
      const result = await ReportsService.getGlAccountsReport({
        filters: validatedFilters,
        user_organisation_id: req.user?.organisation_id || "",
      });
      res.status(200).json(result);
    }
  );

  // Profit and Loss Report
  static getProfitLossReport = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const validatedFilters = profitLossReportSchema.parse(req.query);
      const result = await ReportsService.getProfitLossReport({
        filters: validatedFilters,
        user_organisation_id: req.user?.organisation_id || "",
      });
      res.status(200).json(result);
    }
  );

  // Balance Sheet Report
  static getBalanceSheetReport = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const validatedFilters = balanceSheetReportSchema.parse(req.query);
      const result = await ReportsService.getBalanceSheetReport({
        filters: validatedFilters,
        user_organisation_id: req.user?.organisation_id || "",
      });
      res.status(200).json(result);
    }
  );

  // Partner Balances Report
  static getPartnerBalancesReport = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const validatedFilters = partnerBalancesReportSchema.parse(req.query);
      const result = await ReportsService.getPartnerBalancesReport({
        filters: validatedFilters,
        user_organisation_id: req.user?.organisation_id || "",
      });
      res.status(200).json(result);
    }
  );

  // Customer and Beneficiary Compliance Report
  static getComplianceReport = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const validatedFilters = complianceReportSchema.parse(req.query);
      const result = await ReportsService.getComplianceReport({
        filters: validatedFilters,
        user_organisation_id: req.user?.organisation_id || "",
      });
      res.status(200).json(result);
    }
  );

  // Exchange Rates Report
  static getExchangeRatesReport = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const validatedFilters = exchangeRatesReportSchema.parse(req.query);
      const result = await ReportsService.getExchangeRatesReport({
        filters: validatedFilters,
        user_organisation_id: req.user?.organisation_id || "",
      });
      res.status(200).json(result);
    }
  );

  // Audit Trail Report
  static getAuditTrailReport = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const validatedFilters = auditTrailReportSchema.parse(req.query);
      const result = await ReportsService.getAuditTrailReport({
        filters: validatedFilters,
        user_organisation_id: req.user?.organisation_id || "",
      });
      res.status(200).json(result);
    }
  );

  // Corridor Performance Report
  static getCorridorPerformanceReport = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const validatedFilters = corridorPerformanceReportSchema.parse(req.query);
      const result = await ReportsService.getCorridorPerformanceReport({
        filters: validatedFilters,
        user_organisation_id: req.user?.organisation_id || "",
      });
      res.status(200).json(result);
    }
  );

  // User Performance Report
  static getUserPerformanceReport = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const validatedFilters = userPerformanceReportSchema.parse(req.query);
      const result = await ReportsService.getUserPerformanceReport({
        filters: validatedFilters,
        user_organisation_id: req.user?.organisation_id || "",
      });
      res.status(200).json(result);
    }
  );

  // Integration Status Report
  static getIntegrationStatusReport = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const validatedFilters = integrationStatusReportSchema.parse(req.query);
      const result = await ReportsService.getIntegrationStatusReport({
        filters: validatedFilters,
        user_organisation_id: req.user?.organisation_id || "",
      });
      res.status(200).json(result);
    }
  );

  // Cash Position Report
  static getCashPositionReport = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const validatedFilters = cashPositionReportSchema.parse(req.query);
      const result = await ReportsService.getCashPositionReport({
        filters: validatedFilters,
        user_organisation_id: req.user?.organisation_id || "",
      });
      res.status(200).json(result);
    }
  );
}
