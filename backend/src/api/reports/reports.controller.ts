import { Request, Response } from "express";
import ReportsService from "./reports.services";
import { asyncHandler } from "../../middlewares/error.middleware";
import { AppError } from "../../utils/AppError";

export class ReportsController {
  // Outbound Transactions Report
  static getOutboundTransactionsReport = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await ReportsService.getOutboundTransactionsReport(
        req.query
      );
      res.json(result);
    }
  );

  // Inbound Transactions Report
  static getInboundTransactionsReport = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await ReportsService.getInboundTransactionsReport(
        req.query
      );
      res.json(result);
    }
  );

  // Commissions & Other Revenues Report
  static getCommissionsReport = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await ReportsService.getCommissionsReport(req.query);
      res.json(result);
    }
  );

  // Taxes Report
  static getTaxesReport = asyncHandler(async (req: Request, res: Response) => {
    const result = await ReportsService.getTaxesReport(req.query);
    res.json(result);
  });

  // User Tills Report
  static getUserTillsReport = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await ReportsService.getUserTillsReport(req.query);
      res.json(result);
    }
  );

  // Balances History Report
  static getBalancesHistoryReport = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await ReportsService.getBalancesHistoryReport(req.query);
      res.json(result);
    }
  );

  // GL Accounts Report
  static getGlAccountsReport = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await ReportsService.getGlAccountsReport(req.query);
      res.json(result);
    }
  );

  // Profit and Loss Report
  static getProfitLossReport = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await ReportsService.getProfitLossReport(req.query);
      res.json(result);
    }
  );

  // Balance Sheet Report
  static getBalanceSheetReport = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await ReportsService.getBalanceSheetReport(req.query);
      res.json(result);
    }
  );

  // Partner Balances Report
  static getPartnerBalancesReport = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await ReportsService.getPartnerBalancesReport(req.query);
      res.json(result);
    }
  );

  // Customer and Beneficiary Compliance Report
  static getComplianceReport = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await ReportsService.getComplianceReport(req.query);
      res.json(result);
    }
  );

  // Exchange Rates Report
  static getExchangeRatesReport = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await ReportsService.getExchangeRatesReport(req.query);
      res.json(result);
    }
  );

  // Audit Trail Report
  static getAuditTrailReport = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await ReportsService.getAuditTrailReport(req.query);
      res.json(result);
    }
  );

  // Corridor Performance Report
  static getCorridorPerformanceReport = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await ReportsService.getCorridorPerformanceReport(
        req.query
      );
      res.json(result);
    }
  );

  // User Performance Report
  static getUserPerformanceReport = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await ReportsService.getUserPerformanceReport(req.query);
      res.json(result);
    }
  );

  // Integration Status Report
  static getIntegrationStatusReport = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await ReportsService.getIntegrationStatusReport(req.query);
      res.json(result);
    }
  );

  // Cash Position Report
  static getCashPositionReport = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await ReportsService.getCashPositionReport(req.query);
      res.json(result);
    }
  );
}
