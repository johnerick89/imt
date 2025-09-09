import { Response } from "express";
import { BalanceOperationService } from "./balanceoperations.services";
import {
  orgBalanceOperationSchema,
  tillBalanceOperationSchema,
  vaultBalanceOperationSchema,
  orgBalanceFiltersSchema,
} from "./balanceoperations.validation";
import type CustomRequest from "../../types/CustomReq.type";
import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../middlewares/error.middleware";

const balanceOperationService = new BalanceOperationService();

export class BalanceOperationController {
  // Organisation Balance Operations
  prefundOrganisation = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { orgId } = req.params;
      if (!orgId) {
        throw new AppError("Organisation ID is required", 400);
      }

      const validation = orgBalanceOperationSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const result = await balanceOperationService.prefundOrganisation(
        orgId,
        validation.data,
        userId
      );
      res.json(result);
    }
  );

  // Till Balance Operations
  topupTill = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { tillId } = req.params;
      if (!tillId) {
        throw new AppError("Till ID is required", 400);
      }

      const validation = tillBalanceOperationSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const result = await balanceOperationService.topupTill(
        tillId,
        validation.data,
        userId
      );
      res.json(result);
    }
  );

  // Vault Balance Operations
  topupVault = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { vaultId } = req.params;
      if (!vaultId) {
        throw new AppError("Vault ID is required", 400);
      }

      const validation = vaultBalanceOperationSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const result = await balanceOperationService.topupVault(
        vaultId,
        validation.data,
        userId
      );
      res.json(result);
    }
  );

  // Till Withdrawal Operations
  withdrawTill = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { tillId } = req.params;
      if (!tillId) {
        throw new AppError("Till ID is required", 400);
      }

      const validation = tillBalanceOperationSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const result = await balanceOperationService.withdrawTill(
        tillId,
        validation.data,
        userId
      );
      res.json(result);
    }
  );

  // Vault Withdrawal Operations
  withdrawVault = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { vaultId } = req.params;
      if (!vaultId) {
        throw new AppError("Vault ID is required", 400);
      }

      const validation = vaultBalanceOperationSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const result = await balanceOperationService.withdrawVault(
        vaultId,
        validation.data,
        userId
      );
      res.json(result);
    }
  );

  // Get Organisation Balances
  getOrgBalances = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const validation = orgBalanceFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const result = await balanceOperationService.getOrgBalances(
        validation.data
      );
      res.json(result);
    }
  );

  // Get Organisation Balance Stats
  getOrgBalanceStats = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const organisationId = req.query.organisation_id as string;
      const result = await balanceOperationService.getOrgBalanceStats(
        organisationId
      );
      res.json(result);
    }
  );

  // Get organisation balance history
  getOrgBalanceHistory = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { orgId } = req.params;
      const filters = req.query;

      if (!orgId) {
        throw new AppError("Organisation ID is required", 400);
      }

      const result = await balanceOperationService.getOrgBalanceHistory(
        orgId,
        filters
      );
      res.json(result);
    }
  );

  // Get till balance history
  getTillBalanceHistory = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { tillId } = req.params;
      const filters = req.query;

      if (!tillId) {
        throw new AppError("Till ID is required", 400);
      }

      const result = await balanceOperationService.getTillBalanceHistory(
        tillId,
        filters
      );
      res.json(result);
    }
  );

  // Get vault balance history
  getVaultBalanceHistory = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { vaultId } = req.params;
      const filters = req.query;

      if (!vaultId) {
        throw new AppError("Vault ID is required", 400);
      }

      const result = await balanceOperationService.getVaultBalanceHistory(
        vaultId,
        filters
      );
      res.json(result);
    }
  );
}
