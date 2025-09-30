import { Response } from "express";
import { BankAccountService } from "./bankaccounts.services";
import {
  createBankAccountSchema,
  updateBankAccountSchema,
  bankAccountFiltersSchema,
  topupSchema,
  withdrawalSchema,
} from "./bankaccounts.validation";
import type CustomRequest from "../../types/CustomReq.type";
import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../middlewares/error.middleware";

const bankAccountService = new BankAccountService();

export class BankAccountController {
  createBankAccount = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const validation = createBankAccountSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const result = await bankAccountService.createBankAccount(
        validation.data,
        userId
      );
      res.status(201).json(result);
    }
  );

  getBankAccounts = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const validation = bankAccountFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const result = await bankAccountService.getBankAccounts(validation.data);
      res.json(result);
    }
  );

  getBankAccountById = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      if (!id) {
        throw new AppError("Bank account ID is required", 400);
      }

      const result = await bankAccountService.getBankAccountById(id);
      res.json(result);
    }
  );

  updateBankAccount = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      if (!id) {
        throw new AppError("Bank account ID is required", 400);
      }

      const validation = updateBankAccountSchema.safeParse(req.body);
      if (!validation.success) {
        console.log("validation error", validation.error, "body", req.body);

        throw new AppError("Validation error", 400);
      }

      const result = await bankAccountService.updateBankAccount(
        id,
        validation.data
      );
      res.json(result);
    }
  );

  deleteBankAccount = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      if (!id) {
        throw new AppError("Bank account ID is required", 400);
      }

      const result = await bankAccountService.deleteBankAccount(id);
      res.json(result);
    }
  );

  getBankAccountStats = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const organisationId = req.query.organisation_id as string;
      const result = await bankAccountService.getBankAccountStats(
        organisationId
      );
      res.json(result);
    }
  );

  topupBankAccount = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      if (!id) {
        throw new AppError("Bank account ID is required", 400);
      }

      const validation = topupSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const result = await bankAccountService.topupBankAccount(
        id,
        validation.data,
        userId
      );
      res.json(result);
    }
  );

  withdrawFromBankAccount = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      if (!id) {
        throw new AppError("Bank account ID is required", 400);
      }

      const validation = withdrawalSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const result = await bankAccountService.withdrawFromBankAccount(
        id,
        validation.data,
        userId
      );
      res.json(result);
    }
  );
}
